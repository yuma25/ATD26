import "dotenv/config";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./index";

async function runMigrate() {
  console.log("🚀 マイグレーションを実行しています...");
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("✅ マイグレーションが完了しました。");
  } catch (error) {
    console.error("❌ マイグレーションエラー:", error);
  }
  process.exit(0);
}

runMigrate();
