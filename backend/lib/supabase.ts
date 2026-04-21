import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// 永続化（localStorage）を明示的に有効にする設定
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

/**
 * 既存のセッションを確認し、なければ匿名ログインを実行します。
 * これによりリロードしてもIDが変わりません。
 */
export const signInAnonymously = async () => {
  if (!supabase) return null;

  try {
    // 1. まず現在のセッション（既存ユーザー）を確認
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      console.log("Existing session found:", session.user.id);
      return session.user;
    }

    // 2. セッションがなければ匿名ログインを実行
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.warn("Anonymous Sign-in disabled or failed:", error.message);
      return null;
    }

    console.log("New anonymous session created:", data.user?.id);
    return data.user;
  } catch (e) {
    console.error("Auth Error:", e);
    return null;
  }
};
