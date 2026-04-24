import { NextResponse } from "next/server";
import { BadgeService } from "../../../backend/services/badgeService";

export async function GET() {
  try {
    // 💡 サーバーサイドでは SUPABASE_SERVICE_ROLE_KEY が使えるため、
    // RLS をバイパスして確実に全データを取得できる
    const badges = await BadgeService.getAllBadges();
    return NextResponse.json(badges);
  } catch (error) {
    console.error("API_BADGES_GET_ERROR:", error);
    return NextResponse.json([], { status: 500 });
  }
}
