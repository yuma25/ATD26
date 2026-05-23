import { describe, it, expect } from "vitest";
import { calculateProgress } from "@backend/lib/logic";

/**
 * パッケージ: __tests__
 * 共通計算ロジック（進捗率の算出等）の正確性を検証する。
 */

/**
 * [概要] 進捗率計算関数 (calculateProgress) のテストスイートである。
 */
describe("calculateProgress", () => {
  it("6個中3個獲得していたら、50%と表示されること", () => {
    // [概要] 一般的な割合計算（50%）の検証。
    expect(calculateProgress(6, 3)).toBe(50);
  });

  it("全6個獲得していたら、100%になること", () => {
    // [概要] 上限値（100%）の検証。
    expect(calculateProgress(6, 6)).toBe(100);
  });

  it("1つも獲得していない場合は、0%になること", () => {
    // [概要] 下限値（0%）の検証。
    expect(calculateProgress(6, 0)).toBe(0);
  });

  it("合計が0の場合でも、エラーにならずに0を返すこと", () => {
    // [概要] ゼロ除算の回避ロジックを検証する。
    expect(calculateProgress(0, 0)).toBe(0);
  });

  it("獲得数が合計を超えても、100%に丸められること", () => {
    // [概要] 入力値が不正（合計超過）な場合のガードロジックを検証する。
    expect(calculateProgress(5, 10)).toBe(100);
  });

  it("負の数が渡された場合でも、0%に丸められること", () => {
    // [概要] 負の入力に対するガードロジックを検証する。
    expect(calculateProgress(5, -1)).toBe(0);
  });
});
