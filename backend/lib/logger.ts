/**
 * パッケージ: lib
 * このパッケージは、アプリケーション全体で共有される基底クラス、ユーティリティ、および共通ロジックを提供する。
 * ログ出力、データベースクライアント、および標本設定の管理を担う。
 */

/**
 * [概要]
 * Loggerユーティリティの定義である。
 * サーバー側で発生したイベントやエラーを、後から分析しやすい「構造化ログ（JSON形式）」として標準出力および標準エラー出力に送出する。
 */
export const Logger = {
  /**
   * [概要] 現在時刻を日本時間 (JST) の ISO 形式で取得する。
   * 内部で Date オブジェクトを生成し、9時間のオフセットを加算することで JST を算出している。
   * @return timestamp [string] 日本時間の ISO8601 形式文字列（+09:00 含む）
   */
  getJSTTimestamp() {
    const now = new Date();
    const offset = 9 * 60 * 60 * 1000;
    return new Date(now.getTime() + offset)
      .toISOString()
      .replace("Z", "+09:00");
  },

  /**
   * [概要] 一般的な情報の記録（INFOレベル）を行う。
   * 正常な動作（ページの閲覧、データの保存など）を構造化された JSON 形式で出力する。
   * @param action [string] イベントの種類を示す識別子
   * @param details [Record<string, unknown>] 補足情報のオブジェクト。デフォルトは空オブジェクト。
   */
  info(action: string, details: Record<string, unknown> = {}) {
    console.log(
      JSON.stringify({
        level: "INFO",
        timestamp: this.getJSTTimestamp(),
        action,
        ...details,
      }),
    );
  },

  /**
   * [概要] エラーの記録（ERRORレベル）を行う。
   * 予期せぬ不具合やデータベース接続エラーなどを構造化された JSON 形式で標準エラー出力に記録する。
   * @param action [string] エラーが発生したコンテキストや処理の名称
   * @param error [unknown] エラーオブジェクトまたはメッセージ文字列
   * @param details [Record<string, unknown>] 追加のデバッグ情報。デフォルトは空オブジェクト。
   */
  error(action: string, error: unknown, details: Record<string, unknown> = {}) {
    console.error(
      JSON.stringify({
        level: "ERROR",
        timestamp: this.getJSTTimestamp(),
        action,
        error: error instanceof Error ? error.message : String(error),
        ...details,
      }),
    );
  },

  /**
   * [概要] 標本の発見（SPECIMEN_DISCOVERED）に特化したログを出力する。
   * BadgeService などから呼び出され、特定のユーザーがどの標本を見つけたかを追跡可能にする。
   * @param userId [string] 探索者のユーザーID
   * @param badgeId [string] 発見された標本のユニークID
   * @param badgeName [string] 発見された標本の名称
   */
  discovery(userId: string, badgeId: string, badgeName: string) {
    this.info("SPECIMEN_DISCOVERED", {
      explorer: userId,
      specimen_id: badgeId,
      specimen_name: badgeName,
    });
  },

  /**
   * [概要] 全ての標本をコンプリートした際のログを出力する。
   * @param userId [string] ミッションを完了した探索者のユーザーID
   */
  missionComplete(userId: string) {
    this.info("MISSION_COMPLETE", {
      explorer: userId,
    });
  },
};
