import { SpecimenSettings } from "./types";

export const shellcrab: SpecimenSettings = {
  // 全体的に小型化し、おさまりを良くする (さらに2倍拡大: 1.5 1.0 1.2)
  scale: "1.5 1.0 1.2",
  // カメラに近づきすぎないよう Z軸を 0.05 まで後退
  position: "0 -0.25 0.05",
  rotation: "0 0 0",
  outerAnimation: "",
  // 揺れ幅も最小限にし、安定感を出す
  innerAnimation:
    "property: position; to: 0.02 -0.25 0.06; dur: 3000; easing: easeInOutSine; dir: alternate; loop: true",
  minScale: 0.1,
  maxScale: 2.0,
};