/**
 * [概要] キャッシュ操作のインターフェース。
 * データベースへの負荷を軽減するために使用される、揮発性データストア（Redisなど）とのやり取りを定義する。
 */
export interface ICacheService {
  /** [実行] 指定されたキーからデータを取得する。 */
  get<T>(key: string): Promise<T | null>;
  /** [実行] 指定されたキーにデータを保存する。オプションでTTL（有効期限）を設定可能。 */
  set(key: string, value: any, ttl?: number): Promise<boolean>;
  /** [実行] 指定されたキーのデータを削除する。 */
  delete(key: string): Promise<void>;
}
