/**
 * パッケージ: services
 * 外部キャッシュサービス（Redis）との連携を提供する。
 */

/**
 * [概要]
 * Redis (Upstash) を使用して、高負荷なクエリ結果や頻繁に参照されるデータを一時保存するサービスである。
 * データベースへの負荷を軽減し、システム全体のレスポンス速度を向上させる役割を担う。
 * Upstash の提供する REST API を介して通信を行う。
 */
export const CacheService = {
  /**
   * [概要] 指定されたキーに対応するキャッシュデータを取得する。
   *
   * @param key [string] 取得対象のキャッシュキー。
   * @return data [Promise<T | null>] キャッシュされていたデータ。ジェネリクス T により型指定が可能。
   *                               データが存在しない場合、環境変数が未設定の場合、または通信エラー時は null を返却する。
   *
   * [技術的ステップ]
   * 1. 環境変数確認: UPSTASH_REDIS_REST_URL および UPSTASH_REDIS_REST_TOKEN の存在を確認する。
   * 2. REST呼び出し: HTTP GET メソッドで Upstash のエンドポイントにアクセスする。
   * 3. パース: レスポンス JSON の result フィールドを文字列として取得し、JSON.parse() により元のオブジェクト形式に復元する。
   */
  async get<T>(key: string): Promise<T | null> {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) return null;

    try {
      const res = await fetch(`${url}/get/${key}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      // Upstash REST API は結果を result フィールドに格納して返却する。
      return data.result ? (JSON.parse(data.result) as T) : null;
    } catch (e) {
      console.warn(`[CacheService] Get Error (key: ${key}):`, e);
      return null;
    }
  },

  /**
   * [概要] 指定されたキーでデータをキャッシュに保存する。
   *
   * @param key [string] 保存対象のキャッシュキー。
   * @param value [any] 保存するデータ本体。内部で JSON 文字列化される。
   * @param ttl [number] (Optional) 有効期限（Time To Live）を秒単位で指定する。デフォルトは 300秒（5分）。
   * @return success [Promise<boolean>] 保存に成功した場合は true、失敗した場合は false を返却する。
   *
   * [技術的ステップ]
   * 1. REST呼び出し: HTTP POST メソッドで Upstash の set エンドポイントにアクセスする。
   * 2. TTL指定: クエリパラメータ ex を使用して有効期限を設定する。
   * 3. ペイロード送信: 保存するデータを JSON.stringify() してリクエストボディに含める。
   */
  async set(key: string, value: any, ttl: number = 300): Promise<boolean> {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) return false;

    try {
      await fetch(`${url}/set/${key}?ex=${ttl}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(value),
      });
      return true;
    } catch (e) {
      console.warn(`[CacheService] Set Error (key: ${key}):`, e);
      return false;
    }
  },

  /**
   * [概要] 指定されたキーのキャッシュデータを削除する。
   *
   * @param key [string] 削除対象のキャッシュキー。
   *
   * [技術的ステップ]
   * 1. REST呼び出し: HTTP POST メソッドで Upstash の del エンドポイントにアクセスする。
   */
  async delete(key: string): Promise<void> {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) return;

    try {
      await fetch(`${url}/del/${key}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      console.warn(`[CacheService] Delete Error (key: ${key}):`, e);
    }
  },
};
