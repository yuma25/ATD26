import "dotenv/config";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./index";

async function runMigrate() {
  console.log("🚀 マイグレーションを実行しています...");
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("✅ マイグレーションが完了しました。");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ マイグレーションエラー:", message);
  }
  process.exit(0);
}

runMigrate();
