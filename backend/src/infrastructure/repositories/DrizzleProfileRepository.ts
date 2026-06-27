import { IProfileRepository } from "../../domain/repositories/IProfileRepository";
import { Profile, ProfileSchema } from "../../domain/entities/Profile";
import { db } from "../db";
import { profiles } from "../db/schema";
import { sql } from "drizzle-orm";

/**
 * [概要] Drizzle ORM を使用したプロフィールデータのリポジトリ具象実装。
 */
export class DrizzleProfileRepository implements IProfileRepository {
  /**
   * [実行] 特定ユーザーのプロフィールを取得する。
   *
   * @param id ユーザーID。
   */
  async findById(id: string): Promise<Profile | null> {
    const result = await db.query.profiles.findFirst({
      where: (profiles, { eq }) => eq(profiles.id, id),
    });
    return result
      ? ProfileSchema.parse({
          id: result.id,
          party_size: result.partySize,
          is_exchanged: result.isExchanged,
          created_at: result.createdAt,
          last_seen: result.lastSeen,
        })
      : null;
  }

  /**
   * [実行] プロフィール情報を更新または作成 (upsert) する。
   *
   * @param profile 更新内容。
   *
   * [技術的ステップ]
   * 1. 書き込み: onConflictDoUpdate を使用し、ID が重複した場合は既存レコードを更新する。
   * 2. 日時更新: lastSeen フィールドを JST の現在時刻で強制的に更新する。
   */
  async upsert(
    profile: Partial<Profile> & { id: string },
  ): Promise<Profile | null> {
    const { id, party_size, is_exchanged } = profile;

    const result = await db
      .insert(profiles)
      .values({
        id,
        partySize: party_size,
        isExchanged: is_exchanged,
        lastSeen: sql`(now() + interval '9 hours')`,
      })
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          partySize: party_size,
          isExchanged: is_exchanged,
          lastSeen: sql`(now() + interval '9 hours')`,
        },
      })
      .returning();

    return result[0]
      ? ProfileSchema.parse({
          id: result[0].id,
          party_size: result[0].partySize,
          is_exchanged: result[0].isExchanged,
          created_at: result[0].createdAt,
          last_seen: result[0].lastSeen,
        })
      : null;
  }
}
