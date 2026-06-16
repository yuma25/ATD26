import { Profile } from "../entities/Profile";

/**
 * [概要] プロフィールデータに対する操作のインターフェース。
 */
export interface IProfileRepository {
  /** [実行] 指定されたIDのプロフィールを取得する。 */
  findById(id: string): Promise<Profile | null>;
  /** [実行] プロフィールを作成、または既存の場合は更新(upsert)する。 */
  upsert(profile: Partial<Profile> & { id: string }): Promise<Profile | null>;
}
