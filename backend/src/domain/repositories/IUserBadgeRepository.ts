import { UserBadge } from "../entities/UserBadge";

/**
 * [概要] 獲得済み標本データ（ユーザーと標本の中間テーブル）に対する操作のインターフェース。
 */
export interface IUserBadgeRepository {
  /** [実行] 新しい獲得記録を作成する。 */
  create(userId: string, badgeId: string): Promise<{ data: UserBadge | null; error: unknown }>;
  /** [実行] 指定されたユーザーのすべての獲得記録を取得する。 */
  findByUserId(userId: string): Promise<UserBadge[]>;
}
