import { SpecimenSettings } from "./types";

export const moonJelly: SpecimenSettings = {
  scale: "0.015 0.015 0.015",
  outerAnimation:
    "property: rotation; to: 0 0 360; dur: 60000; easing: linear; loop: true",
  innerAnimation:
    "property: scale; to: 0.02 0.02 0.02; dur: 4000; easing: easeInOutQuad; dir: alternate; loop: true",
  minScale: 0.01,
  maxScale: 0.03,

  // リリース時は浮遊感を高める
  releaseScale: "0.04 0.04 0.04",
  releaseInnerAnimation:
    "property: position; to: 0 0.5 0; dur: 6000; easing: easeInOutSine; dir: alternate; loop: true",
};
