"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import useSWR from "swr";

import { supabase } from "@backend/lib/supabase";
import { Badge } from "@backend/types";
import { BadgeService } from "@backend/services/badgeService";

/**
 * パッケージ: hooks
 * フロントエンドのビジネスロジックおよび状態管理を提供する。
 * 外部ライブラリ（MindAR, A-Frame）との連携や、API データ取得（SWR）の橋渡しを担う。
 */

/**
 * [概要] AR機能の制御と状態管理を行うカスタムフックである。
 * カメラの起動状態、標本の認識、解析ゲージの進捗、および獲得記録の保存を一括して管理する。
 *
 * @return states & methods [Object] AR体験に必要な状態変数と操作メソッド。
 *
 * [技術的ステップ]
 * 1. データ同期: SWR を使用して、現在のユーザーセッション、全標本データ、および獲得済み履歴をバックグラウンドで同期する。
 * 2. イベント監視: setupListeners メソッドにより MindAR の 'targetFound' / 'targetLost' イベントを購読する。
 * 3. 進捗制御: startProgress メソッドがタイマーを起動し、標本認識中の「解析ゲージ」をインクリメントする。
 * 4. 永続化: ゲージが 100% に達すると BadgeService.acquireBadge を呼び出し、DB に記録すると同時に SWR キャッシュを更新 (mutate) する。
 * 5. クリーンアップ: useEffect の戻り値としてカメラストリームの停止や DOM 要素の削除を行い、メモリリークを防止する。
 */
export const useAR = () => {
  // --- 状態管理 (State) ---
  /** ARエンジンの初期化・起動状態 ("init" | "loading" | "started") */
  const [status, setStatus] = useState<"init" | "loading" | "started">("init");
  /** 3Dモデル読み込みの進捗 (0-100) */
  const [modelProgress, setModelProgress] = useState(0);
  /** 現在カメラが標本（マーカー）を捉えているかどうかのフラグ */
  const [isFound, setIsFound] = useState(false);
  /** 解析ゲージの進捗率 (0-100) */
  const [progress, setProgress] = useState(0);
  /** 現在捉えている標本がすでに獲得済みかどうかのフラグ */
  const [acquired, setAcquired] = useState(false);
  /** 獲得成功ダイアログを表示するかどうかのフラグ */
  const [showSuccess, setShowSuccess] = useState(false);
  /** ページ遷移（終了処理）中かどうかのフラグ */
  const [isExiting, setIsExiting] = useState(false);
  /** 現在認識中の標本（Badge）オブジェクト */
  const [activeBadge, setActiveBadge] = useState<Badge | null>(null);

  // --- データ取得 (SWRキャッシュ利用) ---
  // ユーザーのセッション情報を取得。
  const { data: sessionData } = useSWR("user-session", async () => {
    if (!supabase) return null;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  });
  const userId = sessionData?.user?.id || "";

  // 全標本データをバックエンドから取得。
  const { data: allBadges = [], isLoading: loadingBadges } = useSWR(
    "all-badges",
    () => BadgeService.getAllBadges(),
    { revalidateOnFocus: false, dedupingInterval: 60000 },
  );

  // ユーザーの獲得済み標本履歴を取得。
  const {
    data: acquiredRows = [],
    isLoading: loadingAcquired,
    mutate: mutateAcquired,
  } = useSWR(
    userId ? `acquired-${userId}` : null,
    () => BadgeService.getAcquiredBadges(userId),
    { revalidateOnFocus: false },
  );

  // ユーザープロフィール（景品交換済みフラグ等）を取得。
  const { data: profile } = useSWR(
    userId ? `profile-${userId}` : null,
    () => BadgeService.getProfile(userId),
    { revalidateOnFocus: false },
  );

  /** 獲得済み標本のIDリストをメモ化。 */
  const acquiredBadgeIds = useMemo(
    () => acquiredRows.map((r) => r.badge_id),
    [acquiredRows],
  );
  /** 全ての必須データがロード済みかどうかを判定。 */
  const isLoaded = !loadingBadges && (!userId || !loadingAcquired);

  // --- 変数管理 (Ref) ---
  // イベントリスナー内で最新の状態を参照するため Ref を使用。
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
   * [概要] ARエンジンの停止と関連リソースの解放を行う。
   */
  const cleanupAR = useCallback(() => {
    console.log("🧹 ARの終了処理を開始します...");
    if (timerRef.current) clearInterval(timerRef.current);

<<<<<<< HEAD
    // A-Frame および MindAR システムの停止。
=======
>>>>>>> origin/main
    const sceneEl = document.querySelector("a-scene") as HTMLElement & {
      systems?: Record<string, { stop: () => void; controller?: unknown }>;
    };
    const mindarSystem = sceneEl?.systems?.["mindar-image-system"];
    if (mindarSystem?.controller) {
<<<<<<< HEAD
      try {
        mindarSystem.stop();
      } catch (error) {
        console.error("MindAR停止失敗:", error);
      }
=======
      try { mindarSystem.stop(); } catch (error) { console.error("MindAR停止失敗:", error); }
>>>>>>> origin/main
    }
    if (sceneEl) sceneEl.remove();

    // カメラストリームの明示的な停止。
    document.querySelectorAll("video").forEach((v) => {
      try {
        const stream = v.srcObject as MediaStream | null;
        if (stream) stream.getTracks().forEach((track) => track.stop());
      } catch {
<<<<<<< HEAD
        // エラーは無視する。
=======
        // ignore errors
>>>>>>> origin/main
      }
      v.remove();
    });
  }, []);

  /**
   * [概要] 標本の獲得成功時の処理を行う。
   * DB への保存リクエストを送信し、UI の状態を更新する。
   * @param badgeId [string] 獲得した標本のID。
   */
  const handleSuccess = useCallback(
    async (badgeId: string) => {
      if (acquiredRef.current) return;

      setAcquired(true);
      acquiredRef.current = true;
      setShowSuccess(true);

      // ローカルの獲得済みIDリストに即時反映。
      if (!acquiredBadgeIdsRef.current.includes(badgeId)) {
        acquiredBadgeIdsRef.current.push(badgeId);
      }

      // サーバーへの永続化。
      if (!supabase) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: newAcquired } = await BadgeService.acquireBadge(
          user.id,
          badgeId,
        );
        if (newAcquired) void mutateAcquired();
      }
    },
    [mutateAcquired],
  );

  /**
   * [概要] 解析ゲージのカウントアップを開始する。
   * @param badgeId [string] 認識中の標本ID。
   */
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
      }, 40); // 約4秒で100%に到達するように設定。
    },
    [handleSuccess],
  );

  /**
   * [概要] 解析ゲージをリセットする。
   */
  const resetProgress = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!acquiredRef.current) {
      progressRef.current = 0;
      setProgress(0);
    }
  }, []);

  /**
   * [概要] MindAR のターゲット要素に対してイベントリスナーを設定する。
   * 作品の「発見 (Found)」および「見失い (Lost)」を検知し、状態を切り替える。
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

      // targetIndex のパース処理。
      let index = -1;
      if (typeof attr === "string") {
        const match = attr.match(/targetIndex:\s*(\d+)/);
        index = match ? parseInt(match[1]) : -1;
<<<<<<< HEAD
      } else if (
        typeof attr === "object" &&
        attr !== null &&
        "targetIndex" in attr
      ) {
=======
      } else if (typeof attr === "object" && attr !== null && "targetIndex" in attr) {
>>>>>>> origin/main
        index = (attr as { targetIndex: number }).targetIndex;
      }

      if (index === -1) return;

      // 標本発見イベント。
      targetEl.addEventListener("targetFound", () => {
        console.log(`🎯 発見: 番号 ${index}`);
        const badge = allBadgesRef.current.find(
          (b) => b.target_index === index,
        );
        if (!badge) return;

        setActiveBadge(badge);
        setIsFound(true);

        // 3Dモデルの可視化。
        document
          .querySelector(`#model-container-${index}`)
          ?.setAttribute("visible", "true");

        // 獲得済み状況の判定とゲージ開始。
        const alreadyHad = acquiredBadgeIdsRef.current.includes(badge.id);
        setAcquired(alreadyHad);
        acquiredRef.current = alreadyHad;

        if (!alreadyHad) {
          progressRef.current = 0;
          setProgress(0);
          startProgress(badge.id);
        }
      });

      // 標本紛失イベント。
      targetEl.addEventListener("targetLost", () => {
        console.log(`💨 見失い: 番号 ${index}`);
        setIsFound(false);
        document
          .querySelector(`#model-container-${index}`)
          ?.setAttribute("visible", "false");
        resetProgress();
      });
    });
  }, [startProgress, resetProgress]);

  // マウント時にクリーンアップ関数を登録。
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
    /** ホーム画面への遷移（終了処理を含む）。 */
    navigateHome: useCallback(() => {
      setIsExiting(true);
      cleanupAR();
      setTimeout(() => {
        window.location.href = "/";
      }, 300);
    }, [cleanupAR]),
    setShowSuccess,
    /** [概要] 現在のカメラ映像と AR 重畳情報を統合してスクリーンショットを撮影・保存する。 */
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

        // 1. 背面のカメラ映像を描画。
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
<<<<<<< HEAD
        // 2. A-Frame (AR) レンダラーの結果を重ねて描画。
=======
>>>>>>> origin/main
        if (sceneEl.renderer && sceneEl.camera && sceneEl.object3D) {
          sceneEl.renderer.render(sceneEl.object3D, sceneEl.camera);
          const aframeCanvas = sceneEl.canvas;
          if (aframeCanvas) {
            ctx.drawImage(aframeCanvas, 0, 0, canvas.width, canvas.height);
          }
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `specimen-${timestamp}.jpg`;

<<<<<<< HEAD
        canvas.toBlob(
          async (blob) => {
            if (!blob) return;
            const file = new File([blob], fileName, { type: "image/jpeg" });
            // Web Share API が利用可能な場合はシェアダイアログを表示。
            if (
              navigator.share &&
              navigator.canShare &&
              navigator.canShare({ files: [file] })
            ) {
              try {
                await navigator.share({
                  files: [file],
                  title: "標本の観察記録",
                  text: "https://aichitech.day/",
                });
              } catch {
                // シェアキャンセル等は無視する。
              }
            } else {
              // 非対応ブラウザでは直接ダウンロードを実行。
              const link = document.createElement("a");
              link.download = fileName;
              link.href = canvas.toDataURL("image/jpeg", 0.9);
              link.click();
            }
          },
          "image/jpeg",
          0.9,
        );
=======
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
>>>>>>> origin/main
      } catch (error) {
        console.error("📸 保存失敗:", error);
      }
    }, []),
  };
};
