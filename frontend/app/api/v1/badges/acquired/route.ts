import { NextResponse } from "next/server";
import { badgeController } from "@backend/src/infrastructure/di/container";

export const dynamic = "force-dynamic";

/**
 * [概要] 特定ユーザーの獲得履歴を取得する。
 */
export async function GET(request: Request) {
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

  const result = await badgeController.getAcquired(userId);
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
