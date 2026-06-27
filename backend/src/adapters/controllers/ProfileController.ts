import { GetProfileUseCase } from "../../application/use-cases/GetProfileUseCase";
import { UpdateProfileUseCase } from "../../application/use-cases/UpdateProfileUseCase";
import { ProfileSchema } from "../../domain/entities/Profile";

/**
 * [概要] ユーザープロフィールに関する Web リクエストを処理するコントローラー。
 */
export class ProfileController {
  constructor(
    private getProfileUseCase: GetProfileUseCase,
    private updateProfileUseCase: UpdateProfileUseCase,
  ) {}

  /**
   * [実行] 特定ユーザーのプロフィールを取得する。
   *
   * @param userId ユーザーID。
   */
  async get(userId: string) {
    try {
      const profile = await this.getProfileUseCase.execute(userId);
      return {
        success: true,
        data: profile ? ProfileSchema.parse(profile) : null,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: {
          code: "FETCH_PROFILE_ERROR",
          message: "プロフィールの取得に失敗しました。",
          details: message,
        },
      };
    }
  }

  /**
   * [実行] ユーザープロフィールの属性情報を更新する。
   *
   * @param userId ユーザーID。
   * @param updates 更新内容。
   */
  async update(userId: string, updates: any) {
    try {
      const success = await this.updateProfileUseCase.execute(userId, updates);
      return { success };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: {
          code: "UPDATE_PROFILE_ERROR",
          message: "プロフィールの更新に失敗しました。",
          details: message,
        },
      };
    }
  }
}
