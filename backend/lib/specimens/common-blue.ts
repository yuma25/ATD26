import { SpecimenSettings } from "./types";

export const commonBlue: SpecimenSettings = {
  // スケールを抑え、絵画の枠内に収まるサイズに (5倍拡大: 0.15 -> 0.75)
  scale: "0.75 0.75 0.75",
  // 絵画の少し下、かつ表面（Z: 0.05）に配置
  position: "0 -0.15 0.05",
  rotation: "-15 20 0",
  outerAnimation:
    "property: rotation; from: -15 10 -5; to: -15 30 5; dur: 4500; easing: easeInOutSine; dir: alternate; loop: true",
  // 飛び出しすぎないよう、Z軸の揺れを 0.08 に制限
  innerAnimation:
    "property: position; to: 0.02 -0.1 0.08; dur: 4000; easing: easeInOutSine; dir: alternate; loop: true",
  minScale: 0.1,
  maxScale: 2.0,
};