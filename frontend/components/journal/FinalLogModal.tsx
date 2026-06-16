"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, AlertTriangle, Ticket } from "lucide-react";
import { Badge } from "@backend/src/domain/entities/Badge";

/**
 * パッケージ: components/journal
 * コンプリート達成時の演出や景品交換に関連する UI コンポーネントを提供する。
 */

/**
 * [概要] FinalLogModal コンポーネントのプロパティ定義である。
 *
 * @param show [boolean] モーダルを表示するかどうかのフラグ。
 * @param onClose [() => void] モーダルを閉じるためのコールバック関数。
 * @param completionTime [string] 全標本を発見し終えた日時の文字列。
 * @param fullUserId [string] ユーザーの UUID。
 * @param displayId [string] (Optional) 画面表示用のユーザー ID。
 * @param badges [Badge[]] 発見した全標本のデータ配列。
 * @param isExchanged [boolean] すでに景品と交換済みかどうかを示すフラグ。
 * @param onExchange [() => Promise<boolean>] 交換処理を実行する非同期関数。
 */
interface FinalLogModalProps {
  show: boolean;
  onClose: () => void;
  completionTime: string;
  fullUserId: string;
  displayId?: string;
  badges: Badge[];
  isExchanged: boolean;
  onExchange: () => Promise<boolean>;
}

/**
 * [概要] 全ての標本をコンプリートした際に表示される特別なアチーブメント（景品交換）モーダルである。
 * 「景品交換チケット」を模したデザインを採用し、スタッフによる確認ステップを経て交換処理を完了させる。
 *
 * [技術的ステップ]
 * 1. 2段階確認: 誤操作を防ぐため、Redeem ボタン押下後にスタッフ専用の確認画面を表示するステート管理を行う。
 * 2. 交換処理: onExchange プロップスを介してサーバーに交換済みフラグを送信し、完了後に UI を更新する。
 * 3. デザイン実装: チケットの切り取り線や勲章、半券（スタブ）の構造を CSS およびアイコンで表現し、物理的なチケットのような質感を提供する。
 * 4. レスポンシブ: モバイル端末での閲覧を考慮し、アスペクト比を維持したままスケーリングするアニメーションを適用する。
 */
export const FinalLogModal = ({
  show,
  onClose,
  completionTime,
  fullUserId,
  displayId,
  badges,
  isExchanged,
  onExchange,
}: FinalLogModalProps) => {
  /** 確認ステップの状態（0: 初期, 1: 注意喚起） */
  const [confirmStep, setConfirmStep] = useState(0);
  /** 交換リクエストの実行中フラグ */
  const [exchanging, setExchanging] = useState(false);

  /**
   * [概要] 景品交換リクエストを実行する。
   * 成功した場合、確認ステップをリセットする。
   */
  const handleExchange = async () => {
    setExchanging(true);
    const ok = await onExchange();
    if (ok) {
      setConfirmStep(0);
    }
    setExchanging(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-12 overflow-y-auto">
          {/* 背景のオーバーレイ（ぼかし効果付き） */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1a1512]/95 backdrop-blur-md no-print"
          />

          {/* チケット本体：3D 的な傾きを伴う登場アニメーションを適用 */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, rotateX: 20 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-4xl flex flex-row bg-[#fdfaf2] border-[1px] border-[#3e2f28]/40 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden rounded-lg min-h-[220px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 💡 左側：メインチケット情報（発行日、ID、進捗ゲージ） */}
            <div className="flex-1 p-3 sm:p-10 border-r-2 border-dashed border-[#3e2f28]/20 relative">
              {/* チケット特有の切り抜き装飾 */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-[#1a1512] rounded-full" />
              <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-[#1a1512] rounded-full" />

              <div className="space-y-4 sm:space-y-8 text-left">
                <div className="flex items-center gap-3 sm:gap-5">
                  <div className="w-10 h-10 sm:w-16 sm:h-16 bg-amber-400 text-[#3e2f28] rounded-full flex items-center justify-center shadow-inner flex-shrink-0">
                    <Award
                      className="w-6 h-6 sm:w-10 sm:h-10"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-3xl font-black italic tracking-tighter text-[#3e2f28] leading-tight">
                      COLLECTOR&apos;S
                      <br />
                      TICKET.
                    </h2>
                    <p className="text-[6px] sm:text-[9px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.4em] text-[#3e2f28]/40">
                      Archive Reward
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-6 border-t border-[#3e2f28]/10 pt-3 sm:pt-6">
                  <div>
                    <p className="text-[6px] sm:text-[8px] font-black uppercase text-[#3e2f28]/30">
                      Issue Date
                    </p>
                    <p className="font-mono text-[8px] sm:text-xs font-black text-[#3e2f28]">
                      {completionTime}
                    </p>
                  </div>
                  <div className="hidden xs:block">
                    <p className="text-[6px] sm:text-[8px] font-black uppercase text-[#3e2f28]/30">
                      Explorer ID
                    </p>
                    <p className="font-mono text-[7px] sm:text-[8px] font-bold text-[#3e2f28] truncate">
                      {displayId || fullUserId.split("-")[0]}
                    </p>
                  </div>
                </div>

                {/* 全標本の収集進捗を視覚化するドットゲージ */}
                <div className="flex gap-0.5 sm:gap-1.5 py-1">
                  {badges.map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 h-1 sm:h-2 bg-amber-400/30 rounded-full overflow-hidden"
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="h-full bg-amber-500"
                      />
                    </div>
                  ))}
                </div>

                <div className="hidden sm:block text-[10px] text-[#3e2f28]/60 font-bold leading-relaxed italic">
                  &quot;このチケットは、全ての標本を記録した冒険者にのみ贈られる栄誉の証です。&quot;
                </div>
              </div>
            </div>

            {/* 💡 右側：交換スタブ（半券）セクション */}
            <div className="w-36 sm:w-64 bg-[#f9f5e9] p-2 sm:p-10 flex flex-col items-center justify-center text-center relative overflow-hidden flex-shrink-0">
              <Ticket className="absolute -top-6 -right-6 text-[#3e2f28]/5 w-24 h-24 sm:w-32 sm:h-32 rotate-12" />

              <div className="relative z-10 w-full space-y-3 sm:space-y-6">
                {isExchanged ? (
                  /* --- [状態] 既に交換が完了している場合 --- */
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-12 h-12 sm:w-24 sm:h-24 border-2 sm:border-4 border-emerald-500 rounded-full flex items-center justify-center text-emerald-600 rotate-[-15deg] shadow-lg bg-white/80">
                      <span className="text-lg sm:text-3xl font-black">済</span>
                    </div>
                    <p className="text-[7px] sm:text-xs font-black text-[#3e2f28]/60 uppercase tracking-widest whitespace-nowrap">
                      Done
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-2 text-[8px] sm:text-[10px] font-bold text-[#3e2f28]/40 hover:text-[#3e2f28] underline underline-offset-4"
                    >
                      Close
                    </button>
                  </motion.div>
                ) : confirmStep === 0 ? (
                  /* --- [状態] 交換前の初期画面 --- */
                  <div className="space-y-3 sm:space-y-4 w-full px-1">
                    <div className="space-y-0.5">
                      <p className="text-[6px] sm:text-[9px] font-black text-amber-600 uppercase tracking-widest whitespace-nowrap">
                        Prize
                      </p>
                      <p className="text-[10px] sm:text-lg font-black text-[#3e2f28] whitespace-nowrap">
                        交換
                      </p>
                    </div>
                    <button
                      onClick={() => setConfirmStep(1)}
                      className="w-full py-2 sm:py-4 bg-[#3e2f28] text-[#fdfaf2] text-[8px] sm:text-[11px] font-black uppercase tracking-widest shadow-xl active:scale-95 whitespace-nowrap"
                    >
                      Redeem
                    </button>
                    <button
                      onClick={onClose}
                      className="text-[7px] sm:text-[9px] font-bold text-[#3e2f28]/30 uppercase tracking-widest whitespace-nowrap"
                    >
                      Later
                    </button>
                  </div>
                ) : (
                  /* --- [状態] スタッフ確認用（2段階目） --- */
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 sm:space-y-5 bg-white p-2 sm:p-5 border-2 border-amber-500 shadow-2xl rounded-md"
                  >
                    <AlertTriangle className="mx-auto text-amber-500 w-5 h-5 sm:w-8 sm:h-8" />
                    <div className="space-y-1 overflow-hidden px-1">
                      <p className="text-[11px] sm:text-[14px] font-black text-red-600 leading-tight whitespace-nowrap">
                        スタッフ専用
                      </p>
                      <p className="text-[7px] sm:text-[11px] font-bold text-[#3e2f28] leading-tight whitespace-nowrap">
                        スタッフにこの画面を見せてください
                      </p>
                    </div>
                    <div className="space-y-1 pt-2">
                      {/* 交換確定ボタン */}
                      <button
                        disabled={exchanging}
                        onClick={handleExchange}
                        className="w-full py-3 bg-amber-500 text-white text-[9px] sm:text-[12px] font-black uppercase shadow-lg active:scale-95 disabled:opacity-50 whitespace-nowrap"
                      >
                        引き換え実行
                      </button>
                      {/* キャンセルボタン */}
                      <button
                        onClick={() => setConfirmStep(0)}
                        className="w-full py-1 text-[8px] sm:text-[9px] font-bold text-[#3e2f28]/40 uppercase tracking-widest whitespace-nowrap"
                      >
                        戻る
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
