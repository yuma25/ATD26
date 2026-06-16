import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

/**
 * パッケージ: hooks
 * 標本データの取得およびキャッシュ管理を担うフックを提供する。
 */

/**
 * [概要] 全ての標本マスターデータを取得し管理するカスタムフックである。
 * SWR を用いてデータの再検証、重複排除、およびキャッシュの再利用を行う。
 */
export function useBadges() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/v1/badges",
    fetcher,
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
 */
export function useAcquiredBadges(userId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/api/v1/badges/acquired?userId=${userId}` : null,
    fetcher,
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
