const { GoogleGenerativeAI } = require("@google/generative-ai");
const { execSync } = require("child_process");
const fs = require("fs");

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // 1. プロジェクト規約 (docs/AI_INSTRUCTIONS.md) を読み込む
  let instructions = "";
  try {
    instructions = fs.readFileSync("docs/AI_INSTRUCTIONS.md", "utf8");
  } catch (e) {
    console.log(
      "Warning: docs/AI_INSTRUCTIONS.md not found. Using default instructions.",
    );
    instructions =
      "あなたは優秀なシニアエンジニアです。コードの品質、バグ、保守性をレビューしてください。";
  }

  // 2. PRの差分を取得 (GitHub Actions環境での実行を想定)
  let diff = "";
  try {
    // 常に main/develop ブランチとの差分を取るなどの調整が可能
    diff = execSync("git diff origin/${{ github.base_ref }}...HEAD").toString();
  } catch (e) {
    diff = execSync("git diff HEAD^..HEAD").toString();
  }

  if (!diff || diff.trim() === "") {
    console.log("No changes detected.");
    return;
  }

  // 3. Gemini にプロンプトを投げる
  const prompt = `
以下のプロジェクト規約に従って、提供されたコードの差分（diff）をレビューしてください。

# プロジェクト規約
${instructions}

# レビュー対象の差分
${diff}

# 出力形式
- 重要な指摘事項のみを簡潔に、箇条書きで日本語で回答してください。
- 問題がない場合は「素晴らしいコードです！特に指摘事項はありません。」と回答してください。
- 具体的かつ建設的なアドバイスを心がけてください。
`;

  console.log("Sending request to Gemini...");
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const reviewText = response.text();

  // 4. GitHub PR にコメントを投稿
  const repo = process.env.REPO_NAME;
  const prNumber = process.env.PR_NUMBER;
  const token = process.env.GITHUB_TOKEN;

  console.log(`Posting review to PR #${prNumber}...`);
  const commentBody = `### 🤖 AI Code Review (Gemini)\n\n${reviewText}`;

  // GitHub CLI (gh) を使ってコメント投稿（Actions環境には標準搭載）
  fs.writeFileSync("review_comment.txt", commentBody);
  execSync(`gh pr comment ${prNumber} --body-file review_comment.txt`, {
    env: { ...process.env, GH_TOKEN: token },
  });

  console.log("Review posted successfully!");
}

run().catch((err) => {
  console.error("Error during AI review:", err);
  process.exit(1);
});
