import useSWR from "swr";
import { BadgeService } from "@backend/services/badgeService";

/**
 * パッケージ: hooks
 * 標本データの取得およびキャッシュ管理を担うフックを提供する。
 */

/**
 * [概要] 全ての標本マスターデータを取得し管理するカスタムフックである。
 * SWR を用いてデータの再検証、重複排除、およびキャッシュの再利用を行う。
 *
 * @return states & methods [Object] 標本データ、ロード状態、エラー状態、および手動更新関数を含むオブジェクト。
 *
 * [技術的ステップ]
 * 1. データ取得: BadgeService.getAllBadges() を呼び出し、標本の配列を取得する。
 * 2. キャッシュ戦略: revalidateOnFocus を無効にし、不要な再取得を抑制する。
 * 3. 有効期限: dedupingInterval を 60秒に設定し、短期間の重複リクエストを統合する。
 */
export function useBadges() {
  const { data, error, isLoading, mutate } = useSWR(
    "api/badges",
    () => BadgeService.getAllBadges(),
    {
      revalidateOnFocus: false, // 画面がフォーカスを得た際の自動更新をオフにする。
      dedupingInterval: 60000, // 1分間は同一キーのキャッシュを優先して再利用する。
    },
  );

  return {
    /** 標本データのマスター配列（初期値は空配列） */
    badges: data || [],
    /** データの取得中フラグ */
    isLoading,
    /** エラーオブジェクト（発生時のみ） */
    isError: error,
    /** キャッシュを手動で更新（再検証）する関数 */
    refresh: mutate,
  };
}

/**
 * [概要] 特定ユーザーの獲得済み標本履歴を取得し管理するカスタムフックである。
 *
 * @param userId [string | undefined] 対象ユーザーのUUID。
 * @return states & methods [Object] 獲得履歴データ、ロード状態、および手動更新関数。
 *
 * [技術的ステップ]
 * 1. キー生成: userId が存在する場合のみ 'api/badges/acquired/${userId}' というキーでキャッシュを管理する。
 * 2. 同期制御: revalidateOnFocus を有効にし、画面遷移時に最新の獲得状況を反映可能にする。
 */
export function useAcquiredBadges(userId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `api/badges/acquired/${userId}` : null,
    () => BadgeService.getAcquiredBadges(userId!),
    {
      revalidateOnFocus: true,
      dedupingInterval: 10000, // 高頻度な再取得を防ぐため10秒のインターバルを設ける。
    },
  );

  return {
    /** ユーザーが獲得した標本履歴の配列 */
    acquiredBadges: data || [],
    /** 履歴データの取得中フラグ */
    isLoading,
    /** エラーオブジェクト */
    isError: error,
    /** 履歴を最新の状態に更新する関数 */
    refresh: mutate,
  };
}
