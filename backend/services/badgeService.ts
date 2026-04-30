import { supabase, supabaseAdmin } from "../lib/supabase";
import { Badge, BadgeSchema, UserBadge } from "../types";

/**
 * 【標本（バッジ）サービス】
 * データベース（Supabase）とのデータのやり取りを管理する中心的なクラスです。
 */
export const BadgeService = {
  /**
   * --- 【第1章：標本情報の取得】 ---
   * 登録されているすべての標本データを取得します。
   */
  async getAllBadges(): Promise<Badge[]> {
    // 1. ブラウザ側（クライアント）で実行されている場合、専用のAPIを呼び出します
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/badges");
        const data: unknown[] = await res.json();
        // 取得したデータを「設計図（BadgeSchema）」に従って検証し、きれいな形にして返します
        return (data || []).map((badge) => BadgeSchema.parse(badge));
      } catch (e) {
        console.error("[BadgeService/Client] APIの取得に失敗しました:", e);
        return [];
      }
    }

    // 2. サーバー側で実行されている場合、直接データベースに問い合わせます
    const client = supabaseAdmin || supabase;
    if (!client) {
      return []; // 接続できない場合は空のリストを返します（早期リターン）
    }

    const { data, error } = await client
      .from("badges")
      .select("*")
      .order("target_index");

    if (error) {
      console.error("[BadgeService/Server] DB取得エラー:", error.message);
      return [];
    }

    // 検証して返します
    return (data || []).map((badge: unknown) => BadgeSchema.parse(badge));
  },

  /**
   * --- 【第2章：プロフィール（冒険者情報）の取得】 ---
   *
   * @param userId 冒険者のID
   */
  async getProfile(userId: string) {
    // 1. ブラウザ側での実行
    if (typeof window !== "undefined") {
      try {
        const res = await fetch(`/api/profile/get?userId=${userId}`);
        return await res.json();
      } catch {
        return null;
      }
    }

    // 2. サーバー側での実行
    const client = supabaseAdmin || supabase;
    if (!client) return null;

    // データがなくてもエラーを出さず、null を返す「maybeSingle」を使用します
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("[BadgeService] プロフィール取得エラー:", error.message);
      return null;
    }
    return data;
  },

  /**
   * --- 【第3章：プロフィールの更新】 ---
   * 冒険者の人数や最終活動日時を更新します。
   */
  async updateProfile(userId: string, updates: { party_size?: number }) {
    // 1. ブラウザ側での実行
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/profile/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, updates }),
        });
        const data = await res.json();
        return data.success;
      } catch {
        return false;
      }
    }

    // 2. サーバー側での実行
    const client = supabaseAdmin || supabase;
    if (!client) return false;

    // 日本時間 (JST) の現在時刻文字列を作成します (UTC+9h)
    const jstNow = new Date(Date.now() + 9 * 60 * 60 * 1000)
      .toISOString()
      .replace("Z", "")
      .replace("T", " ");

    // upsert: データがあれば更新、なければ新しく作成します
    const { error } = await client.from("profiles").upsert(
      {
        id: userId,
        ...updates,
        last_seen: jstNow,
      },
      { onConflict: "id" },
    );

    if (error) {
      console.error("[BadgeService] プロフィール更新エラー:", error.message);
    }

    return !error; // エラーがなければ true を返します
  },

  /**
   * --- 【第4章：獲得情報の管理】 ---
   */

  /**
   * 冒険者がすでに獲得した標本のID一覧を取得します
   */
  async getAcquiredBadgeIds(userId: string): Promise<string[]> {
    const rows = await this.getAcquiredBadges(userId);
    return rows.map((r) => r.badge_id);
  },

  /**
   * 獲得履歴を詳しく取得します
   */
  async getAcquiredBadges(
    userId: string,
  ): Promise<{ badge_id: string; acquired_at: string }[]> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch(`/api/badges/acquired?userId=${userId}`);
        return await res.json();
      } catch {
        return [];
      }
    }

    const client = supabaseAdmin || supabase;
    if (!client) return [];

    const { data } = await client
      .from("user_badges")
      .select("badge_id, acquired_at")
      .eq("user_id", userId);

    return data || [];
  },

  /**
   * 新しい標本を獲得したことを記録します
   */
  async acquireBadge(
    userId: string,
    badgeId: string,
  ): Promise<UserBadge | null> {
    if (typeof window !== "undefined") {
      const res = await fetch("/api/badges/acquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, badgeId }),
      });
      return await res.json();
    }

    const client = supabaseAdmin || supabase;
    if (!client) return null;

    // 冒険者のプロフィールを確実に作成しておきます
    await client.from("profiles").upsert({ id: userId }, { onConflict: "id" });

    // 日本時間で記録します
    const jstNow = new Date(Date.now() + 9 * 60 * 60 * 1000)
      .toISOString()
      .replace("Z", "")
      .replace("T", " ");

    const { data, error } = await client
      .from("user_badges")
      .insert([{ user_id: userId, badge_id: badgeId, acquired_at: jstNow }])
      .select()
      .single();

    if (error) {
      console.error("[BadgeService] 標本獲得エラー:", error.message);
      return null;
    }
    return data;
  },
};
