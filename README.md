# 📖 Adventurer's Field Journal (ATD26_SCIENCE-ART)

「冒険者のフィールドジャーナル」をテーマにした、AR絵画探索・標本収集アプリケーション。

## 🌟 プロジェクトの概要

実世界の絵画（ターゲット）をスマートフォンでスキャンすることで、幻想的な3D標本を発見・記録するAR体験を提供します。全ての標本は時系列順にジャーナル（ホーム画面）へ記録され、コンプリートすることで「最終日誌」への道が開かれます。

---

## 🛠 技術スタック (Technical Stack)

モダンかつ堅牢な技術を採用し、高いパフォーマンスと保守性を両立しています。

### Frontend

- **Framework**: Next.js 16 (App Router)
- **Library**: React 19, TypeScript
- **Animation**: Framer Motion (UI演出), A-Frame (3Dアニメーション)
- **Styling**: Tailwind CSS (v4) - アナログな手書き質感の実現

### AR / 3D Engine

- **Engine**: MindAR (Image Tracking) - Webベースの高精度な画像認識
- **Rendering**: A-Frame / THREE.js - 標本モデルの高度な描画と制御
- **Model Format**: GLB (PBR対応)

### Backend & Infrastructure

- **BaaS**: Supabase
  - **Database**: PostgreSQL (標本マスタ、獲得記録)
  - **Auth**: Anonymous Authentication (シームレスなユーザー体験)
- **API**: Next.js API Routes (Service Role による安全なデータ操作)

### Quality & DX

- **Validation**: Zod (ランタイム型チェック)
- **Workflow**: Lefthook (Git Hooks による自動検証)
- **Lint/Format**: ESLint, Prettier
- **Testing**: Vitest

---

## 📂 ディレクトリ構成とファイル概要

主要なソースコードの構成と各ファイルの役割です。

### 📁 `app/` (Next.js ページ & API)

- `page.tsx`: **ホーム画面 (Journal Roadmap)**。標本の獲得状況を時系列順に表示し、全体の進捗とスクロール位置を管理します。
- `layout.tsx`: 共通レイアウト、フォント、メタデータの設定。
- **`ar/page.tsx`**: **AR探索画面**。MindARエンジンを起動し、DBから取得した全ターゲットを動的に認識・描画します。
- **`release/page.tsx`**: **フォトモード画面**。獲得した標本を空間に放ち、アニメーションを観察しながら写真を撮影できます。
- **`viewer/page.tsx`**: 各標本の3D詳細閲覧画面。
- **`api/`**:
  - `badges/route.ts`: 全標本マスターデータの提供。
  - `badges/acquire/route.ts`: 標本発見の記録（サーバーサイド実行で安全に保存）。
  - `badges/acquired/route.ts`: ユーザーごとの獲得履歴（日時含む）を提供。

### 📁 `backend/` (ビジネスロジック & DB)

- **`lib/constants.ts`**: **共通設定ファイル**。標本ごとのスケール、アニメーション（旋回・脈動）、オートスケールの範囲を定義します。
- **`lib/supabase.ts`**: Supabaseクライアントの初期化と匿名認証ロジック。
- **`lib/logic.ts`**: 進捗率（%）の計算など、UIに依存しない計算ロジック。
- **`services/badgeService.ts`**: **データ統合レイヤー**。API通信とDB操作を抽象化し、クライアント/サーバー両方から利用可能です。
- **`types/index.ts`**: Zodを使用したデータスキーマとTypeScriptインターフェース。

### 📁 `components/` (UIコンポーネント)

- `BadgeCard.tsx`: ジャーナルに並ぶ「標本箱」のデザイン。ホバー演出や遷移を制御。
- **`ar/DiscoveryComplete.tsx`**: 標本を発見した際の祝祭演出ポップアップ。
- **`layout/CloseButton.tsx`**: 各モードからジャーナルへ戻るためのフローティングボタン。

### 📁 `hooks/` (カスタムフック)

- `useHome.ts`: ホーム画面の状態管理（データ取得、時系列ソート、カメラ権限）。
- `useAR.ts`: **ARライフサイクル管理**。ターゲット発見の検知、解析ゲージのタイマー処理、リスナー管理。
- `useScrollManager.ts`: 画面遷移時のスクロール位置の永続化ロジック。

### 📁 `types/`

- `global.d.ts`: A-Frame、MindAR、THREE.jsなどの外部ライブラリに対するグローバル型定義。

---

## 🚀 技術的な特徴

1.  **データ駆動型**: 標本の数や動き、サイズはDBと定数ファイルに依存しており、コード修正なしで拡張可能です。
2.  **高精度追従**: ジッター抑制フィルターと動的オートスケーリングにより、プロ級のAR体験を実現しています。
3.  **時系列ジャーナル**: 獲得した標本は「発見した順」に古いものから上から順に並び、冒険の軌跡を可視化します。
4.  **堅牢な同期**: サーバーサイドAPIルートにより、DBの権限（RLS）に関わらず確実に記録を保存し、不整合を自動修復します。

---

## 🛠 開発者向けクイックスタート

1.  依存関係のインストール: `pnpm install`
2.  開発サーバー起動: `pnpm dev`
3.  ビルド確認: `pnpm run build`
