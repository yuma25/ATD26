import { NextResponse } from "next/server";
import { BadgeService } from "../../../../backend/services/badgeService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    // 💡 修正：ID一覧ではなく、日時情報を含む全情報を取得して返す
    const data = await BadgeService.getAcquiredBadges(userId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API_ACQUIRED_GET_ERROR:", error);
    return NextResponse.json([], { status: 500 });
  }
}
