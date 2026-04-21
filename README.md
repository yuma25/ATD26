# 🦋 Digital Specimen AR (Universal AR Badge System)

このプロジェクトは、**「現実の絵画」と「デジタルの3D標本」を融合させる、没入型のARバッジ収集システム**です。
Next.js 16 (Turbopack) と Supabase を基盤とし、2026年現在のモダンなエンジニアリング手法で構築されています。

---

## ✨ コア機能 (Key Features)

### 📸 高精度 Image Tracking AR
- **安定した起動**: モバイルブラウザ特有の初期化エラーを克服した堅牢なARエンジン（MindAR + A-Frame）。
- **生命感ある演出**: リアルに羽ばたき、マーカーの周囲を優雅に旋回する 3D モデル。
- **解析シークエンス**: 絵を一定時間捉え続けるとゲージが溜まる、ゲーム性の高い獲得フロー。

### 🆔 スマートなユーザー識別 & 保存
- **匿名 ID システム**: ユーザー登録不要でスマホごとに固有ID（UUID）を発行。
- **データの永続化**: 獲得したバッジは Supabase に永久保存され、リロードしても維持されます。
- **一回限りの獲得制御**: 獲得済みのユーザーには解析バーを表示せず、即座に鑑賞モードへ移行。

### 🎨 Apple スタイルの洗練された UI
- **スマホ最適化**: 右上の固定アクションボタン、大きなタップ領域、直感的な進捗表示。
- **透明感あるデザイン**: ホワイトスペースを贅沢に使った、クリーンでミニマルな美術館スタイル。

---

## 🛠 技術スタック (Technical Stack)

- **Frontend**: Next.js 16 (App Router), Tailwind CSS, Framer Motion
- **3D/AR**: A-Frame, MindAR.js, React Three Fiber (Home)
- **Backend**: Supabase (Auth: Anonymous, Database: PostgreSQL)
- **Tooling**: TypeScript, Prettier, ESLint, pnpm

---

## 🚀 クイックスタート (Quick Start)

### 1. 環境構築
```bash
# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev
```

### 2. バックエンド設定 (Supabase)
1. Supabase でプロジェクトを作成。
2. `docs/DESIGN/DATABASE_SCHEMA.md` の SQL を SQL Editor で実行。
3. `Authentication > Providers` で **Anonymous Sign-ins** を ON に設定。
4. `.env.local` に API キーを設定し、サーバーを再起動。

---

## 🎨 標本（バッジ）を増やす方法

このシステムは「ノーコード拡張」に対応しています。
1. **マーカーの追加**: `public/targets.mind` に新しい絵画の学習データを追加。
2. **モデルの追加**: `public/` に新しい `.glb` モデルを配置。
3. **データ登録**: Supabase の `badges` テーブルに新しい行（名前、ID、ターゲット番号等）を追加。
**これだけで、アプリに新しいコレクションが出現します。**

---

## 📂 プロジェクト構造 (Architecture)

- `app/`: View 層（Next.js ページ構成）
- `hooks/`: Logic 層（AR制御、状態管理、データ取得）
- `backend/`: Infrastructure 層（Supabase 通信、型定義）
- `components/`: UI 部品（再利用可能なコンポーネント）
- `public/`: 静的アセット（3Dモデル、ARマーカーデータ）

---

## 📜 ライセンス
MIT License - 自由に使用・拡張が可能です。

---

**Developed with 💙 for the Next Generation of AR Experiences.**
