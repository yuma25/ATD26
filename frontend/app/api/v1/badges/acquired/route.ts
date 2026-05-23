import { NextResponse } from "next/server";
import { BadgeService } from "@backend/services/badgeService";
import { UserBadgeSchema } from "@backend/types";

/**
 * パッケージ: app/api/v1/badges/acquired
 * ユーザーごとの獲得済み標本履歴を取得するためのエンドポイントを提供する。
 */

/**
 * [概要] 特定ユーザーの獲得履歴を取得する。
 * URL パラメータとして渡された userId に基づき、データベースから全獲得レコードを取得して返却する。
 *
 * @param request [Request] HTTP リクエストオブジェクト。クエリパラメータに userId を含む。
 * @return response [NextResponse] 獲得済み標本の配列を含む JSON レスポンス。
 *
 * [技術的ステップ]
 * 1. パラメータ抽出: URLSearchParams を使用して userId を取得し、不在の場合は 400 エラーを返却する。
 * 2. 履歴取得: BadgeService.getAcquiredBadges(userId) を実行し、サーバー側（Direct DB Access）でデータを取得する。
 * 3. 厳密検証: 取得した各レコードに対し UserBadgeSchema.parse() を適用し、スキーマ定義との不整合を検知・排除する。
 * 4. 応答生成: 検証済みのクリーンなデータを success: true と共に返却する。
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  // ユーザー ID が指定されていない場合は、リクエストが不完全であると判断する。
  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "MISSING_USER_ID",
          message: "冒険者の識別情報が見つかりません。",
        },
      },
      { status: 400 },
    );
  }

  try {
    // 1. データベースからユーザーに紐付く獲得履歴を取得する。
    const data = await BadgeService.getAcquiredBadges(userId);

    // 2. 取得データの構造を Zod スキーマで検証し、不完全なデータがクライアントに渡るのを防ぐ。
    const validatedData = data.map((item) => UserBadgeSchema.parse(item));

    return NextResponse.json({
      success: true,
      data: validatedData,
    });
  } catch (error) {
    console.error("❌ [API_ACQUIRED_GET_ERROR]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: "これまでの発見記録を取得できませんでした。",
        },
      },
      { status: 500 },
    );
  }
}
