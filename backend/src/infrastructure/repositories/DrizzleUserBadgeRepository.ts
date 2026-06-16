import { IUserBadgeRepository } from "../../domain/repositories/IUserBadgeRepository";
import { UserBadge, UserBadgeSchema } from "../../domain/entities/UserBadge";
import { db } from "../db";
import { userBadges } from "../db/schema";

/**
 * [概要] Drizzle ORM を使用した獲得済み標本記録のリポジトリ具象実装。
 */
export class DrizzleUserBadgeRepository implements IUserBadgeRepository {
  /**
   * [実行] 新しい獲得記録を作成する。
   *
   * @param userId 獲得ユーザーID。
   * @param badgeId 標本ID。
   */
  async create(
    userId: string,
    badgeId: string,
  ): Promise<{ data: UserBadge | null; error: any }> {
    try {
      const result = await db
        .insert(userBadges)
        .values({
          userId,
          badgeId,
        })
        .returning();

      return {
        data: result[0]
          ? UserBadgeSchema.parse({
              id: result[0].id,
              user_id: result[0].userId,
              badge_id: result[0].badgeId,
              acquired_at: result[0].acquiredAt,
            })
          : null,
        error: null,
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * [実行] 特定ユーザーのすべての獲得記録を取得する。
   *
   * @param userId 対象ユーザーID。
   */
  async findByUserId(userId: string): Promise<UserBadge[]> {
    const results = await db.query.userBadges.findMany({
      where: (userBadges, { eq }) => eq(userBadges.userId, userId),
    });

    return results.map((r) =>
      UserBadgeSchema.parse({
        id: r.id,
        user_id: r.userId,
        badge_id: r.badgeId,
        acquired_at: r.acquiredAt,
      }),
    );
  }
}
