"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Compass, RefreshCcw, Camera } from "lucide-react";

/**
 * パッケージ: components/layout
 * アプリケーションの上部ナビゲーションに関連するコンポーネントを提供する。
 */

/**
 * [概要] AppHeader コンポーネントのプロパティ定義である。
 *
 * @param fullUserId [string] ユーザーを一意に識別する UUID。
 * @param syncing [boolean] データのバックグラウンド同期（保存処理等）が実行中かどうか。
 * @param onLaunchAR [() => void] スキャンボタン押下時に AR 機能を起動するためのコールバック関数。
 */
interface AppHeaderProps {
  fullUserId: string;
  syncing: boolean;
  onLaunchAR: () => void;
}

/**
 * [概要] アプリケーションの最上部に固定表示される共通ヘッダーコンポーネントである。
 * タイトル、ユーザー識別情報の表示、および AR スキャン画面への導線を提供する。
 *
 * [技術的ステップ]
 * 1. 同期表示: AnimatePresence と motion を組み合わせ、syncing 状態に応じた同期中アイコンのフェードイン/アウトを実現する。
 * 2. ボタン演出: スキャンボタンには hover 時のスケールアップや、背景での継続的な波紋（ripple）アニメーションを適用し、主要なアクションであることを強調する。
 * 3. 視認性確保: 背景に透過度付きの色と backdrop-blur-md を適用し、スクロールされるコンテンツと重なっても高い可読性を維持する。
 */
export const AppHeader = ({
  fullUserId,
  syncing,
  onLaunchAR,
}: AppHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-[#e8e2d2]/90 backdrop-blur-md px-4 sm:px-8 py-6 sm:py-10 flex items-center justify-between border-b border-[#3e2f28]/10 shadow-sm">
      {/* 
        左側セクション：アプリ名称とユーザー識別子。
        「フィールドジャーナル」というコンセプトに合わせ、方位磁石（Compass）アイコンを配置している。
      */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2 sm:gap-3">
          <Compass
            size={20}
            className="text-[#3e2f28]/60 flex-shrink-0"
            strokeWidth={1.5}
          />
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight italic whitespace-nowrap">
            ATD26_SCIENCE-ART
          </h1>
        </div>
        <div className="pl-7 sm:pl-9">
          <p className="font-mono text-[9px] sm:text-[11px] text-[#3e2f28]/60 font-bold uppercase tracking-widest truncate max-w-[200px] sm:max-w-none">
            ID: {fullUserId}
          </p>
        </div>
      </div>

      {/* 
        右側セクション：同期状態およびアクションボタン。
      */}
      <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
        <AnimatePresence>
          {/* 同期中のみ、回転アニメーションを伴うアイコンを提示する。 */}
          {syncing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <RefreshCcw
                size={14}
                className="animate-spin text-[#3e2f28]/20"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 
          AR スキャン画面の起動ボタン。
          カメラアイコンに動的なアニメーション（回転と波紋）を付与し、ユーザーの視線を誘導する。
        */}
        <button
          onClick={onLaunchAR}
          className="group flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 bg-[#3e2f28] text-[#fdfaf2] rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl border border-white/5"
        >
          <div className="relative flex items-center justify-center">
            <Camera
              size={18}
              strokeWidth={1.5}
              className="group-hover:rotate-12 transition-transform"
            />
            {/* 波紋アニメーションのレイヤー */}
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 border border-white/30 rounded-full"
            />
          </div>
          <span className="font-data text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] pt-0.5">
            スキャン
          </span>
        </button>
      </div>
    </header>
  );
};
