import { IUserBadgeRepository } from "../../domain/repositories/IUserBadgeRepository";
import { IProfileRepository } from "../../domain/repositories/IProfileRepository";
import { UserBadge } from "../../domain/entities/UserBadge";

/**
 * [概要] 標本の獲得（発見記録）を永続化するユースケース。
 * 
 * [依存関係]
 * - IUserBadgeRepository: 獲得記録の保存を担当。
 * - IProfileRepository: ユーザープロフィールの存在確認と自動作成を担当。
 */
export class AcquireBadgeUseCase {
  constructor(
    private userBadgeRepository: IUserBadgeRepository,
    private profileRepository: IProfileRepository
  ) {}

  /**
   * [実行] ユーザーによる標本の獲得を記録する。
   * 
   * @param userId 獲得したユーザーのID。
   * @param badgeId 獲得対象の標本ID。
   * @return Promise<{ data: UserBadge | null, error: unknown }> 登録された記録データ、またはエラー。
   * 
   * [技術的ステップ]
   * 1. プロフィールの整合性確保: 外部キー制約違反を防ぐため、事前にプロフィールの存在を確認し、不在なら作成する。
   * 2. 獲得記録の保存: リポジトリを介して重複を許容せずにレコードを挿入する。
   */
  async execute(userId: string, badgeId: string): Promise<{ data: UserBadge | null; error: unknown }> {
    // 1. プロフィールの存在確認と作成（必要に応じて）
    const profile = await this.profileRepository.findById(userId);
    if (!profile) {
      console.log(`🆕 Profile not found for ${userId}, creating now...`);
      await this.profileRepository.upsert({ id: userId });
    }

    // 2. 獲得記録の作成
    return await this.userBadgeRepository.create(userId, badgeId);
  }
}
