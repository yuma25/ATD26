import { NextResponse } from "next/server";
import { badgeController } from "@backend/src/infrastructure/di/container";
import { AcquireBadgeRequestSchema } from "@backend/src/domain/entities/UserBadge";

/**
 * [概要] 標本獲得の記録をデータベースに保存する。
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = AcquireBadgeRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "リクエストデータが不正です。",
            details: result.error.format(),
          },
        },
        { status: 400 },
      );
    }

    const { userId, badgeId } = result.data;
    const response = await badgeController.acquire(userId, badgeId);

    // 重複登録のハンドリング（Postgres Error Code 23505）
    if (!response.success && response.error) {
      const details = response.error.details as Record<string, unknown> | undefined;
      if (details?.code === "23505") {
        return NextResponse.json({
          success: true,
          data: {
            status: "ALREADY_ACQUIRED",
            message: "この標本はすでに記録されています。",
          },
        });
      }
    }

    return NextResponse.json(response, { status: response.success ? 200 : 500 });
  } catch (error) {
    console.error("❌ [API_BADGES_ACQUIRE_ERROR]:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "サーバーエラーが発生しました。" } },
      { status: 500 },
    );
  }
}
