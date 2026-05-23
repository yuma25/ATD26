import { AppFooter } from "@/components/layout/AppFooter";

/**
 * パッケージ: app/(main)
 * ホーム画面や一般ユーザー向け機能の共通レイアウトを提供する。
 */

/**
 * [概要] メインコンテンツ用の共通レイアウトコンポーネントである。
 * 各ページ共通のフッター（ナビゲーション）を配置し、一貫した操作性を提供する。
 *
 * @param children [React.ReactNode] 表示される各ページのコンテンツ要素。
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* 1. 各ページのメインコンテンツを描画する。 */}
      {children}

      {/* 2. 画面下部に共通のナビゲーションフッターを配置する。 */}
      <AppFooter />
    </>
  );
}
