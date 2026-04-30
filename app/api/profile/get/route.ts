import { NextResponse } from "next/server";
import { BadgeService } from "../../../../backend/services/badgeService";

/**
 * 【ユーザープロフィール取得API】
 * 特定のユーザーのプロフィール情報（人数設定など）を取得します。
 */

/**
 * --- 【第1章：GETリクエストの処理】 ---
 */
export async function GET(request: Request) {
  try {
    // 1. URLのクエリパラメータからユーザーIDを抽出します
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // 2. 異常系：ユーザーIDが指定されていない場合はエラーを返します（早期リターン）
    if (!userId) {
      return NextResponse.json(
        { error: "ユーザーIDが指定されていません" },
        { status: 400 },
      );
    }

    // 3. 標本サービスを使用して、プロフィール情報を取得します
    const profile = await BadgeService.getProfile(userId);

    // 4. 正常終了：プロフィール情報を返します
    return NextResponse.json(profile);
  } catch (error) {
    // 5. 異常系：データベースエラーなど
    console.error("❌ [API_PROFILE_GET_ERROR]:", error);
    return NextResponse.json(
      { error: "ユーザープロフィールの取得に失敗しました" },
      { status: 500 },
    );
  }
}
