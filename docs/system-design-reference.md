# 🏗 プロジェクト標準ディレクトリ構成 (Standard Directory Structure)

本プロジェクトは、**「AI-Native Enterprise Architecture (Flat Structure)」**を採用している。
AI エージェントおよびエンジニアは、新しいコンポーネントを作成する際、以下の構造を厳守すること。

---

## 📂 1. アプリケーション層 (Root Components)

### 🌐 フロントエンド (`app/`) - Next.js App Router

- `(auth)/`: 認証関連のページ。
- `api/`: Route Handlers (APIエンドポイント)。
- `components/`: UI コンポーネント（Atomic Design または機能別）。

### 🧠 AI/サーバー層 (`server/` or `ai/`) - AIの脳

- **`agents/`**: 自律的な判断を行うエージェント（Router, Grader, Composer）。
- **`components/`**:
  - `retriever/`: ハイブリッド検索、ベクトル検索。
  - `reranker/`: 検索結果の再ランキング処理。
- **`services/`**: ビジネスロジック。
  - `rag_pipeline/`: 検索から生成までの一連の流れ。
  - `semantic_cache/`: 意味ベースのキャッシュ。
- **`prompts/`**: テンプレート、バージョン管理、レジストリ。
- **`tools/`**: AI が実行できるツール（検索、外部API連携）。
- **`security/`**: 入出力ガードレール、コンテンツフィルタリング。

### 💾 データ層 (`db/` or `schema/`)

- `schema/`: Prisma / Drizzle 等のスキーマ定義。
- `seeds/`: 開発用データ。

---

## 📂 2. 運用・品質管理 (Operations)

- `docs/`: 設計図、プロンプト、Issue、PR下書き。
- `evaluation/`: AI の回答精度（RAG精度）を測定するデータセットと評価スクリプト。
- `observability/`: トレース、コスト監視、ユーザーフィードバック収集。
- `scripts/`: DB初期化、マイグレーション、運用自動化スクリプト。
- `tests/`: ユニットテスト、インテグレーションテスト、E2E。

---

## 📂 3. AI制御メタデータ (Meta)

- **`docs/PROMPTS/`**: 01*設計, 02_Issue, 03*実装ガイド。
- **`docs/AI_INSTRUCTIONS.md`**: AI が遵守すべき「憲法」。
- **`GEMINI.md`**: ローカル AI エージェントへの自動命令書。
- **`DEV_LOG.md`**: ローカル専用の作業進捗ログ。

---

## 🛠 設計の優先順位 (Priority)

1.  **Type-Safety**: Zod と TypeScript による厳格な型定義。
2.  **Separation of Concerns**: UI (app), Logic (server), AI (ai) の分離。
3.  **Observability First**: すべての AI 処理は追跡可能 (Traced) であること。
4.  **Security by Design**: AI の入出力には必ずガードレールを介すること。

---

この構造は、スケーラビリティと AI による自動メンテナンスを最大化するために最適化されている。
