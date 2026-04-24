import { supabase, supabaseAdmin } from "../lib/supabase";
import { Badge, BadgeSchema, UserBadge } from "../types";
import { Logger } from "../../server/lib/logger";

export const BadgeService = {
  /**
   * すべてのバッジ情報を取得する
   */
  async getAllBadges(): Promise<Badge[]> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/badges");
        if (!res.ok) throw new Error("Failed to fetch badges");
        const data = await res.json();
        return (data || []).map((badge: unknown) => BadgeSchema.parse(badge));
      } catch (e) {
        console.error("[BadgeService/Client] API fetch failed:", e);
        return [];
      }
    }

    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from("badges")
      .select("*")
      .order("target_index", { ascending: true });

    if (error) {
      Logger.error("FETCH_BADGES_FAILED", error.message, { error });
      return [];
    }

    try {
      return (data || []).map((badge) => BadgeSchema.parse(badge));
    } catch (e) {
      console.warn("[BadgeService/Server] Zod validation failed:", e);
      return (data || []) as Badge[];
    }
  },

  /**
   * ユーザーが獲得したバッジのID一覧を取得する
   */
  async getAcquiredBadgeIds(userId: string): Promise<string[]> {
    // 💡 クライアントサイドでは API 経由
    if (typeof window !== "undefined") {
      try {
        const res = await fetch(`/api/badges/acquired?userId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch acquired badges");
        const data = await res.json();
        return data || [];
      } catch (e) {
        console.error("[BadgeService/Client] Acquired API fetch failed:", e);
        return [];
      }
    }

    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", userId);

    if (error) {
      Logger.error("FETCH_ACQUIRED_BADGES_FAILED", error.message, { userId });
      return [];
    }

    return (data || []).map((row) => row.badge_id);
  },

  /**
   * バッジを獲得（保存）する
   */
  async acquireBadge(
    userId: string,
    badgeId: string,
  ): Promise<UserBadge | null> {
    // 💡 クライアントサイドでは API 経由で POST
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/badges/acquire", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, badgeId }),
        });
        if (!res.ok) return null;
        return await res.json();
      } catch (e) {
        console.error("[BadgeService/Client] Acquire API call failed:", e);
        return null;
      }
    }

    // 💡 サーバーサイド実行（管理者権限で実行）
    const client = supabaseAdmin || supabase;

    // プロフィールの存在を確認し、なければ作成（自己修復）
    const { data: profile } = await client
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!profile) {
      console.log(
        `[BadgeService] Profile missing for ${userId}, attempting creation...`,
      );
      await client.from("profiles").insert([{ id: userId }]);
    }

    const jstNow = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString();

    const { data, error } = await client
      .from("user_badges")
      .insert([{ user_id: userId, badge_id: badgeId, acquired_at: jstNow }])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") return null; // 重複
      Logger.error("ACQUIRE_BADGE_FAILED", error.message, { userId, badgeId });
      return null;
    }

    return data;
  },
};
