import { NextResponse, NextRequest } from "next/server";
import { profileController } from "@backend/src/infrastructure/di/container";

/**
 * [概要] プロフィールの同期処理を実行する。
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "MISSING_USER_ID", message: "ユーザーIDが必要です" },
        },
        { status: 400 },
      );
    }

    const result = await profileController.update(userId, {});

    return NextResponse.json(result, { status: result.success ? 200 : 500 });
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
