import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/backend/lib/supabase";

/**
 * 【統計データ取得API】
 * 管理者ダッシュボードで表示するための各種数値（来場者数、デバイス数、発見数など）を集計して返します。
 */

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // --- 【第1章：準備とセキュリティチェック】 ---

    // 1. データベース（Supabase）が使える状態か確認します
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "データベースの接続設定が見つかりません" },
        { status: 500 },
      );
    }

    // 2. 「合言葉（Authorizationヘッダー）」が送られてきているか確認します
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 },
      );
    }

    // 3. その合言葉を使って「誰がアクセスしてきたか」をSupabaseに問い合わせます
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    // 4. 【重要】「管理者（メールログイン）」かつ「匿名ではない」ことを厳格にチェックします
    const isEmailUser = user?.app_metadata?.provider === "email";
    const isAnonymous = user?.is_anonymous;

    if (authError || !user || isAnonymous || !isEmailUser) {
      // 条件を満たさない場合は「アクセス拒否」を返して、ここで処理を終了します（早期リターン）
      return NextResponse.json(
        { error: "管理者権限がありません" },
        { status: 403 },
      );
    }

    // --- 【第2章：リクエスト内容の解析】 ---

    // ブラウザから送られてきたURLのパラメーター（?period=24h など）を読み取ります
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "24h";
    const userId = searchParams.get("userId");

    // --- 【第3章：データの取得と加工】 ---

    // 💡 Aパターン：特定のユーザーを詳しく調べたい場合 (userIdがある時)
    if (userId) {
      return await handleUserDetailRequest(userId);
    }

    // 💡 Bパターン：全体の統計を知りたい場合 (通常時)
    return await handleGlobalStatsRequest(period);
  } catch (error: unknown) {
    // 予期せぬエラーが起きた場合は、ログに残してエラー画面用の情報を返します
    const message =
      error instanceof Error
        ? error.message
        : "サーバー内部でエラーが発生しました";
    console.error("Stats API Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * 【補助関数】特定のユーザーの詳細を取得する処理
 */
async function handleUserDetailRequest(userId: string) {
  if (!supabaseAdmin) throw new Error("Admin client missing");

  // 1. プロフィール情報を取得
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  // 見つからない場合は、IDの先頭一致で検索し直してみる（親切設計）
  if (profileError) {
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .ilike("id", `${userId}%`)
      .limit(1);

    if (!profiles || profiles.length === 0) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 },
      );
    }
    return NextResponse.json({ userDetails: profiles[0] });
  }

  // 2. その人が見つけた標本（バッジ）のリストを取得
  const { data: userBadges } = await supabaseAdmin
    .from("user_badges")
    .select(`acquired_at, badges (name, target_index)`)
    .eq("user_id", userId);

  // 3. データを整理してブラウザに返す
  return NextResponse.json({
    userDetails: {
      ...profile,
      created_at: formatToJST(profile.created_at),
      last_seen: profile.last_seen ? formatToJST(profile.last_seen) : null,
      badges:
        (
          userBadges as {
            acquired_at: string;
            badges:
              | { name: string; target_index: number }
              | { name: string; target_index: number }[];
          }[]
        )?.map((b) => {
          // badges が配列で返ってくる場合と単一オブジェクトの場合の両方に対応
          const badgeData = Array.isArray(b.badges) ? b.badges[0] : b.badges;
          return {
            acquired_at: formatToJST(b.acquired_at),
            badges: badgeData || { name: "不明", target_index: 0 },
          };
        }) || [],
    },
  });
}

/**
 * 【補助関数】全体の統計情報を計算する処理
 */
async function handleGlobalStatsRequest(period: string) {
  if (!supabaseAdmin) throw new Error("Admin client missing");

  // 0. 管理者ユーザーのリストを特定します（統計から除外するため）
  const { data: authUsers, error: authError } =
    await supabaseAdmin.auth.admin.listUsers();
  if (authError) throw authError;

  // 管理者（メールプロバイダーを使用し、かつ匿名ではない）のIDを抽出
  const adminIds = authUsers.users
    .filter((u) => u.app_metadata.provider === "email" && !u.is_anonymous)
    .map((u) => u.id);

  // 1. 全ユーザーのリストを新着順で取得
  const { data: allProfiles, error: profilesError } = await supabaseAdmin
    .from("profiles")
    .select("id, party_size, created_at, last_seen")
    .order("created_at", { ascending: false });

  if (profilesError) throw profilesError;

  // 💡 管理者を除外した「純粋な一般ユーザー」のリストを作成
  const profiles = allProfiles.filter((p) => !adminIds.includes(p.id));

  // 2. 数値を集計（JavaScriptの計算機能を使用）
  const totalDevices = profiles.length;
  const totalVisitors = (profiles as { party_size: number }[]).reduce(
    (acc, curr) => acc + (curr.party_size || 1),
    0,
  );

  // 3. グラフ表示用の期間データを準備
  const now = new Date();
  let startDate = new Date();
  if (period === "1h") startDate.setHours(now.getHours() - 1);
  else if (period === "all") startDate = new Date(0);
  else startDate.setHours(now.getHours() - 24);

  // 4. その期間内に見つかった標本の数を取得
  const { data: allRecentBadges } = await supabaseAdmin
    .from("user_badges")
    .select("acquired_at, user_id")
    .gte("acquired_at", startDate.toISOString());

  // 💡 バッジ獲得記録からも管理者によるものを除外
  const recentBadges = (allRecentBadges || []).filter(
    (b) => !adminIds.includes(b.user_id),
  );

  // 5. 総発見数を取得（管理者除外）
  const { data: allUserBadges } = await supabaseAdmin
    .from("user_badges")
    .select("user_id");

  const totalBadges = (allUserBadges || []).filter(
    (b) => !adminIds.includes(b.user_id),
  ).length;

  // 6. グラフ用の「時系列データ」を作成
  const hourlyStats = generateTimeSeries(
    period,
    now,
    profiles as { created_at: string }[],
    recentBadges as { acquired_at: string }[],
  );

  // 7. 最近のユーザー20名分をピックアップ
  const recentUsers = profiles.slice(0, 20).map((p) => ({
    ...p,
    created_at: formatToJST(p.created_at),
    last_seen: p.last_seen ? formatToJST(p.last_seen) : null,
  }));

  // 8. 全ての集計が終わったらまとめて返却
  return NextResponse.json({
    totalVisitors,
    totalDevices,
    totalBadges: totalBadges || 0,
    recentUsers,
    hourlyStats,
    period,
  });
}

/**
 * 【ユーティリティ】日付を日本時間 (JST) の読みやすい形式に変換
 */
function formatToJST(dateStr: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(dateStr));
}

/**
 * 【ユーティリティ】グラフ用の時系列ラベルを作成
 */
function getJSTKey(date: Date, type: "hour" | "day" | "minute") {
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const m: Record<string, string> = {};
  parts.forEach((p) => (m[p.type] = p.value));

  if (type === "minute")
    return `${m.year}-${m.month}-${m.day} ${m.hour}:${m.minute}`;
  if (type === "hour") return `${m.year}-${m.month}-${m.day} ${m.hour}:00`;
  return `${m.month}/${m.day}`;
}

/**
 * 【ユーティリティ】統計グラフ用のデータ配列を生成
 */
function generateTimeSeries(
  period: string,
  now: Date,
  profiles: { created_at: string }[],
  badges: { acquired_at: string }[],
) {
  const stats = [];
  let count = 0;
  let interval = 0;
  let type: "minute" | "hour" | "day" = "hour";

  if (period === "1h") {
    count = 60;
    interval = 60000; // 1分
    type = "minute";
  } else if (period === "24h") {
    count = 24;
    interval = 3600000; // 1時間
    type = "hour";
  } else {
    count = 30; // 全期間（直近30日分）
    interval = 86400000; // 1日
    type = "day";
  }

  for (let i = 0; i < count; i++) {
    const d = new Date(now.getTime() - (count - 1 - i) * interval);
    const labelKey = getJSTKey(d, type);

    // ラベルの表示形式（1hなら "HH:mm"、24hなら "HH:00"、allなら "MM/DD"）
    const label = type === "day" ? labelKey : labelKey.split(" ")[1];

    const devices = profiles.filter(
      (p) => getJSTKey(new Date(p.created_at), type) === labelKey,
    ).length;
    const badgeCount = badges.filter(
      (b) => getJSTKey(new Date(b.acquired_at), type) === labelKey,
    ).length;

    stats.push({ hour: label, devices, badges: badgeCount });
  }
  return stats;
}
