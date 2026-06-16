/**
 * パッケージ: lib/specimens
 * 各標本（3Dモデル）に固有のパラメータを管理するための型定義を提供する。
 */

/**
 * [概要] 標本ごとの個別設定を定義するインターフェースである。
 * AR 空間内でのモデルの配置、サイズ、アニメーション、およびスケーリングの挙動を制御する。
 */
export interface SpecimenSettings {
  /**
   * [概要] A-Frame におけるモデルの初期スケールを指定する。
   * @type string
   * 例: "0.5 0.5 0.5"
   */
  scale: string;

  /**
   * [概要] モデルの重心位置を補正するための相対座標を指定する。
   * @type string (Optional)
   * 例: "0 0.5 0"（モデルを 0.5 単位上に持ち上げる）
   */
  position?: string;

  /**
   * [概要] モデルの初期の向きを補正するための回転角度（度数法）を指定する。
   * @type string (Optional)
   * 例: "0 90 0"（Y軸を中心に 90度回転させる）
   */
  rotation?: string;

  /**
   * [概要] A-Frame の animation コンポーネントに渡す、外側の動き（親要素の動き）の設定を指定する。
   * @type string
   */
  outerAnimation: string;

  /**
   * [概要] A-Frame の animation コンポーネントに渡す、内側の動き（子要素の動き）の設定を指定する。
   * @type string
   */
  innerAnimation: string;

  /**
   * [概要] aframe-extras の animation-mixer コンポーネントの設定を指定する。
   * GLB モデルに組み込まれたアニメーションクリップを再生するために使用する。
   * @type string (Optional)
   * 例: "clip: flight; loop: repeat; timeScale: 1.5"
   */
  animationMixer?: string;

  /**
   * [概要] AR 環境下でのオートスケーリング機能における最小倍率を指定する。
   * @type number
   */
  minScale: number;

  /**
   * [概要] AR 環境下でのオートスケーリング機能における最大倍率を指定する。
   * @type number
   */
  maxScale: number;
}
