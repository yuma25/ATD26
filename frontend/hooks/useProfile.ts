import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

/**
 * パッケージ: hooks
 * ユーザープロフィールの管理に関連するフックを提供する。
 */

/**
 * [概要] 特定ユーザーのプロフィール情報を管理するカスタムフックである。
 * データの取得に加え、パーティ人数などの属性情報の更新機能を提供する。
 *
 * @param userId [string | undefined] 対象ユーザーのUUID。
 */
export function useProfile(userId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/api/v1/profile/get?userId=${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5分間は同一キャッシュを保持する。
    },
  );

  /**
   * [概要] プロフィール情報（パーティ人数など）を更新する。
   * 保存に成功した場合、内部キャッシュを即座に再検証して UI に反映させる。
   *
   * @param updates [Object] 更新内容。
   * @return success [Promise<boolean>] 更新が成功したかどうかを返却する。
   */
  const updateProfile = async (updates: { party_size?: number; is_exchanged?: boolean }) => {
    if (!userId) return false;
    try {
      const res = await fetch("/api/v1/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, updates }),
      });
      const result = await res.json();
      if (result.success) {
        void mutate();
        return true;
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
    return false;
  };

  return {
    /** 現在のプロフィールデータ（DBレコード） */
    profile: data,
    /** プロフィールの取得中フラグ */
    isLoading,
    /** エラーオブジェクト */
    isError: error,
    /** プロフィール更新用関数 */
    updateProfile,
    /** 最新データを手動で取得し直す関数 */
    refresh: mutate,
  };
}
