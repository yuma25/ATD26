"use client";

import Link from "next/link";

/**
 * パッケージ: components/layout
 * アプリケーションの全体レイアウトを構成する共通パーツを提供する。
 */

/**
 * [概要] ページ下部に表示される共通のフッターコンポーネントである。
 * 著作権情報の表示に加え、管理者パネルへの控えめなエントリポイントを提供する。
 *
 * [技術的ステップ]
 * 1. リンク実装: Next.js の Link コンポーネントを使用し、/admin/login へのクライアントサイド遷移を実現する。
 * 2. インタラクション: hover 時の透明度変化 (opacity) を適用し、普段はコンテンツを邪魔せず、操作時にのみ明示されるように設計されている。
 */
export const AppFooter = () => {
  return (
    <footer className="py-12 border-t border-[#3e2f28]/5 bg-black/[0.01] text-center select-none z-10">
      <div className="max-w-xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 opacity-40 hover:opacity-100 transition-opacity">
        {/* プロジェクトのコピーライト表記 */}
        <p className="text-[12px] font-bold uppercase tracking-[0.2em]">
          ©ATD26_SCIENCE-ART
        </p>

        {/* 管理者ログイン画面（アーカイブアクセス）へのナビゲーションリンク */}
        <Link
          href="/admin/login"
          className="text-[10px] font-bold uppercase tracking-[0.2em] border border-[#3e2f28]/30 px-2 py-1 rounded hover:bg-[#3e2f28] hover:text-[#e8e2d2] transition-colors"
        >
          管理者ログイン
        </Link>
      </div>
    </footer>
  );
};
