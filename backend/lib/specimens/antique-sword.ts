import { SpecimenSettings } from "./types";

export const antiqueSword: SpecimenSettings = {
  scale: "0.012 0.012 0.012",
  outerAnimation:
    "property: rotation; to: 0 0 360; dur: 10000; easing: linear; loop: true",
  innerAnimation:
    "property: position; to: 0 0 0.05; dur: 2000; easing: easeInOutSine; dir: alternate; loop: true",
  minScale: 0.008,
  maxScale: 0.025,

  // リリース時は実物大に近い存在感を持たせる
  releaseScale: "0.035 0.035 0.035",
  releaseInnerAnimation:
    "property: position; to: 0 0.2 0; dur: 4000; easing: easeInOutSine; dir: alternate; loop: true",
};
