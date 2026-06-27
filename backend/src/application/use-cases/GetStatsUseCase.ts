import { IAdminRepository } from "../../domain/repositories/IAdminRepository";
import { ICacheService } from "../../domain/services/ICacheService";
import { IBadgeRepository } from "../../domain/repositories/IBadgeRepository";
import { calculateProgress } from "../../domain/logic/logic";

/**
 * [概要] 管理者向けの統計データ（来場者数、デバイス数など）を集計・取得するユースケース。
 */
export class GetStatsUseCase {
  constructor(
    private adminRepository: IAdminRepository,
    private badgeRepository: IBadgeRepository,
    private cacheService: ICacheService,
  ) {}

  async execute(period: string, userId: string | null) {
    const cacheKey = userId
      ? `stats_user_${userId}_${period}`
      : `stats_global_${period}`;
    if (!userId) {
      const cached = await this.cacheService.get(cacheKey);
      if (cached) return { data: cached, fromCache: true };
    }

    // 1. スタッフ除外用のIDリスト取得
    const adminUsers = await this.adminRepository.listAuthUsers();
    const adminIds = adminUsers
      .filter((u) => u?.app_metadata?.provider === "email" && !u?.is_anonymous)
      .map((u) => u.id);

    // 2. プロフィール集計（来場者数・デバイス数）
    const allProfiles = await this.adminRepository.getAllProfiles();
    const profiles = allProfiles.filter(
      (p) => p?.id && !adminIds.includes(p.id),
    );

    const totalDevices = profiles.length;
    const totalVisitors = profiles.reduce(
      (acc, curr) => acc + (curr?.party_size || 1),
      0,
    );

    // 3. 発見率の計算
    const allBadges = await this.badgeRepository.findAll();
    const totalBadgeTypes = allBadges.length;

    const sinceDate = new Date(0); // 全期間
    const allAcquisitions =
      await this.adminRepository.getBadgesSince(sinceDate);
    const userAcquisitions = allAcquisitions.filter(
      (a) => !adminIds.includes(a.user_id),
    );

    // 平均発見率 = (全非管理者の獲得数) / (非管理者デバイス数 * 全標本種数)
    const averageDiscoveryRate =
      totalDevices > 0 && totalBadgeTypes > 0
        ? calculateProgress(
            totalDevices * totalBadgeTypes,
            userAcquisitions.length,
          )
        : 0;

    // 4. 最近アクティブだったユーザーのリスト (最新10件)
    const recentUsers = profiles.slice(0, 10).map((p) => ({
      id: p.id,
      party_size: p.party_size || 1,
      created_at: p.created_at ? p.created_at.split(/[ T]/)[0] : "",
      last_seen: p.last_seen,
    }));

    // 5. アクティビティ推移 (hourlyStats) とデバイス推移
    const daysToTrack = period === "week" || period === "24h" ? 7 : 30;
    const statsMap: Record<
      string,
      { hour: string; devices: number; badges: number }
    > = {};
    const jstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);

    for (let i = 0; i < daysToTrack; i++) {
      const d = new Date(jstNow);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      statsMap[dateStr] = { hour: dateStr, devices: 0, badges: 0 };
    }

    profiles.forEach((p) => {
      if (p.created_at) {
        const dateStr = p.created_at.split(/[ T]/)[0];
        if (statsMap[dateStr] !== undefined) {
          statsMap[dateStr].devices++;
        }
      }
    });

    userAcquisitions.forEach((a) => {
      if (a.acquired_at) {
        const dateStr = a.acquired_at.split(/[ T]/)[0];
        if (statsMap[dateStr] !== undefined) {
          statsMap[dateStr].badges++;
        }
      }
    });

    const hourlyStats = Object.values(statsMap).sort((a, b) =>
      a.hour.localeCompare(b.hour),
    );
    const trendData = this.calculateTrend(userAcquisitions, daysToTrack);

    const data = {
      totalVisitors,
      totalDevices,
      totalBadges: userAcquisitions.length, // UIが期待するキー
      recentUsers, // UIが期待するキー
      hourlyStats, // UIが期待するキー
      discoveryCount: userAcquisitions.length,
      totalAcquisitions: userAcquisitions.length, // 互換性のため
      discoveryRate:
        totalDevices > 0
          ? Number((userAcquisitions.length / totalDevices).toFixed(2))
          : 0,
      averageDiscoveryRate,
      activityTrend: trendData,
    };

    if (!userId) {
      await this.cacheService.set(cacheKey, data, 300);
    }

    return { data, fromCache: false };
  }

  /**
   * 獲得記録から日付ごとの集計データを作成する
   */
  private calculateTrend(acquisitions: any[], days: number) {
    const trend: Record<string, number> = {};
    // DBに合わせて JST で計算
    const jstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);

    // 直近の日付枠を初期化
    for (let i = 0; i < days; i++) {
      const d = new Date(jstNow);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      trend[dateStr] = 0;
    }

    // データをマッピング
    acquisitions.forEach((a) => {
      // "YYYY-MM-DD HH:mm:ss" または "YYYY-MM-DDTHH:mm:ss" の両方に対応
      const dateStr = a.acquired_at.split(/[ T]/)[0];
      if (trend[dateStr] !== undefined) {
        trend[dateStr]++;
      }
    });

    return Object.entries(trend)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
