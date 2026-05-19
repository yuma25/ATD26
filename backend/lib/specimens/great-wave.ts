import { SpecimenSettings } from "./types";

export const greatWave: SpecimenSettings = {
  // 高さが絵画の縦幅に収まるようスケールダウン
  scale: "0.18 0.2 0.12",
  // 絵画の下端付近を起点にする
  position: "0 -0.3 0.05",
  rotation: "0 45 0",
  outerAnimation: "",
  // ダイナミックさは残しつつ、枠から出ない程度の回転揺れ
  innerAnimation:
    "property: rotation; from: -5 40 -5; to: 5 50 5; dur: 3000; easing: easeInOutSine; dir: alternate; loop: true",
  minScale: 0.1,
  maxScale: 2.5,
};