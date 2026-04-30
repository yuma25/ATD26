import { NextResponse } from "next/server";
import { BadgeService } from "../../../../backend/services/badgeService";

/**
 * 【獲得済み標本取得API】
 * 特定のユーザーがこれまでに獲得したすべての標本記録を取得します。
 */

/**
 * --- 【第1章：GETリクエストの処理】 ---
 */
export async function GET(request: Request) {
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

  try {
    // 3. 標本サービスを使用して、ユーザーの獲得履歴を取得します
    // 💡 獲得した標本のIDだけでなく、発見した日時（acquired_at）も含まれます。
    const data = await BadgeService.getAcquiredBadges(userId);

    // 4. 正常終了：履歴データを返します
    return NextResponse.json(data);
  } catch (error) {
    // 5. 異常系：データベースエラーなど
    console.error("❌ [API_ACQUIRED_GET_ERROR]:", error);
    return NextResponse.json([], { status: 500 });
  }
}
