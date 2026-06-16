import { ICacheService } from "../../domain/services/ICacheService";

/**
 * [概要] Redis (Upstash) を使用したキャッシュサービスの具象実装。
 * 高負荷なクエリ結果などを一時保存し、データベースへの負荷を軽減する。
 */
export class RedisCacheService implements ICacheService {
  /**
   * [実行] 指定されたキーに対応するキャッシュデータを取得する。
   * 
   * @param key 取得対象のキャッシュキー。
   * @return Promise<T | null> キャッシュされていたデータ。存在しない場合は null。
   * 
   * [技術的ステップ]
   * 1. 環境変数から Upstash の接続情報を取得。
   * 2. REST API を介して Redis からデータを取得し、JSONパースして返却する。
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
      return data.result ? (JSON.parse(data.result) as T) : null;
    } catch (e) {
      console.warn(`[RedisCacheService] Get Error (key: ${key}):`, e);
      return null;
    }
  }

  /**
   * [実行] 指定されたキーでデータをキャッシュに保存する。
   * 
   * @param key 保存対象のキャッシュキー。
   * @param value 保存するデータ本体。
   * @param ttl 有効期限（秒）。デフォルトは300秒（5分）。
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
      console.warn(`[RedisCacheService] Set Error (key: ${key}):`, e);
      return false;
    }
  }

  /**
   * [実行] 指定されたキーのキャッシュデータを削除する。
   * 
   * @param key 削除対象のキャッシュキー。
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
      console.warn(`[RedisCacheService] Delete Error (key: ${key}):`, e);
    }
  }
}
