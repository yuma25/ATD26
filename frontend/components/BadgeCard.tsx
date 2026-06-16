"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Lock,
  Box,
  Bug,
  CircleDot,
  LucideIcon,
  MapPin,
  Waves,
  Sword,
  Shell,
  X,
} from "lucide-react";
import { Badge } from "@backend/src/domain/entities/Badge";

/**
 * パッケージ: components
 * ホーム画面および一覧表示に関連する UI コンポーネントを提供する。
 */

/**
 * [概要] 各標本のアイコンリストの定義である。
 * target_index をキーとして、表示に使用するアイコンを選択する。
 */
const IconList: LucideIcon[] = [Bug, MapPin, Shell, Sword, Waves, CircleDot];

/**
 * [概要] BadgeCard コンポーネントのプロパティ定義である。
 *
 * @param badge [Badge] 表示対象の標本データ。
 * @param isAcquired [boolean] ユーザーがこの標本を獲得済みかどうかを示すフラグ。
 * @param onSaveScroll [() => void] (Optional) 詳細画面への遷移前にスクロール位置を保存するコールバック。
 */
interface BadgeCardProps {
  badge: Badge;
  isAcquired: boolean;
  onSaveScroll?: () => void;
}

/**
 * [概要] 標本一覧（ジャーナル）における個別の作品カードを表示するコンポーネントである。
 * 未獲得の状態ではロック表示を行い、獲得済みの場合のみ詳細ビューワーへのアクセスを許可する。
 *
 * [技術的ステップ]
 * 1. 状態制御: 獲得済みの場合、クリック時に「観察開始」の確認オーバーレイを表示する二段階の操作フローを持つ。
 * 2. 動的アイコン: badge.target_index に基づき、IconList から適切な Lucide アイコンを選択する。
 * 3. アニメーション: framer-motion の whileInView を使用し、スクロールに合わせてカードが浮き上がる演出を行う。
 * 4. 遷移処理: 確認ボタン押下時に、URL パラメータに標本情報を付与して /viewer ページへ遷移させる。
 */
export const BadgeCard = ({
  badge,
  isAcquired,
  onSaveScroll,
}: BadgeCardProps) => {
  const router = useRouter();
  /** 確認オーバーレイの表示状態 */
  const [showConfirm, setShowConfirm] = useState(false);

  // target_index をもとにアイコンを決定し、フォールバックとして CircleDot を使用する。
  const Icon = IconList[badge.target_index] || CircleDot;
  const locked = !isAcquired;

  /**
   * [概要] 作品詳細ビューワーページへ遷移する。
   * 遷移前に現在のスクロール位置を保存し、復帰時の利便性を確保する。
   */
  const handleOpenViewer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (locked) return;
    if (onSaveScroll) onSaveScroll();
    router.push(
      `/viewer?image=${encodeURIComponent(badge.image_url)}&name=${encodeURIComponent(badge.name)}&artist=${encodeURIComponent(badge.artist || "")}`,
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full flex justify-center"
    >
      {/* 
        カード本体。
        未獲得 (locked) 時は点線の枠線と透過背景、獲得時は実線の枠線と背景色を適用する。
      */}
      <div
        onClick={() => !locked && setShowConfirm(true)}
        className={`
          relative w-full max-w-[180px] min-h-[220px] p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 overflow-hidden
          ${
            locked
              ? "border border-dashed border-[#3e2f28]/10 bg-black/5 opacity-40"
              : "bg-white shadow-sm border border-[#3e2f28]/5 cursor-pointer hover:shadow-md"
          }
        `}
      >
        {/* 表面のコンテンツ：確認画面が表示されていない時のみ表示する。 */}
        {!showConfirm && (
          <>
            {/* アイコンエリア */}
            <div className={`p-3 rounded-full ${locked ? "" : "bg-[#fdfaf2]"}`}>
              {locked ? (
                <Lock size={20} className="text-[#3e2f28]/20" strokeWidth={1} />
              ) : (
                <Icon size={32} className="text-[#3e2f28]/80" strokeWidth={1} />
              )}
            </div>

            {/* テキストエリア（作品名および作者名） */}
            <div className="text-center px-1 w-full overflow-hidden">
              <h3
                className={`font-bold italic font-serif leading-tight whitespace-nowrap ${
                  locked ? "opacity-20" : "text-[#3e2f28]"
                } ${
                  (locked ? 3 : badge.name.length) > 10
                    ? "text-[10px]"
                    : "text-sm"
                }`}
              >
                {locked ? "???" : badge.name}
              </h3>
              {!locked && (
                <>
                  {badge.artist && (
                    <p
                      className={`font-bold text-[#3e2f28]/60 mt-0.5 whitespace-nowrap ${
                        badge.artist.length > 10 ? "text-[8px]" : "text-[9px]"
                      }`}
                    >
                      {badge.artist}
                    </p>
                  )}
                  <p className="text-[7px] font-mono text-[#3e2f28]/30 uppercase tracking-widest mt-1">
                    RECORDED
                  </p>
                </>
              )}
            </div>

            {/* ガイダンス表示 */}
            {!locked && (
              <div className="flex items-center gap-1 text-[6px] font-bold text-[#3e2f28]/10 uppercase mt-1">
                <span>View Details</span>
              </div>
            )}
          </>
        )}

        {/* --- 確認用オーバーレイ (インライン表示) --- */}
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#3e2f28] z-50 p-4 flex flex-col items-center justify-center text-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              {/* オーバーレイを閉じるボタン */}
              <button
                onClick={() => setShowConfirm(false)}
                className="absolute top-1 right-1 p-1.5 text-white/40 hover:text-white"
              >
                <X size={14} />
              </button>

              <p className="text-[8px] font-bold text-white/40 uppercase tracking-[0.1em]">
                Open Archive?
              </p>

              {/* ビューワー起動ボタン */}
              <button
                onClick={handleOpenViewer}
                className="w-full py-2 bg-white text-[#3e2f28] flex items-center justify-center gap-1.5 hover:bg-[#e8e2d2] transition-colors shadow-lg"
              >
                <Box size={12} strokeWidth={1.5} />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  観察開始
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
