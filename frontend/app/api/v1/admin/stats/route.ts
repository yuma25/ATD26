import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@backend/src/infrastructure/external/supabase";
import { adminController } from "@backend/src/infrastructure/di/container";

export const dynamic = "force-dynamic";

/**
 * [概要] 管理者ダッシュボード用の統計データを取得する。
 */
export async function GET(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DB_CONFIG_MISSING",
            message: "接続設定が見つかりません",
          },
        },
        { status: 500 },
      );
    }

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

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "24h";
    const userId = searchParams.get("userId");

    const result = await adminController.getStats(period, userId);
    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
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
