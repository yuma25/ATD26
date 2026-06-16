import { NextResponse } from "next/server";
import { badgeController } from "@backend/src/infrastructure/di/container";

/**
 * パッケージ: app/api/v1/badges
 * 標本のマスターデータを提供するためのエンドポイントを提供する。
 */

/**
 * [概要] システムに登録されているすべての標本情報を取得する。
 * 
 * @return response 標本データの配列を含む JSON レスポンス。
 */
export async function GET() {
  const result = await badgeController.getAll();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
