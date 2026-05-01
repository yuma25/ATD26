/**
 * 標本ごとの個別設定を定義するインターフェース
 */
export interface SpecimenSettings {
  scale: string; // A-Frameでの初期サイズ（スキャン用）
  outerAnimation: string; // 外側の動き（スキャン用）
  innerAnimation: string; // 内側の動き（スキャン用）
  minScale: number; // ARオートスケーリングの最小値
  maxScale: number; // ARオートスケーリングの最大値

  // --- フォトモード（RELEASE）用の上書き設定 ---
  // 設定しない場合は、上記のスキャン用設定がそのまま使われます
  releaseScale?: string;
  releaseOuterAnimation?: string;
  releaseInnerAnimation?: string;
}
