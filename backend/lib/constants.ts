/**
 * 標本ごとの個別設定（スケールとアニメーション）
 */
export interface SpecimenSettings {
  scale: string;
  outerAnimation: string;
  innerAnimation: string;
  minScale: number; // AR画面：最も近づいた時
  maxScale: number; // AR画面：最も遠い時
}

export const SPECIMEN_SETTINGS: Record<string, SpecimenSettings> = {
  Leviathan: {
    scale: "0.07 0.07 0.07",
    outerAnimation:
      "property: rotation; to: 0 0 360; dur: 40000; easing: linear; loop: true",
    innerAnimation:
      "property: position; to: 0 0 0.3; dur: 8000; easing: easeInOutSine; dir: alternate; loop: true",
    minScale: 0.04,
    maxScale: 0.1,
  },
  "Moon Jelly": {
    scale: "0.08 0.08 0.08",
    outerAnimation:
      "property: rotation; to: 0 0 360; dur: 60000; easing: linear; loop: true",
    innerAnimation:
      "property: scale; to: 0.1 0.1 0.1; dur: 4000; easing: easeInOutQuad; dir: alternate; loop: true",
    minScale: 0.05,
    maxScale: 0.12,
  },
  "Antique Sword": {
    scale: "0.06 0.06 0.06",
    outerAnimation:
      "property: rotation; to: 0 0 360; dur: 10000; easing: linear; loop: true",
    innerAnimation:
      "property: position; to: 0 0 0.15; dur: 2000; easing: easeInOutSine; dir: alternate; loop: true",
    minScale: 0.03,
    maxScale: 0.08,
  },
  "Great Wave": {
    scale: "0.025 0.025 0.025",
    outerAnimation:
      "property: rotation; to: 0 0 360; dur: 25000; easing: linear; loop: true",
    innerAnimation:
      "property: rotation; from: 80 -10 -5; to: 100 10 5; dur: 3000; easing: easeInOutSine; dir: alternate; loop: true",
    minScale: 0.015,
    maxScale: 0.04,
  },
  "Common Blue": {
    scale: "5.0 5.0 5.0",
    outerAnimation:
      "property: rotation; to: 0 0 360; dur: 15000; easing: linear; loop: true",
    innerAnimation:
      "property: position; to: 0 0 0.2; dur: 1500; easing: easeInOutSine; dir: alternate; loop: true",
    minScale: 3.0,
    maxScale: 8.0,
  },
};

export const DEFAULT_SETTINGS: SpecimenSettings = {
  scale: "0.05 0.05 0.05",
  outerAnimation:
    "property: rotation; to: 0 0 360; dur: 20000; easing: linear; loop: true",
  innerAnimation:
    "property: position; to: 0 0 0.1; dur: 4000; easing: easeInOutSine; dir: alternate; loop: true",
  minScale: 0.03,
  maxScale: 0.08,
};

export const getSpecimenSettings = (name: string): SpecimenSettings => {
  return SPECIMEN_SETTINGS[name] || DEFAULT_SETTINGS;
};
