/**
 * パッケージ: lib
 * 共通ロジックを提供する。本ファイルでは数値計算などの純粋なロジックを定義する。
 */

/**
 * [概要] 進捗率（パーセンテージ）を計算する。
 * 全体の目標数と現在の達成数から、0〜100 の範囲に収まる整数値を算出する。
 *
 * @param total [number] 全体の数（目標数）。
 * @param acquired [number] 獲得済みの数（現在の達成数）。
 * @return progress [number] 0-100 の整数で表される進捗率。
 *
 * [技術的ステップ]
 * 1. バリデーション: 分母となる total が 0 以下の場合は計算不能と判断し、0 を返却する。
 * 2. 割合計算: (達成数 / 目標数) * 100 により浮動小数点のパーセンテージを算出する。
 * 3. 補正と丸め: Math.round で四捨五入し、Math.min/max で 0〜100 の範囲を強制する。
 */
export function calculateProgress(total: number, acquired: number): number {
  // 1. 分母（全体の数）が 0 以下の場合は計算できないため、0% を返却する（早期リターン）。
  if (total <= 0) {
    return 0;
  }

  // 2. 割合を計算して 100 を掛け、パーセント形式にする。
  const percentage = (acquired / total) * 100;

  // 3. 数値を四捨五入し、0 から 100 の範囲内に収まるように調整して返却する。
  // Math.round: 小数点第一位で四捨五入し整数化する。
  // Math.max(0, ...): 負の値になることを防ぐ。
  // Math.min(100, ...): 100% を超える値になることを防ぐ。
  return Math.min(100, Math.max(0, Math.round(percentage)));
}
