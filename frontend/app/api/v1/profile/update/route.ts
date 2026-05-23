import { NextResponse } from "next/server";
import { BadgeService } from "@backend/services/badgeService";
import { UpdateProfileRequestSchema } from "@backend/types";

/**
 * パッケージ: app/api/v1/profile/update
 * ユーザーの属性情報（人数設定、景品交換フラグ等）を更新するためのエンドポイントを提供する。
 */

/**
 * [概要] プロフィール情報を更新する。
 * UUID に基づき、指定された属性情報をデータベースに保存する。
 *
 * @param request [Request] HTTP リクエストオブジェクト。ボディに userId と更新内容 updates を含む。
 * @return response [NextResponse] 更新結果の成功フラグを含む JSON レスポンス。
 *
 * [技術的ステップ]
 * 1. 構造検証: Zod スキーマ (UpdateProfileRequestSchema) を使用して、リクエストボディの構造を厳密にチェックする。
 * 2. 入力チェック: バリデーションに失敗した場合は 400 Bad Request と詳細なエラー理由を返却する。
 * 3. 更新実行: BadgeService.updateProfile を呼び出し、profiles テーブルへの永続化（upsert）を行う。
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = UpdateProfileRequestSchema.safeParse(body);

    // バリデーション結果の確認。
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "更新内容が正しくありません。",
            details: result.error.format(),
          },
        },
        { status: 400 },
      );
    }

    const { userId, updates } = result.data;

    // サービスレイヤーを介して更新を実行する。
    const success = await BadgeService.updateProfile(userId, updates);

    return NextResponse.json({
      success,
      data: success ? { message: "プロフィールを更新しました" } : null,
    });
  } catch (error) {
    console.error("❌ [API_PROFILE_UPDATE_ERROR]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "プロフィールの更新に失敗しました。",
        },
      },
      { status: 500 },
    );
  }
}
