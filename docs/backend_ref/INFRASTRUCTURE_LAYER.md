# 🛠️ バックエンド・リファレンス：Infrastructure Layer (インフラストラクチャ層)

インフラストラクチャ層は，データベース(Drizzle)，高速記憶(Redis)，外部通信(Supabase)などの具体的な技術を用いた実装を提供する．

---

## 📂 db (データベース構成)

### `schema.ts`
Drizzle ORM を用いた物理表（テーブル）定義である．
- `profiles`：利用者属性表．
- `badges`：標本基本情報表．
- `user_badges`：獲得記録（交差表）．

### `index.ts`
データベース接続の初期化を行う．
- `db`：プロジェクト全体で共有される Drizzle 操作実体である．
- サーバーレス環境向けの接続最適化設定（`prepare: false`）を含む．

### `seed.ts`
初期データ投入用スクリプトである．
- 作品名 (`name`) を鍵（キー）とした上書き保存（upsert）により，6つの標本データを自動登録する．

---

## 📂 repositories (操作実装)
Drizzle ORM を使用してドメイン層の定義を具体化したクラス群である．

### `DrizzleBadgeRepository.ts`
- **`findAll()`**：`db.query.badges` を使用して全件取得を行う．
- **`findById(id)`**：指定識別子の1件取得を行う．
- **変換処理**：データベースの命名規則（キャメルケース）を，ドメイン層が求める規則（スネークケース）へ変換して解析する．

### `DrizzleProfileRepository.ts`
- **`upsert(profile)`**：重複時に更新を行う `onConflictDoUpdate` を使用する．更新時に最終活動日時 (`last_seen`) を日本時間（JST）で強制更新する論理を含む．

---

## 📂 services (外部機能実装)

### `RedisCacheService.ts`
Upstash Redis REST API を使用した高速記憶実装である．
- **`get<T>(key)`**：HTTP GET 要求を送信し，結果を JSON 復元する．
- **`set(key, value, ttl)`**：HTTP POST 要求でデータを保存する．標準で300秒の有効期限（TTL）を設定する．

---

## 📂 external (外部接続)

### `supabase.ts`
Supabase JavaScript SDK の初期化を行う．
- `supabase`：一般公開用通信実体（Anon Key 使用）．
- `supabaseAdmin`：特権操作用通信実体（Service Role Key 使用）．
- `signInAnonymously()`：接続異常時の復旧機能を備えた匿名ログイン処理である．

---

## 📂 di (依存性の注入)

### `container.ts`
すべてのレイヤーの部品を組み立てる「統合器（コンテナ）」である．
- 各実装クラスを単一実体（シングルトン）として生成する．
- `badgeController`，`profileController`，`adminController` として完成品を外部へ提供する．
