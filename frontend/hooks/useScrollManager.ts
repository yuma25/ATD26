"use client";

import { useCallback } from "react";

/**
 * パッケージ: hooks
 * ブラウザのスクロール位置管理に関連するユーティリティを提供する。
 */

/**
 * ストレージに使用する一意のキー名
 */
const SCROLL_STORAGE_KEY = "specimens_journal_scroll_pos";

/**
 * [概要] ページ遷移時におけるスクロール位置の永続化と復元を行うカスタムフックである。
 * 標本詳細からホーム画面に戻った際、ユーザーが閲覧していた位置を正確に再現する。
 *
 * @return methods [Object] スクロール位置の保存 (saveScroll) および復元 (restoreScroll) メソッド。
 *
 * [技術的ステップ]
 * 1. 保存処理: sessionStorage を使用して現在の window.scrollY の値を記録する。
 * 2. 復元処理: 保存された値を読み込み、window.scrollTo を instant モードで実行して画面位置を戻す。
 * 3. クリーンアップ: 一度復元に成功した値は sessionStorage から削除し、予期せぬ位置への移動を防止する。
 */
export const useScrollManager = () => {
  /**
   * [概要] 現在のスクロール位置をブラウザの「sessionStorage」に一時保存する。
   * サーバーサイドレンダリング (SSR) 時の実行エラーを避けるため、window オブジェクトの存在を確認する。
   */
  const saveScroll = useCallback(() => {
    if (typeof window === "undefined") return;

    sessionStorage.setItem(SCROLL_STORAGE_KEY, window.scrollY.toString());
    console.log(`📍 スクロール位置を保存しました: ${window.scrollY}px`);
  }, []);

  /**
   * [概要] 保存されていた位置へスクロールを即座に戻す。
   * 復元完了後、不要になったストレージ内の値を削除する。
   */
  const restoreScroll = useCallback(() => {
    if (typeof window === "undefined") return;

    // 1. 保存されている値を取得し、不在の場合は何もしない。
    const savedPos = sessionStorage.getItem(SCROLL_STORAGE_KEY);
    if (!savedPos) {
      return;
    }

    // 2. 指定された位置へ、ユーザーに違和感を与えないよう即座に移動する。
    window.scrollTo({
      top: parseInt(savedPos, 10),
      behavior: "instant",
    });

    // 3. 重複した復元を防ぐため、データをクリアする。
    sessionStorage.removeItem(SCROLL_STORAGE_KEY);
    console.log(`🔄 スクロール位置を復元しました: ${savedPos}px`);
  }, []);

  return { saveScroll, restoreScroll };
};
