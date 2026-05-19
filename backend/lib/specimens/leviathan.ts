import { SpecimenSettings } from "./types";

export const leviathan: SpecimenSettings = {
  // スケールを均一に 4.5 倍へ調整。巨大さを保ちつつ、AR空間での収まりを最適化します。
  scale: "4.5 4.5 4.5",
  // 中心から右(X)に離すことで、旋回半径を作ります
  position: "1.2 -0.5 0",
  // 90度倒して水平（よこ）にし、進行方向を向かせます
  rotation: "90 90 0",
  outerAnimation:
    "property: rotation; from: 0 0 0; to: 0 360 0; dur: 40000; easing: linear; loop: true",
  // 枠外に出ない範囲での緩やかな上下運動
  innerAnimation:
    "property: position; to: 0 -0.15 0.08; dur: 15000; easing: easeInOutSine; dir: alternate; loop: true",
  minScale: 0.1,
  maxScale: 3.0,
};
