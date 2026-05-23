import useSWR from "swr";
import { BadgeService } from "@backend/services/badgeService";

/**
 * パッケージ: hooks
 * ユーザープロフィールの管理に関連するフックを提供する。
 */

/**
 * [概要] 特定ユーザーのプロフィール情報を管理するカスタムフックである。
 * データの取得に加え、パーティ人数などの属性情報の更新機能を提供する。
 *
 * @param userId [string | undefined] 対象ユーザーのUUID。
 * @return states & methods [Object] プロフィールデータ、ロード状態、エラー、および更新関数。
 *
 * [技術的ステップ]
 * 1. データ同期: SWR を用いて 'api/profile/${userId}' というキーでキャッシュを管理する。
 * 2. キャッシュ戦略: 属性情報の変更頻度は低いため、dedupingInterval を 5分に設定し、再検証コストを削減する。
 * 3. 状態更新: updateProfile 関数内で BadgeService を呼び出し、成功時に SWR の mutate を実行して画面を最新状態にする。
 */
export function useProfile(userId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `api/profile/${userId}` : null,
    () => BadgeService.getProfile(userId!),
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
   * @param updates.party_size [number] (Optional) パーティ人数。
   * @return success [Promise<boolean>] 更新が成功したかどうかを返却する。
   */
  const updateProfile = async (updates: { party_size?: number }) => {
    if (!userId) return false;
    const success = await BadgeService.updateProfile(userId, updates);
    if (success) {
      // サーバー側の変更を検知させるため、キャッシュの再取得をトリガーする。
      void mutate();
    }
    return success;
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
