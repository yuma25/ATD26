"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import useSWR from "swr";

import { supabase } from "@backend/lib/supabase";
import { Badge } from "@backend/types";
import { BadgeService } from "@backend/services/badgeService";

/**
 * 【AR機能用カスタムフック】
 * カメラの制御、標本の認識、解析プロセスの進捗管理などを一括して行います。
 */
export const useAR = () => {
  // --- 状態管理 (State) ---
  const [status, setStatus] = useState<"init" | "loading" | "started">("init"); // 起動状態
  const [modelProgress, setModelProgress] = useState(0); // モデル読み込みの進捗 (0-100)
  const [isFound, setIsFound] = useState(false); // 標本を見つけているかどうか
  const [progress, setProgress] = useState(0); // 解析の進捗 (0-100)
  const [acquired, setAcquired] = useState(false); // すでに獲得済みかどうか
  const [showSuccess, setShowSuccess] = useState(false); // 獲得成功画面の表示フラグ
  const [isExiting, setIsExiting] = useState(false); // 終了処理中かどうか
  const [activeBadge, setActiveBadge] = useState<Badge | null>(null); // 現在認識中の標本

  // --- データ取得 (SWRキャッシュ利用) ---
  const { data: sessionData } = useSWR("user-session", async () => {
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  });
  const userId = sessionData?.user?.id || "";

  const { data: allBadges = [], isLoading: loadingBadges } = useSWR(
    "all-badges",
    () => BadgeService.getAllBadges(),
    { revalidateOnFocus: false, dedupingInterval: 60000 },
  );

  const {
    data: acquiredRows = [],
    isLoading: loadingAcquired,
    mutate: mutateAcquired,
  } = useSWR(
    userId ? `acquired-${userId}` : null,
    () => BadgeService.getAcquiredBadges(userId),
    { revalidateOnFocus: false },
  );

  const { data: profile } = useSWR(
    userId ? `profile-${userId}` : null,
    () => BadgeService.getProfile(userId),
    { revalidateOnFocus: false },
  );

  const acquiredBadgeIds = useMemo(
    () => acquiredRows.map((r) => r.badge_id),
    [acquiredRows],
  );
  const isLoaded = !loadingBadges && (!userId || !loadingAcquired);

  // --- 変数管理 (Ref) ---
  const allBadgesRef = useRef<Badge[]>([]);
  useEffect(() => {
    allBadgesRef.current = allBadges;
  }, [allBadges]);

  const progressRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const acquiredRef = useRef(false);
  const acquiredBadgeIdsRef = useRef<string[]>([]);

  useEffect(() => {
    acquiredBadgeIdsRef.current = acquiredBadgeIds;
  }, [acquiredBadgeIds]);

  /**
   * --- クリーンアップ処理 ---
   */
  const cleanupAR = useCallback(() => {
    console.log("🧹 ARの終了処理を開始します...");
    if (timerRef.current) clearInterval(timerRef.current);

    const sceneEl = document.querySelector("a-scene") as HTMLElement & {
      systems?: Record<string, { stop: () => void; controller?: unknown }>;
    };
    const mindarSystem = sceneEl?.systems?.["mindar-image-system"];
    if (mindarSystem?.controller) {
      try { mindarSystem.stop(); } catch (error) { console.error("MindAR停止失敗:", error); }
    }
    if (sceneEl) sceneEl.remove();

    document.querySelectorAll("video").forEach((v) => {
      try {
        const stream = v.srcObject as MediaStream | null;
        if (stream) stream.getTracks().forEach((track) => track.stop());
      } catch {
        // ignore errors
      }
      v.remove();
    });
  }, []);

  /**
   * --- 解析と獲得のロジック ---
   */
  const handleSuccess = useCallback(
    async (badgeId: string) => {
      if (acquiredRef.current) return;

      setAcquired(true);
      acquiredRef.current = true;
      setShowSuccess(true);

      if (!acquiredBadgeIdsRef.current.includes(badgeId)) {
        acquiredBadgeIdsRef.current.push(badgeId);
      }

      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: newAcquired } = await BadgeService.acquireBadge(user.id, badgeId);
        if (newAcquired) void mutateAcquired();
      }
    },
    [mutateAcquired],
  );

  const startProgress = useCallback(
    (badgeId: string) => {
      if (acquiredRef.current) return;
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        progressRef.current += 1;
        setProgress(Math.floor(progressRef.current));

        if (progressRef.current >= 100) {
          clearInterval(timerRef.current!);
          handleSuccess(badgeId);
        }
      }, 40);
    },
    [handleSuccess],
  );

  const resetProgress = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!acquiredRef.current) {
      progressRef.current = 0;
      setProgress(0);
    }
  }, []);

  /**
   * --- イベントリスナーの設定 ---
   */
  const setupListeners = useCallback(() => {
    console.log("🔍 ARマーカーの監視を開始します...");
    const targets = document.querySelectorAll("[mindar-image-target]");

    targets.forEach((targetEl) => {
      const el = targetEl as HTMLElement & { _listenerAttached?: boolean };
      if (el._listenerAttached) return;
      el._listenerAttached = true;

      const attr = targetEl.getAttribute("mindar-image-target");
      if (!attr) return;

      let index = -1;
      if (typeof attr === "string") {
        const match = attr.match(/targetIndex:\s*(\d+)/);
        index = match ? parseInt(match[1]) : -1;
      } else if (typeof attr === "object" && attr !== null && "targetIndex" in attr) {
        index = (attr as { targetIndex: number }).targetIndex;
      }

      if (index === -1) return;

      targetEl.addEventListener("targetFound", () => {
        console.log(`🎯 発見: 番号 ${index}`);
        const badge = allBadgesRef.current.find((b) => b.target_index === index);
        if (!badge) return;

        setActiveBadge(badge);
        setIsFound(true);

        document.querySelector(`#model-container-${index}`)?.setAttribute("visible", "true");

        const alreadyHad = acquiredBadgeIdsRef.current.includes(badge.id);
        setAcquired(alreadyHad);
        acquiredRef.current = alreadyHad;

        if (!alreadyHad) {
          progressRef.current = 0;
          setProgress(0);
          startProgress(badge.id);
        }
      });

      targetEl.addEventListener("targetLost", () => {
        console.log(`💨 見失い: 番号 ${index}`);
        setIsFound(false);
        document.querySelector(`#model-container-${index}`)?.setAttribute("visible", "false");
        resetProgress();
      });
    });
  }, [startProgress, resetProgress]);

  useEffect(() => {
    return () => cleanupAR();
  }, [cleanupAR]);

  return {
    status,
    setStatus,
    modelProgress,
    setModelProgress,
    isFound,
    progress,
    acquired,
    showSuccess,
    isExiting,
    activeBadge,
    allBadges,
    isLoaded,
    acquiredBadgeIds,
    isExchanged: profile?.is_exchanged ?? false,
    setupListeners,
    navigateHome: useCallback(() => {
      setIsExiting(true);
      cleanupAR();
      setTimeout(() => { window.location.href = "/"; }, 300);
    }, [cleanupAR]),
    setShowSuccess,
    captureImage: useCallback(async () => {
      const sceneEl = document.querySelector("a-scene") as HTMLElement & {
        renderer?: { render: (scene: unknown, camera: unknown) => void };
        camera?: unknown;
        object3D?: unknown;
        canvas?: HTMLCanvasElement;
      };
      const videoEl = document.querySelector("video");
      if (!sceneEl || !videoEl) return;

      try {
        const canvas = document.createElement("canvas");
        canvas.width = videoEl.videoWidth;
        canvas.height = videoEl.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        if (sceneEl.renderer && sceneEl.camera && sceneEl.object3D) {
          sceneEl.renderer.render(sceneEl.object3D, sceneEl.camera);
          const aframeCanvas = sceneEl.canvas;
          if (aframeCanvas) {
            ctx.drawImage(aframeCanvas, 0, 0, canvas.width, canvas.height);
          }
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `specimen-${timestamp}.jpg`;

        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], fileName, { type: "image/jpeg" });
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({ files: [file], title: "標本の観察記録", text: "https://aichitech.day/" });
            } catch {
              // ignore
            }
          } else {
            const link = document.createElement("a");
            link.download = fileName;
            link.href = canvas.toDataURL("image/jpeg", 0.9);
            link.click();
          }
        }, "image/jpeg", 0.9);
      } catch (error) {
        console.error("📸 保存失敗:", error);
      }
    }, []),
  };
};
