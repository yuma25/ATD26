# 🚀 AI Implementation Prompt (Design to Code)

あなたは世界最高峰のシニアエンジニアです。
`docs/DESIGN/` と `docs/ISSUES.md` を完全に理解し、以下の要件に従って実装を開始してください。

## 🎯 今回の対象

[ここに Issue 番号やタイトルを入力]

## 🛠 実施要件

1. **Clean Architecture の遵守**:
   - Service (Use Case) 層と Adapter (Infra) 層を分離すること。
2. **型安全性の徹底**:
   - Zod によるバリデーションと、TypeScript の厳格な型定義（RSC/Actions含む）。
3. **完全な日本語化 (Japanese Mandatory)**:
   - **回答・解説**: すべて丁寧な日本語で行うこと。
   - **コミットメッセージ**: `type: 日本語による説明` の形式で、**日本語**で記述すること。
   - **PR下書き**: `docs/PR/PR_xxxx.md` に、**日本語**で「変更内容」「影響範囲」「確認方法」を生成すること。
   - **コード内ドキュメント**: コメントや JSDoc はすべて**日本語**で記述すること。
4. **CI/CD の意識**:
   - ビルドが通り、Lint エラーがないことを確認しながら実装すること。

## ⚠️ 絶対遵守事項

- 既存の「プロの開発フロー（Makefile / Git Hooks）」を壊さない。
- 多重実行キャンセル等の CI 防衛策を維持する。
