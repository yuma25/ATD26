# 🎨 新しい標本の追加手順

### — 世界を拡張するガイド —

このアプリケーションに新しい絵画（ターゲット）と標本（3Dモデル）を追加するためのステップバイステップガイドです。

---

## 1. アセットの準備

### 3Dモデル

- 形式: `.glb`
- 配置先: `public/` ディレクトリ
- 推奨: PBRテクスチャを使用し、10MB以下に最適化してください。

### AR学習データ (`targets.mind`)

1.  [MindAR Compile Tool](https://hiukim.github.io/mind-ar-js-doc/tools/compile) を開きます。
2.  新しい絵画画像をアップロードします。
3.  **注意**: 画像の並び順が `target_index` になります。
4.  書き出された `targets.mind` を `public/` に上書き配置します。

---

## 2. データベース登録 (Supabase)

`badges` テーブルに新しいレコードを追加します。

- `name`: 標本名
- `target_index`: 学習データの順番（0から開始）
- `model_url`: `/モデル名.glb`

---

## 3. 質感と動きの定義

`backend/lib/constants.ts` を編集し、追加した標本の振る舞いを定義します。

```typescript
// 例: 新しい標本 "Starry Night" の設定
"Starry Night": {
  scale: "2.0 2.0 2.0",            // 画面上の大きさ
  outerAnimation: "property: rotation; to: 0 360 0; dur: 8000; loop: true;", // 旋回
  innerAnimation: "property: position; to: 0 0.1 0; dur: 2000; dir: alternate; loop: true;", // 浮遊
  minScale: 1.5,
  maxScale: 3.0
}
```

---

## 4. UIアイコンの割り当て

`components/BadgeCard.tsx` 内の `IconList` を更新し、その標本を象徴する Lucide アイコンを紐付けます。

> [!IMPORTANT]
> 変更後は必ず `pnpm run build` を実行し、型チェックとパスの整合性を確認してください。
