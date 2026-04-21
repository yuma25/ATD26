/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function review() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const diff = process.argv[2] || "";
    const prompt = `あなたは世界最高峰のソフトウェアエンジニアです。以下のコードの変更点（git diff）をレビューし、改善点や称賛すべき点を日本語で簡潔に伝えてください。\n\n${diff}`;

    const result = await model.generateContent(prompt);
    console.log(result.response.text());
  } catch (e) {
    // 失敗してもCIを止めない
  }
}

review();
