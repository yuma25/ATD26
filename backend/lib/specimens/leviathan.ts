import { SpecimenSettings } from "./types";

export const leviathan: SpecimenSettings = {
  scale: "0.01 0.01 0.01",
  outerAnimation:
    "property: rotation; to: 0 0 360; dur: 40000; easing: linear; loop: true",
  innerAnimation:
    "property: position; to: 0 0 0.1; dur: 8000; easing: easeInOutSine; dir: alternate; loop: true",
  minScale: 0.005,
  maxScale: 0.02,

  // リリース時は巨大なサイズで、ゆっくりと回遊させる
  releaseScale: "0.06 0.06 0.06",
  releaseOuterAnimation:
    "property: rotation; to: 0 360 0; dur: 60000; easing: linear; loop: true",
};
