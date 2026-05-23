import { NextResponse } from "next/server";
import { BadgeService } from "@backend/services/badgeService";

/**
 * パッケージ: app/api/v1/profile/get
 * ユーザーの属性情報（プロフィール）を取得するためのエンドポイントを提供する。
 */

/**
 * [概要] 特定ユーザーのプロフィール情報を取得する。
 * UUID に基づき、来場人数や景品交換状況などの属性をデータベースから取得して返却する。
 *
 * @param request [Request] HTTP リクエストオブジェクト。クエリパラメータに userId を含む。
 * @return response [NextResponse] プロフィールデータを含む JSON レスポンス。
 *
 * [技術的ステップ]
 * 1. パラメータ抽出: URLSearchParams を介して userId を取得する。
 * 2. 入力バリデーション: userId が欠落している場合は 400 Bad Request を返却する。
 * 3. 取得実行: BadgeService.getProfile(userId) を呼び出し、該当ユーザーのレコードを取得する。
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // ユーザー識別子が指定されていない場合はエラーを返却する。
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

    // サービスレイヤーを介してプロフィールを取得する。
    const profile = await BadgeService.getProfile(userId);

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("❌ [API_PROFILE_GET_ERROR]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: "プロフィールの読み込みに失敗しました。",
        },
      },
      { status: 500 },
    );
  }
}
