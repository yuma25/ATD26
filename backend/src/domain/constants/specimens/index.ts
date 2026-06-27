/**
 * パッケージ: lib/specimens
 * 標本ごとの設定を統合管理し、提供する。
 */

import { SpecimenSettings } from "./types";
import { commonBlue } from "./common-blue";
import { leviathan } from "./leviathan";
import { shellcrab } from "./shellcrab";
import { antiqueSword } from "./antique-sword";
import { greatWave } from "./great-wave";
import { moonJelly } from "./moon-jelly";

/**
 * [概要] 全作品（標本）の設定マッピングである。
 * 作品名をキー、それに対応する SpecimenSettings を値として保持する。
 * 各標本ファイル（common-blue.ts 等）からインポートされた設定をここに集約する。
 */
export const SPECIMEN_SETTINGS: Record<string, SpecimenSettings> = {
  自然に寄り添う者たち: commonBlue,
  お母さんの初水族館: leviathan,
  ちょっと不思議な海の冒険: shellcrab,
  海底の奥: antiqueSword,
  よすが: greatWave,
  遊々海月: moonJelly,
};

/**
 * [概要] 作品名に基づき、対応する標本設定を取得する。
 * @param name [string] 作品名。DB に登録されている標本の名称に一致する必要がある。
 * @return settings [SpecimenSettings] 作品に対応する設定オブジェクト。見つからない場合は DEFAULT_SETTINGS を返却する。
 *
 * [技術的ステップ]
 * 1. 検索: 引数の name をキーとして SPECIMEN_SETTINGS マップから設定を検索する。
 * 2. フォールバック: 検索結果が undefined の場合は DEFAULT_SETTINGS を採用する。
 */
export const getSpecimenSettings = (name: string): SpecimenSettings => {
  return SPECIMEN_SETTINGS[name];
};

// 型定義を外部に再エクスポートする。
export * from "./types";
