import { SpecimenSettings } from "./types";

export const commonBlue: SpecimenSettings = {
  scale: "0.015 0.015 0.015",
  outerAnimation:
    "property: rotation; to: 0 0 360; dur: 15000; easing: linear; loop: true",
  innerAnimation:
    "property: position; to: 0 0 0.05; dur: 1500; easing: easeInOutSine; dir: alternate; loop: true",
  minScale: 0.01,
  maxScale: 0.03,

  // リリース時は少し大きく、ゆったりと羽ばたく
  releaseScale: "0.03 0.03 0.03",
  releaseInnerAnimation:
    "property: position; to: 0 0.1 0.1; dur: 3000; easing: easeInOutSine; dir: alternate; loop: true",
};
