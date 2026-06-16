# 🖥️ フロントエンド・リファレンス：App Layer (画面と通信経路)

本ドキュメントは，`frontend/app/` 配下に構築された Next.js (App Router) のルーティング構造と，各ページおよびAPIエンドポイントの役割を定義する．

---

## 📂 画面構成 (Pages & Layouts)

Next.js の規約に従い，ディレクトリ構造がそのままURLの経路（ルーティング）となる．

### `layout.tsx` (ルートレイアウト)
- **概要**：アプリケーション全体の最も外側を包む基本構造である．
- **処理詳細**：
  - HTML の骨組み（`<html>`, `<body>`）を定義する．
  - `globals.css` を読み込み，Tailwind CSS 等の全体装飾を適用する．
  - `metadata` を定義し，ブラウザの表題（タイトル）や SEO 情報を設定する．

### `(main)/layout.tsx` (メインレイアウト)
- **概要**：ARカメラ画面を除く，一般的な画面（ホームや管理画面）に共通する装飾を提供する．
- **処理詳細**：
  - アプリケーションのヘッダー（`AppHeader`）とフッター（`AppFooter`）を配置し，その間に各ページの内容を描画する．
  - 背景色や最大幅などの基本的なレイアウト制約を適用する．

### `(main)/page.tsx` (ホーム画面)
- **URL**：`/`
- **概要**：「冒険者の手記」として，利用者がこれまでに発見した標本の一覧や進行状況を表示する主画面である．
- **論理詳細**：
  - `useHome` フックを利用して，バックエンドと同期された標本目録（`sortedBadges`）を描画する．
  - 利用者がパーティ人数を未設定の場合，入力を促す画面を優先して表示する．
  - 全標本を獲得した場合，特別な演出（`FinalLogModal`）を起動する．

### `ar/page.tsx` (ARカメラ画面)
- **URL**：`/ar`
- **概要**：WebAR (MindAR, A-Frame) を用いて，現実の絵画を認識し3D標本を投影する没入型画面である．
- **技術詳細**：
  - ヘッダー等を排除し，全画面（フルスクリーン）でカメラ映像のみを描画する．
  - `useEffect` を用いて A-Frame や Three.js などの巨大な外部スクリプトを非同期に動的ロードする．
  - 認識成功時，UIとして `DiscoveryComplete` などを重ねて表示する．

### `(main)/admin/login/page.tsx` (管理者認証画面)
- **URL**：`/admin/login`
- **概要**：スタッフ専用の認証画面である．
- **論理詳細**：メールアドレスと暗号（パスワード）を受け取り，Supabase Auth を通じて認証を行う．成功した場合はダッシュボードへ転送する．

### `(main)/admin/page.tsx` (管理者ダッシュボード)
- **URL**：`/admin`
- **概要**：本日の来場者数や標本の発見数など，イベントの稼働状況を監視する画面である．
- **論理詳細**：認証済みであることを確認した上で `/api/v1/admin/stats` を叩き，Recharts を用いて時系列の統計情報を描画する．

---

## 📂 API Routes (内部通信経路)

フロントエンドとバックエンドの間に位置し，Next.js サーバー（Node.js 環境）上で動作する API エンドポイント群である．これらはすべて `@backend/src/adapters/controllers` に実装された機能（メソッド）を呼び出す中継器（プロキシ）として機能し，通信時の HTTP 状態コードの制御や，リクエストの検証（バリデーション）の初期段階を担う．

### `/api/v1/badges`
- **HTTPメソッド**：`GET`
- **概要**：システムに登録されている全標本（バッジ）のマスターデータを一覧で取得する．
- **処理詳細**：
  - 引数を持たず，内部で `badgeController.getAll()` を呼び出す．
  - 成功時は `status: 200` と共に標本データの配列を含む JSON を返却し，失敗時には `status: 500` のエラー応答を返却する．

### `/api/v1/badges/acquired`
- **HTTPメソッド**：`GET`
- **要求引数**：`userId` (URLクエリ引数・必須)
- **概要**：指定された利用者がこれまでに獲得した標本の記録をすべて取得する．
- **処理詳細**：
  - URL引数から `userId` を抽出し，存在しない場合は直ちに `status: 400`（`MISSING_USER_ID`）を返却して不正な呼び出しを遮断する．
  - 有効な場合は `badgeController.getAcquired(userId)` を実行し，結果を `status: 200` または `500` と共に返却する．

### `/api/v1/badges/acquire`
- **HTTPメソッド**：`POST`
- **要求本体 (JSON)**：
  - `userId`: `string`（利用者の識別子）
  - `badgeId`: `string`（獲得した標本の識別子）
- **概要**：利用者が新たな標本を発見した事実をデータベースに記録する．
- **処理詳細**：
  1. **要求検証**：要求本体を `AcquireBadgeRequestSchema.safeParse` を用いて厳密に検証し，不備があれば `status: 400`（`INVALID_REQUEST`）を返す．
  2. **記録実行**：検証通過後，`badgeController.acquire(userId, badgeId)` を実行する．
  3. **冪等性の担保（重複許容）**：データベース側で一意制約違反（Postgres Error Code `23505`）が発生した場合，これを「異常」とは見なさず，「既に記録されている」という状態（`ALREADY_ACQUIRED`）として `status: 200` の成功応答を返す．これにより，通信遅延や重複送信による予期せぬエラー表示を防ぐ．

### `/api/v1/profile/get`
- **HTTPメソッド**：`GET`
- **要求引数**：`userId` (URLクエリ引数・必須)
- **概要**：特定利用者の現在の属性情報（来場人数，景品交換フラグなど）を取得する．
- **処理詳細**：
  - `userId` が欠落している場合は `status: 400` で要求を拒否する．
  - 有効な場合，`profileController.get(userId)` を呼び出し，プロフィール実体を返却する．

### `/api/v1/profile/update`
- **HTTPメソッド**：`POST`
- **要求本体 (JSON)**：
  - `userId`: `string`
  - `updates`: `object`（`party_size` や `is_exchanged` など更新したい項目のみを含む実体）
- **概要**：利用者の属性情報を部分的に更新（上書き保存）する．
- **処理詳細**：
  1. `UpdateProfileRequestSchema` を用いて更新内容の構造を検証し，不正な型が含まれる場合は `status: 400` を返す．
  2. 検証成功後，`profileController.update(userId, updates)` を実行し，更新の成否に応じた状態コードを返却する．

### `/api/v1/profile/sync`
- **HTTPメソッド**：`POST`
- **要求本体 (JSON)**：`{ userId: string }`
- **概要**：利用者がアプリを起動した際などに，プロフィールの存在を確約するための同期処理を行う．
- **処理詳細**：
  - 内部的には空の更新要求（`update(userId, {})`）を呼び出し，データベース側の `onConflictDoUpdate` 機能を誘発して，レコードが存在しなければ新規作成する挙動を実現する．

### `/api/v1/admin/stats`
- **HTTPメソッド**：`GET`
- **要求引数**：
  - `period`: `string` (集計対象期間，未指定時は `24h` が規定値)
  - `userId`: `string` (任意・特定利用者の詳細を照会する場合に指定)
- **概要**：管理者向けに集計された統計資料（来場者数，獲得数など）を提供する．
- **処理詳細**：
  1. **防壁（認可ガード）**：要求の `Authorization` ヘッダーから JWT を抽出し，`supabaseAdmin.auth.getUser(token)` で検証を行う．
  2. **権限確認**：認証に成功しても，送信元が「メール認証された運営者（非匿名利用者）」でない場合は即座に `status: 403 Forbidden` を返却して処理を完全に遮断する．
  3. **集計実行**：権限が確認された場合のみ，`adminController.getStats(period, userId)` を呼び出し，統計データを返却する．
