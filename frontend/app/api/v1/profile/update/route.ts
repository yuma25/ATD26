import { NextResponse } from "next/server";
import { profileController } from "@backend/src/infrastructure/di/container";
import { UpdateProfileRequestSchema } from "@backend/src/domain/entities/Profile";

/**
 * [概要] プロフィール情報を更新する。
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = UpdateProfileRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "更新内容が正しくありません。",
            details: result.error.format(),
          },
        },
        { status: 400 },
      );
    }

    const { userId, updates } = result.data;
    const resultJson = await profileController.update(userId, updates);

    return NextResponse.json(resultJson, {
      status: resultJson.success ? 200 : 500,
    });
  } catch (error) {
    console.error("❌ [API_PROFILE_UPDATE_ERROR]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "サーバーエラーが発生しました。",
        },
      },
      { status: 500 },
    );
  }
}
