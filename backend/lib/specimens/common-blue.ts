import { SpecimenSettings } from "./types";

export const commonBlue: SpecimenSettings = {
  // モデルの大きさ
  scale: "6.0 6.0 6.0",
  // モデルの重心補正（絵画の表面に密着させ、位置を少し下げる）
  position: "0 -0.4 0.01",
  // モデルの向き [X軸(上下) Y軸(左右) Z軸(傾き)]
  rotation: "-15 20 0",
  // 回転の揺れ（停止）
  outerAnimation: "",
  // 位置の移動（停止）
  innerAnimation: "",
  // AR空間でのピンチ操作による最小・最大サイズ制限
  minScale: 0.2,
  maxScale: 3.0,
};
