import { NextResponse } from "next/server";
import { BadgeService } from "@backend/services/badgeService";
import { BadgeSchema } from "@backend/types";

/**
 * パッケージ: app/api/v1/badges
 * 標本のマスターデータを提供するためのエンドポイントを提供する。
 */

/**
 * [概要] システムに登録されている全ての標本情報を取得する。
 *
 * @return response [NextResponse] 標本データの配列を含む JSON レスポンス。
 *
 * [技術的ステップ]
 * 1. マスタ取得: BadgeService.getAllBadges() を実行し、DB から全標本レコードを取得する。
 * 2. 型安全の保証: 取得した各レコードを BadgeSchema.parse() に通し、プロパティの欠落や型違いを検知する。
 * 3. 一貫した応答: 成功時は success: true、失敗時は標準化されたエラーコードを返却し、クライアント側の処理を簡素化する。
 */
export async function GET() {
  try {
    // 1. 全標本データをサービスレイヤーから取得する。
    const badges = await BadgeService.getAllBadges();

    // 2. データの構造を検証し、標準化されたオブジェクト配列として整形する。
    const validatedBadges = badges.map((b) => BadgeSchema.parse(b));

    return NextResponse.json({
      success: true,
      data: validatedBadges,
    });
  } catch (error) {
    // 3. 異常系：ログを記録した上で、ユーザーフレンドリーなエラー情報を返却する。
    console.error("❌ [API_BADGES_GET_ERROR]:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message:
            "標本データの取得に失敗しました。冒険を続けるには、通信環境を確認してください。",
        },
      },
      { status: 500 },
    );
  }
}
