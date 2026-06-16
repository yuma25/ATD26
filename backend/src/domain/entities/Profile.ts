import { z } from "zod";

/**
 * [概要] プロフィール（来場者管理）のエンティティ定義。
 * ユーザーごとの属性情報（パーティ人数、景品交換状態）の構造とバリデーションルールを保証する。
 */
export const ProfileSchema = z.object({
  id: z.string().min(1),
  party_size: z.number().int().min(1).max(10).nullable().optional(),
  is_exchanged: z.boolean().default(false),
  created_at: z.string().optional(),
  last_seen: z.string().optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;

/**
 * [概要] プロフィール更新リクエストのスキーマ定義。
 * APIリクエストのボディに含まれる更新内容のバリデーションを行う。
 */
export const UpdateProfileRequestSchema = z.object({
  userId: z.string().min(1),
  updates: z.object({
    party_size: z.number().int().min(1).max(10).optional(),
    is_exchanged: z.boolean().optional(),
  }),
});
