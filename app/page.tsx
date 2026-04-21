'use client';

import { RefreshCcw, Fingerprint, Camera } from 'lucide-react';
import { useHome } from '../hooks/useHome';
import { BadgeCard } from '../components/BadgeCard';

export default function Home() {
  const {
    badges,
    syncing,
    fullUserId,
    copied,
    cameraPermission,
    isAcquired,
    copyToClipboard,
    requestCameraPermission
  } = useHome();

  const handleLaunchAR = async () => {
    if (cameraPermission !== "granted") {
      const ok = await requestCameraPermission();
      if (!ok) return;
    }
    window.location.href = '/ar';
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-slate-900 font-sans selection:bg-blue-100 overflow-x-hidden">
      <header className="sticky top-0 z-50 bg-[#F2F2F7]/90 backdrop-blur-xl border-b border-slate-200 px-6 py-6">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-tight">コレクション</h1>
          
          <div className="flex items-center gap-4">
            {syncing && <RefreshCcw size={20} className="animate-spin text-blue-500" />}
            
            <button 
              onClick={handleLaunchAR}
              className={`flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg transition-all active:scale-90 ${
                cameraPermission === "granted" ? 'bg-blue-600 shadow-blue-500/40' : 'bg-slate-900 shadow-black/20'
              }`}
            >
              <Camera size={28} strokeWidth={2.5} className="text-white" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 pt-10 pb-40">
        {cameraPermission !== "granted" && (
          <section className="mb-10 p-6 bg-blue-600 rounded-[32px] text-white shadow-xl shadow-blue-900/20">
            <h2 className="text-xl font-black mb-2 flex items-center gap-2">
              <Camera size={24} /> カメラを有効化
            </h2>
            <p className="text-sm font-medium text-blue-100 leading-relaxed mb-6">
              AR体験を楽しむにはカメラの許可が必要です。最初に一度だけ設定を行ってください。
            </p>
            <button 
              onClick={requestCameraPermission}
              className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-[0.98] transition-all"
            >
              許可リクエストを送る
            </button>
          </section>
        )}

        <section className="mb-12 flex items-end justify-between border-b border-slate-200 pb-8">
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">獲得状況</p>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black text-slate-900">{badges.filter(b => isAcquired(b.id)).length}</span>
              <span className="text-2xl font-bold text-slate-300">/ {badges.length}</span>
            </div>
          </div>
          
          <div className="mb-2 p-4 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center gap-2">
            <Fingerprint size={20} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ID Active</span>
          </div>
        </section>

        <section className="mb-12 p-6 bg-slate-800 rounded-[32px] text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">データベース ID</span>
            <button onClick={copyToClipboard} className="text-xs font-bold text-blue-400 uppercase p-2 active:scale-95">
              {copied ? 'コピー完了' : 'コピーする'}
            </button>
          </div>
          <code className="text-xs font-mono text-slate-300 break-all leading-loose block bg-black/20 p-4 rounded-xl border border-white/5 shadow-inner">
            {fullUserId || "Generating identity..."}
          </code>
        </section>

        <div className="space-y-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] px-2 mb-2">Specimen Collection</h2>
          {badges.map((badge) => (
            <BadgeCard 
              key={badge.id} 
              badge={badge} 
              isAcquired={isAcquired(badge.id)} 
            />
          ))}

          {badges.length === 0 && !syncing && (
            <div className="text-center py-32 bg-white/50 rounded-[40px] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">標本データがありません</p>
            </div>
          )}
        </div>
      </main>

      <footer className="py-20 text-center opacity-30">
        <p className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase italic">Digital Specimen Case v1.0</p>
      </footer>
    </div>
  );
}
