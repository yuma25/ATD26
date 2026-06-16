import "dotenv/config";
import { db } from "./index";
import { badges } from "./schema";

/**
 * 【データベース初期化（シード）スクリプト】
 * アプリケーションの動作に必要な「作品（標本）マスターデータ」をデータベースに投入する。
 *
 * [実行方法]
 * backend ディレクトリで `npx tsx src/infrastructure/db/seed.ts` を実行する。
 *
 * [技術的ステップ]
 * 1. 接続: dotenv 経由で環境変数（DATABASE_URL）を読み込み、DB へ接続。
 * 2. 投入: 定義された badgeData をループし、名前 (name) をキーにして upsert (onConflictDoUpdate) を実行する。
 */
async function seed() {
  console.log("🌱 データベースの初期化（シード）を開始します...");

  const badgeData = [
    {
      name: "自然に寄り添う者たち",
      artist: "池田 咲花",
      modelUrl: "/butterfly.glb",
      imageUrl: "/images/paintings/painting_0.jpg",
      targetIndex: 0,
    },
    {
      name: "お母さんの初水族館",
      artist: "川越あけみ",
      modelUrl: "/whale.glb",
      imageUrl: "/images/paintings/painting_1.jpg",
      targetIndex: 1,
    },
    {
      name: "ちょっと不思議な海の冒険",
      artist: "高山那月",
      modelUrl: "/shellcrab.glb",
      imageUrl: "/images/paintings/painting_2.jpg",
      targetIndex: 2,
    },
    {
      name: "海底の奥",
      artist: "可部谷清楓",
      modelUrl: "/sword.glb",
      imageUrl: "/images/paintings/painting_3.jpg",
      targetIndex: 3,
    },
    {
      name: "よすが",
      artist: "中西玲奈",
      modelUrl: "/wave.glb",
      imageUrl: "/images/paintings/painting_4.jpg",
      targetIndex: 4,
    },
    {
      name: "遊々海月",
      artist: "石垣実莉",
      modelUrl: "/jellyfish.glb",
      imageUrl: "/images/paintings/painting_5.jpg",
      targetIndex: 5,
    },
  ];

  try {
    for (const data of badgeData) {
      await db.insert(badges).values(data).onConflictDoUpdate({
        target: badges.name,
        set: data,
      });
      console.log(`✅ バッジ登録: ${data.name}`);
    }
    console.log("✨ 全ての初期データの投入が完了しました。");
  } catch (error) {
    console.error("❌ シード実行中にエラーが発生しました:", error);
    process.exit(1);
  }
}

seed();
