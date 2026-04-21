'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Camera, ChevronLeft, Sparkles, RefreshCw } from 'lucide-react';

export default function ReleasePage() {
  const searchParams = useSearchParams();
  const modelUrl = searchParams.get('model') || '/butterfly.glb';
  const name = searchParams.get('name') || '標本';

  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState("init");
  const [isExiting, setIsExiting] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const arContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => cleanupAR();
  }, []);

  const cleanupAR = () => {
    const sceneEl = document.querySelector('a-scene');
    if (sceneEl) sceneEl.remove();
    document.querySelectorAll('video').forEach(v => {
      const s = v.srcObject as any;
      if (s) s.getTracks().forEach((t: any) => t.stop());
      v.remove();
    });
  };

  /**
   * 写真を撮影して保存する
   */
  const takePhoto = async () => {
    if (isCapturing) return;
    setIsCapturing(true);

    try {
      const sceneEl = document.querySelector('a-scene') as any;
      const videoEl = document.querySelector('video');
      if (!sceneEl || !videoEl) {
        console.error("Required elements not found");
        return;
      }

      // 1. A-Frame / Three.js のレンダリングを強制実行して最新のバッファを確保
      const renderer = sceneEl.renderer;
      const camera = sceneEl.camera;
      if (renderer && camera) {
        renderer.render(sceneEl.object3D, camera);
      }

      // 2. キャンバスの準備
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // ビデオの実際の解像度を使用
      const width = videoEl.videoWidth;
      const height = videoEl.videoHeight;
      canvas.width = width;
      canvas.height = height;

      // 3. カメラ映像を書き込む（反転などが必要な場合はここで調整）
      ctx.drawImage(videoEl, 0, 0, width, height);
      
      // 4. A-Frameのキャンバスを取得して重ねる
      // a-sceneのキャンバスはCSSでリサイズされている可能性があるため、
      // 元の解像度で取得して、ビデオのサイズに合わせて描画
      const threeCanvas = sceneEl.canvas;
      if (threeCanvas) {
        ctx.drawImage(threeCanvas, 0, 0, width, height);
      }

      // 5. ダウンロード処理
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      link.download = `Specimen_${name}_${timestamp}.png`;
      link.href = dataUrl;
      
      // モバイルブラウザ対応のためのダミー要素追加
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("Photo captured successfully");
    } catch (e) {
      console.error("Capture failed", e);
      alert("写真の保存に失敗しました。カメラの権限等を確認してください。");
    } finally {
      // フラッシュ演出の時間を考慮して少し待つ
      setTimeout(() => setIsCapturing(false), 800);
    }
  };

  const startAR = async () => {
    setStatus("loading");
    try {
      const load = (src: string) => new Promise((res, rej) => {
        if (document.querySelector(`script[src="${src}"]`)) return res(true);
        const s = document.createElement('script');
        s.src = src; s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });

      await load("https://aframe.io/releases/1.5.0/aframe.min.js");
      await load("https://cdn.jsdelivr.net/gh/c-frame/aframe-extras@7.2.0/dist/aframe-extras.min.js");
      
      setStatus("started");
    } catch (e) {
      setStatus("init");
    }
  };

  useEffect(() => {
    if (status === "started" && arContainerRef.current) {
      arContainerRef.current.innerHTML = `
        <a-scene 
          embedded 
          renderer="colorManagement: true, physicallyCorrectLights: true, exposure: 1.5, alpha: true, preserveDrawingBuffer: true"
          vr-mode-ui="enabled: false"
          device-orientation-permission-ui="enabled: false"
          loading-screen="enabled: false"
          style="width: 100%; height: 100%;"
        >
          <a-assets><a-asset-item id="m" src="${modelUrl}"></a-asset-item></a-assets>
          <a-entity camera look-controls="pointerLockEnabled: false" position="0 1.6 0"></a-entity>
          <a-light type="ambient" intensity="1.5"></a-light>
          <a-light type="directional" intensity="2.0" position="1 2 1"></a-light>
          
          <a-entity position="0 1.6 -2">
            <a-entity animation="property: rotation; to: 0 360 0; dur: 20000; easing: linear; loop: true">
              <a-entity position="1.5 0 0" animation="property: position; to: 1.5 0.5 0.2; dur: 4000; easing: easeInOutSine; dir: alternate; loop: true">
                <a-entity animation="property: rotation; from: -10 90 -10; to: 10 90 10; dur: 5000; easing: easeInOutSine; dir: alternate; loop: true">
                  <a-gltf-model src="#m" scale="3 3 3" animation-mixer="clip: *; loop: repeat; timeScale: 1.2"></a-gltf-model>
                </a-entity>
              </a-entity>
            </a-entity>
          </a-entity>
        </a-scene>
      `;
      setupCameraBackground();
    }
  }, [status, modelUrl]);

  const setupCameraBackground = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.setAttribute('autoplay', '');
      video.setAttribute('playsinline', '');
      video.style.position = 'fixed';
      video.style.top = '0';
      video.style.left = '0';
      video.style.width = '100vw';
      video.style.height = '100vh';
      video.style.objectFit = 'cover';
      video.style.zIndex = '-1';
      video.style.filter = 'brightness(1.2)';
      document.body.appendChild(video);
      video.play();
    } catch (e) {
      console.error("Camera failed", e);
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ margin: 0, overflow: 'hidden', height: '100vh', width: '100vw', backgroundColor: 'transparent', position: 'fixed', top: 0, left: 0, fontFamily: 'sans-serif' }}>
      
      {isExiting && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 5000, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner"></div>
        </div>
      )}

      {status !== "started" && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', color: '#000' }}>
          <div style={{ fontSize: '80px', marginBottom: '20px', animation: 'float 3s ease-in-out infinite' }}>🦋</div>
          <h1 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '40px', letterSpacing: '0.2em' }}>READY TO RELEASE</h1>
          <button onClick={startAR} style={{ padding: '20px 60px', fontSize: '14px', fontWeight: '900', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '100px', cursor: 'pointer', boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)' }}>
            {status === "loading" ? "INITIALIZING..." : "空間に解き放つ"}
          </button>
        </div>
      )}

      <div ref={arContainerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />

      {/* 写真撮影UI */}
      {status === "started" && !isExiting && (
        <>
          {/* シャッターボタン */}
          <div style={{ position: 'absolute', bottom: '40px', left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px', zIndex: 1000 }}>
            <button 
              onClick={takePhoto}
              disabled={isCapturing}
              style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#fff', border: '6px solid rgba(59, 130, 246, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', transition: 'all 0.2s' }}
              className={isCapturing ? 'scale-90 opacity-50' : 'active:scale-95'}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: isCapturing ? '#3b82f6' : '#fff', border: '2px solid #eee' }}></div>
            </button>
          </div>
          
          <div style={{ position: 'absolute', top: '30px', left: '30px', zIndex: 1000 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '8px 15px', borderRadius: '15px', backdropFilter: 'blur(10px)' }}>
               <Sparkles size={16} className="text-blue-400" />
               <span style={{ color: '#fff', fontSize: '11px', fontWeight: '900', letterSpacing: '0.1em' }}>PHOTO MODE</span>
            </div>
          </div>
        </>
      )}

      {/* 撮影時のフラッシュ演出 */}
      {isCapturing && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: '#fff', zIndex: 2000, animation: 'flash 0.5s forwards' }}></div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes flash { from { opacity: 1; } to { opacity: 0; } }
        .spinner { width: 30px; height: 30px; border: 3px solid #eee; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}} />

      <button onClick={() => { setIsExiting(true); cleanupAR(); setTimeout(() => window.location.href='/', 300); }} style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 3000, width: '44px', height: '44px', borderRadius: '15px', backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', color: '#000', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
    </div>
  );
}
