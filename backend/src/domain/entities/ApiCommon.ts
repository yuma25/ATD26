import { z } from "zod";

/**
 * [概要] API通信の共通スキーマ定義。
 * クライアントとサーバー間でやり取りされるデータの共通フォーマット（成功・エラー構造）を定義する。
 */

/**
 * [概要] エラー内容の定義スキーマ。
 */
export const ApiErrorSchema = z.object({
  code: z.string(), // エラーコード（例: "NOT_FOUND", "AUTH_REQUIRED"）
  message: z.string(), // ユーザー向けのメッセージ
  details: z.any().optional(), // 開発用デバッグ情報
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

/**
 * [概要] 成功・失敗を含む共通のAPIレスポンス形式を生成するユーティリティ。
 * @param dataSchema 成功時に含まれるデータ自体のスキーマ
 */
export function createApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.discriminatedUnion("success", [
    z.object({
      success: z.literal(true),
      data: dataSchema,
    }),
    z.object({
      success: z.literal(false),
      error: ApiErrorSchema,
    }),
  ]);
}
