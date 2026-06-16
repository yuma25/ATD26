# 🛠️ バックエンド・リファレンス：Interface Adapters Layer (アダプター層)

アダプター層は，外部（Next.js API Routes）からの要求を受け取り，アプリケーションの業務機能（ユースケース）へ変換して実行する制御器（コントローラー）を提供する．

---

## 📂 controllers (制御器実装)

本層の各制御器（コントローラー）は，APIルートから呼び出され，内部で発生した例外（エラー）を捕捉して `console.error` に出力しつつ，クライアントには常に `{ success: boolean, data?: any, error?: ApiError }` という統一された形式で応答を返す安全網（セーフティネット）としての役割も担う．

### `BadgeController.ts`
標本（アート作品）および利用者の獲得状況に関する Web 要求を処理する．

#### `getAll()`
- **引数**：なし
- **戻り値**：`Promise<{ success: boolean, data?: Badge[], error?: ApiError }>`
- **論理詳細**：
  1. `GetAllBadgesUseCase` を実行し，システム上の全標本実体を取得する．
  2. 取得した各データを `BadgeSchema` で検証・整形して返却する．
  3. 異常発生時は，異常符号 `FETCH_ERROR` と共に失敗応答を返す．

#### `acquire(userId, badgeId)`
- **引数**：
  - `userId: string`（獲得利用者の識別子）
  - `badgeId: string`（獲得対象の標本識別子）
- **戻り値**：`Promise<{ success: boolean, data?: UserBadge | null, error?: ApiError }>`
- **論理詳細**：
  1. `AcquireBadgeUseCase` を実行し，獲得記録の永続化を試みる．
  2. 重複登録などのデータベース異常が発生した場合は，その詳細を `error.details` に格納し，異常符号 `ACQUIRE_ERROR` と共に失敗応答を返す（重複自体の許容判定は呼び出し元のAPIルートで行う）．

#### `getAcquired(userId)`
- **引数**：`userId: string`（対象利用者の識別子）
- **戻り値**：`Promise<{ success: boolean, data?: UserBadge[], error?: ApiError }>`
- **論理詳細**：
  1. `GetAcquiredBadgesUseCase` を実行し，該当利用者の全獲得記録を抽出する．
  2. 各記録を `UserBadgeSchema` で検証して返却する．
  3. 異常発生時は，異常符号 `FETCH_ACQUIRED_ERROR` と共に失敗応答を返す．

### `ProfileController.ts`
利用者の属性情報（プロフィール）に関する Web 要求を処理する．

#### `get(userId)`
- **引数**：`userId: string`（対象利用者の識別子）
- **戻り値**：`Promise<{ success: boolean, data?: Profile | null, error?: ApiError }>`
- **論理詳細**：
  1. `GetProfileUseCase` を実行し，プロフィールの現在状態を取得する．
  2. 取得結果を `ProfileSchema` で検証して返却する．
  3. 異常発生時は，異常符号 `FETCH_PROFILE_ERROR` と共に失敗応答を返す．

#### `update(userId, updates)`
- **引数**：
  - `userId: string`（更新対象利用者の識別子）
  - `updates: any`（更新したい項目を格納した実体）
- **戻り値**：`Promise<{ success: boolean }>`
- **論理詳細**：
  1. `UpdateProfileUseCase` を実行し，指定された項目の上書き保存を行う．
  2. 更新の成否を単純な真偽値（boolean）として返却する．例外発生時も `success: false` を返すことで安全に処理を終了させる．

### `AdminController.ts`
管理者向けの高度な Web 要求（統計表示など）を処理する．

#### `getStats(period, userId)`
- **引数**：
  - `period: string`（集計対象期間）
  - `userId: string | null`（個別照会用の利用者識別子，全体統計時は null）
- **戻り値**：`Promise<{ success: boolean, data?: any, fromCache?: boolean, error?: ApiError }>`
- **論理詳細**：
  1. `GetStatsUseCase` を実行し，キャッシュの有無を含めた集計資料を取得する．
  2. 取得した結果を展開して返却する．
  3. 異常発生時は，異常符号 `STATS_ERROR` および発生したエラーの詳細（`error.message`）を添えて失敗応答を返す．
