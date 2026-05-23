/**
 * パッケージ: lib
 * 外部サービス（Supabase）との接続および認証ロジックを提供する。
 *
 * 導入パッケージ:
 * - @supabase/supabase-js: Supabase との通信を行うための公式 SDK。データベース操作および認証機能に使用。
 */

import { createClient, SupabaseClient, User } from "@supabase/supabase-js";

/**
 * 環境変数から接続に必要な構成情報を取得する。
 * - NEXT_PUBLIC_SUPABASE_URL: Supabase プロジェクトの URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: 公開用のアノンキー（ブラウザ側で使用可能）
 * - SUPABASE_SERVICE_ROLE_KEY: 管理者権限を持つサービスロールキー（サーバー側のみで使用）
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * [概要] 一般ユーザー用の Supabase クライアントである。
 * 公開情報の取得や、行レベルセキュリティ (RLS) に基づく一般的な操作に使用する。
 * 外部 SDK の createClient メソッドを使用して初期化される。
 */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * [概要] 管理者権限（Service Role）を持つ Supabase クライアントである。
 * RLS をバイパスしてデータベース全体へのフルアクセスを行う必要があるサーバーサイド処理（統計集計など）に使用する。
 * autoRefreshToken および persistSession を無効化し、ステートレスな実行環境に最適化している。
 */
export const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

/**
 * [概要] 匿名サインイン処理を実行し、ユーザー情報を取得する。
 * ユーザーに明示的な登録作業を強いることなく、アプリの利用（標本獲得の記録など）を可能にするための「匿名認証」を行う。
 *
 * @return user [User | null] 認証に成功した場合はユーザーオブジェクトを、失敗した場合は null を返却する。
 *
 * [技術的ステップ]
 * 1. セッション確認: supabase.auth.getSession() を呼び出し、既存のログイン状態を確認する。
 * 2. 異常検知とリカバリ: セッションエラー（トークン切れ等）を検知した場合は、強制的にサインアウトを実行した上で再サインインを試みる。
 * 3. 匿名サインイン実行: セッションが存在しない場合、supabase.auth.signInAnonymously() を実行して新しい匿名アカウントを作成する。
 * 4. 結果返却: 最終的に確定したユーザー情報を返却する。内部での例外は catch して null を返却することで、呼び出し元の処理を継続可能にする。
 */
export const signInAnonymously = async () => {
  try {
    if (!supabase) return null;

    // 1. SDK を使用して現在のセッション取得を試みる。
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    // 2. セッションの不整合（リフレッシュトークン異常など）が発生している場合のリカバリフロー。
    if (sessionError) {
      console.warn(
        "🔄 セッションの不整合を検知しました。リセットします...",
        sessionError.message,
      );
      // 強制サインアウトにより不整合状態をクリアする。
      await supabase.auth.signOut();
      // SDK の匿名サインイン機能を呼び出し、クリーンなセッションを確立する。
      const { data, error: retryError } =
        await supabase.auth.signInAnonymously();
      if (retryError) throw retryError;
      return data.user;
    }

    let user: User | null = session?.user || null;

    // 3. ログインしていない場合は、新しく「匿名ユーザー」としてサインインを実行する。
    if (!user) {
      console.log("🗝 匿名サインインを開始します...");
      const { data, error: signInError } =
        await supabase.auth.signInAnonymously();
      if (signInError) throw signInError;
      user = data.user;
    }

    return user || null;
  } catch (error: unknown) {
    // 予期せぬエラー（ネットワークエラー等）をキャッチし、ログに記録する。
    console.error("❌ 認証エラーが発生しました:", error);
    return null;
  }
};
