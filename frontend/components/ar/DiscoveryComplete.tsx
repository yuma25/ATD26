"use client";

/**
 * モジュールのインポート
 */
import { motion } from "framer-motion";
import { Check, Ticket, Award, Sparkles } from "lucide-react";
import type { Badge } from "@backend/types";

/**
 * DiscoveryCompleteProps の説明：
 * @param badgeName - 発見した標本の名前
 * @param artistName - 作者名
 * @param allBadges - 全標本リスト
 * @param acquiredBadgeIds - 獲得済み標本IDリスト
 * @param onClose - 画面を閉じるための関数
 * @param isLast - 最後の1つかどうか
 * @param isExchanged - すでに景品交換済みかどうか
 */
interface DiscoveryCompleteProps {
  badgeName: string;
  artistName?: string;
  allBadges: Badge[];
  acquiredBadgeIds: string[];
  onClose: () => void;
  isLast?: boolean;
  isExchanged?: boolean;
}

/**
 * DiscoveryCompleteコンポーネント本体
 * ARで標本を認識した直後に表示される「発見完了」の演出画面です。
 */
export const DiscoveryComplete = ({
  badgeName,
  artistName,
  allBadges,
  acquiredBadgeIds,
  onClose,
  isLast = false,
  isExchanged = false,
}: DiscoveryCompleteProps) => {
  const currentCount = isLast ? allBadges.length : acquiredBadgeIds.length + 1;
  const totalCount = allBadges.length;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-between p-6 pointer-events-none">
      {/* 上部：進捗カウンター */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mt-12 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 flex items-center gap-3 shadow-xl"
      >
        <Award size={16} className={isLast ? "text-amber-400" : "text-white/60"} />
        <span className="text-white font-mono text-sm font-black tracking-widest">
          {currentCount} / {totalCount}
        </span>
      </motion.div>

      {/* メイン演出エリア */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center gap-8 pointer-events-auto cursor-pointer"
        onClick={onClose}
      >
        {/* 【演出】完了の刻印 */}
        <motion.div
          initial={{ scale: 2, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: -5, opacity: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
          className={`w-44 h-44 border-8 border-double rounded-full flex flex-col items-center justify-center relative shadow-[0_0_50px_rgba(255,255,255,0.4)] ${
            isLast
              ? "border-amber-400 text-amber-400 bg-black/40"
              : "border-white text-white"
          }`}
        >
          {isLast ? (
            <div className="text-center relative">
              <Sparkles className="absolute -top-12 -right-8 text-amber-300 animate-pulse" size={40} />
              <div className="text-4xl font-black mb-1 tracking-tighter">COMPLETE</div>
              <Check size={50} strokeWidth={4} className="mx-auto" />
            </div>
          ) : (
            <Check size={80} strokeWidth={3} />
          )}
          <div
            className={`absolute -bottom-2 px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em] rotate-12 ${
              isLast ? "bg-amber-400 text-black" : "bg-white text-black"
            }`}
          >
            {isLast ? "全作品収集完了" : "記録完了"}
          </div>
        </motion.div>

        {/* 標本名と作者名 */}
        <div className="text-center space-y-2 w-full max-w-[85vw] overflow-hidden px-4">
          <h2
            className={`font-black italic font-serif tracking-tight whitespace-nowrap truncate ${
              isLast ? "text-amber-400" : "text-white"
            } ${
              badgeName.length > 12
                ? "text-lg"
                : badgeName.length > 8
                  ? "text-xl"
                  : "text-3xl"
            }`}
          >
            {badgeName}
          </h2>
          {artistName && (
            <p className="text-white/80 font-medium text-sm truncate whitespace-nowrap">
              {artistName}
            </p>
          )}
          <p className="text-white/60 font-mono text-[10px] uppercase tracking-[0.5em] pt-2">
            {isLast ? "全ての標本のアーカイブに成功しました" : "新たな標本を発見しました"}
          </p>
        </div>

        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-4 text-white/40 font-mono text-[8px] uppercase tracking-widest"
        >
          画面をタップして閉じる
        </motion.div>
      </motion.div>

      {/* --- 下部：景品交換チケット UI --- */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-sm mb-4 pointer-events-auto"
      >
        <div className={`relative overflow-hidden border-2 rounded-2xl p-4 flex items-center justify-between shadow-2xl backdrop-blur-xl ${
          isExchanged 
            ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400" 
            : isLast 
              ? "bg-amber-950/60 border-amber-400 text-amber-400 animate-[pulse_3s_infinite]" 
              : "bg-black/60 border-white/10 text-white/80"
        }`}>
          {/* チケットの切り取り線風の装飾 */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[radial-gradient(circle,currentColor_1px,transparent_1.5px)] bg-[length:1px_6px]" />
          
          <div className="flex items-center gap-4 flex-1">
            <div className={`p-3 rounded-xl ${isExchanged ? 'bg-emerald-500/20' : isLast ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-white/10'}`}>
              <Ticket size={24} strokeWidth={isLast ? 2.5 : 1.5} />
            </div>
            
            <div className="flex flex-col min-w-0">
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 ${isLast ? 'text-amber-400/60' : 'text-white/40'}`}>
                Archivist Reward Status
              </span>
              <h3 className="text-sm font-black tracking-tight whitespace-nowrap">
                {isExchanged ? '景品交換済み：探究完了' : isLast ? '景品引き換えチケット有効' : '全作品収集でチケット解禁'}
              </h3>
              {isLast && !isExchanged && (
                <span className="text-[8px] font-bold opacity-80 animate-pulse">※ホーム画面からスタッフへ提示してください</span>
              )}
            </div>
          </div>

          <div className="ml-4 pl-4 border-l border-white/10 flex flex-col items-center justify-center min-w-[60px]">
             <span className="text-[8px] font-bold opacity-50 uppercase tracking-tighter mb-1">Total</span>
             <span className="text-lg font-black font-mono leading-none">{currentCount}</span>
          </div>
        </div>
        
        {isLast && (
           <p className="text-center text-white/30 text-[7px] uppercase tracking-[0.3em] mt-3 font-mono">
             Your scientific journey reaches its magnificent conclusion.
           </p>
        )}
      </motion.div>
    </div>
  );
};
