import { IProfileRepository } from "../../domain/repositories/IProfileRepository";
import { Profile } from "../../domain/entities/Profile";

/**
 * [概要] 特定ユーザーのプロフィール情報を取得するユースケース。
 *
 * [依存関係]
 * - IProfileRepository: プロフィールデータの取得を担当。
 */
export class GetProfileUseCase {
  constructor(private profileRepository: IProfileRepository) {}

  /**
   * [実行] 指定されたユーザーのプロフィールを取得する。
   * @param userId 対象ユーザーID。
   */
  async execute(userId: string): Promise<Profile | null> {
    return await this.profileRepository.findById(userId);
  }
}
