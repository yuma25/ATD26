/* eslint-disable */
"use client";

/**
 * パッケージ: app/ar
 * Web ベースの AR (MindAR) を用いた、現実空間への標本投影画面を提供する。
 */

import { useEffect, useState, useRef } from "react";
import { useAR } from "@/hooks/useAR";
import { DiscoveryComplete } from "@/components/ar/DiscoveryComplete";
import { CloseButton } from "@/components/layout/CloseButton";
import { getSpecimenSettings } from "@backend/lib/constants";
import { Camera } from "lucide-react";
import type { Badge } from "@backend/types";

/**
 * [概要] AR カメラ画面のメインコンポーネントである。
 * 外部ライブラリ（A-Frame, MindAR）の動的読み込み、AR シーンの構築、およびキャプチャ機能を提供する。
 *
 * [技術的ステップ]
 * 1. ライブラリロード: useEffect にて A-Frame や MindAR、および各種デコーダー（Draco, Meshopt）をローカルパスから順次読み込む。
 * 2. 独自ローダー設定: THREE.GLTFLoader を拡張し、自作の LoadingManager とデコーダーを統合して、3D モデルのロード進捗を 0-100% で追跡・可視化する。
 * 3. 動的シーン構築: 取得した全標本データに基づき、A-Frame の <a-entity>（AR マーカーターゲット）を HTML 文字列として生成し、DOM に注入する。
 * 4. カメラ補正: MindAR が生成するビデオ要素を検知し、インラインスタイルや手動リサイズイベントの発火により、モバイルブラウザ特有のズームや表示の乱れを解消する。
 * 5. 没入型 UI: 解析ゲージや獲得成功ダイアログを AR レンダリングの上に重ね、リアルタイムなフィードバックを提供する。
 */
export default function ARPage() {
  const {
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
    acquiredBadgeIds,
    isLoaded,
    isExchanged,
    setupListeners,
    navigateHome,
    setShowSuccess,
    captureImage,
  } = useAR();

  /** AR シーンを描画するためのコンテナ要素への参照 */
  const arContainerRef = useRef<HTMLDivElement>(null);
  /** 重複注入を防ぐためのデータハッシュの保持 */
  const lastInjectedDataHashRef = useRef<string>("");
  /** クライアントサイドでの実行フラグ */
  const [isClient, setIsClient] = useState(false);
  /** AR シーン（A-Frame）の準備完了フラグ */
  const [isSceneReady, setIsSceneReady] = useState(false);

  // マウント時にクライアントサイドであることを確定させる。
  useEffect(() => {
    setIsClient(true);
  }, []);

  /**
   * [概要] 外部 AR ライブラリ群を動的にロードする。
   * Next.js の標準的なインポートではなく、window オブジェクトへの登録を必要とするスクリプトを制御する。
   */
  useEffect(() => {
    if (!isClient) return;

    /** 特定のパスからスクリプトをロードし、完了を Promise で返す。 */
    const loadScript = (src: string) => {
      return new Promise((resolve) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve(true);
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve(true);
        document.head.appendChild(script);
      });
    };

    const initScripts = async () => {
      setStatus("loading");
      try {
        // 依存関係に従い、順序を意識してロードを実行。
        await loadScript("/scripts/aframe.min.js");
        await loadScript("/scripts/aframe-extras.min.js");
        await loadScript("/scripts/mindar-image-aframe.prod.js");
        await loadScript("/scripts/meshopt_decoder.js");
        await loadScript("/scripts/draco_decoder.js");

        const win = window as any;
        const AFRAME = win.AFRAME;

        if (AFRAME && AFRAME.THREE) {
          const THREE = AFRAME.THREE;
          // 3D モデルのロード進捗を管理するマネージャーの設定。
          const manager = new THREE.LoadingManager();
          manager.onProgress = (url: string, itemsLoaded: number, itemsTotal: number) => {
            const p = Math.floor((itemsLoaded / itemsTotal) * 100);
            setModelProgress(p);
          };
          win._loadingManager = manager;

          // Meshopt デコーダーの初期化。
          let MeshoptDecoder = win.MeshoptDecoder;
          if (typeof MeshoptDecoder === "function") MeshoptDecoder = await MeshoptDecoder();
          if (MeshoptDecoder?.ready) await MeshoptDecoder.ready;

          // GLTF ローダーにデコーダーを登録するためのプロトタイプ拡張。
          if (THREE.GLTFLoader) {
            const originalLoad = THREE.GLTFLoader.prototype.load;
            THREE.GLTFLoader.prototype.load = function (this: any, ...args: any[]) {
              this.manager = win._loadingManager || THREE.DefaultLoadingManager;
              if (MeshoptDecoder) this.setMeshoptDecoder(MeshoptDecoder);
              if (THREE.DRACOLoader) {
                const dracoLoader = new THREE.DRACOLoader();
                dracoLoader.setDecoderPath("/scripts/");
                this.setDRACOLoader(dracoLoader);
              }
              return originalLoad.apply(this, args);
            };
          }
        }

        // ロード完了後のわずかな待機により、エンジンの安定を図る。
        await new Promise((resolve) => setTimeout(resolve, 300));
        setIsSceneReady(true);
        setStatus("started");
      } catch (e) {
        console.error("❌ ライブラリの初期化に失敗しました", e);
      }
    };

    void initScripts();
  }, [isClient, setStatus, setModelProgress]);

  /**
   * [概要] AR シーン（a-scene）を DOM に構築・注入する。
   * 標本データがロードされ、スクリプトの準備が整ったタイミングで一度だけ実行される。
   */
  useEffect(() => {
    if (!isSceneReady || !isClient || !isLoaded || allBadges.length === 0) return;
    if (!arContainerRef.current) return;

    // 現在の標本データの状態をハッシュ化して、不要な再描画（エンジン再起動）を防止する。
    const currentDataHash = JSON.stringify(allBadges.map((b: Badge) => `${b.target_index}:${b.model_url}`));
    const existingScene = arContainerRef.current.querySelector("a-scene");
    if (existingScene && lastInjectedDataHashRef.current === currentDataHash) return;

    // 既存のシーンがある場合は停止し、コンテナをクリアする。
    if (existingScene) {
      try {
        const mindarSystem = (existingScene as any).systems?.["mindar-image-system"];
        if (mindarSystem) mindarSystem.stop();
      } catch (e) {}
      arContainerRef.current.innerHTML = "";
    }

    lastInjectedDataHashRef.current = currentDataHash;
    
    // 全標本に対応する AR ターゲット実体を生成。
    const entitiesHtml = allBadges.map((badge: Badge) => {
      const settings = getSpecimenSettings(badge.name);
      return `
        <a-entity mindar-image-target="targetIndex: ${badge.target_index}">
          <a-entity id="model-container-${badge.target_index}" visible="false">
             <a-entity animation="${settings.outerAnimation || ""}">
               <a-entity animation="${settings.innerAnimation || ""}">
                 <a-gltf-model 
                   src="${badge.model_url}"
                   position="${settings.position || "0 0 0"}" 
                   rotation="${settings.rotation || "0 0 0"}" 
                   scale="${settings.scale || "0.3 0.3 0.3"}"
                   animation-mixer
                 ></a-gltf-model>
               </a-entity>
             </a-entity>
          </a-entity>
        </a-entity>
      `;
    }).join("\n");

    // AR シーン全体の HTML 構造を定義。
    const sceneHtml = `
      <a-scene 
        mindar-image="imageTargetSrc: /targets.mind; autoStart: false; uiLoading: no; uiError: no; uiScanning: no; filterMinCF: 0.0001; filterBeta: 0.001;" 
        color-space="sRGB" 
        renderer="colorManagement: true, preserveDrawingBuffer: true, alpha: true, antialias: true, precision: highp" 
        vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false" embedded
        style="width: 100%; height: 100%; position: absolute; top: 0; left: 0;"
      >
        <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>
        <a-light type="ambient" intensity="0.7"></a-light>
        <a-light type="directional" intensity="1.0" position="1 2 1"></a-light>
        ${entitiesHtml}
      </a-scene>
    `;

    arContainerRef.current.innerHTML = sceneHtml;
    const sceneEl = arContainerRef.current.querySelector("a-scene") as any;

    /**
     * [概要] AR エンジンを起動し、ビデオ要素の不具合を補正する。
     */
    const boot = () => {
      if (sceneEl.systems?.["mindar-image-system"]) {
        sceneEl.systems["mindar-image-system"].start();
        
        /** カメラ映像のスタイルと挙動を強制的に固定する補正関数。 */
        const fixVideo = (video: HTMLVideoElement) => {
          video.setAttribute("playsinline", "");
          video.muted = true;
          video.style.position = "fixed";
          video.style.top = "0";
          video.style.left = "0";
          video.style.width = "100vw";
          video.style.height = "100vh";
          video.style.objectFit = "cover";
          void video.play().catch(() => {});
          
          // レイアウト崩れ防止のため、周期的にリサイズイベントをシミュレートする。
          setTimeout(() => window.dispatchEvent(new Event("resize")), 100);
          setTimeout(() => window.dispatchEvent(new Event("resize")), 500);
        };
        const existingVideo = document.querySelector("video");
        if (existingVideo) fixVideo(existingVideo);

        // MindAR が後から生成するビデオ要素を監視するためのオブザーバー。
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((m) => {
            m.addedNodes.forEach((node) => {
              if (node.nodeName === "VIDEO") fixVideo(node as HTMLVideoElement);
            });
          });
        });
        observer.observe(document.body, { childList: true, subtree: true });

        // イベントリスナー（Found/Lost）の登録を遅延実行。
        setTimeout(() => setupListeners(), 500);
      }
    };

    if (sceneEl.hasLoaded) boot();
    else sceneEl.addEventListener("loaded", boot);
  }, [isSceneReady, isClient, isLoaded, allBadges, setupListeners]);

  /**
   * [概要] 現在獲得済みの標本数（認識中のものを含む）を計算する。
   * サーバーとの同期遅延を考慮し、ローカルの獲得済み ID セットを用いて一貫性を保つ。
   * @return count [number] 現在表示すべき獲得数。
   */
  const getCurrentDisplayCount = () => {
    if (!activeBadge) return acquiredBadgeIds.length;
    return new Set([...acquiredBadgeIds, activeBadge.id]).size;
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none touch-none">
      {/* AR レンダリングコンテナ */}
      <div ref={arContainerRef} className="absolute inset-0 w-full h-full z-10" />

      {/* 2D オーバーレイ UI レイヤー */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center">
        {/* システム初期化中のローディング */}
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-white">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em]">
              Initializing System... {modelProgress}%
            </p>
          </div>
        )}

        {/* AR 稼働中のステータス表示（解析ゲージ、スキャン指示） */}
        {status === "started" && !showSuccess && (
          <div className="w-full h-full flex flex-col items-center justify-between p-8 pt-20 pb-48">
            <div className="text-center space-y-2">
              <div className="inline-block px-4 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/20">
                <p className="text-white text-[10px] font-black uppercase tracking-[0.2em]">
                  {isFound ? "Analyzing Specimen..." : "Scan Painting"}
                </p>
              </div>
              {!isFound && (
                <p className="text-white/40 text-[8px] uppercase tracking-widest animate-pulse">
                  絵画にカメラを向けてください
                </p>
              )}
              {/* 3D モデルの個別読み込み進捗 */}
              {isFound && modelProgress < 100 && (
                <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 mt-2">
                  <p className="text-white/80 text-[9px] uppercase tracking-[0.2em] animate-pulse">
                    Restoring Specimen... {modelProgress}%
                  </p>
                </div>
              )}
            </div>

            {/* 解析中（未獲得時）のプログレスバー */}
            {isFound && !acquired && modelProgress === 100 && (
              <div className="w-full max-w-[280px] space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-white text-[10px] font-black italic tracking-tighter">
                    {activeBadge?.name} ({getCurrentDisplayCount()} / {allBadges.length})
                  </span>
                  <span className="text-white font-mono text-[10px]">{progress}%</span>
                </div>
                <div className="h-[6px] w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white transition-all duration-100 ease-out" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}

            {/* 獲得済み標本の検知時 */}
            {isFound && acquired && (
              <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="text-white text-[10px] font-bold uppercase tracking-widest">標本データ取得済み</p>
              </div>
            )}
          </div>
        )}

        {/* 標本獲得成功時の全画面オーバーレイ（DiscoveryComplete） */}
        {showSuccess && activeBadge && (
          <div className="h-full w-full flex items-center justify-center pointer-events-auto bg-black/60 backdrop-blur-sm">
            <DiscoveryComplete
              badgeName={activeBadge.name}
              artistName={activeBadge.artist}
              allBadges={allBadges}
              acquiredBadgeIds={acquiredBadgeIds}
              isLast={allBadges.length > 0 && getCurrentDisplayCount() === allBadges.length}
              isExchanged={isExchanged}
              onClose={() => setShowSuccess(false)}
            />
          </div>
        )}
      </div>

      {/* スクリーンショット撮影ボタン */}
      {status === "started" && !showSuccess && (
        <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center px-8">
          <button onClick={captureImage} className="w-16 h-16 bg-white/10 backdrop-blur-xl border-4 border-white rounded-full flex items-center justify-center active:scale-90 transition-transform pointer-events-auto shadow-2xl group">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center group-hover:bg-white/90">
              <Camera size={28} className="text-black" />
            </div>
          </button>
        </div>
      )}

      {/* 閉じるボタン（ホームへの復帰） */}
      <CloseButton onClick={navigateHome} />

      {/* ビデオ要素に対するグローバル補正スタイル */}
      <style jsx global>{`
        video { object-fit: cover !important; width: 100vw !important; height: 100vh !important; position: fixed !important; top: 0 !important; left: 0 !important; z-index: -10 !important; }
      `}</style>
    </div>
  );
}
