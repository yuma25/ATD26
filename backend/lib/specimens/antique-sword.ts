import { SpecimenSettings } from "./types";

export const antiqueSword: SpecimenSettings = {
  // 回転時に剣先が見切れないよう、全体をコンパクトに縮小 (さらに2倍拡大: 1.5 1.5 1.5)
  scale: "1.5 1.5 1.5",
  // 絵画の少し下側を起点にし、表面にほど近い位置（Z: 0.05）に配置
  position: "0 -0.2 0.05",
  rotation: "0 0 0",
  // 全体のゆっくりとした回転アニメーションはそのまま維持
  outerAnimation:
    "property: rotation; to: 0 360 0; dur: 20000; easing: linear; loop: true",
  // 枠外へ出ないよう、上下（Y軸）の浮遊幅を小さく調整し、手前（Z軸）への飛び出しも抑える
  innerAnimation:
    "property: position; to: 0 -0.05 0.08; dur: 10000; easing: easeInOutSine; dir: alternate; loop: true",
  minScale: 0.1,
  maxScale: 3.0,
};