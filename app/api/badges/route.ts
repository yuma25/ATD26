import { NextResponse } from "next/server";
import { BadgeService } from "../../../backend/services/badgeService";

/**
 * 【標本データ取得API】
 * データベースに登録されているすべての標本情報を取得するためのエンドポイントです。
 */

/**
 * --- 【第1章：GETリクエストの処理】 ---
 * 全ての標本データを取得してクライアントに返します。
 */
export async function GET() {
  try {
    // 1. 標本サービスを使用して、データベースから全件取得を試みます
    // 💡 サーバーサイド（Service Role）を使用するため、
    // 公開設定に関わらず全ての標本データを確実に取得できます。
    const badges = await BadgeService.getAllBadges();

    // 2. 正常に取得できた場合、JSON形式でクライアントにデータを返します
    return NextResponse.json(badges);
  } catch (error) {
    // 3. 異常系：データベース接続エラーなどの場合
    // エラー内容をログに記録し、安全のために空のリストを返します
    console.error("❌ [API_BADGES_GET_ERROR]:", error);
    return NextResponse.json([], { status: 500 });
  }
}
