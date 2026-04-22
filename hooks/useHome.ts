"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "../backend/types";
import { BadgeService } from "../backend/services/badgeService";
import { signInAnonymously } from "../backend/lib/supabase";

export const useHome = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [acquiredBadgeIds, setAcquiredBadgeIds] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(true);
  const [fullUserId, setFullUserId] = useState<string>("");
  const [cameraPermission, setCameraPermission] = useState<
    "prompt" | "granted" | "denied"
  >("prompt");

  /**
   * カメラの許可を要求する (ユーザーのボタン操作から呼び出される)
   */
  const requestCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setCameraPermission("granted");
      return true;
    } catch (err) {
      console.warn("Camera permission denied or failed:", err);
      setCameraPermission("denied");
      return false;
    }
  }, []);

  /**
   * 初期データのロード
   */
  const loadData = useCallback(async () => {
    setSyncing(true);
    try {
      const user = await signInAnonymously();
      if (user) {
        setFullUserId(user.id);
        const [allBadges, myAcquiredIds] = await Promise.all([
          BadgeService.getAllBadges(),
          BadgeService.getAcquiredBadgeIds(user.id),
        ]);

        // 1. Supabase から取得した実データ（最大5つ）
        const realBadges = allBadges.slice(0, 5);

        // 2. 6番目の枠、または実データが足りない場合の埋め合わせ
        const slots: Badge[] = [...realBadges];
        while (slots.length < 6) {
          const index = slots.length;
          slots.push({
            id: `unknown-specimen-${index}`,
            name: "Unknown Specimen",
            description: "Yet to be discovered in the wild.",
            color: "#8b5cf6",
            model_url: "/butterfly.glb",
            target_index: index,
          });
        }

        setBadges(slots);

        // 3. 獲得済みリストの設定（実データのみ反映）
        setAcquiredBadgeIds(myAcquiredIds);
      }
    } catch (error) {
      console.error("❌ Roadmap Load Error:", error);
    } finally {
      setSyncing(false);
    }
  }, []);

  // データロード用 (自動的なカメラ要求は削除)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();

    window.addEventListener("focus", loadData);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") loadData();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", loadData);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadData]);

  // パーミッション監視用 (一度許可されれば granted を維持)
  useEffect(() => {
    const checkPermission = async () => {
      if (typeof window !== "undefined" && navigator.permissions?.query) {
        try {
          const result = await navigator.permissions.query({
            name: "camera" as PermissionName,
          });
          setCameraPermission(result.state as "prompt" | "granted" | "denied");
          result.onchange = () => {
            setCameraPermission(
              result.state as "prompt" | "granted" | "denied",
            );
          };
        } catch (e) {
          console.warn("Permissions API not supported for camera", e);
        }
      }
    };
    checkPermission();
  }, []);

  const isAcquired = (id: string) => acquiredBadgeIds.includes(id);

  return {
    badges,
    acquiredBadgeIds,
    syncing,
    fullUserId,
    cameraPermission,
    isAcquired,
    requestCameraPermission,
    refresh: loadData,
  };
};
