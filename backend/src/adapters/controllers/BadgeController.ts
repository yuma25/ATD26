import { GetAllBadgesUseCase } from "../../application/use-cases/GetAllBadgesUseCase";
import { AcquireBadgeUseCase } from "../../application/use-cases/AcquireBadgeUseCase";
import { GetAcquiredBadgesUseCase } from "../../application/use-cases/GetAcquiredBadgesUseCase";
import { BadgeSchema } from "../../domain/entities/Badge";
import { UserBadgeSchema } from "../../domain/entities/UserBadge";

/**
 * [概要] 標本（バッジ）に関する Web リクエストを処理するコントローラー。
 * 外部（Next.js API Routes）からの入力を受け取り、適切なユースケースを呼び出す。
 */
export class BadgeController {
  constructor(
    private getAllBadgesUseCase: GetAllBadgesUseCase,
    private acquireBadgeUseCase: AcquireBadgeUseCase,
    private getAcquiredBadgesUseCase: GetAcquiredBadgesUseCase,
  ) {}

  /**
   * [実行] すべての標本情報を取得し、API レスポンス形式で返却する。
   */
  async getAll() {
    try {
      const badges = await this.getAllBadgesUseCase.execute();
      return { success: true, data: badges.map((b) => BadgeSchema.parse(b)) };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: "標本データの取得に失敗しました。",
          details: message,
        },
      };
    }
  }

  /**
   * [実行] 標本の獲得を記録し、結果を API レスポンス形式で返却する。
   *
   * @param userId 獲得ユーザーID。
   * @param badgeId 標本ID。
   */
  async acquire(userId: string, badgeId: string) {
    try {
      const { data, error } = await this.acquireBadgeUseCase.execute(
        userId,
        badgeId,
      );
      if (error) throw error;
      return { success: true, data: data ? UserBadgeSchema.parse(data) : null };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: {
          code: "ACQUIRE_ERROR",
          message: "標本の獲得記録に失敗しました。",
          details: message,
        },
      };
    }
  }

  /**
   * [実行] 特定ユーザーの獲得済み標本リストを取得する。
   *
   * @param userId 対象ユーザーID。
   */
  async getAcquired(userId: string) {
    try {
      const acquired = await this.getAcquiredBadgesUseCase.execute(userId);
      return {
        success: true,
        data: acquired.map((b) => UserBadgeSchema.parse(b)),
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: {
          code: "FETCH_ACQUIRED_ERROR",
          message: "獲得履歴の取得に失敗しました。",
          details: message,
        },
      };
    }
  }
}
