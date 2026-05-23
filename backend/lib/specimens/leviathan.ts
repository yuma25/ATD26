import { SpecimenSettings } from "./types";

/**
 * [概要] クジラ（Leviathan）の標本設定である。
 * 巨大なスケールを維持しつつ、絵画のさらに奥側（Z: -0.3）に配置することで、
 * 広大な空間を泳ぐ演出を行う。また、向きを横向きに変更し、左右に遊泳させる。
 */
export const leviathan: SpecimenSettings = {
  // 💡 修正: 迫力を出すためにスケールを 4.5 倍へ拡大（マジェスティック・サイズ）
  scale: "4.5 4.5 4.5",
  // 💡 修正: さらに絵画の奥（Z: -0.3）へ移動させ、カメラへの圧迫感を解消。
  position: "0 -0.8 -0.3",
  // 💡 修正: モデルが左右（横向き）を向くように Y 軸を 90度回転。
  rotation: "90 90 0",
  // 巨大化に合わせて、ゆったりとした泳ぎの幅を再調整（Z軸は奥に固定）。
  outerAnimation:
    "property: position; from: -1.2 -0.8 -0.3; to: 1.2 -0.8 -0.3; dur: 25000; easing: easeInOutSine; dir: alternate; loop: true",
  // 進行方向への優雅な傾き（ヨーイング）。
  innerAnimation:
    "property: rotation; from: 0 -10 0; to: 0 10 0; dur: 12000; easing: easeInOutSine; dir: alternate; loop: true",
  minScale: 0.1,
  maxScale: 3.0,
};
