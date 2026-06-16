"use client";

/**
 * パッケージ: app/(main)/admin/login
 * 管理者パネル専用の認証画面を提供する。
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@backend/src/infrastructure/external/supabase";
import { LogIn, Key, Mail, AlertCircle, RefreshCw } from "lucide-react";

/**
 * [概要] 管理者ログイン画面のコンポーネントである。
 * メールアドレスとパスワードによる認証フォームを提供し、Supabase Auth を用いて検証を行う。
 *
 * [技術的ステップ]
 * 1. セッション監視: useEffect 内で現在のセッションを確認し、既に管理者としてログイン済みの場合は自動的にダッシュボード (/admin) へリダイレクトする。
 * 2. 認証処理: handleLogin 関数内で supabase.auth.signInWithPassword を呼び出し、認証結果に応じたエラーハンドリングを行う。
 * 3. セキュリティ: 匿名ユーザーや一般ユーザーを排除するため、session.user.app_metadata.provider の値を厳密にチェックする。
 * 4. UI 演出: 羊皮紙風の背景やマスキングテープの装飾を適用し、アプリ全体の「手記」というコンセプトを維持している。
 */
export default function AdminLoginPage() {
  // --- 状態管理 (State) ---
  /** 入力されたメールアドレス */
  const [email, setEmail] = useState("");
  /** 入力されたパスワード */
  const [password, setPassword] = useState("");
  /** 表示するエラーメッセージの内容 */
  const [error, setError] = useState<string | null>(null);
  /** ログイン処理の実行中フラグ */
  const [isLoading, setIsLoading] = useState(false);
  /** 初回のログイン状態チェック中フラグ */
  const [isChecking, setIsChecking] = useState(true);

  const router = useRouter();

  /**
   * [概要] 初回マウント時にユーザーのログイン状態を確認する。
   * 管理者権限を持つセッションが確立されている場合、ログイン画面をスキップさせる。
   */
  useEffect(() => {
    const checkUser = async () => {
      if (!supabase) {
        setIsChecking(false);
        return;
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // 管理者権限の厳格チェック。
      // provider が "email" であり、かつ匿名ログインでない場合を管理者とみなす。
      const isEmailUser = session?.user?.app_metadata?.provider === "email";
      const isAnonymous = session?.user?.is_anonymous;

      if (session && !isAnonymous && isEmailUser) {
        router.replace("/admin");
      } else {
        // 管理者でない場合は、そのままログインフォームを表示させる。
        setIsChecking(false);
      }
    };
    void checkUser();
  }, [router]);

  /**
   * [概要] ログインフォーム送信時の処理を行う。
   * @param e [React.FormEvent] フォーム送信イベント。
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // ページのリロード（既定動作）をキャンセルする。
    setIsLoading(true);
    setError(null);

    try {
      if (!supabase) throw new Error("Supabase client not initialized");

      // SDK を介して認証を実行する。
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      // 認証成功時、管理者ダッシュボードへ遷移する。
      router.push("/admin");
    } catch (err: unknown) {
      // エラーメッセージの抽出とステートへの反映。
      const message =
        err instanceof Error ? err.message : "ログインに失敗しました";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // セッション確認中のローディング画面を表示する。
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e8e2d2]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#3e2f28]/20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#e8e2d2]">
      <div className="max-w-md w-full">
        {/* ヘッダーセクション：タイトルとアイコン */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full bg-white/50 backdrop-blur-sm border border-[#3e2f28]/10 mb-4">
            <LogIn className="w-8 h-8 text-[#3e2f28]" />
          </div>
          <h1 className="text-3xl font-bold text-[#3e2f28] mb-2 tracking-widest uppercase">
            ADMIN ARCHIVE
          </h1>
          <p className="text-[#3e2f28]/60 italic font-serif">管理者ログイン</p>
        </div>

        {/* ログインフォームカード */}
        <div className="bg-white/40 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-xl relative overflow-hidden">
          {/* デザイン装飾（テープ） */}
          <div className="tape -top-2 -left-4 rotate-[-15deg] w-20 h-6 opacity-60"></div>
          <div className="tape -bottom-2 -right-4 rotate-[-15deg] w-20 h-6 opacity-60"></div>

          <form
            onSubmit={(e) => {
              void handleLogin(e);
            }}
            className="space-y-6 relative z-10"
          >
            {/* エラー発生時の警告表示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-3 text-sm animate-pulse">
                <AlertCircle className="w-4 h-4" />
                <span>
                  {error === "Invalid login credentials"
                    ? "メールアドレスまたはパスワードが正しくありません"
                    : error}
                </span>
              </div>
            )}

            {/* メールアドレス入力フィールド */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-[#3e2f28]/60 ml-1 font-bold">
                メールアドレス
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3e2f28]/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/50 border border-[#3e2f28]/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#3e2f28]/20 transition-all"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            {/* パスワード入力フィールド */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-[#3e2f28]/60 ml-1 font-bold">
                パスワード
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3e2f28]/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/50 border border-[#3e2f28]/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#3e2f28]/20 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* ログイン実行ボタン */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#3e2f28] text-[#e8e2d2] py-4 rounded-xl font-bold tracking-widest hover:bg-[#523f35] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? "認証中..." : "管理者ページに入る"}
            </button>
          </form>
        </div>

        {/* 戻るボタン（一般ユーザー用画面へ） */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-xs uppercase tracking-[0.2em] text-[#3e2f28]/40 hover:text-[#3e2f28] transition-colors font-bold"
          >
            ← フィールドに戻る
          </button>
        </div>
      </div>
    </div>
  );
}
