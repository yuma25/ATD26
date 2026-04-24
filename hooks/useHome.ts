"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Badge } from "../backend/types";
import { BadgeService } from "../backend/services/badgeService";
import { signInAnonymously } from "../backend/lib/supabase";

export const useHome = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [acquiredBadgeIds, setAcquiredBadgeIds] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [fullUserId, setFullUserId] = useState<string>("");
  const [cameraPermission, setCameraPermission] = useState<
    "prompt" | "granted" | "denied"
  >("prompt");

  const isLoadingRef = useRef(false);

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
   * 初期データのロードと獲得順ソート（昇順：古い順）
   */
  const loadData = useCallback(async () => {
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setSyncing(true);

    try {
      const user = await signInAnonymously();
      if (user) {
        setFullUserId(user.id);
        const [allBadges, acquiredRows] = await Promise.all([
          BadgeService.getAllBadges(),
          BadgeService.getAcquiredBadges(user.id),
        ]);

        const myAcquiredIds = acquiredRows.map((r) => r.badge_id);
        setAcquiredBadgeIds(myAcquiredIds);

        const acquisitionMap = new Map(
          acquiredRows.map((r) => [r.badge_id, r.acquired_at]),
        );

        // 💡 修正：獲得順に並び替え（昇順：古い発見が上、新しい発見が下へ蓄積）
        const sortedBadges = [...allBadges].sort((a, b) => {
          const timeA = acquisitionMap.get(a.id);
          const timeB = acquisitionMap.get(b.id);

          if (timeA && timeB) {
            // 両方獲得済み：日時の昇順（古い発見が上、物語の始まり）
            return new Date(timeA).getTime() - new Date(timeB).getTime();
          }
          if (timeA) return -1; // 発見済みは上に
          if (timeB) return 1; // 発見済みは上に

          // 両方未発見：本来のインデックス順
          return a.target_index - b.target_index;
        });

        setBadges(sortedBadges);
      }
    } catch (error) {
      console.error("❌ Roadmap Load Error:", error);
    } finally {
      setSyncing(false);
      isLoadingRef.current = false;
    }
  }, []);

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
