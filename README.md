# ATD26_SCIENCE-ART

<p align="center">
  <img src="./docs/images/cover.png" alt="ATD26_SCIENCE-ART Architecture Cover" width="100%">
</p>

AR（拡張現実）技術を用いた絵画コレクション・管理アプリケーション。実世界の画像認識を通じて3D作品を発見し、獲得した作品のデジタル図録（2D画像）をユーザーごとに永続化します。

---

## 🛠 技術スタック

### Frontend / Core

- **Framework**: Next.js 16 (App Router / Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Framer Motion
- **AR Engine**: MindAR.js (Web-based Image Tracking), A-Frame
- **Data Fetching**: SWR (Stale-While-Revalidate) - 画面遷移時の高速表示とキャッシュ管理を実現

### Backend / Infrastructure

- **BaaS**: Supabase (PostgreSQL / Auth / Storage)
- **Cache**: Redis (Upstash) - 統計データの高速集計、レートリミットに使用
- **Data Validation**: Zod

### Development / Quality

- **Linter/Formatter**: ESLint, Prettier
- **Testing**: Vitest
- **Commit**: Commitlint, Lefthook (Pre-commit hook)

---

## 📖 開発ドキュメント

詳細なシステム設計については，以下の各仕様書を参照のこと．

- **バックエンド技術リファレンス (`docs/backend_ref/`)**
  - [Domain Layer](./docs/backend_ref/DOMAIN_LAYER.md)：エンティティとインターフェース定義
  - [Application Layer](./docs/backend_ref/APPLICATION_LAYER.md)：ユースケースの詳細
  - [Infrastructure Layer](./docs/backend_ref/INFRASTRUCTURE_LAYER.md)：データベース構造，Drizzle ORM実装
  - [Adapters Layer](./docs/backend_ref/ADAPTERS_LAYER.md)：APIコントローラー仕様
- **フロントエンド技術リファレンス (`docs/frontend_ref/`)**
  - [App Layer](./docs/frontend_ref/APP_LAYER.md)：画面構成とAPI通信経路
  - [Components Layer](./docs/frontend_ref/COMPONENTS_LAYER.md)：UI部品の仕様と演出
  - [Hooks Layer](./docs/frontend_ref/HOOKS_LAYER.md)：状態管理と非同期通信処理
  - [Utils & Types Layer](./docs/frontend_ref/UTILS_LAYER.md)：共通処理とグローバル型定義
  - [Public Assets Layer](./docs/frontend_ref/ASSETS_LAYER.md)：静的資産（3D模型，AR標的等）の管理
- [⚖️ ライセンス・法的事項](./THIRD_PARTY_LICENSES.md)
  - 使用ライブラリの帰属表示，プライバシーポリシー，利用規約

---

## ⚖️ ライセンスと法的事項

本プロジェクトはプロフェッショナルな標準に基づき、以下の法的ドキュメントを整備しています。

- **[MIT License](./LICENSE)**: プロジェクト本体のライセンス。
- **[サードパーティ通知](./THIRD_PARTY_LICENSES.md)**: MindAR.js (TensorFlow.js, OpenCV.js 含む)、Next.js 等の主要ライブラリの帰属表示。
- **[プライバシーポリシー](./docs/LEGAL/PRIVACY_POLICY.md)**: ARカメラ利用（映像はデバイス内処理のみ）、データ収集に関するポリシー。
- **[利用規約](./docs/LEGAL/TERMS_OF_SERVICE.md)**: 知的財産権の保護、AR利用時の安全上の免責事項。

---

## 📂 プロジェクト構成 (Monorepo)

本プロジェクトは `pnpm workspaces` を採用したモノレポ構成となっており，クリーンアーキテクチャ（4層構造）に基づき関心の分離を徹底している．

```text
.
├── backend/            # バックエンド基盤 (@app/backend)
│   ├── drizzle/        # マイグレーション履歴
│   ├── src/
│   │   ├── adapters/   # Interface Adapters Layer (Controller群)
│   │   ├── application/# Application Layer (UseCase群)
│   │   ├── domain/     # Domain Layer (Entity, Repository Interfaces, Constants)
│   │   └── infrastructure/ # Infrastructure Layer (Drizzle DB, Redis, Supabase)
│   └── types/          # 互換性維持用の型エクスポート
├── frontend/           # Next.js 16 プロジェクト
│   ├── app/            # App Router (画面，API Routes)
│   ├── components/     # React コンポーネント (UI，AR制御)
│   ├── hooks/          # カスタムフック (状態管理，通信)
│   ├── lib/            # フロントエンド共通処理 (fetcher)
│   ├── public/         # 静的資産 (3Dモデル, ターゲット, 画像, スクリプト)
│   └── __tests__/      # テストコード
├── docs/               # プロジェクトドキュメント (backend_ref, frontend_ref 等)
├── AR_dataset/         # AR マーカー作成用の元データ
└── pnpm-workspace.yaml # モノレポ設定
```

---

## 🚀 環境構築・設定手順

リポジトリを取得（クローン）した後，以下の手順で開発環境を構築する．

### 1. 依存関係のインストール

プロジェクトのルートディレクトリで以下のコマンドを実行し，必要なパッケージをインストールする．

```bash
pnpm install
```

### 2. 環境変数の設定

フロントエンドとバックエンドのそれぞれで環境変数を設定する．

**フロントエンドの設定:**
```bash
cp frontend/.env.local.example frontend/.env.local
```
作成した `frontend/.env.local` に，Supabase および Redis の接続情報，ならびにデータベースの直接接続用URL (`DATABASE_URL`) を入力する．

**バックエンドの設定:**
マイグレーションやシード実行のため，バックエンド側にも `.env` ファイルを配置する（フロントエンドと同じ内容で構わない）．
```bash
cd backend
cp ../frontend/.env.local .env
```

### 3. データベースの構築（マイグレーション）

Drizzle ORM を使用して，Supabase 上にテーブル構造を構築する．

```bash
npx drizzle-kit push
```

### 4. 初期データ（シード）の投入

AR機能の動作に必要な標本マスターデータをデータベースに投入する．

```bash
npx tsx src/infrastructure/db/seed.ts
cd ..
```

### 5. 開発サーバーの起動

準備が完了したら，ルートディレクトリに戻り，開発サーバーを起動する．

```bash
pnpm dev
```
ブラウザで `http://localhost:3000` にアクセスし，画面が表示されることを確認する．

---

## ✅ 開発ガイドライン

- **ビルド確認**: コミット前に必ず `pnpm build` が通ることを確認してください。
- **型安全性**: `any` の使用は原則禁止です。`backend/types` のスキーマを使用してください。
- **ドキュメント更新**: 仕様変更を伴う場合は、必ず `docs/` 内の各仕様書も更新してください。

---

© 2026 ATD26_SCIENCE-ART Project.
