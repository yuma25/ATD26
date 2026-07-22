# ATD26_SCIENCE-ART

<p align="center">
  <img src="./docs/images/cover.png" alt="ATD26_SCIENCE-ART Architecture Cover" width="100%">
</p>

AR（拡張現実）技術を用いた絵画コレクション・管理アプリケーション．実世界の画像認識を通じて3D作品を発見し，獲得した作品のデジタル図録（2D画像）をユーザーごとに永続化する．

<h3 align="center">🎬 デモ動画 (Demo Video)</h3>

<p align="center">
  <a href="https://youtu.be/DSTXw9Lhr3w" target="_blank" rel="noopener noreferrer">
    <img src="https://img.youtube.com/vi/DSTXw9Lhr3w/maxresdefault.jpg" alt="ATD26_SCIENCE-ART デモ動画" width="640" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.15);">
  </a>
</p>

<p align="center">
  <sub>※画像をクリックすると YouTube でデモ動画が再生されます</sub>
</p>

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
- **Cache**: Redis (Upstash) - 統計データの高速集計，レートリミットに使用
- **Data Validation**: Zod

### Development / Quality

- **Linter/Formatter**: ESLint, Prettier
- **Testing**: Vitest
- **Commit**: Commitlint, Lefthook (Pre-commit hook)

---

## 📖 開発ドキュメント

詳細なシステム設計については，以下の各仕様書およびアーキテクチャガイドを参照のこと．

### 🏛️ アーキテクチャ設計ガイドライン

システム全体の構造，データフロー，および設計思想を把握するためのガイドである．

- **[システム全体のアーキテクチャとデータフロー図解](./docs/architecture_and_dataflow.md)**：フロント・バックエンドの結合構造とデータ遷移シーケンス図．
- **[バックエンド クリーンアーキテクチャ ガイド](./docs/clean_architecture_guide.md)**：バックエンドの4層構造，DIP（依存関係逆転），およびディレクトリ構成の解説．
- **[フロントエンド アーキテクチャと通信ガイド](./docs/frontend_architecture_guide.md)**：Next.js App Router，SWR，およびBFF（API Routes）のデータ取得・更新フロー．
- **[フロントエンドの設計思想とクリーンアーキテクチャとの比較](./docs/frontend_clean_architecture_comparison.md)**：フロントエンドにおける「関心の分離（UIとロジックの分離）」とクリーンアーキテクチャ概念の対比．

### 🛠️ 技術詳細リファレンス (`docs/`)

各レイヤーごとの具体的な仕様・構造定義である．

- **バックエンド技術リファレンス (`docs/backend_ref/`)**
  - [Domain Layer](./docs/backend_ref/domain_layer.md)：エンティティとインターフェース定義
  - [Application Layer](./docs/backend_ref/application_layer.md)：ユースケースの詳細
  - [Infrastructure Layer](./docs/backend_ref/infrastructure_layer.md)：データベース構造，Drizzle ORM実装
  - [Adapters Layer](./docs/backend_ref/adapters_layer.md)：APIコントローラー仕様
  - [API仕様まとめ](./docs/backend_ref/api_summary.md)：提供API一覧と各レイヤーでの作業手順
- **フロントエンド技術リファレンス (`docs/frontend_ref/`)**
  - [App Layer](./docs/frontend_ref/app_layer.md)：画面構成とAPI通信経路
  - [Components Layer](./docs/frontend_ref/components_layer.md)：UI部品の仕様と演出
  - [Hooks Layer](./docs/frontend_ref/hooks_layer.md)：状態管理と非同期通信処理
  - [Utils & Types Layer](./docs/frontend_ref/utils_layer.md)：共通処理とグローバル型定義
  - [Public Assets Layer](./docs/frontend_ref/assets_layer.md)：静的資産（3D模型，AR標的等）の管理
- [⚖️ ライセンス・法的事項](./THIRD_PARTY_LICENSES.md)
  - 使用ライブラリの帰属表示，プライバシーポリシー，利用規約

---

## ⚖️ ライセンスと法的事項

本プロジェクトはプロフェッショナルな標準に基づき，以下の法的ドキュメントを整備している．

- **[MIT License](./LICENSE)**: プロジェクト本体のライセンス．
- **[サードパーティ通知](./THIRD_PARTY_LICENSES.md)**: MindAR.js (TensorFlow.js, OpenCV.js 含む)，Next.js 等の主要ライブラリの帰属表示．
- **[プライバシーポリシー](./docs/LEGAL/PRIVACY_POLICY.md)**: ARカメラ利用（映像はデバイス内処理のみ），データ収集に関するポリシー．
- **[利用規約](./docs/LEGAL/TERMS_OF_SERVICE.md)**: 知的財産権の保護，AR利用時の安全上の免責事項．

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

作成した `frontend/.env.local` に，以下の構成情報を入力する（※値にダブルクォーテーション `"` は含めないこと）．

```env
# --- データベース設定 ---
# Drizzle ORM が PostgreSQL に接続するための URL (マイグレーション・シード用)
DATABASE_URL=postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# --- Supabase 設定 ---
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# --- Redis 設定 (Upstash) ---
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxx
```

> [!NOTE]
> **管理者アクセスの仕組みについて**
>
> 本システムでは，環境変数 `ADMIN_EMAIL` のような固定の設定は不要である．
> Supabase 上で事前に「メールアドレスとパスワード」を用いて登録されたユーザーは，自動的に「運営者（スタッフ）」とみなされる仕組みになっている（一般ユーザーはすべて匿名ログインとなるため区別可能）．
>
> 管理者ダッシュボードには `http://localhost:3000/admin/login` からアクセスし，Supabase に登録したメールアドレスでログインを行う．

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

## 🧪 テスト実行手順

自動テスト（Vitest）を実行して，デバイス制御ロジックや計算処理が正常に動作するかを検証する．

### ユニットテストの実行

プロジェクトのルートディレクトリで以下のコマンドを実行する．

```bash
pnpm test
```

※ 内部でフロントエンド配下のテストファイル（`frontend/__tests__/*`）が実行される．

---

## 📸 当日の実施結果

実際に展示・実施した際の結果および認識対象となった作品画像です．

<table align="center" style="border: none; border-collapse: collapse;">
  <tr style="border: none;">
    <td align="center" style="border: none; padding: 5px;"><img src="./results/butterfly.jpg" width="220px" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"><br><sub>butterfly</sub></td>
    <td align="center" style="border: none; padding: 5px;"><img src="./results/jellyfish.jpg" width="220px" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"><br><sub>jellyfish</sub></td>
    <td align="center" style="border: none; padding: 5px;"><img src="./results/shellcrab.jpg" width="220px" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"><br><sub>shellcrab</sub></td>
  </tr>
  <tr style="border: none;">
    <td align="center" style="border: none; padding: 5px;"><img src="./results/sword.jpg" width="220px" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"><br><sub>sword</sub></td>
    <td align="center" style="border: none; padding: 5px;"><img src="./results/wave.jpg" width="220px" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"><br><sub>wave</sub></td>
    <td align="center" style="border: none; padding: 5px;"><img src="./results/whale.jpg" width="220px" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"><br><sub>whale</sub></td>
  </tr>
</table>

---

© 2026 ATD26_SCIENCE-ART Project.
