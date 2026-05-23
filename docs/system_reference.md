# 🛠️ システム・リファレンス (System Reference)

本ドキュメントは、アプリケーション全体の処理フロー、クラス間の相互関係、および技術的な実装の詳細を言語化したものである。

---

## 1. 📂 全体構造と依存関係

システムはモノレポ構造を採用しており、以下の 3 つの主要パッケージで構成されている。

1.  **frontend**: Next.js (App Router) をベースとしたプレゼンテーション層。
2.  **backend**: ビジネスロジックと外部サービス（Supabase, Redis）との連携を担う共通ロジック層。
3.  **docs**: システム仕様書、API定義、図面類を管理するドキュメント層。

フロントエンドはバックエンドの `services` および `lib` をインポートして使用し、UI とロジックを分離している。

---

## 2. 🏛️ 主要クラス・インターフェースの役割

### BadgeService (backend/services/badgeService.ts)

ビジネスロジックの中核を担うサービスである。

- **実装関係**: 特定のインターフェースを明示的に継承はしていないが、実質的に標本管理の全権を担うシングルトン的な役割を果たす。
- **主要メソッド**:
  - `getAllBadges()`: 全標本データのリストを取得する。
  - `acquireBadge(userId, badgeId)`: ユーザーが標本を獲得した事実を DB に記録する。
  - `getProfile(userId)`: ユーザーの属性情報を取得する。

### CacheService (backend/services/cacheService.ts)

Redis (Upstash) との通信を抽象化するサービスである。

- **委譲関係**: `BadgeService` や API ルートから呼び出され、キャッシュの読み書き処理を委譲される。
- **主要メソッド**:
  - `get(key)`: キャッシュされた値を取得する。
  - `set(key, value, ttl)`: 指定した有効期限（TTL）で値をキャッシュする。

---

## 3. 🔄 主要な処理フロー

### 3.1 標本獲得フロー (AR体験)

1.  **ユーザーアクション**: `/ar` ページでカメラを特定の作品（マーカー）に向ける。
2.  **マーカー検出**: `MindAR` が画像を認識し、対応する `Badge` ID を特定する。
3.  **解析フェーズ**: `useAR` フックが「解析ゲージ」の状態を管理し、継続的な検出によりゲージを増加させる。
4.  **データ記録**: ゲージが 100% に達すると、`BadgeService.acquireBadge()` が呼び出される。
5.  **永続化**: バックエンドの API ルートを経由して、Supabase (PostgreSQL) の `user_badges` テーブルにレコードが挿入される。
6.  **UI反映**: 獲得成功のダイアログ（`DiscoveryComplete`）が表示され、`SWR` のキャッシュが更新される。

### 3.2 管理者統計取得フロー (キャッシュ活用)

1.  **要求**: 管理者画面から統計 API (`/api/v1/admin/stats`) にリクエストが送信される。
2.  **キャッシュ確認**: `CacheService.get()` を呼び出し、Redis 内に有効なデータがあるか確認する。
3.  **条件分岐 (Hit)**: キャッシュが存在すれば、即座にそのデータを返却する。
4.  **条件分岐 (Miss)**: キャッシュがない場合、`Supabase` に対して複雑な集計クエリを実行する。
5.  **キャッシュ更新**: 取得した結果を `CacheService.set()` で Redis に保存し、次回以降の高速化を図る。

---

## 4. 🧠 フロントエンド・オーケストレーション

### useAR フック (frontend/hooks/useAR.ts)

AR カメラ画面の全生命周期を管理する。

- **役割**: マーカーの検出イベント（targetFound / targetLost）を監視し、それに応じて「解析ゲージ」のタイマーを開始・停止する。
- **連携**: 獲得成功時には `BadgeService` を呼び出し、同時に `DiscoveryComplete` コンポーネントを表示するためのフラグ (`showSuccess`) を制御する。

### DiscoveryComplete コンポーネント (frontend/components/ar/DiscoveryComplete.tsx)

標本発見時のビジュアルフィードバックを担う。

- **役割**: 獲得した標本の名称や進捗状況（X / Y）をアニメーション（framer-motion）を用いて表示する。
- **連携**: コンプリート時には `handleDirectToExchange` メソッドを通じて、景品交換パラメータを付与したトップページへの遷移を誘導する。

---

## 5. 🧱 型安全とデータ構造の定義

- **SpecimenSettings**: `backend/lib/specimens/types.ts` で定義されるインターフェース。各標本（例: `antique-sword.ts`, `common-blue.ts`）はこの型定義に従って、モデル固有のスケールやアニメーションパラメータを実装している。
- **Zod Schemas**: API のリクエスト/レスポンスは Zod によって定義されたスキーマに準拠しており、型安全性がコンパイル時および実行時の両方で保証されている。
