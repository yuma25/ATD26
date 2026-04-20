module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // 新機能
        "fix", // バグ修正
        "docs", // ドキュメントのみの変更
        "style", // コードの動作に影響しない変更（ホワイトスペース、フォーマット等）
        "refactor", // バグ修正や機能追加ではないコード変更
        "perf", // パフォーマンス向上
        "test", // テストの追加・修正
        "chore", // ビルドプロセスやドキュメント生成などの補助ツール・ライブラリの変更
        "revert", // 過去のコミットの取り消し
      ],
    ],
  },
};
