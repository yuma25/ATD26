import type { Metadata, Viewport } from "next";
import "./globals.css";

/**
 * パッケージ: app
 * アプリケーション全体の基盤となる設定およびルートレイアウトを提供する。
 */

/**
 * [概要] アプリケーションのメタデータ設定である。
 * ブラウザのタイトル、説明、および iOS 向けの PWA 設定を定義する。
 */
export const metadata: Metadata = {
  title: "ATD26_SCIENCE-ART",
  description: "ARと3D標本のフィールドジャーナル",
  // iOS でホーム画面に追加した際の表示設定。
  appleWebApp: {
    capable: true,
    title: "ATD26",
    statusBarStyle: "default",
  },
};

/**
 * [概要] ビューポート（表示領域）の設定である。
 * モバイル端末での意図しないピンチズームを防止し、ノッチ領域まで描画を広げる設定を行う。
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // UI 操作の安定性向上のためズームを禁止する。
  viewportFit: "cover", // 画面端（ノッチ等）までコンテンツを表示させる。
};

/**
 * [概要] アプリケーションのルートレイアウトコンポーネントである。
 * HTML の骨格を定義し、全ページ共通のスタイルやフォント設定を適用する。
 *
 * @param children [React.ReactNode] 各ページの実体コンテンツ。
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" data-scroll-behavior="smooth">
      <head></head>
      <body className="antialiased">
        {/* 1. 各ページの内容をボディ要素内に注入する。 */}
        {children}
      </body>
    </html>
  );
}
