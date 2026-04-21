import { supabase } from "../lib/supabase";
import { Badge } from "../types";

export const BadgeService = {
  /**
   * すべてのバッジ情報を取得する
   */
  async getAllBadges(): Promise<Badge[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("badges")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to fetch badges:", error.message);
      return [];
    }
    return data || [];
  },

  /**
   * 特定ユーザーの獲得済みバッジIDリストを取得する
   */
  async getAcquiredBadgeIds(userId: string): Promise<string[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", userId);

    if (error) {
      console.error("Failed to fetch user badges:", error.message);
      return [];
    }
    return (data || []).map((b) => b.badge_id);
  },

  /**
   * バッジ獲得を記録する
   */
  async acquireBadge(userId: string, badgeId: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from("user_badges").insert({
      user_id: userId,
      badge_id: badgeId,
      acquired_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to save badge acquisition:", error.message);
      return false;
    }
    return true;
  },

  /**
   * 特定のバッジを既に持っているか確認する
   */
  async isAlreadyAcquired(userId: string, badgeId: string): Promise<boolean> {
    if (!supabase) return false;
    const { data, error } = await supabase
      .from("user_badges")
      .select("id")
      .eq("user_id", userId)
      .eq("badge_id", badgeId)
      .maybeSingle();

    return !!data && !error;
  },
};
