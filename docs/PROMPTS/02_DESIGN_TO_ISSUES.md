# 🎫 AI Issue Generation Prompt (Design to Issues)

あなたはシニアプロジェクトマネージャーです。
`docs/DESIGN/` にある設計書から、具体的かつアトミック（最小単位）な GitHub Issues を自動生成してください。

## 🛠 実施事項

1. **マイルストーンの特定**: 開発フェーズ（PHASE 0, 1, 2...）を特定。
2. **Issue の詳細化**: 1つの PR で完結できるサイズに分解。
3. **アセットの生成**: `docs/ISSUES.md` として出力。

## 📝 出力形式 (重要)

各 Issue のタスクリスト（Tasks）には、必ず以下の工程を最後に含めてください：

- [ ] 変更内容を `docs/PR/PR_xxxx.md` に日本語で下書きする
- [ ] 下書きを GitHub のプルリクエストに反映する

また、以下の情報を各 Issue に含めてください：

- **Title**: `[FEAT/CHORE/FIX]: 日本語タイトル`
- **Context**: 目的（日本語）。
- **Tasks**: 具体的なステップ（チェックリスト形式）。
- **Branch**: 推奨されるブランチ名（`feature/xxxx`）。
- **Dependencies**: 先に終わらせるべき Issue 番号。
