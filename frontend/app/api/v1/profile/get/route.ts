import { NextResponse } from "next/server";
import { profileController } from "@backend/src/infrastructure/di/container";

/**
 * [概要] 特定ユーザーのプロフィール情報を取得する。
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_USER_ID",
            message: "ユーザーIDが見つかりません。",
          },
        },
        { status: 400 },
      );
    }

    const result = await profileController.get(userId);
    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error) {
    console.error("❌ [API_PROFILE_GET_ERROR]:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "サーバーエラーが発生しました。" } },
      { status: 500 },
    );
  }
}
