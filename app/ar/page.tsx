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
                padding: "40px",
                background: "#fff",
                border: "1px solid #000",
                boxShadow: "20px 20px 0px rgba(0,0,0,0.1)",
                textAlign: "left",
                animation: "label-reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                width: "85vw",
                maxWidth: "400px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  right: 15,
                  fontSize: "10px",
                  opacity: 0.3,
                  fontFamily: "monospace",
                }}
              >
                REG-ID: {activeBadge?.id.slice(0, 8)}
              </div>

              <div
                style={{
                  borderBottom: "2px solid #000",
                  paddingBottom: "10px",
                  marginBottom: "20px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "10px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    opacity: 0.5,
                  }}
                >
                  Archive Entry Confirmed
                </p>
                <h2
                  style={{
                    margin: "5px 0 0",
                    fontSize: "32px",
                    fontWeight: "900",
                    fontFamily: "serif",
                    italic: "true",
                  }}
                >
                  {activeBadge?.name}
                </h2>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "8px",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                      opacity: 0.4,
                    }}
                  >
                    Classification
                  </label>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      fontFamily: "monospace",
                    }}
                  >
                    Digital Specimen
                  </p>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "8px",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                      opacity: 0.4,
                    }}
                  >
                    Status
                  </label>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      fontFamily: "monospace",
                      color: "#3b82f6",
                    }}
                  >
                    PRESERVED
                  </p>
                </div>
              </div>

              <div
                style={{
                  marginTop: "30px",
                  borderTop: "1px dashed #ccc",
                  paddingTop: "20px",
                  fontSize: "10px",
                  fontFamily: "monospace",
                  lineHeight: "1.6",
                  opacity: 0.6,
                }}
              >
                DATE: {new Date().toLocaleDateString()}
                <br />
                TYPE: AR-RECONSTRUCTION
                <br />
                LOCATION: REMOTE_NODE
              </div>
            </div>
          )}
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes label-reveal { 
          from { transform: translateY(50px) rotate(-2deg); opacity: 0; } 
          to { transform: translateY(0) rotate(0); opacity: 1; } 
        }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        .spinner { width: 30px; height: 30px; border: 1px solid #eee; border-top: 1px solid #000; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        video { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; object-fit: cover !important; z-index: -1 !important; filter: grayscale(0.2) brightness(1.1) contrast(1.1) !important; }
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
