import { SpecimenSettings } from "./types";

export const leviathan: SpecimenSettings = {
  // スケールを 4.5 倍で維持。
  scale: "4.5 4.5 4.5",
  // 絵画の中央付近に配置
  position: "0 -0.4 0.1",
  // 基本の向きをよこ向きに設定
  rotation: "90 90 0",
  // 横方向にゆったりと往復する動き（泳いでいる感を演出）
  outerAnimation:
    "property: position; from: -0.6 -0.4 0.1; to: 0.6 -0.4 0.1; dur: 20000; easing: easeInOutSine; dir: alternate; loop: true",
  // 進行方向にあわせてわずかに角度を変える動き
  innerAnimation:
    "property: rotation; from: 90 75 0; to: 90 105 0; dur: 10000; easing: easeInOutSine; dir: alternate; loop: true",
  minScale: 0.1,
  maxScale: 3.0,
};

