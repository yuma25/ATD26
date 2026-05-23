import { SpecimenSettings } from "./types";

/**
 * [概要] クジラ（Leviathan）の標本設定である。
 * 巨大なスケールを維持しつつ、絵画の奥側（Z軸マイナス方向）に配置することで、
 * 圧迫感を抑えつつ没入感のある遊泳演出を行う。
 */
export const leviathan: SpecimenSettings = {
  // 💡 修正: 迫力を出すためにスケールを 4.5 倍へ拡大（マジェスティック・サイズ）
  scale: "4.5 4.5 4.5",
  // 巨大化に合わせて、少し下げて絵画（マーカー）の内側（Z: -0.1）に配置。
  // これによりカメラへの近すぎによる圧迫感を解消する。
  position: "0 -0.8 -0.1",
  // モデルの基本姿勢を横向き（水平）に設定。
  rotation: "90 0 0",
  // 巨大化に合わせて、ゆったりとした泳ぎの幅を再調整（Z軸は絵画側に固定）。
  outerAnimation:
    "property: position; from: -1.0 -0.8 -0.1; to: 1.0 -0.8 -0.1; dur: 25000; easing: easeInOutSine; dir: alternate; loop: true",
  // 進行方向への優雅な傾き（ヨーイング）。
  innerAnimation:
    "property: rotation; from: 0 -10 0; to: 0 10 0; dur: 12000; easing: easeInOutSine; dir: alternate; loop: true",
  minScale: 0.1,
  maxScale: 3.0,
};
