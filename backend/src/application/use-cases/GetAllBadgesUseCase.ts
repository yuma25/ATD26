import { IBadgeRepository } from "../../domain/repositories/IBadgeRepository";
import { Badge } from "../../domain/entities/Badge";

/**
 * [概要] すべての標本データを取得するユースケース。
 *
 * [依存関係]
 * - IBadgeRepository: 標本データの永続化層へのアクセスを担当。
 */
export class GetAllBadgesUseCase {
  constructor(private badgeRepository: IBadgeRepository) {}

  /**
   * [実行] 登録されているすべての標本情報を取得する。
   *
   * @return Promise<Badge[]> 標本オブジェクトの配列。
   */
  async execute(): Promise<Badge[]> {
    return await this.badgeRepository.findAll();
  }
}
