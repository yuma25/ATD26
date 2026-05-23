"use client";

/**
 * 外部ライブラリのインポート
 * - framer-motion: 高度なアニメーション演出に使用。
 * - lucide-react: UI アイコン（チェック、チケット、勲章など）に使用。
 */
import { motion } from "framer-motion";
import { Check, Ticket, Award, Sparkles, ArrowRight } from "lucide-react";
import type { Badge } from "@backend/types";

/**
 * [概要] DiscoveryComplete コンポーネントのプロパティ定義である。
 *
 * @param badgeName [string] 発見した標本の名前。
 * @param artistName [string] (Optional) 作品の作者名。
 * @param allBadges [Badge[]] システムに登録されている全標本のリスト。進捗計算に使用。
 * @param acquiredBadgeIds [string[]] ユーザーが既に獲得済みの標本IDリスト。進捗計算に使用。
 * @param onClose [() => void] ダイアログを閉じるためのコールバック関数。
 * @param isLast [boolean] (Optional) これが最後の1つ（コンプリート達成）かどうか。デフォルトは false。
 * @param isExchanged [boolean] (Optional) 景品交換が既に完了しているかどうか。デフォルトは false。
 */
interface DiscoveryCompleteProps {
  badgeName: string;
  artistName?: string;
  allBadges: Badge[];
  acquiredBadgeIds: string[];
  onClose: () => void;
  isLast?: boolean;
  isExchanged?: boolean;
}

/**
 * [概要] AR標本発見時の「発見完了」演出を表示するコンポーネントである。
 * 標本の解析が 100% に達した際にオーバーレイとして表示され、ユーザーに進捗状況と達成感を視覚的に伝える。
 * コンプリート時には景品交換への誘導を行う。
 *
 * [技術的ステップ]
 * 1. 進捗計算: Props から全標本数と現在の獲得数を算出し、"X / Y" 形式のカウンターを表示する。
 * 2. アニメーション演出: framer-motion を使用し、刻印（Stamp）が上から跳ねるような Spring アニメーションを適用する。
 * 3. 動的スタイリング: コンプリート状態 (isLast) に応じて、テーマカラーを白から琥珀色 (amber) に切り替える。
 * 4. 遷移制御: 最後の標本獲得時には、ホーム画面に戻りつつ景品交換モーダルを自動展開するための URL パラメータ付与リダイレクトを行う。
 */
export const DiscoveryComplete = ({
  badgeName,
  artistName,
  allBadges,
  acquiredBadgeIds,
  onClose,
  isLast = false,
  isExchanged = false,
}: DiscoveryCompleteProps) => {
  const totalCount = allBadges.length;

  // 獲得数の算出ロジック。
  // すでに獲得済みリストに含まれている場合は現在の数、新規獲得時（リスト未反映）は現在の数に +1 する。
  const currentBadgeId = allBadges.find((b) => b.name === badgeName)?.id;
  const isAlreadyInList =
    currentBadgeId && acquiredBadgeIds.includes(currentBadgeId);
  const currentCount = isLast
    ? totalCount
    : acquiredBadgeIds.length + (isAlreadyInList ? 0 : 1);

  /**
   * [概要] ホーム画面に戻り、自動的に景品引き換えモーダルを開く。
   * @param e [React.MouseEvent] クリックイベントオブジェクト。
   *
   * [技術的ステップ]
   * 1. 伝搬停止: 親要素のクリックイベント（onClose）が発火しないよう stopPropagation を実行する。
   * 2. リダイレクト: クエリパラメータ `openExchange=true` を付与してトップページへ遷移する。
   */
  const handleDirectToExchange = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 画面遷移の演出として 100ms 待機してから実行。
    setTimeout(() => {
      window.location.href = "/?openExchange=true";
    }, 100);
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-between p-6 pointer-events-none">
      {/* 画面上部：進捗状況を表示するフローティングカウンター */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mt-12 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 flex items-center gap-3 shadow-xl"
      >
        <Award
          size={16}
          className={isLast ? "text-amber-400" : "text-white/60"}
        />
        <span className="text-white font-mono text-sm font-black tracking-widest">
          {currentCount} / {totalCount}
        </span>
      </motion.div>

      {/* 画面中央：メインの発見演出エリア */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center gap-8 pointer-events-auto cursor-pointer"
        onClick={onClose}
      >
        {/* 【演出】完了の刻印（Stamp） */}
        <motion.div
          initial={{ scale: 2, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: -5, opacity: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
          className={`w-44 h-44 border-8 border-double rounded-full flex flex-col items-center justify-center relative shadow-[0_0_50px_rgba(255,255,255,0.4)] ${
            isLast
              ? "border-amber-400 text-amber-400 bg-black/40"
              : "border-white text-white"
          }`}
        >
          {isLast ? (
            <div className="text-center relative">
              <Sparkles
                className="absolute -top-12 -right-8 text-amber-300 animate-pulse"
                size={40}
              />
              <div className="text-4xl font-black mb-1 tracking-tighter">
                COMPLETE
              </div>
              <Check size={50} strokeWidth={4} className="mx-auto" />
            </div>
          ) : (
            <Check size={80} strokeWidth={3} />
          )}
          <div
            className={`absolute -bottom-2 px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em] rotate-12 ${
              isLast ? "bg-amber-400 text-black" : "bg-white text-black"
            }`}
          >
            {isLast ? "全作品収集完了" : "記録完了"}
          </div>
        </motion.div>

        {/* 標本名および作者名の表示 */}
        <div className="text-center space-y-2 w-full max-w-[85vw] overflow-hidden px-4">
          <h2
            className={`font-black italic font-serif tracking-tight whitespace-nowrap truncate ${
              isLast ? "text-amber-400" : "text-white"
            } ${
              badgeName.length > 12
                ? "text-lg"
                : badgeName.length > 8
                  ? "text-xl"
                  : "text-3xl"
            }`}
          >
            {badgeName}
          </h2>
          {artistName && (
            <p className="text-white/80 font-medium text-sm truncate whitespace-nowrap">
              {artistName}
            </p>
          )}
          <p className="text-white/60 font-mono text-[10px] uppercase tracking-[0.5em] pt-2">
            {isLast
              ? "全ての標本のアーカイブに成功しました"
              : "新たな標本を発見しました"}
          </p>
        </div>

        {/* 閉じるためのガイダンステキスト */}
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-4 text-white/40 font-mono text-[8px] uppercase tracking-widest"
        >
          画面をタップして閉じる
        </motion.div>
      </motion.div>

      {/* 画面下部：景品交換チケットステータス表示 */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-sm mb-4 pointer-events-auto"
        onClick={isLast && !isExchanged ? handleDirectToExchange : onClose}
      >
        <div
          className={`relative overflow-hidden border-2 rounded-2xl p-4 flex items-center justify-between shadow-2xl backdrop-blur-xl group active:scale-95 transition-transform ${
            isExchanged
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
              : isLast
                ? "bg-amber-950/60 border-amber-400 text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                : "bg-black/60 border-white/10 text-white/80"
          }`}
        >
          {/* チケットの切り取り線風の装飾ドット */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[radial-gradient(circle,currentColor_1px,transparent_1.5px)] bg-[length:1px_6px]" />

          <div className="flex items-center gap-4 flex-1 overflow-hidden">
            <div
              className={`p-3 rounded-xl shrink-0 ${isExchanged ? "bg-emerald-500/20" : isLast ? "bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]" : "bg-white/10"}`}
            >
              <Ticket size={24} strokeWidth={isLast ? 2.5 : 1.5} />
            </div>

            <div className="flex flex-col min-w-0">
              <span
                className={`text-[8px] font-black uppercase tracking-[0.2em] mb-0.5 whitespace-nowrap ${isLast ? "text-amber-400/60" : "text-white/40"}`}
              >
                Archive Reward Status
              </span>
              <h3 className="text-[12px] font-black tracking-tighter whitespace-nowrap overflow-hidden">
                {isExchanged
                  ? "景品交換済み：探究完了"
                  : isLast
                    ? "引き換えチケットを使用する"
                    : "全作品収集でチケット解禁"}
              </h3>
              {isLast && !isExchanged && (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[8px] font-bold opacity-80">
                    タップしてホーム画面へ
                  </span>
                  <ArrowRight
                    size={8}
                    className="animate-[bounce-x_1s_infinite]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* チケットの右側：現在のカウント表示 */}
          <div
            className={`ml-4 pl-4 border-l border-white/10 flex flex-col items-center justify-center min-w-[50px] shrink-0 ${isLast && !isExchanged ? "animate-pulse" : ""}`}
          >
            <span className="text-[8px] font-bold opacity-50 uppercase tracking-tighter mb-1">
              {isLast ? "Valid" : "Total"}
            </span>
            <span className="text-lg font-black font-mono leading-none">
              {isLast ? "OK" : currentCount}
            </span>
          </div>
        </div>

        {/* コンプリート時のメッセージ */}
        {isLast && (
          <div className="mt-3 text-center space-y-1">
            <p className="text-white/40 text-[7px] uppercase tracking-[0.3em] font-mono">
              Your scientific journey reaches its magnificent conclusion.
            </p>
            <p className="text-amber-400/60 text-[8px] font-bold tracking-widest">
              — ホーム画面へ戻りスタッフへ提示してください —
            </p>
          </div>
        )}
      </motion.div>

      {/* コンポーネント固有のアニメーション定義 */}
      <style jsx global>{`
        @keyframes bounce-x {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(3px);
          }
        }
      `}</style>
    </div>
  );
};
