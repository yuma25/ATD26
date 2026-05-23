"use client";

/**
 * パッケージ: app/(main)
 * アプリケーションのメインエントリポイント（ホーム画面）を提供する。
 */

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  RefreshCcw,
  Camera,
  MapPin,
  Compass,
  Flag,
  History,
  Users,
} from "lucide-react";
import { useHome } from "@/hooks/useHome";
import { Badge } from "@backend/types";
import { BadgeCard } from "@/components/BadgeCard";
import { calculateProgress } from "@backend/lib/logic";
import { useScrollManager } from "@/hooks/useScrollManager";
import { FinalLogModal } from "@/components/journal/FinalLogModal";
import { useRouter } from "next/navigation";

/**
 * [概要] ホーム画面（冒険者の手記）のコンポーネントである。
 * 標本の収集状況の可視化、AR スキャンの起動、および収集完了後の景品交換機能を提供する。
 *
 * [技術的ステップ]
 * 1. データ統合: useHome カスタムフックを介して、標本データ、獲得状況、ユーザー設定を統合的に取得する。
 * 2. 同期演出: initialLoading フラグに基づき、初回起動時のデータ同期オーバーレイを表示する。
 * 3. スクロール管理: useScrollManager を使用し、AR 画面から戻った際に直前まで見ていた標本カードの位置へ自動復帰させる。
 * 4. 進捗計算: 獲得済み標本数をもとに、画面中央のタイムラインゲージの長さを動的に制御する。
 * 5. 導線制御: URL パラメータ (openExchange) を監視し、AR 獲得画面からの戻り時に即座に交換モーダルを展開する。
 */
export default function Home() {
  // --- カスタムフックから状態と関数を取得 ---
  const {
    badges, // 全標本データの配列
    syncing, // バックグラウンドでの同期（検証）中フラグ
    initialLoading, // 初回データロード中フラグ
    fullUserId, // ユーザーの UUID
    displayId, // 画面表示用の短縮 ID
    partySize, // 登録されたパーティ人数
    isExchanged, // 景品交換済みフラグ
    showPartyInput, // 人数入力が必要かどうかの判定フラグ
    cameraPermission, // 現在のカメラ権限の状態
    isAcquired, // 特定標本の獲得状況を判定する関数
    requestCameraPermission, // 権限リクエスト関数
    updatePartySize, // 人数保存関数
    exchangePrize, // 交換記録関数
  } = useHome();

  const { saveScroll, restoreScroll } = useScrollManager();
  const router = useRouter();

  /** コンプリート記念（景品交換）モーダルの表示フラグ */
  const [showFinalLog, setShowFinalLog] = useState(false);
  /** 人数入力用のローカルステート */
  const [inputValue, setInputValue] = useState("1");

  // --- ライフサイクル制御 ---

  /**
   * [概要] 獲得完了直後の遷移（URLパラメータ）を検知し、モーダルを自動展開する。
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("openExchange") === "true") {
      // カスケードレンダリング警告回避のため、実行を次フレームへ遅延させる。
      setTimeout(() => {
        setShowFinalLog(true);
      }, 0);
      // パラメータを消去して履歴をクリーンにする。
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  // 現在の獲得状況を集計する。
  const acquiredCount = badges.filter((b: Badge) => isAcquired(b.id)).length;
  const isComplete = badges.length > 0 && acquiredCount === badges.length;
  const progressPercentage = calculateProgress(badges.length, acquiredCount);

  /** コンプリート達成時刻の文字列。 */
  const completionTime = useMemo(() => {
    if (!isComplete) return "";
    return new Date().toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [isComplete]);

  /**
   * [概要] ページ遷移（AR起動）の際、スクロール位置を復元する。
   */
  useEffect(() => {
    if (!initialLoading && badges.length > 0) {
      const timer = setTimeout(() => {
        restoreScroll();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [initialLoading, badges, restoreScroll]);

  // --- ユーザーアクション ---

  /**
   * [概要] AR カメラ画面を起動する。
   * 権限確認およびスクロール位置の保存を先行して行う。
   */
  const handleLaunchAR = async () => {
    // カメラ権限が未取得の場合はリクエストを行う。
    if (cameraPermission !== "granted") {
      const ok = await requestCameraPermission();
      if (!ok) return;
    }
    // 復帰時のために現在のスクロール位置を記録。
    saveScroll();
    // A-Frame の起動（ページ全体のリロードを伴うため window.location を使用）。
    window.location.href = "/ar";
  };

  return (
    <div className="min-h-screen font-serif selection:bg-[#d4c5a9] text-[#3e2f28] flex flex-col relative">
      {/* 💡 データ同期中の全画面オーバーレイ（初回起動時のみ） */}
      <AnimatePresence>
        {initialLoading && badges.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-[#e8e2d2] flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-4">
              <RefreshCcw
                size={32}
                className="animate-spin text-[#3e2f28]/40"
              />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#3e2f28]/40">
                Synchronizing Archive...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ヘッダー領域：ロゴ、ID、アクションボタン --- */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-[#e8e2d2]/90 backdrop-blur-md px-4 sm:px-8 py-6 sm:py-10 flex items-center justify-between border-b border-[#3e2f28]/10 shadow-sm">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 管理者ログインへの隠し味的なエントリポイント */}
            <button
              onClick={() => router.push("/admin/login")}
              className="focus:outline-none active:scale-95 transition-transform group relative"
              title="管理者ログイン"
            >
              <Compass
                size={20}
                className="text-[#3e2f28]/60 flex-shrink-0 group-hover:text-[#3e2f28]"
                strokeWidth={1.5}
              />
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                管理者
              </span>
            </button>
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight italic whitespace-nowrap">
              ATD26_SCIENCE-ART
            </h1>
          </div>
          <div className="pl-7 sm:pl-9 flex items-center gap-3 text-[#3e2f28]/60">
            {/* 識別情報の提示 */}
            {displayId && (
              <p className="font-mono text-[7px] sm:text-[10px] font-bold tracking-tight opacity-70 break-all leading-tight max-w-[180px] sm:max-w-none">
                ID: {displayId}
              </p>
            )}
            {/* パーティ人数の明示 */}
            {typeof partySize === "number" && partySize > 0 && (
              <div className="flex items-center gap-1 text-[10px] font-bold border-l border-[#3e2f28]/10 pl-3 h-3">
                <Users size={10} />
                <span>{partySize}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
          {/* バックグラウンド同期中を示す回転アイコン */}
          <AnimatePresence>
            {syncing && (
              <RefreshCcw
                size={14}
                className="animate-spin text-[#3e2f28]/20"
              />
            )}
          </AnimatePresence>
          {/* AR カメラ起動ボタン */}
          <button
            onClick={() => {
              void handleLaunchAR();
            }}
            className="group relative w-10 h-10 sm:w-12 sm:h-12 bg-[#3e2f28] text-[#fdfaf2] flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-lg"
          >
            <Camera size={18} strokeWidth={1} />
          </button>
        </div>
      </header>

      {/* --- メインコンテンツ領域：タイムライン形式の標本リスト --- */}
      <main className="max-w-xl mx-auto px-8 pt-40 sm:pt-56 pb-40 relative flex-1 w-full z-10">
        <div className="relative">
          {/* 画面中央を貫くタイムライン軸と進捗ゲージ */}
          <div className="absolute left-[50%] top-0 bottom-0 w-[4px] -translate-x-1/2 overflow-hidden opacity-40">
            <div className="absolute inset-0 w-full h-full border-l border-dashed border-[#3e2f28]/10" />
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${progressPercentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-0 w-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)] z-10"
              style={{
                maxHeight: isComplete
                  ? "calc(100% - 100px)"
                  : "calc(100% - 200px)",
              }}
            />
          </div>

          {/* 入口（探索開始地点）のシンボル */}
          <div className="relative z-10 flex flex-col items-center mb-40">
            <div className="relative">
              <div className="absolute inset-0 -m-4 border border-[#3e2f28]/10 rounded-full scale-110 border-dashed animate-[spin_30s_linear_infinite]" />
              <div className="w-24 h-24 bg-[#fdfaf2] border-2 border-[#3e2f28]/60 rounded-full flex flex-col items-center justify-center shadow-lg rotate-[-8deg]">
                <Flag
                  size={28}
                  className="text-[#3e2f28]/80 mb-1"
                  strokeWidth={1.5}
                />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                  入口
                </span>
              </div>
            </div>
          </div>

          {/* 標本カード（各作品）のレンダリング */}
          <div className="space-y-24 relative z-20">
            {badges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                isAcquired={isAcquired(badge.id)}
                onSaveScroll={saveScroll}
              />
            ))}
          </div>

          {/* ゴール（探索完了地点）のシンボルおよびボタン */}
          <div className="relative z-10 flex flex-col items-center mt-60">
            <motion.button
              disabled={!isComplete}
              onClick={() => isComplete && setShowFinalLog(true)}
              whileHover={isComplete ? { scale: 1.1, rotate: 0 } : {}}
              whileTap={isComplete ? { scale: 0.9 } : {}}
              className={`w-24 h-24 border-2 flex flex-col items-center justify-center transition-all duration-1000 rotate-[5deg] relative ${isComplete ? "bg-[#3e2f28] text-[#fdfaf2] border-[#3e2f28] shadow-[20px_20px_0_rgba(0,0,0,0.1)] cursor-pointer goal-aura" : "bg-[#fdfaf2] text-[#3e2f28]/10 border-[#3e2f28]/10 cursor-not-allowed"}`}
            >
              {isComplete && (
                <div className="absolute inset-0 bg-amber-400/10 blur-2xl rounded-full animate-pulse" />
              )}
              {isComplete ? (
                <>
                  <History size={32} className="relative z-10 mb-1" />
                  <span className="relative z-10 text-[10px] font-black uppercase tracking-tighter">
                    {isExchanged ? "Archive" : "Redeem"}
                  </span>
                </>
              ) : (
                <>
                  <MapPin
                    size={32}
                    strokeWidth={1}
                    className="relative z-10 mb-1"
                  />
                  <span className="relative z-10 text-[9px] font-bold uppercase tracking-widest opacity-40">
                    Goal
                  </span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </main>

      {/* コンプリート達成時に表示される記念・交換モーダル */}
      <FinalLogModal
        show={showFinalLog}
        onClose={() => setShowFinalLog(false)}
        completionTime={completionTime}
        fullUserId={fullUserId}
        displayId={displayId}
        badges={badges}
        isExchanged={isExchanged}
        onExchange={exchangePrize}
      />

      {/* 初回来場時のみ表示される人数登録モーダル */}
      <AnimatePresence>
        {showPartyInput && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
            {/* 背景のディミング効果 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#3e2f28]/95 backdrop-blur-md"
            />
            {/* 入力フォームカード */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative w-full max-w-sm bg-[#fdfaf2] p-10 border-2 border-[#3e2f28] shadow-[20px_20px_0_rgba(0,0,0,0.3)] text-center"
            >
              <Users
                size={40}
                className="mx-auto mb-6 text-[#3e2f28]/40"
                strokeWidth={1}
              />
              <h2 className="text-2xl font-black italic mb-2">ご来場の確認</h2>
              <p className="text-[11px] font-bold text-[#3e2f28]/60 mb-8">
                この端末で何名分の来場を登録しますか？
              </p>

              <div className="space-y-8">
                {/* 自由入力フォーム：アナログな手記の雰囲気に合わせたタイポグラフィ */}
                <div className="relative group">
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-[#3e2f28]/5 border-2 border-[#3e2f28]/20 rounded-none py-6 text-center font-mono font-bold text-4xl focus:border-[#3e2f28] focus:bg-white transition-all outline-none"
                    placeholder="1"
                    autoFocus
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#3e2f28]/40 group-focus-within:text-[#3e2f28]">
                    名
                  </div>
                </div>

                <div className="bg-[#3e2f28]/5 p-4 text-left border-l-2 border-[#3e2f28]/20">
                  <p className="text-[10px] text-[#3e2f28]/70 font-bold leading-relaxed">
                    グループで複数台のスマホをご利用の場合は、全員の合計が正しくなるように分担して入力してください。
                  </p>
                </div>

                {/* 登録完了・開始ボタン */}
                <button
                  onClick={() => {
                    const num = parseInt(inputValue);
                    if (!isNaN(num) && num > 0) {
                      void updatePartySize(num);
                    }
                  }}
                  className="w-full bg-[#3e2f28] text-[#e8e2d2] py-5 font-black uppercase tracking-[0.3em] hover:bg-[#523f35] transition-colors shadow-lg active:scale-[0.98]"
                >
                  記録を開始する
                </button>

                {/* 管理者用ページへの控えめなリンク */}
                <div className="pt-4 border-t border-[#3e2f28]/10">
                  <button
                    onClick={() => router.push("/admin/login")}
                    className="text-[9px] font-bold text-[#3e2f28]/30 hover:text-[#3e2f28]/60 transition-colors uppercase tracking-[0.2em]"
                  >
                    — 管理者用アクセス —
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 画面最下部の余白 */}
      <footer className="h-20" />
    </div>
  );
}
