import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@backend/lib/supabase";
import { CacheService } from "@backend/services/cacheService";

/**
 * パッケージ: app/api/v1/admin/stats
 * 管理者向けの統計データ集計および取得エンドポイントを提供する。
 */

export const dynamic = "force-dynamic";

/**
 * [概要] 管理者ダッシュボード用の統計データを取得する。
 * 来場者数、デバイス数、標本獲得数などの集計値を返却する。
 *
 * @param req [NextRequest] HTTP リクエストオブジェクト。
 * @return response [NextResponse] 統計データを含む JSON レスポンス。
 *
 * [技術的ステップ]
 * 1. 認可チェック: Authorization ヘッダーの JWT を検証し、メール認証された非匿名ユーザー（管理者）であることを確認する。
 * 2. キャッシュ利用: グローバル統計リクエスト（userId 指定なし）の場合、Redis キャッシュ (CacheService) を優先的に参照する。
 * 3. 処理分岐: userId が存在する場合は個別ユーザーの詳細を、存在しない場合は全体統計をそれぞれ補助関数で処理する。
 * 4. 統計集計: profiles テーブルと user_badges テーブルをスキャンし、期間に応じた集計および時系列データの生成を行う。
 * 5. キャッシュ保存: 新たに生成した統計データを Redis に 5分間保存する。
 */
export async function GET(req: NextRequest) {
  try {
    // --- 準備とセキュリティチェック ---

    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DB_CONFIG_MISSING",
            message: "データベースの接続設定が見つかりません",
          },
        },
        { status: 500 },
      );
    }

    // JWT トークンの取得と検証。
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "ログインが必要です" },
        },
        { status: 401 },
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    // 管理者権限（メールログインかつ非匿名）の確認。
    const isEmailUser = user?.app_metadata?.provider === "email";
    const isAnonymous = user?.is_anonymous;

    if (authError || !user || isAnonymous || !isEmailUser) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "管理者権限がありません" },
        },
        { status: 403 },
      );
    }

    // --- リクエスト内容の解析 ---
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "24h";
    const userId = searchParams.get("userId");

    // --- キャッシュの確認 (グローバル統計の場合のみ適用) ---
    if (!userId) {
      const cacheKey = `stats_global_${period}`;
      const cachedData = await CacheService.get<unknown>(cacheKey);
      if (cachedData) {
        return NextResponse.json({
          success: true,
          data: cachedData,
          fromCache: true,
        });
      }
    }

    // --- データの取得と加工 ---
    let data;
    if (userId) {
      // 特定ユーザーの照会。
      data = await handleUserDetailRequest(userId);
    } else {
      // 全体統計の集計。
      data = await handleGlobalStatsRequest(period);

      // --- キャッシュの保存 (5分間) ---
      const cacheKey = `stats_global_${period}`;
      await CacheService.set(cacheKey, data, 300);
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "サーバー内部でエラーが発生しました";
    console.error("Stats API Error:", message);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message },
      },
      { status: 500 },
    );
  }
}

/**
 * [概要] 個別ユーザーの詳細情報（プロフィールおよび獲得済み標本）を取得する補助関数。
 * @param userId [string] 対象ユーザーの ID。
 */
async function handleUserDetailRequest(userId: string) {
  if (!supabaseAdmin) throw new Error("Admin client missing");

  // プロフィール情報の取得。
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  // ID が完全一致しない場合、前方一致検索を試みる（利便性のため）。
  if (profileError) {
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .ilike("id", `${userId}%`)
      .limit(1);

    if (!profiles || profiles.length === 0) {
      throw new Error("ユーザーが見つかりません");
    }
    return { userDetails: profiles[0] };
  }

  interface UserBadgeResponse {
    acquired_at: string;
    badges:
      | { name: string; target_index: number }
      | { name: string; target_index: number }[];
  }

  // 獲得済み標本のリストを取得。
  const { data: userBadges } = await supabaseAdmin
    .from("user_badges")
    .select(`acquired_at, badges (name, target_index)`)
    .eq("user_id", userId);

  const typedUserBadges = (userBadges as unknown as UserBadgeResponse[]) || [];

  return {
    userDetails: {
      ...profile,
      created_at: formatToJST(profile.created_at),
      last_seen: profile.last_seen ? formatToJST(profile.last_seen) : null,
      badges: typedUserBadges.map((b) => ({
        acquired_at: formatToJST(b.acquired_at),
        badges: Array.isArray(b.badges)
          ? b.badges[0]
          : b.badges || { name: "不明", target_index: 0 },
      })),
    },
  };
}

/**
 * [概要] 全体統計データ（集計値および時系列）を生成する補助関数。
 * 管理者（スタッフ）をカウントから除外して算出する。
 * @param period [string] 集計対象期間。
 */
async function handleGlobalStatsRequest(period: string) {
  if (!supabaseAdmin) throw new Error("Admin client missing");

  // スタッフ（管理者）の ID リストを取得して集計から除外する。
  const { data: authUsers, error: authError } =
    await supabaseAdmin.auth.admin.listUsers();
  if (authError) throw authError;

  const adminIds = (authUsers.users || [])
    .filter((u) => u?.app_metadata?.provider === "email" && !u?.is_anonymous)
    .map((u) => u.id);

  // 全プロフィールの取得。
  const { data: allProfiles, error: profilesError } = await supabaseAdmin
    .from("profiles")
    .select("id, party_size, created_at, last_seen")
    .order("created_at", { ascending: false });

  if (profilesError) throw profilesError;

  const profiles = (allProfiles || []).filter(
    (p) => p?.id && !adminIds.includes(p.id),
  );

  // 各種メトリクスの計算。
  const totalDevices = profiles.length;
  const totalVisitors = (
    profiles as { id: string; party_size: number | null }[]
  ).reduce((acc, curr) => acc + (curr?.party_size || 1), 0);

  // 集計開始日時の算出。
  const now = new Date();
  let startDate = new Date();
  if (period === "1h") startDate.setHours(now.getHours() - 1);
  else if (period === "all") startDate = new Date(0);
  else startDate.setHours(now.getHours() - 24);

  // 直近の獲得記録を取得。
  const { data: allRecentBadges } = await supabaseAdmin
    .from("user_badges")
    .select("acquired_at, user_id")
    .gte("acquired_at", getJSTISOString(startDate));

  const recentBadges = (allRecentBadges || []).filter(
    (b) => b?.user_id && !adminIds.includes(b.user_id),
  );

  // 総獲得数の計算。
  const { data: allUserBadges } = await supabaseAdmin
    .from("user_badges")
    .select("user_id");
  const totalBadges = (allUserBadges || []).filter(
    (b) => b?.user_id && !adminIds.includes(b.user_id),
  ).length;

  // グラフ用時系列データの生成。
  const hourlyStats = generateTimeSeries(
    period,
    now,
    profiles as { created_at: string }[],
    recentBadges as { acquired_at: string }[],
  );

  // 最近のユーザー 20 名を抽出。
  const recentUsers = profiles.slice(0, 20).map((p) => ({
    ...p,
    created_at: formatToJST(p.created_at),
    last_seen: p.last_seen ? formatToJST(p.last_seen) : null,
  }));

  return {
    totalVisitors,
    totalDevices,
    totalBadges,
    recentUsers,
    hourlyStats,
    period,
  };
}

/**
 * 【ユーティリティ】DB から取得した日時のタイムゾーン不整合を補正して解析する。
 */
function parseJST(dateStr: string): Date {
  if (!dateStr) return new Date();
  // DB からの文字列がタイムゾーン情報を含まない場合、JST (+09:00) として解釈させる。
  const isoStr =
    dateStr.includes("+") || dateStr.includes("Z")
      ? dateStr
      : `${dateStr.replace(" ", "T")}+09:00`;
  return new Date(isoStr);
}

/**
 * 【ユーティリティ】ISO 形式の JST 文字列を生成する。
 */
function getJSTISOString(date: Date): string {
  const offset = 9 * 60 * 60 * 1000;
  const jstDate = new Date(date.getTime() + offset);
  return jstDate.toISOString().replace("Z", "");
}

/**
 * 【ユーティリティ】日時を日本時間の読みやすい形式に整形する。
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
  }).format(parseJST(dateStr));
}

/**
 * 【ユーティリティ】グラフの X 軸ラベル用キーを生成する。
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
 * 【ユーティリティ】統計グラフ表示用の配列データを生成する。
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

  // 期間に応じた分割単位の設定。
  if (period === "1h") {
    count = 60;
    interval = 60000; // 1分単位
    type = "minute";
  } else if (period === "24h") {
    count = 24;
    interval = 3600000; // 1時間単位
    type = "hour";
  } else {
    count = 30; // 30日分
    interval = 86400000; // 1日単位
    type = "day";
  }

  for (let i = 0; i < count; i++) {
    const d = new Date(now.getTime() - (count - 1 - i) * interval);
    const labelKey = getJSTKey(d, type);

    const label = type === "day" ? labelKey : labelKey.split(" ")[1];

    // 各時間スロットに該当するレコード数を集計。
    const devices = profiles.filter(
      (p) => getJSTKey(parseJST(p.created_at), type) === labelKey,
    ).length;
    const badgeCount = badges.filter(
      (b) => getJSTKey(parseJST(b.acquired_at), type) === labelKey,
    ).length;

    stats.push({ hour: label, devices, badges: badgeCount });
  }
  return stats;
}
