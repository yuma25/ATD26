"use client";

/**
 * パッケージ: app/viewer
 * 獲得した作品の 2D 画像を詳細に鑑賞するためのビューワー画面を提供する。
 */

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CloseButton } from "../../components/layout/CloseButton";

/**
 * [概要] ビューワーの主要コンテンツを描画するコンポーネントである。
 * URL パラメータから標本情報を取得し、豪華な額縁演出と共に画像を表示する。
 *
 * [技術的ステップ]
 * 1. パラメータ取得: useSearchParams を使用し、標本の画像 URL、名称、作者名を取得する。
 * 2. デザイン演出: Tailwind CSS のグラデーション、多重シャドウ、およびインセットボーダーを組み合わせ、金枠の物理的な質感と奥行きを表現する。
 * 3. 視認性確保: 背景に暗色のグラデーション（放射状）を適用し、作品画像のコントラストを際立たせる。
 */
function ViewerContent() {
  const searchParams = useSearchParams();

  // URL パラメータからのデータ抽出。デフォルト値をフォールバックとして設定。
  const imageUrl =
    searchParams.get("image") || "/images/paintings/painting_0.jpg";
  const name = searchParams.get("name") || "作品";
  const artist = searchParams.get("artist") || "";

  return (
    <div className="fixed inset-0 bg-[#1a1512] flex flex-col items-center overflow-hidden">
      {/* 1. 背景装飾：ギャラリーのスポットライトを連想させる放射状グラデーション。 */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,#3e2f28,transparent)]" />
      
      {/* 2. ヘッダー UI：作品名と作者名の表示。 */}
      <div className="w-full pt-12 pb-4 z-50 flex justify-center">
        <div className="text-center space-y-1 w-full max-w-[90vw] overflow-hidden">
          <h1
            className={`text-white/90 font-black uppercase tracking-[0.3em] italic whitespace-nowrap px-4 ${
              name.length > 12 ? "text-[10px]" : "text-sm"
            }`}
          >
            {name}
          </h1>
          {artist && (
            <p
              className={`text-white/60 font-bold uppercase tracking-[0.1em] whitespace-nowrap px-4 ${
                artist.length > 15 ? "text-[8px]" : "text-[10px]"
              }`}
            >
              {artist}
            </p>
          )}
          {/* 金色のアクセントライン。 */}
          <div className="h-[1px] w-12 bg-amber-400/50 mx-auto mt-4" />
        </div>
      </div>

      {/* 閉じるボタン。 */}
      <CloseButton />

      {/* 3. メイン画像表示エリア：高度な CSS による額縁（フレーム）演出。 */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 w-full">
        {/* 外側の金枠。複数のグラデーションを重ねて光沢感を出す。 */}
        <div className="relative z-10 p-2 sm:p-4 bg-gradient-to-br from-[#d4af37] via-[#f9e4b7] to-[#8c6d31] shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] border border-[#b8860b]/30">
          {/* 装飾的なインラインボーダー。 */}
          <div className="absolute inset-2 border border-[#8c6d31]/50 pointer-events-none" />

          {/* 内側のダークウッド調フレーム。 */}
          <div className="relative p-1 bg-[#1a120f] shadow-2xl">
            {/* 作品マット（パスマルテュ）。画像と枠の間の余白を演出。 */}
            <div className="bg-[#f2f2f2] p-4 sm:p-10 shadow-[inset_0_0_40px_rgba(0,0,0,0.2)] border border-[#d1d1d1]">
              <div className="relative bg-white shadow-[0_0_2px_rgba(0,0,0,0.5)]">
                {/* 実際の標本画像。 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={name}
                  className="max-w-[75vw] max-h-[50vh] object-contain block"
                />

                {/* 画像の前面にガラスの反射とわずかな影を重畳する。 */}
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_5px_15px_rgba(0,0,0,0.1)] bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
              </div>
            </div>
          </div>

          {/* 額縁全体への光沢フィルタ。 */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent)] mix-blend-overlay" />
          <div className="absolute inset-0 pointer-events-none border-[0.5px] border-white/20" />
        </div>
      </div>
    </div>
  );
}

/**
 * [概要] 作品詳細ビューワーのページエントリポイントである。
 * useSearchParams を使用するため、境界を Suspense でラップして Hydration エラーを防止する。
 */
export default function ViewerPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#1a1512]" />}>
      <ViewerContent />
    </Suspense>
  );
}
