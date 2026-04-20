# 🚀 Universal AI-Native Template

このテンプレートは、**「AI（Gemini/ChatGPT/Cursor）と協調して、プロレベルの品質で爆速開発する」**ためのフルスタック・スターターキットです。

---

## 🛠 0. 最初の準備 (Quick Start)

1.  **リポジトリを作成**: このテンプレートから新しいリポジトリを作成します。
2.  **デブコンテナを起動**:
    - VS Code で開き、右下の **「Reopen in Container」** をクリック。
    - **自動セットアップ**: 起動時に AI ログファイル (`DEV_LOG.md` 等) が自動生成されます。
3.  **APIキーの登録**:
    - [Google AI Studio](https://aistudio.google.com/app/apikey) で API キーを取得。
    - GitHub の `Settings > Secrets > Actions` に `GEMINI_API_KEY` を登録（自動レビュー用）。
4.  **AIログイン**:
    - コンテナ内のターミナルで `gemini auth login` を実行。

---

## 📋 1. 開発フロー (AI-Native Workflow)

このテンプレートでは、AI と対話しながら **「3ステップ」** で開発を進めます。

### STEP 1: アイデアを設計図にする

- **使うもの**: `docs/PROMPTS/01_IDEA_TO_DESIGN.md`
- **手順**: プロンプトを AI に貼り付け、アイデアを伝えます。AI が質問を投げかけ、設計を深掘りします。
- **成果物**: `docs/DESIGN/` 内に要件定義、UXフロー、データ設計が生成されます。

### STEP 2: 設計をタスク(Issue)に分解する

- **使うもの**: `docs/PROMPTS/02_DESIGN_TO_ISSUES.md`
- **手順**: STEP 1 の設計図を AI に読み込ませます。
- **成果物**: `docs/ISSUES/` に、実装順序を考慮した最小単位のタスクリストが生成されます。

### STEP 3: 実装と自動レビュー

- **使うもの**: `docs/PROMPTS/03_IMPLEMENTATION_GUIDE.md`
- **手順**: AI (Cursor/Gemini等) に Issue を実装させ、`git push` します。
- **成果物**: **AI (Gemini) が PR に自動で現れ、日本語でコードレビューを投稿します。**

---

## 🏗 2. プロジェクト構造 (Architecture)

```text
.
├── app/                # フロントエンド (Next.js App Router)
├── server/             # バックエンド・AIロジック (RAG/Agents)
│   ├── agents/         # 自律型エージェント (Router, Grader)
│   ├── components/     # AIコンポーネント (Retriever, Reranker)
│   └── services/       # ビジネスロジック・RAGパイプライン
├── db/                 # データベース関連 (Schema, Seeds)
├── docs/               # AI と協調するための最重要ドキュメント
│   ├── PROMPTS/        # 01〜03の「AI共創プロンプト」
│   ├── DESIGN/         # AI生成の設計図の保存先
│   ├── ISSUES/         # AI生成のタスクリストの保存先
│   ├── PR/             # AI生成のプルリク下書きの保存先
│   └── AI_INSTRUCTIONS.md # プロジェクトの「憲法」(AI絶対遵守ルール)
├── scripts/            # 自動レビュー等の自動化スクリプト
├── DEV_LOG.md          # [Local] AIが自律管理する進捗ログ (Git非表示)
├── TECH_NOTES.md       # [Local] AIが自律管理する技術知識 (Git非表示)
├── GEMINI.md           # [Local] AI自身の動作命令・OS (Git非表示)
└── Makefile            # プロ仕様のセットアップコマンド集
```

---

## 🧠 3. AI 自律管理システム

このテンプレートには、AI が **「自分で自分の記憶を管理する」** 仕組みが組み込まれています。

- **自己紹介不要**: AI は起動時に `DEV_LOG.md` を読み込み、前回の続きから会話を始めます。
- **知識の蓄積**: 開発中に学んだ技術や設計判断は、AI が `TECH_NOTES.md` に自律的に記録します。
- **日本語徹底**: すべての回答、コミット、PR、ログは **日本語** で統一されます。

---

## 🚀 4. 将来の拡張 (CI/CD)

- **自動品質チェック**: `.github/workflows/ci.yml` により、プッシュ時に DB 連携テストまで自動実行。
- **自動デプロイ**: デプロイ先が決まれば、AI に依頼して `deploy.yml` を作成するだけで CD 環境が完成します。

---

**Happy AI-Driven Developing!** 🚀
