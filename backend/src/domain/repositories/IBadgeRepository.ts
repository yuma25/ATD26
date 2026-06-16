import { Badge } from "../entities/Badge";

/**
 * [概要] 標本（バッジ）データに対する操作のインターフェース。
 */
export interface IBadgeRepository {
  /** [実行] すべての標本データを取得する。 */
  findAll(): Promise<Badge[]>;
  /** [実行] 指定されたIDの標本データを取得する。 */
  findById(id: string): Promise<Badge | null>;
}
