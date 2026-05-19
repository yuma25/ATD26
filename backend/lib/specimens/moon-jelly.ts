import { SpecimenSettings } from "./types";

export const moonJelly: SpecimenSettings = {
  // 空間を覆い尽くさない、上品なサイズに縮小 (5倍拡大: 1.0 1.0 0.75)
  scale: "1.0 1.0 0.75",
  // 絵画の表面付近（Z: 0.08）で浮遊させる
  position: "0 -0.1 0.08",
  rotation: "0 0 0",
  outerAnimation:
    "property: rotation; to: 0 360 0; dur: 60000; easing: linear; loop: true",
  // 手前ではなく、上下（Y軸）メインのゆらぎに変更
  innerAnimation:
    "property: position; to: 0.02 -0.05 0.1; dur: 7000; easing: easeInOutSine; dir: alternate; loop: true",
  minScale: 0.1,
  maxScale: 4.0,
};