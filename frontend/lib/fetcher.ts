/**
 * パッケージ: frontend/lib
 * フロントエンド専用の共通ユーティリティを提供する。
 */

/**
 * [概要] SWR などで使用する標準的な HTTP GET フェッチャー。
 * 成功時 (success: true) は `data` プロパティの中身を返し、エラー時は例外をスローする。
 * 
 * @param url リクエスト先のURL
 * @return Promise<any> レスポンスデータの `data` 部分
 */
export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("HTTP Error: " + res.status);
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error?.message || "API request failed");
  }
  return json.data;
};
