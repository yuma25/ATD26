import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * 【データベース接続設定】
 * Drizzle ORM インスタンスの初期化を行う。
 * 接続文字列は環境変数 DATABASE_URL から取得する。
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    "⚠️ 環境変数 DATABASE_URL が設定されていません。ビルド時または環境設定漏れの可能性があります。"
  );
}

// サーバーレス環境（Next.js API Routes）における接続リークを防ぐため、prepare: false を設定。
// 未設定時はダミーのURLを指定し、ビルド時の静的解析エラー（top-level throw）を回避する。
const client = postgres(connectionString || "postgres://dummy:dummy@localhost:5432/dummy", { prepare: false });


/**
 * プロジェクト全体で共有されるデータベース操作インスタンス。
 */
export const db = drizzle(client, { schema });
