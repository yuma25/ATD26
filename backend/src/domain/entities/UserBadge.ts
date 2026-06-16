import { z } from "zod";

/**
 * [概要] ユーザー獲得記録のエンティティ定義。
 * どのユーザーがどの標本を獲得したかという関係データ（交差テーブル）の構造とバリデーションルールを保証する。
 */
export const UserBadgeSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().min(1, "ユーザーIDは必須です"),
  badge_id: z.string().uuid("標本IDが正しくありません"),
  acquired_at: z.string(),
});

export type UserBadge = z.infer<typeof UserBadgeSchema>;

/**
 * [概要] 標本獲得リクエストのスキーマ定義。
 * APIリクエストのボディに含まれる獲得情報のバリデーションを行う。
 */
export const AcquireBadgeRequestSchema = z.object({
  userId: z.string().min(1),
  badgeId: z.string().uuid(),
});
