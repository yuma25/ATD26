import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "@backend/lib/supabase";

/**
 * パッケージ: app/api/v1/profile/sync
 * ユーザープロフィールの存在確認および初期化をサーバー側で実行するためのエンドポイントを提供する。
 */

/**
 * [概要] プロフィールの同期処理を実行する。
 * ユーザーがアプリを起動した際に、データベース上にプロフィールレコードが存在することを確認し、なければ作成する。
 *
 * @param request [NextRequest] HTTP リクエストオブジェクト。ボディに userId を含む。
 * @return response [NextResponse] 実行結果（成功またはエラー）を含む JSON レスポンス。
 *
 * [技術的ステップ]
 * 1. 入力チェック: リクエストボディから userId を取得し、不在の場合は 400 エラーを返却する。
 * 2. 認可ガード: supabaseAdmin クライアントの可用性を確認する。
 * 3. 永続化処理: profiles テーブルに対して upsert 操作を行う。
 *    onConflict: 'id' を指定することで、既存レコードがある場合は何もしない（または更新する）冪等な処理を実現する。
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    // ユーザー ID の存在確認。
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "MISSING_USER_ID", message: "ユーザーIDが必要です" },
        },
        { status: 400 },
      );
    }

    // データベース設定の確認。
    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DB_CONFIG_MISSING",
            message: "サーバーの設定に問題があります",
          },
        },
        { status: 500 },
      );
    }

    // UPSERT 処理：レコードがあれば維持、なければ作成する。
    const { error } = await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
      },
      { onConflict: "id" },
    );

    if (error) {
      console.error("❌ [API_PROFILE_SYNC_FAILED]:", error.message);
      return NextResponse.json(
        {
          success: false,
          error: { code: "DB_ERROR", message: error.message },
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ [API_PROFILE_SYNC_CRITICAL_ERROR]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "サーバー内部でエラーが発生しました",
        },
      },
      { status: 500 },
    );
  }
}
