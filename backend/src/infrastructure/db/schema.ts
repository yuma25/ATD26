import { pgTable, uuid, text, integer, timestamp, boolean, unique, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * 【データベーススキーマ定義】
 * 🎨 ATD26_SCIENCE-ART: アプリケーションの永続データを管理するための設計図。
 * docs/DATABASE_SQL.md の定義に基づき、Drizzle ORM 形式で記述。
 */

/**
 * --- profiles (来場者プロフィール) ---
 * アプリを利用する匿名ユーザー（冒険者）の属性情報を管理する。
 */
export const profiles = pgTable("profiles", {
  /** ユーザー固有のID (Supabase Auth の ID と一致させる) */
  id: uuid("id").primaryKey().notNull(),
  /** 来場グループの人数 (1-10) */
  partySize: integer("party_size"),
  /** 景品との交換が完了したかどうかのフラグ */
  isExchanged: boolean("is_exchanged").default(false),
  /** プロフィール作成日時 (JST) */
  createdAt: timestamp("created_at", { mode: "string" })
    .default(sql`(now() + interval '9 hours')`)
    .notNull(),
  /** 最後にアクティビティが確認された日時 (JST) */
  lastSeen: timestamp("last_seen", { mode: "string" })
    .default(sql`(now() + interval '9 hours')`),
});

/**
 * --- badges (標本マスター) ---
 * アプリ内で発見・収集可能な標本（アート作品）の情報を管理する。
 */
export const badges = pgTable("badges", {
  /** 標本固有のUUID */
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  /** 標本の名称 (重複不可) */
  name: text("name").unique().notNull(),
  /** 標本の作者（アーティスト）名 */
  artist: text("artist"),
  /** AR表示用の3Dモデルファイル (.glb) へのパス */
  modelUrl: text("model_url").notNull(),
  /** 詳細表示用の絵画画像ファイルへのパス */
  imageUrl: text("image_url").notNull(),
  /** MindAR で使用されるターゲット画像のインデックス (0-5) */
  targetIndex: integer("target_index").notNull(),
  /** マスターデータの登録日時 (JST) */
  createdAt: timestamp("created_at", { mode: "string" })
    .default(sql`(now() + interval '9 hours')`)
    .notNull(),
}, (table) => {
  return {
    /** ターゲットインデックスによる検索を高速化するためのインデックス */
    targetIndexIdx: index("idx_badges_target_index").on(table.targetIndex),
  };
});

/**
 * --- user_badges (獲得済み標本記録) ---
 * どのユーザーが、どの標本を、いつ獲得したかを記録する交差テーブル。
 */
export const userBadges = pgTable("user_badges", {
  /** 獲得記録固有のUUID */
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  /** 獲得したユーザーのID (profiles.id への参照) */
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  /** 獲得した標本のID (badges.id への参照) */
  badgeId: uuid("badge_id").references(() => badges.id, { onDelete: "cascade" }).notNull(),
  /** 標本を獲得（発見）した日時 (JST) */
  acquiredAt: timestamp("acquired_at", { mode: "string" })
    .default(sql`(now() + interval '9 hours')`)
    .notNull(),
}, (table) => {
  return {
    /** ユーザーごとの獲得リスト取得を高速化するためのインデックス */
    userIdIdx: index("idx_user_badges_user_id").on(table.userId),
    /** 同一ユーザーが同一標本を重複して獲得することを防ぐユニーク制約 */
    userBadgeUnique: unique("user_badges_user_id_badge_id_key").on(table.userId, table.badgeId),
  };
});
