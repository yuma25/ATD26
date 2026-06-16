"use client";

/**
 * パッケージ: app/(main)/admin
 * 管理者専用のダッシュボード機能を提供する。
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@backend/src/infrastructure/external/supabase";
import {
  Users,
  Award,
  TrendingUp,
  LogOut,
  RefreshCw,
  Clock,
  LayoutDashboard,
  ChevronRight,
  Home,
  Smartphone,
  Calendar,
  Search,
  User,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// --- 型定義 ---

/**
 * 全体統計データの構造
 */
interface Stats {
  /** 総来場者数（パーティ人数の合計） */
  totalVisitors: number;
  /** アプリを利用した総デバイス数 */
  totalDevices: number;
  /** 全ユーザーが獲得した標本の総数 */
  totalBadges: number;
  /** 最近アクティブだったユーザーのリスト */
  recentUsers: {
    id: string;
    party_size: number;
    created_at: string;
    last_seen: string | null;
  }[];
  /** 時系列統計データ（グラフ用） */
  hourlyStats: { hour: string; devices: number; badges: number }[];
  /** 統計の集計期間 ("1h", "24h", "all") */
  period: string;
}

/**
 * 個別ユーザーの詳細データの構造
 */
interface UserDetails {
  id: string;
  party_size: number;
  created_at: string;
  last_seen: string | null;
  /** ユーザーが獲得した標本の詳細リスト */
  badges?: {
    acquired_at: string;
    badges: { name: string; target_index: number };
  }[];
}

/**
 * [概要] 管理者ダッシュボードのメインコンポーネントである。
 * 全体の利用統計の可視化（Recharts 使用）および個別ユーザーの検索・照会機能を提供する。
 *
 * [技術的ステップ]
 * 1. 認可ガード: initDashboard 関数にてセッションを確認し、管理者でない場合はログイン画面へ強制リダイレクトする。
 * 2. 統計取得: fetchStats 関数で内部 API (/api/v1/admin/stats) を呼び出し、Redis キャッシュを活用した高速なデータ取得を行う。
 * 3. 動的更新: 集計期間 (period) の変更を検知し、自動的に統計データを再取得する。
 * 4. ユーザー検索: ユーザー ID による部分一致検索をサポートし、獲得済み標本のリストを詳細カードとして表示する。
 * 5. 時系列描画: ResponsiveContainer および AreaChart を用い、デバイス数と標本発見数の推移をグラフィカルに提示する。
 */
export default function AdminDashboard() {
  // --- 状態管理 (State) ---
  const [stats, setStats] = useState<Stats | null>(null);
  const [period, setPeriod] = useState("24h");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [searchId, setSearchId] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  const router = useRouter();
  const isInitialized = useRef(false);

  /**
   * マウント状態の管理（クライアントサイド限定の描画制御用）。
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => {
      clearTimeout(timer);
      setIsMounted(false);
    };
  }, []);

  /**
   * リアルタイム時計の更新。
   */
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        new Intl.DateTimeFormat("ja-JP", {
          timeZone: "Asia/Tokyo",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(now),
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  /**
   * [概要] 統計データを API から取得する。
   * @param isInitial [boolean] 初回読み込みかどうか。
   */
  const fetchStats = useCallback(
    async (isInitial = false) => {
      if (!isInitial) setIsRefreshing(true);
      const controller = new AbortController();
      try {
        if (!supabase) return;
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // 認証トークンをヘッダーに含めてリクエストを送信する。
        const res = await fetch(`/api/v1/admin/stats?period=${period}`, {
          headers: { Authorization: `Bearer ${session?.access_token}` },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("通信エラー");
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        } else {
          throw new Error(json.error?.message || "データ取得失敗");
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        const message = err instanceof Error ? err.message : "不明なエラー";
        console.warn("統計取得失敗:", message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
      return () => controller.abort();
    },
    [period],
  );

  /**
   * [概要] 管理者セッションの初期化と権限確認を行う。
   */
  const initDashboard = useCallback(async () => {
    if (!supabase) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // メールログインかつ非匿名ユーザーのみを管理者とみなす。
    const isEmailUser = session?.user?.app_metadata?.provider === "email";
    const isAnonymous = session?.user?.is_anonymous;

    if (!session || isAnonymous || !isEmailUser) {
      router.replace("/admin/login");
      return;
    }
    setHasSession(true);
    void fetchStats(true);
  }, [router, fetchStats]);

  /**
   * [概要] 特定のユーザー ID で詳細情報を検索する。
   * @param id [string] 検索対象のユーザーID（UUID）。
   */
  const searchUser = useCallback(async (id: string) => {
    if (!id) return;
    setIsSearching(true);
    setSearchError("");
    try {
      if (!supabase) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch(`/api/v1/admin/stats?userId=${id}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "検索失敗");
      setSelectedUser(json.data.userDetails);
    } catch (err: unknown) {
      setSearchError(err instanceof Error ? err.message : "検索失敗");
      setSelectedUser(null);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // 初期化の実行。
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      void initDashboard();
    }
  }, [initDashboard]);

  // 期間変更時の自動再取得。
  useEffect(() => {
    if (isInitialized.current && !isLoading) {
      void fetchStats();
    }
  }, [period, fetchStats, isLoading]);

  /**
   * ログアウト処理。
   */
  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (isLoading || !hasSession) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#e8e2d2] text-[#3e2f28] font-sans pb-20">
      <NavigationBar onLogout={handleLogout} currentTime={currentTime} />
      <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* ユーザー照会セクション */}
        <section className="space-y-4">
          <SearchBar
            value={searchId}
            onChange={setSearchId}
            onSearch={searchUser}
            isSearching={isSearching}
          />
          {(selectedUser || searchError) && (
            <UserDetailsCard
              user={selectedUser}
              error={searchError}
              onClose={() => {
                setSelectedUser(null);
                setSearchError("");
              }}
            />
          )}
        </section>

        {/* 統計概況セクション */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側：最近のユーザーリスト */}
          <RecentExplorersList
            users={stats?.recentUsers || []}
            onSelectUser={(id) => {
              setSearchId(id);
              void searchUser(id);
            }}
          />
          {/* 右側：数値カードおよびグラフ */}
          <div className="lg:col-span-2 space-y-6 lg:order-1">
            <StatsOverview
              stats={stats}
              period={period}
              onPeriodChange={setPeriod}
              onRefresh={() => fetchStats()}
              isRefreshing={isRefreshing}
              isMounted={isMounted}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

/**
 * [概要] ロード中画面を表示するコンポーネントである。
 */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e8e2d2]">
      <div className="flex flex-col items-center gap-4">
        <RefreshCw className="w-10 h-10 animate-spin text-[#3e2f28]/40" />
        <p className="text-sm font-data text-[#3e2f28]/60 tracking-widest">
          記録を照合中...
        </p>
      </div>
    </div>
  );
}

/**
 * [概要] 管理者パネルの共通ナビゲーションバーである。
 */
function NavigationBar({
  onLogout,
  currentTime,
}: {
  onLogout: () => Promise<void>;
  currentTime: string;
}) {
  const router = useRouter();
  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-[#3e2f28]/10 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-[#3e2f28] p-1.5 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-[#e8e2d2]" />
            </div>
            <span className="font-bold tracking-tighter text-lg leading-none">
              管理者パネル
            </span>
            <span className="hidden sm:block text-[#3e2f28]/40 font-mono text-[10px] ml-2">
              {currentTime} [JST]
            </span>
          </div>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#3e2f28]/10 text-xs font-bold hover:bg-[#3e2f28]/5 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">メイン画面を表示</span>
          </button>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-50 text-red-600 text-xs font-bold"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">ログアウト</span>
        </button>
      </div>
    </nav>
  );
}

/**
 * [概要] ユーザー ID による検索バーコンポーネントである。
 */
function SearchBar({
  value,
  onChange,
  onSearch,
  isSearching,
}: {
  value: string;
  onChange: (v: string) => void;
  onSearch: (id: string) => void;
  isSearching: boolean;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
        <Search className="w-5 h-5" />
        探索者の個別照会
      </h2>
      <div className="relative flex-1 max-w-md">
        <input
          type="text"
          placeholder="ユーザーIDを入力"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void onSearch(value)}
          className="w-full bg-white border border-[#3e2f28]/10 rounded-xl py-2.5 pl-10 pr-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#3e2f28]/20"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3e2f28]/40" />
        {isSearching && (
          <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3e2f28]/40 animate-spin" />
        )}
      </div>
    </div>
  );
}

/**
 * [概要] 検索されたユーザーの詳細情報を表示するカードコンポーネントである。
 */
function UserDetailsCard({
  user,
  error,
  onClose,
}: {
  user: UserDetails | null;
  error: string;
  onClose: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#3e2f28]/10 shadow-lg p-6 relative animate-in fade-in slide-in-from-top-4">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
      >
        <X className="w-5 h-5 text-[#3e2f28]/40" />
      </button>
      {error ? (
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <p className="font-bold">{error}</p>
        </div>
      ) : (
        user && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex-shrink-0 flex items-center justify-center text-blue-600">
                  <User className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-[#3e2f28]/40 uppercase tracking-widest">
                    User ID
                  </p>
                  <p className="font-mono text-xs font-bold truncate">
                    {user.id}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-[#3e2f28]/40 uppercase mb-1">
                    人数
                  </p>
                  <p className="text-xl font-black">{user.party_size || 1}名</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-[#3e2f28]/40 uppercase mb-1">
                    登録日
                  </p>
                  <p className="text-sm font-bold truncate">
                    {user.created_at}
                  </p>
                </div>
                {user.last_seen && (
                  <div className="bg-blue-50/50 p-3 rounded-xl col-span-2">
                    <p className="text-[10px] font-bold text-blue-600/60 uppercase mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      最終アクティブ
                    </p>
                    <p className="text-sm font-bold text-blue-700">
                      {user.last_seen}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                発見済み標本 ({user.badges?.length || 0})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.badges && user.badges.length > 0 ? (
                  user.badges.map((b, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-white border border-[#3e2f28]/5 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 text-xs font-bold">
                          #{b.badges.target_index}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{b.badges.name}</p>
                          <p className="text-[10px] text-[#3e2f28]/40">
                            {b.acquired_at}
                          </p>
                        </div>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#3e2f28]/40 italic">
                    まだ標本を発見していません
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

/**
 * [概要] 直近でアクティブだったユーザーを一覧表示するサイドバーコンポーネントである。
 */
function RecentExplorersList({
  users,
  onSelectUser,
}: {
  users: Stats["recentUsers"];
  onSelectUser: (id: string) => void;
}) {
  return (
    <div className="space-y-4 lg:order-2">
      <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
        <Clock className="w-5 h-5 text-[#3e2f28]/40" />
        最近の探索者
      </h2>
      <div className="bg-white rounded-2xl border border-[#3e2f28]/10 shadow-sm divide-y divide-[#3e2f28]/5 max-h-[400px] lg:max-h-[800px] overflow-y-auto">
        {users.map((u) => (
          <button
            key={u.id}
            onClick={() => onSelectUser(u.id)}
            className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-[#3e2f28]/40 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[9px] text-[#3e2f28]/40 truncate">
                  ID: {u.id}
                </p>
                <p className="text-xs font-bold">
                  <span>{u.party_size || 1}名</span>{" "}
                  <span className="text-[10px] text-[#3e2f28]/30 font-normal ml-2">
                    {u.created_at}
                  </span>
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#3e2f28]/20 group-hover:text-blue-500 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * [概要] 数値統計カードとアクティビティ推移グラフを統合して表示するコンポーネントである。
 */
function StatsOverview({
  stats,
  period,
  onPeriodChange,
  onRefresh,
  isRefreshing,
  isMounted,
}: {
  stats: Stats | null;
  period: string;
  onPeriodChange: (p: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isMounted: boolean;
}) {
  return (
    <>
      {/* 期間切り替え UI */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <h2 className="text-2xl font-black tracking-tight">全体統計</h2>
        <div className="flex bg-white rounded-xl border border-[#3e2f28]/10 p-1 shadow-sm">
          {["1h", "24h", "all"].map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${period === p ? "bg-[#3e2f28] text-white" : "text-[#3e2f28]/40 hover:text-[#3e2f28]"}`}
            >
              {p === "1h" ? "1時間" : p === "24h" ? "24時間" : "全期間"}
            </button>
          ))}
        </div>
      </div>

      {/* 統計数値カードのグリッド */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatsCard
          label="総来場者数"
          value={`${stats?.totalVisitors || 0} 名`}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        <StatsCard
          label="探索デバイス"
          value={`${stats?.totalDevices || 0} 台`}
          icon={<Smartphone className="w-5 h-5" />}
          color="purple"
        />
        <StatsCard
          label="標本発見数"
          value={`${stats?.totalBadges || 0} 件`}
          icon={<Award className="w-5 h-5" />}
          color="amber"
        />
        <StatsCard
          label="平均発見率"
          value={
            stats
              ? `${(stats.totalBadges / Math.max(1, stats.totalDevices)).toFixed(1)} 件/台`
              : "-"
          }
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
        />
      </div>

      {/* 推移グラフセクション */}
      <div className="bg-white rounded-2xl border border-[#3e2f28]/10 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-[#3e2f28]/5 flex items-center justify-between bg-gray-50/50">
          <h3 className="font-bold flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-blue-500" />
            アクティビティ推移
          </h3>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1 rounded-lg hover:bg-[#3e2f28]/5 text-[#3e2f28]/40 transition-all"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
        <div className="p-4 md:p-6 h-[300px]">
          {isMounted && (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart
                data={stats?.hourlyStats}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorDevices" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBadges" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  strokeOpacity={0.1}
                />
                <XAxis
                  dataKey="hour"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#3e2f28", opacity: 0.5, fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#3e2f28", opacity: 0.5, fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="devices"
                  name="デバイス"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorDevices)"
                />
                <Area
                  type="monotone"
                  dataKey="badges"
                  name="発見"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#colorBadges)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </>
  );
}

/**
 * [概要] 統計数値を表示するためのカードコンポーネントである。
 */
function StatsCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: "blue" | "amber" | "purple" | "green";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
  };
  return (
    <div className="bg-white p-5 rounded-2xl border border-[#3e2f28]/10 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-[#3e2f28]/50 uppercase tracking-widest">
          {label}
        </p>
        <h3 className="text-xl md:text-2xl font-black tracking-tight tabular-nums">
          {value}
        </h3>
      </div>
      <div className={`p-3 rounded-xl ${colorClasses[color]}`}>{icon}</div>
    </div>
  );
}
