import { z } from "zod";

/**
 * [概要] 標本（バッジ）のエンティティ定義。
 * データベースへの保存時やAPI通信時に、データの構造とバリデーションルールを保証する。
 */
export const BadgeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "名前は必須です"),
  artist: z
    .string()
    .nullish()
    .transform((val) => val ?? undefined),
  model_url: z
    .string()
    .url("有効なURLを入力してください")
    .or(z.string().regex(/^\/.*$/, "相対パスは / から始めてください")),
  image_url: z
    .string()
    .url("有効なURLを入力してください")
    .or(z.string().regex(/^\/.*$/, "相対パスは / から始めてください")),
  target_index: z.number().int().min(0),
  created_at: z.string().optional(),
});

export type Badge = z.infer<typeof BadgeSchema>;
