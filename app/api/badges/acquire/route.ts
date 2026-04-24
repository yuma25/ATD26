import { NextResponse } from "next/server";
import { BadgeService } from "../../../../backend/services/badgeService";

export async function POST(request: Request) {
  try {
    const { userId, badgeId } = await request.json();

    if (!userId || !badgeId) {
      return NextResponse.json(
        { error: "Missing userId or badgeId" },
        { status: 400 },
      );
    }

    // バッジ獲得を試行
    const data = await BadgeService.acquireBadge(userId, badgeId);

    // 💡 修正：data が null の場合（重複等）でも 200 成功として返す
    // 重複をエラー（500）にしないことで、ブラウザ側の挙動を安定させる
    if (!data) {
      return NextResponse.json({
        message: "Already acquired or duplicate",
        status: "success",
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API_BADGES_ACQUIRE_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
