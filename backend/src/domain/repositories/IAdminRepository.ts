import { Profile } from "../entities/Profile";
import { UserBadge } from "../entities/UserBadge";

/**
 * [概要] 管理者権限が必要なデータ操作を行うためのリポジトリインターフェース。
 * 統計情報の集計や、ユーザー全体の情報取得に必要なメソッドを定義する。
 */
export interface IAdminRepository {
  /** [実行] Supabase Auth に登録されているすべてのユーザー情報を取得する。 */
  listAuthUsers(): Promise<any[]>;
  /** [実行] システム上のすべてのプロフィール情報を取得する。 */
  getAllProfiles(): Promise<Profile[]>;
  /** [実行] 指定された日時以降に獲得されたすべての標本記録を取得する。 */
  getBadgesSince(date: Date): Promise<UserBadge[]>;
  /** [実行] システム全体の総標本獲得数を取得する。 */
  getTotalBadgeCount(): Promise<number>;
}
