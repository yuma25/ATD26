# 🛠️ バックエンド・リファレンス：Interface Adapters Layer (アダプター層)

アダプター層は，外部（Next.js API Routes）からの要求を受け取り，アプリケーションの業務機能（ユースケース）へ変換して実行する制御器（コントローラー）を提供する．

---

## 📂 controllers (制御器実装)

各機能（メソッド）は，成功時に `{ success: true, data: ... }` ，失敗時に `{ success: false, error: { code, message } }` という統一された応答形式を返却する．

### `BadgeController.ts`
標本（バッジ）に関する Web 要求を処理する．

- **`getAll(): Promise<ApiResponse>`**
  - **処理**：全標本取得ユースケースを実行する．
  - **異常符号**：`FETCH_ERROR`
- **`acquire(userId: string, badgeId: string): Promise<ApiResponse>`**
  - **引数**：`userId`（利用者識別子），`badgeId`（標本識別子）
  - **処理**：標本獲得ユースケースを実行する．
  - **異常符号**：`ACQUIRE_ERROR`
- **`getAcquired(userId: string): Promise<ApiResponse>`**
  - **引数**：`userId`
  - **処理**：指定利用者の獲得済み目録を返却する．
  - **異常符号**：`FETCH_ACQUIRED_ERROR`

### `ProfileController.ts`
利用者プロフィールに関する Web 要求を処理する．

- **`get(userId: string): Promise<ApiResponse>`**
  - **処理**：特定利用者のプロフィール取得ユースケースを実行する．
  - **異常符号**：`FETCH_PROFILE_ERROR`
- **`update(userId: string, updates: any): Promise<ApiResponse>`**
  - **引数**：`userId` ，`updates`（更新内容を格納した実体）
  - **処理**：プロフィール更新ユースケースを実行する．

### `AdminController.ts`
管理者向けの Web 要求を処理する．

- **`getStats(period: string, userId: string | null): Promise<ApiResponse>`**
  - **引数**：`period`（期間），`userId`（個別照会用）
  - **処理**：統計集計ユースケースを実行する．
  - **異常符号**：`STATS_ERROR`
