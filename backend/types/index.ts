import { z } from "zod";

/**
 * 【データ型の定義と検証】
 * アプリケーションで扱うデータの「形」を定義し、正しくないデータが入らないようにチェック（検証）します。
 */

/**
 * --- 【第1章：標本（バッジ）の設計図】 ---
 */
export const BadgeSchema = z.object({
  id: z.string().min(1), // 固有のID（必須）
  name: z.string().min(1), // 標本の名前（必須）
  description: z.string(), // 標本の解説文
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/), // テーマカラー（16進数形式）
  model_url: z.string().min(1), // 3DモデルファイルのURL（必須）
  target_index: z.number().int().min(0), // ARマーカーの番号（必須）
  created_at: z.string().optional(), // 登録日時（任意）
});

/**
 * --- 【第2章：ユーザー獲得記録の設計図】 ---
 */
export const UserBadgeSchema = z.object({
  id: z.string().optional(), // 記録のID（自動付与）
  user_id: z.string().min(1), // 冒険者（ユーザー）のID（必須）
  badge_id: z.string().min(1), // 獲得した標本のID（必須）
  acquired_at: z.string(), // 獲得日時（必須）
});

/**
 * --- 【第3章：TypeScript用の型定義】 ---
 * 上記の設計図から、プログラム内で使いやすい「型」を自動的に作成します。
 */
export type Badge = z.infer<typeof BadgeSchema>;
export type UserBadge = z.infer<typeof UserBadgeSchema>;

/**
 * APIのレスポンス（返却値）の共通形式
 */
export interface BadgeServiceResponse<T> {
  data: T | null; // 成功した時のデータ
  error: Error | null; // 失敗した時のエラー情報
}
