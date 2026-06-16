import { defineConfig } from "drizzle-kit";

/**
 * [概要] Drizzle Kit の設定ファイル。
 * データベースのマイグレーション生成やプッシュ実行時の動作を定義する。
 *
 * [設定項目]
 * - schema: データベースの設計図（schema.ts）の場所。
 * - out: 生成された SQL マイグレーションファイルの保存先。
 * - dialect: 使用するデータベースの種類（PostgreSQL）。
 * - dbCredentials: 接続先 URL（環境変数から取得）。
 */
export default defineConfig({
  schema: "./src/infrastructure/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      "postgres://postgres:postgres@localhost:5432/postgres",
  },
});
