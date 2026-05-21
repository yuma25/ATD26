import { SpecimenSettings } from "./types";

export const moonJelly: SpecimenSettings = {
  // スケールを元のサイズ (1.6 1.6 1.2) に戻しつつ、動きだけを強調
  scale: "1.6 1.6 1.2",
  // 絵画の表面付近で、動きを強調するために位置を再調整
  position: "0 -0.8 0.1",
  rotation: "0 0 0",
  // 全体の優雅な回転（ゆらぎのある回転を維持）
  outerAnimation:
    "property: rotation; from: -5 0 -5; to: 5 360 5; dur: 35000; easing: linear; loop: true",
  // 幻想的な「漂い」を強調：上下・左右に大きくゆったり動く設定を維持
  innerAnimation:
    "property: position; from: -0.15 -0.9 0.08; to: 0.15 -0.6 0.2; dur: 8000; easing: easeInOutSine; dir: alternate; loop: true",
  minScale: 0.1,
  maxScale: 4.0,
};
