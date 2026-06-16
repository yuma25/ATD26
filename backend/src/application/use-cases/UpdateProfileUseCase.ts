import { IProfileRepository } from "../../domain/repositories/IProfileRepository";
import { Profile } from "../../domain/entities/Profile";

/**
 * [概要] ユーザープロフィールの属性情報を更新するユースケース。
 * 
 * [依存関係]
 * - IProfileRepository: プロフィールデータの更新（upsert）を担当。
 */
export class UpdateProfileUseCase {
  constructor(private profileRepository: IProfileRepository) {}

  /**
   * [実行] 指定されたユーザーの属性情報（人数、景品交換フラグ等）を更新する。
   * 
   * @param userId 更新対象ユーザーのID。
   * @param updates 更新内容を含むオブジェクト。
   * @return Promise<boolean> 更新に成功した場合は true、失敗した場合は false。
   */
  async execute(userId: string, updates: Partial<Profile>): Promise<boolean> {
    const result = await this.profileRepository.upsert({ id: userId, ...updates });
    return !!result;
  }
}
