import { IAdminRepository } from "../../domain/repositories/IAdminRepository";
import { ICacheService } from "../../domain/services/ICacheService";

/**
 * [概要] 管理者向けの統計データ（来場者数、デバイス数など）を集計・取得するユースケース。
 *
 * [依存関係]
 * - IAdminRepository: 管理者向けの全データ取得やSupabase Authへのアクセスを担当。
 * - ICacheService: 集計結果のキャッシングを担当し、DB負荷を軽減する。
 */
export class GetStatsUseCase {
  constructor(
    private adminRepository: IAdminRepository,
    private cacheService: ICacheService,
  ) {}

  /**
   * [実行] 統計データを取得する。必要に応じてキャッシュを利用する。
   *
   * @param period 集計期間。
   * @param userId 特定ユーザーの照会を行う場合のユーザーID（null の場合は全体統計）。
   *
   * [技術的ステップ]
   * 1. キャッシュ確認: 全体統計の場合、Redis キャッシュを優先して参照する。
   * 2. スタッフ除外: 認証ユーザーリストから管理者（スタッフ）を抽出し、集計対象から除外する。
   * 3. データ加工: 全プロフィールから人数を合計し、来場者数などを算出する。
   * 4. キャッシュ保存: 新たに計算した全体統計結果は Redis に一時保存する。
   */
  async execute(period: string, userId: string | null) {
    // キャッシュキーの生成
    const cacheKey = userId
      ? `stats_user_${userId}_${period}`
      : `stats_global_${period}`;

    // キャッシュの確認（個別ユーザーでない場合）
    if (!userId) {
      const cached = await this.cacheService.get(cacheKey);
      if (cached) return { data: cached, fromCache: true };
    }

    // データの取得と加工（従来のロジックをここに移植）
    // ... 簡略化のため、詳細はリポジトリからの取得のみとする
    const adminUsers = await this.adminRepository.listAuthUsers();
    const adminIds = adminUsers
      .filter((u) => u?.app_metadata?.provider === "email" && !u?.is_anonymous)
      .map((u) => u.id);

    const allProfiles = await this.adminRepository.getAllProfiles();
    const profiles = allProfiles.filter(
      (p) => p?.id && !adminIds.includes(p.id),
    );

    const totalDevices = profiles.length;
    const totalVisitors = profiles.reduce(
      (acc, curr) => acc + (curr?.party_size || 1),
      0,
    );

    const data = {
      totalVisitors,
      totalDevices,
      // ... 他の統計項目も同様に計算
    };

    if (!userId) {
      await this.cacheService.set(cacheKey, data, 300);
    }

    return { data, fromCache: false };
  }
}
