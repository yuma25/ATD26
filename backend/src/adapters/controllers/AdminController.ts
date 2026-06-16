import { GetStatsUseCase } from "../../application/use-cases/GetStatsUseCase";

/**
 * [概要] 管理者向け（統計など）の Web リクエストを処理するコントローラー。
 */
export class AdminController {
  constructor(private getStatsUseCase: GetStatsUseCase) {}

  /**
   * [実行] 統計データを取得し、API レスポンス形式で返却する。
   * 
   * @param period 集計期間。
   * @param userId 特定ユーザーの照会を行う場合のユーザーID。
   */
  async getStats(period: string, userId: string | null) {
    try {
      const result = await this.getStatsUseCase.execute(period, userId);
      return { success: true, ...result };
    } catch (error: any) {
      console.error("❌ [AdminController.getStats]:", error);
      return {
        success: false,
        error: { code: "STATS_ERROR", message: "統計データの取得に失敗しました。", details: error.message },
      };
    }
  }
}
