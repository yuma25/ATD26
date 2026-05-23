import { NextResponse } from "next/server";
import { BadgeService } from "@backend/services/badgeService";
import { AcquireBadgeRequestSchema } from "@backend/types";

/**
 * パッケージ: app/api/v1/badges/acquire
 * ユーザーによる標本獲得の記録を永続化するエンドポイントを提供する。
 */

/**
 * [概要] 標本獲得の記録をデータベースに保存する。
 * 冒険者が新しい標本を発見した際に呼び出され、user_badges テーブルにレコードを挿入する。
 *
 * @param request [Request] HTTP リクエストオブジェクト。ボディに userId と badgeId を含む。
 * @return response [NextResponse] 記録結果またはエラー情報を含む JSON。
 *
 * [技術的ステップ]
 * 1. バリデーション: Zod スキーマ (AcquireBadgeRequestSchema) を用いてリクエストボディの型安全性を実行時に検証する。
 * 2. 永続化実行: BadgeService.acquireBadge を呼び出し、内部でプロフィール不在時の自動作成とレコード挿入を行う。
 * 3. 冪等性の担保: 重複登録（一意制約違反: 23505）が発生した場合、エラーを返さず「既に獲得済み」として成功レスポンスを返却する。
 * 4. 異常系処理: その他のデータベースエラーや通信エラーが発生した場合は、標準化されたエラー形式で 500 レスポンスを返却する。
 */
export async function POST(request: Request) {
  try {
    // 1. リクエストボディの厳密な検証を行う。
    const body = await request.json();
    const result = AcquireBadgeRequestSchema.safeParse(body);

    if (!result.success) {
      console.warn(
        "⚠️ [API_BADGES_ACQUIRE] バリデーション失敗:",
        result.error.format(),
      );
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message:
              "標本の記録に必要な情報が正しくありません。日誌の形式を確認してください。",
            details: result.error.format(),
          },
        },
        { status: 400 },
      );
    }

    const { userId, badgeId } = result.data;

    // 2. サービスレイヤーを介して獲得記録の保存を試みる。
    const { data, error } = await BadgeService.acquireBadge(userId, badgeId);

    // 3. 一意制約違反（既に登録済み）のハンドリング。
    // クライアント側での重複リクエストを許容し、ユーザー体験を損なわないようにする。
    if (error?.code === "23505") {
      console.log(
        `ℹ️ [API_BADGES_ACQUIRE] 重複リクエストを許容: user=${userId}, badge=${badgeId}`,
      );
      return NextResponse.json({
        success: true,
        data: {
          status: "ALREADY_ACQUIRED",
          message: "この標本はすでにあなたのジャーナルに記録されています。",
        },
      });
    }

    // 4. 想定外のエラーが発生した場合は例外としてスローする。
    if (error) {
      throw error;
    }

    // 5. 正常終了：保存されたレコード情報を返却する。
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    console.error("❌ [API_BADGES_ACQUIRE_ERROR]:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message:
            "大地の記憶（データベース）への書き込み中に予期せぬエラーが発生しました。時間を置いて再度お試しください。",
        },
      },
      { status: 500 },
    );
  }
}
