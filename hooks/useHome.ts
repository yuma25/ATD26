"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Badge } from "../backend/types";
import { BadgeService } from "../backend/services/badgeService";
import { signInAnonymously } from "../backend/lib/supabase";

/**
 * 【ホーム画面用カスタムフック】
 * データのロード、ユーザー情報の管理、カメラ権限の確認など、
 * メイン画面（冒険者の手記）で必要な機能をまとめて提供します。
 */
export const useHome = () => {
  // --- 状態管理 (State) ---
  const [badges, setBadges] = useState<Badge[]>([]); // 標本リスト
  const [acquiredBadgeIds, setAcquiredBadgeIds] = useState<string[]>([]); // 獲得済みIDリスト
  const [syncing, setSyncing] = useState(false); // 同期中フラグ
  const [fullUserId, setFullUserId] = useState<string>(""); // ユーザーID

  // partySize の状態: undefined (確認中), null (未設定), number (設定済み)
  const [partySize, setPartySize] = useState<number | null | undefined>(
    undefined,
  );

  // カメラ権限の状態
  const [cameraPermission, setCameraPermission] = useState<
    "prompt" | "granted" | "denied"
  >("prompt");

  const isLoadingRef = useRef(false); // 二重ロード防止用

  /**
   * --- 【第1章：データのロード】 ---
   * サーバーから最新の標本データと獲得状況を取得します。
   */
  const loadData = useCallback(async () => {
    // すでにロード中なら何もしない（早期リターン）
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setSyncing(true);

    try {
      // 1. 匿名サインインしてユーザー情報を取得
      const user = await signInAnonymously();
      if (!user) {
        throw new Error("ユーザー認証に失敗しました");
      }
      setFullUserId(user.id);

      // 2. 標本、獲得履歴、プロフィールを並列（同時）に取得して効率化
      const [allBadges, acquiredRows, profile] = await Promise.all([
        BadgeService.getAllBadges(),
        BadgeService.getAcquiredBadges(user.id),
        BadgeService.getProfile(user.id),
      ]);

      // 3. 人数設定 (party_size) の判定
      if (profile && typeof profile.party_size === "number") {
        setPartySize(profile.party_size);
      } else {
        setPartySize(null); // 未設定の場合は入力を促す
      }

      // 4. 獲得済みバッジの整理
      const myAcquiredIds = acquiredRows.map((r) => r.badge_id);
      setAcquiredBadgeIds(myAcquiredIds);

      // 5. バッジの並び替え（獲得したものは古い順、未獲得はインデックス順）
      const acquisitionMap = new Map(
        acquiredRows.map((r) => [r.badge_id, r.acquired_at]),
      );
      const sortedBadges = [...allBadges].sort((a, b) => {
        const tA = acquisitionMap.get(a.id);
        const tB = acquisitionMap.get(b.id);
        if (tA && tB) return new Date(tA).getTime() - new Date(tB).getTime();
        if (tA) return -1;
        if (tB) return 1;
        return a.target_index - b.target_index;
      });
      setBadges(sortedBadges);
    } catch (error) {
      console.error("❌ ロード中にエラーが発生しました:", error);
    } finally {
      setSyncing(false);
      isLoadingRef.current = false;
    }
  }, []);

  /**
   * --- 【第2章：ユーザー情報の更新】 ---
   */
  const updatePartySize = async (size: number) => {
    if (!fullUserId) return;
    setPartySize(size);
    const ok = await BadgeService.updateProfile(fullUserId, {
      party_size: size,
    });
    if (ok) {
      await loadData(); // 保存が成功したらデータを再ロード
    }
    return ok;
  };

  /**
   * --- 【第3章：カメラ権限の管理】 ---
   */
  useEffect(() => {
    const checkPermission = async () => {
      if (typeof window === "undefined" || !navigator.permissions?.query)
        return;

      try {
        const result = await navigator.permissions.query({
          name: "camera" as PermissionName,
        });
        setCameraPermission(result.state as "prompt" | "granted" | "denied");

        // 権限が変わった時に自動で反映
        result.onchange = () =>
          setCameraPermission(result.state as "prompt" | "granted" | "denied");
      } catch (e) {
        console.warn("Permissions API がサポートされていません", e);
      }
    };
    checkPermission();
  }, []);

  /**
   * --- 【第4章：イベントとライフサイクル】 ---
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    // 画面にフォーカスが戻った時に最新の状態に更新
    window.addEventListener("focus", loadData);
    return () => window.removeEventListener("focus", loadData);
  }, [loadData]);

  // 補助関数
  const isAcquired = (id: string) => acquiredBadgeIds.includes(id);

  return {
    badges,
    acquiredBadgeIds,
    syncing,
    fullUserId,
    partySize,
    showPartyInput: partySize === null,
    cameraPermission,
    isAcquired,
    // カメラ権限をリクエストする関数
    requestCameraPermission: async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        stream.getTracks().forEach((t) => t.stop()); // 確認が終わったらすぐ止める
        setCameraPermission("granted");
        return true;
      } catch {
        setCameraPermission("denied");
        return false;
      }
    },
    updatePartySize,
    refresh: loadData,
  };
};
