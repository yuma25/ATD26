import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// 1. 一般権限（ブラウザ用）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. 管理者権限 (サーバーサイド専用)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * ログイン状態を確認し、必要に応じて匿名サインインを行う
 */
export const signInAnonymously = async () => {
  try {
    // 1. まず現在のセッションを確認
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      console.log("✅ Existing session found:", session.user.id);
      return session.user;
    }

    // 2. セッションがない場合のみ、新しく匿名サインイン
    console.log("🗝 Starting new anonymous session...");
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;

    console.log("✅ New anonymous user created:", data.user?.id);
    return data.user;
  } catch (error) {
    console.error("❌ Auth failure:", error);
    return null;
  }
};
