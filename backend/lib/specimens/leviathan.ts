import { SpecimenSettings } from "./types";

export const leviathan: SpecimenSettings = {
  // 💡 修正: 迫力を出すためにスケールを 4.5 倍へ拡大（マジェスティック・サイズ）
  scale: "4.5 4.5 4.5",
  // 巨大化に合わせて、少し下げて手前に配置し、画面内での収まりを調整
  position: "0 -0.8 0.2",
  // モデルの基本姿勢を横向き（水平）に設定
  rotation: "90 0 0",
  // 巨大化に合わせて、ゆったりとした泳ぎの幅を再調整
  outerAnimation:
    "property: position; from: -1.0 -0.8 0.2; to: 1.0 -0.8 0.2; dur: 25000; easing: easeInOutSine; dir: alternate; loop: true",
  // 進行方向への優雅な傾き
  innerAnimation:
    "property: rotation; from: 0 -10 0; to: 0 10 0; dur: 12000; easing: easeInOutSine; dir: alternate; loop: true",
  minScale: 0.1,
  maxScale: 3.0,
};
