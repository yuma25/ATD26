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

  // 💡 修正：無限ループ防止のため、実行中の状態を Ref で管理
  const isLoadingRef = useRef(false);

  /**
   * カメラの許可を要求する
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
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setSyncing(true);

    try {
      const user = await signInAnonymously();
      if (user) {
        setFullUserId(user.id);
        const [allBadges, myAcquiredIds] = await Promise.all([
          BadgeService.getAllBadges(),
          BadgeService.getAcquiredBadgeIds(user.id),
        ]);

        setBadges(allBadges);
        setAcquiredBadgeIds(myAcquiredIds);
      }
    } catch (error) {
      console.error("❌ Roadmap Load Error:", error);
    } finally {
      setSyncing(false);
      isLoadingRef.current = false;
    }
  }, []); // 💡 依存配列を空にしてループを完全に切る

  // データロード用
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

  // パーミッション監視用
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
