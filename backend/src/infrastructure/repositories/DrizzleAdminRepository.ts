import { IAdminRepository } from "../../domain/repositories/IAdminRepository";
import { Profile } from "../../domain/entities/Profile";
import { UserBadge } from "../../domain/entities/UserBadge";
import { supabaseAdmin } from "../external/supabase";
import { db } from "../db";
import { profiles, userBadges } from "../db/schema";
import { desc, gte } from "drizzle-orm";
import { ProfileSchema } from "../../domain/entities/Profile";
import { UserBadgeSchema } from "../../domain/entities/UserBadge";

/**
 * [概要] 管理者権限が必要な集計・管理操作のためのリポジトリ具象実装。
 */
export class DrizzleAdminRepository implements IAdminRepository {
  /**
   * [実行] Supabase Auth からすべてのユーザー（管理者を含む）を取得する。
   */
  async listAuthUsers(): Promise<any[]> {
    if (!supabaseAdmin) return [];
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;
    return data.users || [];
  }

  /**
   * [実行] 作成日時順ですべてのプロフィールを取得する。
   */
  async getAllProfiles(): Promise<Profile[]> {
    const results = await db.query.profiles.findMany({
      orderBy: [desc(profiles.createdAt)],
    });
    return results.map((r) =>
      ProfileSchema.parse({
        id: r.id,
        party_size: r.partySize,
        is_exchanged: r.isExchanged,
        created_at: r.createdAt,
        last_seen: r.lastSeen,
      }),
    );
  }

  /**
   * [実行] 指定された日時以降のすべての獲得記録を取得する。
   *
   * @param date 集計開始日時。
   */
  async getBadgesSince(date: Date): Promise<UserBadge[]> {
    const results = await db.query.userBadges.findMany({
      where: (userBadges, { gte }) =>
        gte(userBadges.acquiredAt, date.toISOString()),
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

  /**
   * [実行] システム全体の総獲得標本数を取得する。
   */
  async getTotalBadgeCount(): Promise<number> {
    const result = await db.select({ count: userBadges.id }).from(userBadges);
    return result.length;
  }
}
