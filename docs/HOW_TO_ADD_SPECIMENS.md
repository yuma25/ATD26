# 🎨 新しい標本（絵画）の追加手順

## 1. データベースへの登録

Supabase の `badges` テーブルに新しい標本を登録します。

- `target_index`: `.mind` ファイルの何番目の画像か（1から順に指定）。

## 2. アセット配置

- `public/` に新しい `.glb` ファイルを配置。
- `public/targets.mind` を [MindAR Compile Tool](https://hiukim.github.io/mind-ar-js-doc/tools/compile) で更新。

## 3. 質感と動きの定義（重要）

`backend/lib/constants.ts` を開き、新標本の定義を追加します。

- `scale`: 表示サイズ。
- `outerAnimation`: 旋回速度。
- `innerAnimation`: 浮遊や脈動の動き。

## 4. アイコンの指定

`components/BadgeCard.tsx` の `IconList` に、`target_index` に応じた Lucide アイコンを追加します。
