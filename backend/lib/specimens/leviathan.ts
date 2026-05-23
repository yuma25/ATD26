import { SpecimenSettings } from "./types";

export const leviathan: SpecimenSettings = {
  // 💡 修正: 迫力を出すためにスケールを 4.5 倍へ拡大（マジェスティック・サイズ）
  scale: "4.5 4.5 4.5",
  // 巨大化に合わせて、少し下げて絵画（マーカー）の表面ギリギリに配置
  position: "0 -0.8 0.01",
  // モデルの基本姿勢を横向き（水平）に設定
  rotation: "90 0 0",
  // 巨大化に合わせて、ゆったりとした泳ぎの幅を再調整（Z軸は表面に固定）
  outerAnimation:
    "property: position; from: -1.0 -0.8 0.01; to: 1.0 -0.8 0.01; dur: 25000; easing: easeInOutSine; dir: alternate; loop: true",
  // 進行方向への優雅な傾き
  innerAnimation:
    "property: rotation; from: 0 -10 0; to: 0 10 0; dur: 12000; easing: easeInOutSine; dir: alternate; loop: true",
  minScale: 0.1,
  maxScale: 3.0,
};
