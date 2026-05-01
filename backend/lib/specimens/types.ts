/**
 * 標本ごとの個別設定を定義するインターフェース
 */
export interface SpecimenSettings {
  scale: string; // A-Frameでの初期サイズ
  outerAnimation: string; // 外側の動き（回転など）
  innerAnimation: string; // 内側の動き（浮遊など）
  minScale: number; // ARオートスケーリングの最小値
  maxScale: number; // ARオートスケーリングの最大値
  // 今後ここに追加の設定（material, sound, script等）を増やすことができます
}
