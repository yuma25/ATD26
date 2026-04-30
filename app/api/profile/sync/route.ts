import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../backend/lib/supabase";

/**
 * 【プロフィール同期API】
 * ユーザーがアプリを開いた際に、プロフィールの存在確認と最終アクセス日時の更新をサーバー側で行います。
 * 管理者権限（Service Role）を使用するため、RLS（行レベルセキュリティ）を回避して確実に処理できます。
 */

/**
 * --- 【第1章：POSTリクエストの処理】 ---
 */
export async function POST(request: NextRequest) {
  try {
    // 1. リクエストボディからユーザーIDを取得します
    const { userId } = await request.json();

    // 2. 異常系：ユーザーIDが欠けている場合（早期リターン）
    if (!userId) {
      return NextResponse.json(
        { error: "ユーザーIDが必要です" },
        { status: 400 },
      );
    }

    // 3. 異常系：サーバーの設定（環境変数）が不足している場合
    if (!supabaseAdmin) {
      console.error(
        "❌ [SERVER_ERROR]: SUPABASE_SERVICE_ROLE_KEY が設定されていません",
      );
      return NextResponse.json(
        { error: "サーバーの設定に問題があります" },
        { status: 500 },
      );
    }

    // 4. 管理者権限で profiles テーブルを更新します
    // 💡 upsert: データがあれば更新、なければ新規作成します
    const { error } = await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        last_seen: new Date().toISOString(), // 最終アクセス日時を現在時刻に
      },
      { onConflict: "id" }, // IDが重複した場合は更新する
    );

    // 5. データベース操作でエラーが発生した場合
    if (error) {
      console.error("❌ [API_PROFILE_SYNC_FAILED]:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 6. 正常終了
    console.log("✅ [API_PROFILE_SYNC_SUCCESS]:", userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    // 7. 異常系：予期せぬエラー
    console.error("❌ [API_PROFILE_SYNC_CRITICAL_ERROR]:", error);
    return NextResponse.json(
      { error: "サーバー内部でエラーが発生しました" },
      { status: 500 },
    );
  }
}
