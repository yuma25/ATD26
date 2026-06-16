"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { signInAnonymously, supabase } from "@backend/src/infrastructure/external/supabase";
import { fetcher } from "@/lib/fetcher";

/**
 * パッケージ: hooks
 * ホーム画面のライフサイクルと状態管理を統合するフックを提供する。
 */

/**
 * [概要] ホーム画面（冒険者の手記）に必要な全データと操作ロジックを提供するカスタムフックである。
 * 匿名認証の管理、標本リストのソート、カメラ権限の制御、およびユーザー情報の同期を担う。
 *
 * @return states & methods [Object] ホーム画面の描画と操作に必要な状態・関数群。
 *
 * [技術的ステップ]
 * 1. 永続データ同期: SWR を用いて標本マスタ、ユーザーセッション、獲得済み履歴、プロフィール情報を並列に取得・キャッシュする。
 * 2. 状態集計: initialLoading や syncing フラグを各 SWR の状態から算出し、UI での一貫した待機・同期表現を可能にする。
 * 3. 認証管理: supabase.auth.onAuthStateChange を監視し、サインアウト時にキャッシュを即座にクリアする。
 * 4. ソートロジック: 標本リストを獲得済みかどうか、および獲得日時順でソートし、ユーザーの「発見の旅」を可視化する。
 * 5. 操作抽象化: カメラ権限のリクエストや、匿名サインインを伴う人数更新などの非同期操作をカプセル化して提供する。
 */
export const useHome = () => {
  // --- 内部状態 ---
  /** ローカルでの人数送信済みフラグ（通信遅延時のUI制御用） */
  const [localSubmitted, setLocalSubmitted] = useState(false);

  // 1. 基本的な標本リストの取得 (SWR)
  const {
    data: allBadges = [],
    isLoading: loadingBadges,
    isValidating: validatingBadges,
  } = useSWR("/api/v1/badges", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  // 2. ユーザーセッションとIDの管理
  const { data: sessionData, mutate: mutateSession } = useSWR(
    "user-session",
    async () => {
      if (!supabase) return null;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    },
  );

  const user = sessionData?.user;
  const userId = user?.id || "";

  // 3. ユーザー固有データの取得 (SWR)
  const {
    data: acquiredRows = [],
    isLoading: loadingAcquired,
    isValidating: validatingAcquired,
    mutate: mutateAcquired,
  } = useSWR(
    userId ? `/api/v1/badges/acquired?userId=${userId}` : null,
    fetcher,
    { revalidateOnFocus: true },
  );

  const {
    data: profile,
    isLoading: loadingProfile,
    isValidating: validatingProfile,
    mutate: mutateProfile,
  } = useSWR(
    userId ? `/api/v1/profile/get?userId=${userId}` : null,
    fetcher,
    { revalidateOnFocus: true },
  );

  // --- 状態の集計 ---

  /** 「本当にデータがなくて待機が必要な初期状態」であるかを判定するフラグ */
  const initialLoading =
    loadingBadges || (userId !== "" && (loadingAcquired || loadingProfile));

  /** バックグラウンドでのデータ検証（同期）中であるかを判定するフラグ */
  const syncing = validatingBadges || validatingAcquired || validatingProfile;

  /** カメラ権限の現在の状態 ("prompt" | "granted" | "denied") */
  const [cameraPermission, setCameraPermission] = useState<
    "prompt" | "granted" | "denied"
  >("prompt");

  // --- 計算・加工 ---
  /** 獲得済み標本の ID リストをメモ化する。 */
  const acquiredBadgeIds = useMemo(
    () => acquiredRows.map((r: unknown) => (r as { badge_id: string }).badge_id),
    [acquiredRows],
  );

  /** 獲得状況を考慮してソートされた標本リストを生成する。
   * 獲得済みを優先し、かつ獲得が古い順に並べる。未獲得は target_index 順。 */
  const sortedBadges = useMemo(() => {
    if (allBadges.length === 0) return [];
    const acquisitionMap = new Map<string, string>(
      acquiredRows.map((r: unknown) => {
        const item = r as { badge_id: string; acquired_at: string };
        return [item.badge_id, item.acquired_at];
      }),
    );

    return [...allBadges].sort((a, b) => {
      const tA = acquisitionMap.get(a.id);
      const tB = acquisitionMap.get(b.id);
      if (tA && tB) return new Date(tA).getTime() - new Date(tB).getTime();
      if (tA) return -1;
      if (tB) return 1;
      return a.target_index - b.target_index;
    });
  }, [allBadges, acquiredRows]);

  /** ログインユーザーが管理者（メール認証かつ非匿名）であるかを判定する。 */
  const isAdmin = useMemo(() => {
    if (!user) return false;
    return (
      user.app_metadata?.provider === "email" && !(user.is_anonymous ?? false)
    );
  }, [user]);

  /** 画面表示用のユーザー識別子を生成する。 */
  const displayId = useMemo(() => {
    if (!userId) return "";
    if (isAdmin) return `STAFF-ADMIN-${userId.slice(0, 4).toUpperCase()}`;
    return userId;
  }, [userId, isAdmin]);

  /**
   * [概要] 認証イベントの監視設定である。
   * サインアウト発生時に、メモリ上のデータや SWR キャッシュを明示的にクリアする。
   */
  useEffect(() => {
    if (!supabase) return;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      console.log(`🔐 認証イベント検知: ${event}`);
      void mutateSession();
      if (event === "SIGNED_OUT") {
        void mutateAcquired([], false);
        void mutateProfile(null, false);
      }
    });
    return () => subscription.unsubscribe();
  }, [mutateSession, mutateAcquired, mutateProfile]);

  return {
    /** ソート済みの標本配列 */
    badges: sortedBadges,
    /** 獲得済みの標本ID配列 */
    acquiredBadgeIds,
    /** データ同期中フラグ */
    syncing,
    /** 初期ロード中フラグ */
    initialLoading,
    /** ユーザーのUUID */
    fullUserId: userId,
    /** 表示用ID（管理者表示含む） */
    displayId,
    /** プロフィール上の人数設定 */
    partySize: profile?.party_size ?? (userId ? null : undefined),
    /** 景品交換済みフラグ */
    isExchanged: profile?.is_exchanged ?? false,
    /** 人数入力モーダルを表示すべきかどうかの判定ロジック */
    showPartyInput:
      !localSubmitted &&
      !isAdmin &&
      !initialLoading &&
      (userId === "" ||
        (profile !== undefined &&
          (profile?.party_size === undefined || profile?.party_size === null))),
    /** カメラ権限状態 */
    cameraPermission,
    /** [概要] 特定の標本を獲得済みか判定する。 @param id [string] 標本ID。 @return boolean */
    isAcquired: (id: string) => acquiredBadgeIds.includes(id),
    /**
     * [概要] カメラの使用許可を OS/ブラウザにリクエストする。
     * @return result [Promise<boolean>] 許可された場合は true を返却する。
     */
    requestCameraPermission: async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        // 権限確認が目的のため、ストリームは即座に停止する。
        stream.getTracks().forEach((t) => t.stop());
        setCameraPermission("granted");
        return true;
      } catch {
        setCameraPermission("denied");
        return false;
      }
    },
    /**
     * [概要] パーティ人数を更新・保存する。
     * 必要に応じて匿名サインインを自動実行し、プロフィールを永続化する。
     * @param size [number] 登録する人数。
     * @return success [Promise<boolean>] 成功した場合は true を返却する。
     */
    updatePartySize: async (size: number) => {
      setLocalSubmitted(true); // UI フリッカー防止のため、即座にフラグを立てる。
      const u = await signInAnonymously();
      if (!u) {
        setLocalSubmitted(false);
        return false;
      }
      try {
        const res = await fetch("/api/v1/profile/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: u.id, updates: { party_size: size } }),
        });
        const result = await res.json();
        
        if (result.success) {
          void mutateProfile();
          void mutateSession();
          return true;
        }
      } catch (error) {
        console.error(error);
      }
      setLocalSubmitted(false); // 失敗時は再入力を促すためフラグを戻す。
      return false;
    },
    /**
     * [概要] 景品交換済みステータスをサーバーに記録する。
     * @return success [Promise<boolean>] 成功した場合は true を返却する。
     */
    exchangePrize: async () => {
      if (!userId) return false;
      try {
        const res = await fetch("/api/v1/profile/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, updates: { is_exchanged: true } }),
        });
        const result = await res.json();
        
        if (result.success) {
          void mutateProfile();
          return true;
        }
      } catch (error) {
        console.error(error);
      }
      return false;
    },

    /**
     * [概要] 獲得状況とプロフィール情報を手動で再取得する。
     */
    refresh: async () => {
      await Promise.all([mutateAcquired(), mutateProfile()]);
    },
  };
};
