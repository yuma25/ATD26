/* eslint-disable */
"use client";

import { useEffect, useState, useRef } from "react";
import { useAR } from "@/hooks/useAR";
import { DiscoveryComplete } from "@/components/ar/DiscoveryComplete";
import { CloseButton } from "@/components/layout/CloseButton";
import { getSpecimenSettings } from "@backend/lib/constants";
import { Camera } from "lucide-react";
import type { Badge } from "@backend/types";

/**
 * 【ARカメラ画面】
 * スマートフォンのカメラを使用して、現実世界に3D標本を重ねて表示します。
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

  const arContainerRef = useRef<HTMLDivElement>(null);
  const lastInjectedDataHashRef = useRef<string>("");
  const [isClient, setIsClient] = useState(false);
  const [isSceneReady, setIsSceneReady] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 1. 外部ライブラリの動的ロード（ローカルから読み込み）
  useEffect(() => {
    if (!isClient) return;

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
        await loadScript("/scripts/aframe.min.js");
        await loadScript("/scripts/aframe-extras.min.js");
        await loadScript("/scripts/mindar-image-aframe.prod.js");
        await loadScript("/scripts/meshopt_decoder.js");
        await loadScript("/scripts/draco_decoder.js");

        const win = window as any;
        const AFRAME = win.AFRAME;

        if (AFRAME && AFRAME.THREE) {
          const THREE = AFRAME.THREE;
          const manager = new THREE.LoadingManager();
          manager.onProgress = (url: string, itemsLoaded: number, itemsTotal: number) => {
            const p = Math.floor((itemsLoaded / itemsTotal) * 100);
            setModelProgress(p);
          };
          win._loadingManager = manager;

          let MeshoptDecoder = win.MeshoptDecoder;
          if (typeof MeshoptDecoder === "function") MeshoptDecoder = await MeshoptDecoder();
          if (MeshoptDecoder?.ready) await MeshoptDecoder.ready;

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

        await new Promise((resolve) => setTimeout(resolve, 300));
        setIsSceneReady(true);
        setStatus("started");
      } catch (e) {
        console.error("❌ ライブラリの初期化に失敗しました", e);
      }
    };

    initScripts();
  }, [isClient, setStatus, setModelProgress]);

  // 2. AR シーンの生成
  useEffect(() => {
    if (!isSceneReady || !isClient || !isLoaded || allBadges.length === 0) return;
    if (!arContainerRef.current) return;

    const currentDataHash = JSON.stringify(allBadges.map((b: Badge) => `${b.target_index}:${b.model_url}`));
    const existingScene = arContainerRef.current.querySelector("a-scene");
    if (existingScene && lastInjectedDataHashRef.current === currentDataHash) return;

    if (existingScene) {
      try {
        const mindarSystem = (existingScene as any).systems?.["mindar-image-system"];
        if (mindarSystem) mindarSystem.stop();
      } catch (e) {}
      arContainerRef.current.innerHTML = "";
    }

    lastInjectedDataHashRef.current = currentDataHash;
    
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

    const boot = () => {
      if (sceneEl.systems?.["mindar-image-system"]) {
        sceneEl.systems["mindar-image-system"].start();
        const fixVideo = (video: HTMLVideoElement) => {
          video.setAttribute("playsinline", "");
          video.muted = true;
          // 💡 修正: ビデオ要素のスタイルを固定
          video.style.position = "fixed";
          video.style.top = "0";
          video.style.left = "0";
          video.style.width = "100vw";
          video.style.height = "100vh";
          video.style.objectFit = "cover";
          video.play().catch(() => {});
          
          // 💡 修正: 起動直後にリサイズを強制して一瞬のズーム現象を防止
          setTimeout(() => window.dispatchEvent(new Event("resize")), 100);
          setTimeout(() => window.dispatchEvent(new Event("resize")), 500);
        };
        const existingVideo = document.querySelector("video");
        if (existingVideo) fixVideo(existingVideo);

        // ビデオ要素が後から生成される場合（MindARの標準動作）にも対応
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((m) => {
            m.addedNodes.forEach((node) => {
              if (node.nodeName === "VIDEO") fixVideo(node as HTMLVideoElement);
            });
          });
        });
        observer.observe(document.body, { childList: true, subtree: true });

        setTimeout(() => setupListeners(), 500);
      }
    };

    if (sceneEl.hasLoaded) boot();
    else sceneEl.addEventListener("loaded", boot);
  }, [isSceneReady, isClient, isLoaded, allBadges, setupListeners]);

  if (!isClient) return null;

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none touch-none">
      <div ref={arContainerRef} className="absolute inset-0 w-full h-full z-10" />

      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center">
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-white">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em]">
              Initializing System... {modelProgress}%
            </p>
          </div>
        )}

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
              {isFound && modelProgress < 100 && (
                <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 mt-2">
                  <p className="text-white/80 text-[9px] uppercase tracking-[0.2em] animate-pulse">
                    Restoring Specimen... {modelProgress}%
                  </p>
                </div>
              )}
            </div>

            {isFound && !acquired && modelProgress === 100 && (
              <div className="w-full max-w-[280px] space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-white text-[10px] font-black italic tracking-tighter">{activeBadge?.name}</span>
                  <span className="text-white font-mono text-[10px]">{progress}%</span>
                </div>
                <div className="h-[6px] w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white transition-all duration-100 ease-out" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}

            {isFound && acquired && (
              <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="text-white text-[10px] font-bold uppercase tracking-widest">標本データ取得済み</p>
              </div>
            )}
          </div>
        )}

        {showSuccess && activeBadge && (
          <div className="h-full w-full flex items-center justify-center pointer-events-auto bg-black/60 backdrop-blur-sm">
            <DiscoveryComplete
              badgeName={activeBadge.name}
              artistName={activeBadge.artist}
              isLast={allBadges.length > 0 && acquiredBadgeIds.length === allBadges.length}
              isExchanged={isExchanged}
              onClose={() => setShowSuccess(false)}
            />
          </div>
        )}
      </div>

      {status === "started" && !showSuccess && (
        <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center px-8">
          <button onClick={captureImage} className="w-16 h-16 bg-white/10 backdrop-blur-xl border-4 border-white rounded-full flex items-center justify-center active:scale-90 transition-transform pointer-events-auto shadow-2xl group">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center group-hover:bg-white/90">
              <Camera size={28} className="text-black" />
            </div>
          </button>
        </div>
      )}

      <CloseButton onClick={navigateHome} />
      <style jsx global>{`
        video { object-fit: cover !important; width: 100vw !important; height: 100vh !important; position: fixed !important; top: 0 !important; left: 0 !important; z-index: -10 !important; }
      `}</style>
    </div>
  );
}
