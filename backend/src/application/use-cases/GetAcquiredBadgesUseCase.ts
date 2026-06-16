import { IUserBadgeRepository } from "../../domain/repositories/IUserBadgeRepository";
import { UserBadge } from "../../domain/entities/UserBadge";

/**
 * [概要] 特定ユーザーの獲得済み標本一覧を取得するユースケース。
 * 
 * [依存関係]
 * - IUserBadgeRepository: 獲得記録データの取得を担当。
 */
export class GetAcquiredBadgesUseCase {
  constructor(private userBadgeRepository: IUserBadgeRepository) {}

  /**
   * [実行] 指定されたユーザーのすべての獲得記録を取得する。
   * @param userId 対象ユーザーID。
   */
  async execute(userId: string): Promise<UserBadge[]> {
    return await this.userBadgeRepository.findByUserId(userId);
  }
}
