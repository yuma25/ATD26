import { IBadgeRepository } from "../../domain/repositories/IBadgeRepository";
import { Badge, BadgeSchema } from "../../domain/entities/Badge";
import { db } from "../db";
import { badges } from "../db/schema";
import { asc } from "drizzle-orm";

/**
 * [概要] Drizzle ORM を使用した標本データのリポジトリ具象実装。
 */
export class DrizzleBadgeRepository implements IBadgeRepository {
  /**
   * [実行] 全標本データをターゲットインデックス順に取得する。
   * 
   * [技術的ステップ]
   * 1. 問い合わせ: Drizzle の db.query インターフェースを使用して全レコードを取得。
   * 2. 変換: キャメルケースの DB 結果を、ドメインエンティティが期待するスネークケース形式にマッピングして Zod でパースする。
   */
  async findAll(): Promise<Badge[]> {
    const results = await db.query.badges.findMany({
      orderBy: [asc(badges.targetIndex)],
    });

    return results.map((r) => BadgeSchema.parse({
      id: r.id,
      name: r.name,
      artist: r.artist,
      model_url: r.modelUrl,
      image_url: r.imageUrl,
      target_index: r.targetIndex,
      created_at: r.createdAt
    }));
  }

  /**
   * [実行] ID 指定で標本を 1 件取得する。
   * 
   * @param id 標本ID。
   */
  async findById(id: string): Promise<Badge | null> {
    const result = await db.query.badges.findFirst({
      where: (badges, { eq }) => eq(badges.id, id),
    });

    return result ? BadgeSchema.parse({
      id: result.id,
      name: result.name,
      artist: result.artist,
      model_url: result.modelUrl,
      image_url: result.imageUrl,
      target_index: result.targetIndex,
      created_at: result.createdAt
    }) : null;
  }
}
