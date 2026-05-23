"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * パッケージ: components/layout
 * 共通の操作ボタン（閉じるボタン等）を提供する。
 */

/**
 * [概要] CloseButton コンポーネントのプロパティ定義である。
 *
 * @param onClick [() => void] (Optional) ボタン押下時に実行するカスタム処理。指定がない場合はブラウザバックを行う。
 * @param className [string] (Optional) 追加のスタイルクラス名。
 */
interface CloseButtonProps {
  onClick?: () => void;
  className?: string;
}

/**
 * [概要] 画面の右上に固定表示される「×（閉じる）」ボタンコンポーネントである。
 * AR 画面や詳細ビューワーなどのオーバーレイ画面を終了するために使用される。
 *
 * [技術的ステップ]
 * 1. ナビゲーション制御: onClick が指定されていない場合、history.length を確認し、戻る先がある場合は router.back() を、ない場合はトップページへ強制遷移させる。
 * 2. デザイン実装: 丸い背景色付きのデザインを採用し、高い Z-Index により常に最前面に配置される。
 * 3. モバイル最適化: active:scale-90 により、タッチ操作時の視覚的フィードバックを提供する。
 */
export const CloseButton = ({ onClick, className = "" }: CloseButtonProps) => {
  const router = useRouter();

  /**
   * [概要] ボタンクリック時の動作を決定し、実行する。
   */
  const handleClose = () => {
    console.log("👆 CloseButton clicked");
    // カスタムの onClick 処理が渡されている場合は、それを優先して実行する。
    if (onClick) {
      onClick();
      return;
    }

    // 閲覧履歴がある場合は一つ前に戻り、直接 URL 指定で開かれた場合などはホームへ戻す。
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <button
      onClick={handleClose}
      type="button"
      className={`fixed top-4 right-4 sm:top-6 sm:right-6 z-[9999] w-12 h-12 flex items-center justify-center bg-[#e8e2d2] border-2 border-[#3e2f28]/30 rounded-full text-[#3e2f28] shadow-2xl active:scale-90 pointer-events-auto touch-manipulation cursor-pointer ${className}`}
      style={{ WebkitTapHighlightColor: "transparent" }}
      aria-label="閉じる"
    >
      {/* Lucide の「X」アイコン（太めの線）を表示する。 */}
      <X size={26} strokeWidth={2.5} />
    </button>
  );
};
