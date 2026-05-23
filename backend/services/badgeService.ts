/**
 * パッケージ: services
 * アプリケーションのビジネスロジックを提供する。
 * データベース操作、外部APIとの通信、およびデータのバリデーションを担う。
 */

import { supabase, supabaseAdmin } from "../lib/supabase";
import { Badge, BadgeSchema, UserBadge, UserBadgeSchema } from "../types";

/**
 * [概要]
 * 標本（バッジ）およびユーザー進捗の管理を担う中心的なサービスである。
 * データベース（Supabase）との通信を抽象化し、実行環境（ブラウザ/サーバー）を判別して最適な通信経路を自動選択する。
 */
export const BadgeService = {
  /**
   * [概要] すべての標本情報を取得する。
   * データベースに登録されている全標本データを取得し、Zod スキーマでパースして返却する。
   *
   * @param signal [AbortSignal] (Optional) リクエストを中断するためのシグナル。
   * @return badges [Promise<Badge[]>] 標本データの配列。エラー時や中断時は空配列を返却する。
   *
   * [技術的ステップ]
   * 1. 環境判定: typeof window を使用してクライアント側かサーバー側かを判定する。
   * 2. クライアント側処理: 内部 API (/api/v1/badges) に対して fetch を行い、結果をパースする。
   * 3. サーバー側処理: supabase クライアントを使用して 'badges' テーブルから直接データをセレクトする。
   * 4. バリデーション: 取得した生データを BadgeSchema.parse() に通し、型安全性を保証する。
   */
  async getAllBadges(signal?: AbortSignal): Promise<Badge[]> {
    // 1. クライアント側（ブラウザ）で実行されている場合、専用の内部APIを呼び出す。
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/v1/badges", { signal });
        const result = await res.json();

        if (result.success) {
          return (result.data || []).map((badge: unknown) =>
            BadgeSchema.parse(badge),
          );
        }
        return [];
      } catch (e: unknown) {
        if (e instanceof Error && e.name === "AbortError") return [];
        const message = e instanceof Error ? e.message : "不明なエラー";
        console.warn("[BadgeService/Client] 標本取得を中断:", message);
        return [];
      }
    }

    // 2. サーバー側で実行されている場合、直接データベースに問い合わせる。
    const client = supabaseAdmin || supabase;
    if (!client) return [];

    const { data, error } = await client
      .from("badges")
      .select("id, name, artist, model_url, image_url, target_index")
      .order("target_index");

    if (error) {
      console.error("[BadgeService/Server] DB取得エラー:", error.message);
      return [];
    }

    return (data || []).map((badge: unknown) => BadgeSchema.parse(badge));
  },

  /**
   * [概要] ユーザープロフィールの取得を行う。
   * 指定されたユーザーIDに対応する属性情報（パーティ人数、景品交換フラグなど）を取得する。
   *
   * @param userId [string] 取得対象ユーザーの UUID。
   * @param signal [AbortSignal] (Optional) リクエストを中断するためのシグナル。
   * @return profile [Promise<any | null>] プロフィールデータ。存在しない場合やエラー時は null を返却する。
   */
  async getProfile(userId: string, signal?: AbortSignal) {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch(`/api/v1/profile/get?userId=${userId}`, {
          signal,
        });
        const result = await res.json();
        return result.success ? result.data : null;
      } catch (e: unknown) {
        if (e instanceof Error && e.name === "AbortError") return null;
        return null;
      }
    }

    const client = supabaseAdmin || supabase;
    if (!client) return null;

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
   * [概要] 標本の獲得を記録する。
   * ユーザーが特定の標本を発見・解析完了した事実をデータベースに永続化する。
   * プロフィールが未作成の場合は自動的に作成を行う（遅延初期化）。
   *
   * @param userId [string] 獲得したユーザーのID。
   * @param badgeId [string] 獲得対象の標本ID。
   * @return result [Promise<{data: UserBadge | null, error: any}>] 登録されたデータ、または発生したエラー。
   *
   * [技術的ステップ]
   * 1. API呼び出し: クライアント側では /api/v1/badges/acquire を POST で呼び出す。
   * 2. プロフィール整合性チェック: サーバー側では、外部キー制約違反を防ぐため事前に profiles テーブルを確認し、不在なら作成 (upsert) する。
   * 3. レコード挿入: 'user_badges' テーブルに user_id と badge_id のペアを挿入する。
   * 4. バリデーション: 挿入成功後、UserBadgeSchema でデータを検証する。
   */
  async acquireBadge(userId: string, badgeId: string) {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/v1/badges/acquire", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, badgeId }),
        });
        const result = await res.json();
        return {
          data: result.success ? result.data : null,
          error: result.success ? null : result.error,
        };
      } catch (e: unknown) {
        console.error("[BadgeService/Client] 標本獲得の記録に失敗:", e);
        return { data: null, error: e };
      }
    }

    const client = supabaseAdmin || supabase;
    if (!client)
      throw new Error("データベースクライアントが初期化されていません。");

    // 外部キー制約エラー (23503) 対策: プロフィールの存在を確認し、なければ作成する。
    try {
      const { data: profile } = await client
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (!profile) {
        console.log(`🆕 Profile not found for ${userId}, creating now...`);
        await client.from("profiles").upsert({ id: userId });
      }
    } catch (e) {
      console.warn("⚠️ Profile check failed, proceeding anyway:", e);
    }

    // 重複登録が発生した場合はエラーを返却し、上位レイヤーでハンドリングさせる。
    const { data, error } = await client
      .from("user_badges")
      .insert({
        user_id: userId,
        badge_id: badgeId,
      })
      .select()
      .single();

    return { data: data ? UserBadgeSchema.parse(data) : null, error };
  },

  /**
   * [概要] ユーザーの獲得済み標本リストを取得する。
   *
   * @param userId [string] 対象ユーザーのID。
   * @param signal [AbortSignal] (Optional) リクエストを中断するためのシグナル。
   * @return userBadges [Promise<UserBadge[]>] 獲得済みレコードの配列。
   */
  async getAcquiredBadges(
    userId: string,
    signal?: AbortSignal,
  ): Promise<UserBadge[]> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch(`/api/v1/badges/acquired?userId=${userId}`, {
          signal,
        });
        const result = await res.json();
        if (result.success) {
          return (result.data || []).map((b: unknown) =>
            UserBadgeSchema.parse(b),
          );
        }
        return [];
      } catch (e: unknown) {
        if (e instanceof Error && e.name === "AbortError") return [];
        return [];
      }
    }

    const client = supabaseAdmin || supabase;
    if (!client) return [];

    const { data, error } = await client
      .from("user_badges")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("[BadgeService] 獲得履歴取得エラー:", error.message);
      return [];
    }

    return (data || []).map((b: unknown) => UserBadgeSchema.parse(b));
  },

  /**
   * [概要] 獲得済み標本のIDリストのみを取得する。
   * getAcquiredBadges の結果から ID 部分のみを抽出し、フロントエンドでの重複チェックなどを容易にする。
   *
   * @param userId [string] 対象ユーザーのID。
   * @param signal [AbortSignal] (Optional) リクエストを中断するためのシグナル。
   * @return badgeIds [Promise<string[]>] 標本IDの文字列配列。
   */
  async getAcquiredBadgeIds(
    userId: string,
    signal?: AbortSignal,
  ): Promise<string[]> {
    const acquired = await this.getAcquiredBadges(userId, signal);
    return acquired.map((b) => b.badge_id);
  },

  /**
   * [概要] プロフィール情報の更新を行う。
   * ユーザーの属性情報（パーティ人数や景品交換状況など）を upsert により更新する。
   *
   * @param userId [string] 更新対象ユーザーのID。
   * @param updates [Object] 更新内容。
   * @param updates.party_size [number] (Optional) パーティ（グループ）の人数。
   * @param updates.is_exchanged [boolean] (Optional) 景品交換が完了したかどうか。
   * @return success [Promise<boolean>] 更新に成功した場合は true、失敗した場合は false を返却する。
   */
  async updateProfile(
    userId: string,
    updates: { party_size?: number; is_exchanged?: boolean },
  ) {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/v1/profile/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, updates }),
        });
        const result = await res.json();
        return result.success;
      } catch {
        return false;
      }
    }

    const client = supabaseAdmin || supabase;
    if (!client) return false;

    const { error } = await client.from("profiles").upsert({
      id: userId,
      ...updates,
    });

    if (error) {
      console.error("[BadgeService] プロフィール更新エラー:", error.message);
      return false;
    }
    return true;
  },
};
