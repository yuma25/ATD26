"use client";

import { useEffect, useState, useRef } from "react";
import { useAR } from "../../hooks/useAR";
import { DiscoveryComplete } from "../../components/ar/DiscoveryComplete";
import { CloseButton } from "../../components/layout/CloseButton";

export default function ARPage() {
  const {
    status,
    setStatus,
    isFound,
    progress,
    acquired,
    showSuccess,
    isExiting,
    activeBadge,
    allBadges,
    isLoaded,
    setupListeners,
    navigateHome,
    setShowSuccess,
  } = useAR();

  const [ready, setReady] = useState(false);
  const arContainerRef = useRef<HTMLDivElement>(null);
  const lastInjectedDataRef = useRef("");

  interface AFrameScene extends HTMLElement {
    systems?: {
      "mindar-image-system"?: {
        start: () => void;
        stop: () => void;
        controller?: unknown;
      };
    };
    hasLoaded?: boolean;
  }

  useEffect(() => {
    const loadScript = (src: string) =>
      new Promise((res) => {
        if (document.querySelector(`script[src="${src}"]`)) return res(true);
        const s = document.createElement("script");
        s.src = src;
        s.onload = () => res(true);
        document.head.appendChild(s);
      });

    const init = async () => {
      setStatus("loading");
      try {
        await loadScript("https://aframe.io/releases/1.5.0/aframe.min.js");
        await loadScript(
          "https://cdn.jsdelivr.net/gh/c-frame/aframe-extras@7.2.0/dist/aframe-extras.min.js",
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js",
        );
        setReady(true);
        setStatus("started");
      } catch (e) {
        console.error("Initialization failed", e);
      }
    };
    init();
  }, [setStatus]);

  useEffect(() => {
    if (
      status === "started" &&
      ready &&
      isLoaded &&
      allBadges.length > 0 &&
      arContainerRef.current
    ) {
      const currentDataHash = JSON.stringify(
        allBadges.map((b) => `${b.target_index}:${b.model_url}`),
      );
      const existingScene = arContainerRef.current.querySelector("a-scene");

      if (existingScene && lastInjectedDataRef.current === currentDataHash) {
        return;
      }

      if (existingScene) {
        try {
          const sceneEl = existingScene as AFrameScene;
          if (sceneEl.systems?.["mindar-image-system"])
            sceneEl.systems["mindar-image-system"].stop();
        } catch {
          // ignore
        }
        arContainerRef.current.innerHTML = "";
      }

      lastInjectedDataRef.current = currentDataHash;

      const uniqueModels = Array.from(
        new Set(allBadges.map((b) => b.model_url)),
      );
      const v = Date.now();

      // 💡 修正：renderer 設定を軽量化し、フィルター設定でジッター（震え）を抑制しつつ高速化
      const sceneHTML = `
        <a-scene 
          mindar-image="imageTargetSrc: /targets.mind?v=${v}; autoStart: false; uiLoading: no; uiScanning: no; maxTrack: 1; filterMinCF: 0.0001; filterBeta: 0.001;" 
          color-space="sRGB" 
          renderer="colorManagement: true, physicallyCorrectLights: false, exposure: 1.2, alpha: true, antialias: false" 
          vr-mode-ui="enabled: false" 
          device-orientation-permission-ui="enabled: false" 
          loading-screen="enabled: false" 
          embedded 
          style="width: 100%; height: 100%; position: absolute; top: 0; left: 0;"
        >
          <a-assets>
            ${uniqueModels.map((url, i) => `<a-asset-item id="model-${i}" src="${url}"></a-asset-item>`).join("")}
          </a-assets>
          <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

          ${allBadges
            .map((badge) => {
              const modelIndex = uniqueModels.indexOf(badge.model_url);
              let scaleValue = 0.05;
              if (badge.name === "Leviathan") scaleValue = 0.01;
              else if (badge.name === "Moon Jelly") scaleValue = 0.015;
              else if (badge.name === "Antique Sword") scaleValue = 0.005;
              else if (badge.name === "Great Wave") scaleValue = 0.03;
              else if (badge.name === "Common Blue") scaleValue = 1.0;

              const s = `${scaleValue} ${scaleValue} ${scaleValue}`;

              return `
              <a-entity mindar-image-target="targetIndex: ${badge.target_index}">
                <a-entity id="model-container-${badge.target_index}" visible="false">
                  <a-entity animation="property: rotation; to: 0 0 360; dur: 20000; easing: linear; loop: true">
                    <a-entity position="0 0 0">
                      <a-gltf-model src="#model-${modelIndex}" scale="${s}" animation-mixer="clip: *; loop: repeat; timeScale: 1.0"></a-gltf-model>
                    </a-entity>
                  </a-entity>
                </a-entity>
              </a-entity>
            `;
            })
            .join("")}
        </a-scene>
      `;

      arContainerRef.current.innerHTML = sceneHTML;

      const sceneEl = arContainerRef.current.querySelector(
        "a-scene",
      ) as AFrameScene;
      const boot = () => {
        if (sceneEl.systems?.["mindar-image-system"]) {
          console.log("🏁 Starting MindAR (Optimized)...");
          sceneEl.systems["mindar-image-system"].start();
          setupListeners();
          setTimeout(() => window.dispatchEvent(new Event("resize")), 500);
        } else {
          setTimeout(boot, 200);
        }
      };

      if (sceneEl.hasLoaded) boot();
      else sceneEl.addEventListener("loaded", boot);
    }
  }, [status, ready, isLoaded, allBadges, setupListeners]);

  return (
    <div
      style={{
        backgroundColor: "transparent",
        minHeight: "100vh",
        position: "fixed",
        inset: 0,
        overflow: "hidden",
      }}
    >
      <div ref={arContainerRef} style={{ width: "100%", height: "100%" }} />
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        {(!ready || !isLoaded || allBadges.length === 0) && (
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "#fdfaf2",
              pointerEvents: "auto",
            }}
          >
            <div className="spinner"></div>
            <p
              style={{
                marginTop: "20px",
                fontSize: "12px",
                fontWeight: "bold",
                opacity: 0.5,
              }}
            >
              SYNCHRONIZING ARCHIVE...
            </p>
          </div>
        )}
        {status === "started" &&
          isLoaded &&
          allBadges.length > 0 &&
          !isExiting && (
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {!isFound && !showSuccess && (
                <div
                  style={{
                    position: "absolute",
                    top: "25%",
                    padding: "12px 24px",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: "bold",
                    borderRadius: "4px",
                  }}
                >
                  SCANNING FOR SPECIMENS...
                </div>
              )}
              {isFound && !acquired && !showSuccess && activeBadge && (
                <div style={{ width: "220px", textAlign: "center" }}>
                  <div
                    style={{
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: "900",
                      marginBottom: "12px",
                    }}
                  >
                    ANALYZING {progress}%
                  </div>
                  <div
                    style={{
                      height: "6px",
                      width: "100%",
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${progress}%`,
                        background: "#fff",
                      }}
                    ></div>
                  </div>
                </div>
              )}
              {showSuccess && activeBadge && (
                <div style={{ pointerEvents: "auto" }}>
                  <DiscoveryComplete
                    badgeName={activeBadge.name}
                    onClose={() => setShowSuccess(false)}
                  />
                </div>
              )}
            </div>
          )}
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .spinner { width: 40px; height: 40px; border: 2px solid rgba(62, 47, 40, 0.1); border-top: 2px solid #3e2f28; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        video { position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; object-fit: cover !important; z-index: -10 !important; display: block !important; }
        canvas.a-canvas { background-color: transparent !important; }
      `,
        }}
      />
      <CloseButton onClick={navigateHome} />
    </div>
  );
}
