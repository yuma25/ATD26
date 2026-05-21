import { SpecimenSettings } from "./types";

export const leviathan: SpecimenSettings = {
  // スケールを 4.5 倍で維持。
  scale: "4.5 4.5 4.5",
  // 絵画の中央付近に配置
  position: "0 -0.4 0.1",
  // 💡 修正: 頭が上を向かないよう、回転を 90 0 0 に変更して横向き（水平）に固定
  rotation: "90 0 0",
  // 横方向にゆったりと往復する動き（泳いでいる感を演出）
  outerAnimation:
    "property: position; from: -0.6 -0.4 0.1; to: 0.6 -0.4 0.1; dur: 20000; easing: easeInOutSine; dir: alternate; loop: true",
  // 💡 修正: 横向きの状態をベースに、進行方向にあわせてわずかに角度（ヨーイング）を変える
  innerAnimation:
    "property: rotation; from: 90 -15 0; to: 90 15 0; dur: 10000; easing: easeInOutSine; dir: alternate; loop: true",
  minScale: 0.1,
  maxScale: 3.0,
};
