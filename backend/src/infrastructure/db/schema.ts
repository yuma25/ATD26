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
  id: uuid("id").primaryKey().notNull(),
  partySize: integer("party_size"),
  isExchanged: boolean("is_exchanged").default(false),
  createdAt: timestamp("created_at", { mode: "string" })
    .default(sql`(now() + interval '9 hours')`)
    .notNull(),
  lastSeen: timestamp("last_seen", { mode: "string" })
    .default(sql`(now() + interval '9 hours')`),
});

/**
 * --- badges (標本マスター) ---
 * アプリ内で発見・収集可能な標本（アート作品）の情報を管理する。
 */
export const badges = pgTable("badges", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: text("name").unique().notNull(),
  artist: text("artist"),
  modelUrl: text("model_url").notNull(),
  imageUrl: text("image_url").notNull(),
  targetIndex: integer("target_index").notNull(),
  createdAt: timestamp("created_at", { mode: "string" })
    .default(sql`(now() + interval '9 hours')`)
    .notNull(),
}, (table) => {
  return {
    targetIndexIdx: index("idx_badges_target_index").on(table.targetIndex),
  };
});

/**
 * --- user_badges (獲得済み標本記録) ---
 * どのユーザーが、どの標本を、いつ獲得したかを記録する交差テーブル。
 */
export const userBadges = pgTable("user_badges", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  badgeId: uuid("badge_id").references(() => badges.id, { onDelete: "cascade" }).notNull(),
  acquiredAt: timestamp("acquired_at", { mode: "string" })
    .default(sql`(now() + interval '9 hours')`)
    .notNull(),
}, (table) => {
  return {
    userIdIdx: index("idx_user_badges_user_id").on(table.userId),
    userBadgeUnique: unique("user_badges_user_id_badge_id_key").on(table.userId, table.badgeId),
  };
});
