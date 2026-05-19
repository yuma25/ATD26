import { SpecimenSettings } from "./types";

export const leviathan: SpecimenSettings = {
  // 絵画の幅に対して約25%程度の長さに縮小 (5倍拡大: 1.25 0.5 0.6)
  scale: "1.25 0.5 0.6",
  // 絵画の少し下を泳がせ、手前への飛び出しを抑える（Z: 0.05）
  position: "0 -0.2 0.05",
  rotation: "90 90 0",
  outerAnimation:
    "property: rotation; from: 90 90 0; to: 90 450 0; dur: 40000; easing: linear; loop: true",
  // 枠外に出ない範囲での緩やかな上下運動
  innerAnimation:
    "property: position; to: 0 -0.15 0.08; dur: 15000; easing: easeInOutSine; dir: alternate; loop: true",
  minScale: 0.1,
  maxScale: 3.0,
};