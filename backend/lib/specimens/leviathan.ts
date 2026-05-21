import { SpecimenSettings } from "./types";

export const leviathan: SpecimenSettings = {
  // スケールを 4.5 倍で維持。
  scale: "4.5 4.5 4.5",
  // 絵画の中央付近に配置
  position: "0 -0.4 0.1",
  // 💡 修正: モデルの基本姿勢を横向き（水平）に設定
  rotation: "90 0 0",
  // 横方向にゆったりと往復する動き
  outerAnimation:
    "property: position; from: -0.6 -0.4 0.1; to: 0.6 -0.4 0.1; dur: 20000; easing: easeInOutSine; dir: alternate; loop: true",
  // 💡 修正: 親要素での二重回転（90+90=180）を避けるため、アニメーションのベース角度を 0 に修正
  // これにより、モデルの X:90 状態を維持したまま、Y軸（首振り）だけを動かします
  innerAnimation:
    "property: rotation; from: 0 -15 0; to: 0 15 0; dur: 10000; easing: easeInOutSine; dir: alternate; loop: true",
  minScale: 0.1,
  maxScale: 3.0,
};
