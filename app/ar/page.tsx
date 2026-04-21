"use client";

import { useAR } from "../../hooks/useAR";

export default function ARPage() {
  const {
    status,
    isFound,
    progress,
    acquired,
    showSuccess,
    isExiting,
    activeBadge,
    arContainerRef,
    startAR,
    navigateHome,
    setShowSuccess,
  } = useAR();

  return (
    <div
      style={{
        margin: 0,
        overflow: "hidden",
        height: "100vh",
        width: "100vw",
        backgroundColor: "transparent",
        position: "fixed",
        top: 0,
        left: 0,
        fontFamily: "sans-serif",
      }}
    >
      {/* 1. 終了中オーバーレイ：フリーズ感をなくす */}
      {isExiting && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 5000,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="spinner"></div>
        </div>
      )}

      {/* 2. スタート前画面 */}
      {status !== "started" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#fff",
            color: "#000",
          }}
        >
          <div
            style={{
              fontSize: "100px",
              marginBottom: "20px",
              animation: "float 3s ease-in-out infinite",
            }}
          >
            🦋
          </div>
          <button
            onClick={startAR}
            style={{
              padding: "20px 60px",
              fontSize: "16px",
              fontWeight: "900",
              backgroundColor: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "100px",
              cursor: "pointer",
            }}
          >
            {status === "loading" ? "SYNCING..." : "START AR"}
          </button>
        </div>
      )}

      {/* 3. AR 3D シーンコンテナ */}
      <div
        ref={arContainerRef}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />

      {/* 4. HUD レイヤー */}
      {status === "started" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1000,
            pointerEvents: "none",
            display: "flex",
            flexFlow: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!acquired && isFound && (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  color: "#fff",
                  fontSize: "24px",
                  fontWeight: "900",
                  textShadow: "0 2px 10px #000",
                }}
              >
                {progress}%
              </div>
              <p
                style={{
                  color: "#fff",
                  fontSize: "10px",
                  fontWeight: "bold",
                  textShadow: "0 2px 10px #000",
                  letterSpacing: "0.1em",
                }}
              >
                ANALYZING: {activeBadge?.name}
              </p>
            </div>
          )}

          {showSuccess && (
            <div
              onClick={() => setShowSuccess(false)}
              style={{
                pointerEvents: "auto",
                cursor: "pointer",
                padding: "30px 60px",
                background: "#fff",
                borderRadius: "30px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
                border: "1px solid #eee",
                textAlign: "center",
                animation: "pop 0.5s forwards",
              }}
            >
              <h2
                style={{
                  color: "#3b82f6",
                  fontSize: "36px",
                  margin: 0,
                  fontWeight: "900",
                }}
              >
                GET!
              </h2>
              <p
                style={{
                  color: "#64748b",
                  fontSize: "14px",
                  marginTop: "10px",
                }}
              >
                {activeBadge?.name} を復元しました
              </p>
            </div>
          )}
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes pop { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        .spinner { width: 30px; height: 30px; border: 3px solid #eee; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        video { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; object-fit: cover !important; z-index: -1 !important; filter: brightness(1.2) contrast(1.1) !important; }
      `,
        }}
      />

      {/* 5. 終了ボタン */}
      <button
        onClick={navigateHome}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 3000,
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          backgroundColor: "rgba(0,0,0,0.1)",
          color: "#000",
          border: "none",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        ✕
      </button>
    </div>
  );
}
