import { SpecimenSettings } from "./types";

export const moonJelly: SpecimenSettings = {
  // 空間を覆い尽くさない、上品なサイズに縮小 (さらに小型化: 1.6 1.6 1.2)
  scale: "1.6 1.6 1.2",
  // 絵画の表面付近（Z: 0.08）で浮遊させる
  position: "0 -0.9 0.08",
  rotation: "0 0 0",
  // 全体の回転アニメーション
  outerAnimation:
    "property: rotation; to: 0 360 0; dur: 60000; easing: linear; loop: true",
  // 手前ではなく、上下（Y軸）メインのゆらぎに変更（速度と幅をアップ）
  innerAnimation:
    "property: position; to: 0.05 0.15 0.15; dur: 5000; easing: easeInOutSine; dir: alternate; loop: true",
  maxScale: 4.0,
};