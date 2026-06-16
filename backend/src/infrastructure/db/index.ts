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
  throw new Error(
    "❌ 環境変数 DATABASE_URL が設定されていません。Supabase のダッシュボードから接続文字列を取得し、.env ファイルに設定してください。",
  );
}

// サーバーレス環境（Next.js API Routes）における接続リークを防ぐため、prepare: false を設定。
const client = postgres(connectionString, { prepare: false });

/**
 * プロジェクト全体で共有されるデータベース操作インスタンス。
 */
export const db = drizzle(client, { schema });
