import fs from "fs";
import path from "path";

/**
 * 環境変数を物理ファイル（.env）から直接読み込んで注入するユーティリティ
 *
 * Next.js の Server Actions や特定のランタイム（Windows / Docker等）で、
 * .env が正しく読み込まれない問題に対処するために使用します。
 */
export function forceLoadEnv() {
  // すでに重要な変数が読み込まれている場合はスキップ（高速化）
  if (process.env.DATABASE_URL || process.env.GEMINI_API_KEY) return;

  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (!fs.existsSync(envPath)) return;

    const content = fs.readFileSync(envPath, "utf8");
    content.split(/\r?\n/).forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith("#")) return;

      const [key, ...valueParts] = trimmedLine.split("=");
      if (key && valueParts.length > 0) {
        const k = key.trim();
        const v = valueParts
          .join("=")
          .trim()
          .replace(/^["']|["']$/g, "");
        process.env[k] = v;
      }
    });
  } catch (err) {
    console.error("[Utility] Failed to force load env:", err);
  }
}
