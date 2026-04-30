import { NextResponse } from "next/server";
import { BadgeService } from "../../../../backend/services/badgeService";

/**
 * 【標本獲得API】
 * ユーザーが新しい標本を発見した際に、その記録をデータベースに保存します。
 */

/**
 * --- 【第1章：POSTリクエストの処理】 ---
 * ユーザーIDと標本IDを受け取り、獲得処理を実行します。
 */
export async function POST(request: Request) {
  try {
    // 1. リクエストボディから必要な情報を抽出します
    const { userId, badgeId } = await request.json();

    // 2. 異常系：必要なデータが欠けている場合はエラーを返します（早期リターン）
    if (!userId || !badgeId) {
      return NextResponse.json(
        { error: "ユーザーIDまたは標本IDが不足しています" },
        { status: 400 },
      );
    }

    // 3. 標本サービスを使用して、獲得記録の保存を試みます
    const data = await BadgeService.acquireBadge(userId, badgeId);

    // 4. 重複チェック：すでに獲得済み、または何らかの理由でデータが作成されなかった場合
    // 💡 ユーザー体験を損なわないよう、エラーではなく「成功（ただし追加なし）」として扱います
    if (!data) {
      return NextResponse.json({
        message: "すでに獲得済みか、重複したリクエストです",
        status: "success",
      });
    }

    // 5. 正常終了：保存された獲得記録を返します
    return NextResponse.json(data);
  } catch (error) {
    // 6. 異常系：サーバー内での予期せぬエラー
    console.error("❌ [API_BADGES_ACQUIRE_ERROR]:", error);
    return NextResponse.json(
      { error: "サーバー内部でエラーが発生しました" },
      { status: 500 },
    );
  }
}
