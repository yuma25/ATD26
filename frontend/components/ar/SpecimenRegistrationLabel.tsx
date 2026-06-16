"use client";

import { Badge } from "@backend/src/domain/entities/Badge";

/**
 * パッケージ: components/ar
 * AR 体験中に使用されるオーバーレイ UI コンポーネントを提供する。
 */

/**
 * [概要] SpecimenRegistrationLabel コンポーネントのプロパティ定義である。
 *
 * @param activeBadge [Badge | null] 現在認識されている標本のデータ。認識されていない場合は null。
 * @param onClose [() => void] ラベルを閉じるためのコールバック関数。
 */
interface SpecimenRegistrationLabelProps {
  activeBadge: Badge | null;
  onClose: () => void;
}

/**
 * [概要] 博物館の標本ラベル（キャプション）を模したデザインの UI コンポーネントである。
 * AR 画面で標本を認識している間、作品のメタデータを表示するために使用される。
 *
 * [技術的ステップ]
 * 1. 表示制御: activeBadge が不在の場合は null を返却し、何も描画しない。
 * 2. デザイン実装: インラインスタイルを用いて、羊皮紙のような質感や影、タイポグラフィを構築する。
 * 3. アニメーション: label-reveal アニメーション（グローバル CSS で定義）により、下から浮き上がる演出を行う。
 * 4. データ整形: ユーザー ID の一部や現在の日付を表示し、その場での「公式な記録」であるという没入感を高める。
 */
export const SpecimenRegistrationLabel = ({
  activeBadge,
  onClose,
}: SpecimenRegistrationLabelProps) => {
  // 標本が選択されていない場合は早期リターンする。
  if (!activeBadge) return null;

  return (
    <div
      onClick={onClose}
      style={{
        pointerEvents: "auto",
        cursor: "pointer",
        padding: "40px",
        background: "#fff",
        border: "1px solid #000",
        boxShadow: "20px 20px 0px rgba(0,0,0,0.1)",
        textAlign: "left",
        animation: "label-reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        width: "85vw",
        maxWidth: "400px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 登録 ID の表示（UUID の先頭 8 文字を抽出） */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 15,
          fontSize: "10px",
          opacity: 0.3,
          fontFamily: "monospace",
        }}
      >
        REG-ID: {activeBadge.id.slice(0, 8)}
      </div>

      {/* 標本名エリア */}
      <div
        style={{
          borderBottom: "2px solid #000",
          paddingBottom: "10px",
          marginBottom: "20px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "10px",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            opacity: 0.5,
          }}
        >
          アーカイブへの記録を確認
        </p>
        <h2
          style={{
            margin: "5px 0 0",
            fontSize: "32px",
            fontWeight: "900",
            fontFamily: "serif",
            fontStyle: "italic",
          }}
        >
          {activeBadge.name}
        </h2>
      </div>

      {/* 詳細情報エリア（分類・状態） */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: "8px",
              textTransform: "uppercase",
              fontWeight: "bold",
              opacity: 0.4,
            }}
          >
            分類
          </label>
          <p style={{ margin: 0, fontSize: "12px", fontFamily: "monospace" }}>
            デジタル標本
          </p>
        </div>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "8px",
              textTransform: "uppercase",
              fontWeight: "bold",
              opacity: 0.4,
            }}
          >
            状態
          </label>
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              fontFamily: "monospace",
              color: "#3b82f6",
            }}
          >
            保存済み
          </p>
        </div>
      </div>

      {/* 登録メタデータ（日付、種別、場所） */}
      <div
        style={{
          marginTop: "30px",
          borderTop: "1px dashed #ccc",
          paddingTop: "20px",
          fontSize: "10px",
          fontFamily: "monospace",
          lineHeight: "1.6",
          opacity: 0.6,
        }}
      >
        日付: {new Date().toLocaleDateString()}
        <br />
        種別: AR再構成
        <br />
        場所: リモートノード
      </div>
    </div>
  );
};
