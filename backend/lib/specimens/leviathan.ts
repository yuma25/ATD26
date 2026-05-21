import { SpecimenSettings } from "./types";

export const leviathan: SpecimenSettings = {
  // 💡 修正: 以前のスケール (1.2) に戻して収まりを良くする
  scale: "1.2 1.2 1.2",
  // 絵画の中央付近に配置
  position: "0 -0.4 0.1",
  // モデルの基本姿勢を横向き（水平）に設定
  rotation: "90 0 0",
  // 横方向にゆったりと往復する動き（スケールに合わせて移動幅を調整）
  outerAnimation:
    "property: position; from: -0.3 -0.4 0.1; to: 0.3 -0.4 0.1; dur: 20000; easing: easeInOutSine; dir: alternate; loop: true",
  // 横向きの状態をベースに、進行方向にあわせてわずかに角度（ヨーイング）を変える
  innerAnimation:
    "property: rotation; from: 0 -15 0; to: 0 15 0; dur: 10000; easing: easeInOutSine; dir: alternate; loop: true",
  minScale: 0.1,
  maxScale: 3.0,
};
