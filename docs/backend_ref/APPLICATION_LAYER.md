# 🛠️ バックエンド・リファレンス：Application Layer (アプリケーション層)

アプリケーション層は，実体（ドメインオブジェクト）を組み合わせて具体的な「機能（ユースケース）」を実装する．業務論理の主要な流れ（シナリオ）を記述する場所である．

---

## 📂 use-cases (業務機能実装)

### `AcquireBadgeUseCase.ts`
標本の獲得（発見記録）を永続化する主要な論理である．
- **`execute(userId: string, badgeId: string): Promise<{ data: UserBadge | null, error: unknown }>`**
  - **引数**：
    - `userId`：獲得した利用者の識別子．
    - `badgeId`：獲得対象の標本識別子．
  - **処理内容**：
    1. プロフィールの存在確認を行い，不在であれば初期プロフィールを自動作成（遅延初期化）する．
    2. 抽象操作（リポジトリ）を介して `user_badges` 表に記録を保存する．
  - **戻り値**：登録されたデータ，または異常実体．

### `GetAllBadgesUseCase.ts`
すべての標本基本データを取得する．
- **`execute(): Promise<Badge[]>`**
  - **処理内容**：標本リポジトリから全件を取得する．
  - **戻り値**：標本実体の配列である．

### `GetAcquiredBadgesUseCase.ts`
特定利用者がすでに獲得した標本の目録を取得する．
- **`execute(userId: string): Promise<UserBadge[]>`**
  - **引数**：`userId`：対象利用者の識別子．
  - **戻り値**：獲得記録の配列である．

### `GetProfileUseCase.ts`
利用者の属性情報を取得する．
- **`execute(userId: string): Promise<Profile | null>`**
  - **引数**：`userId`：対象利用者の識別子．
  - **戻り値**：プロフィール実体，または存在しない場合は null を返す．

### `UpdateProfileUseCase.ts`
利用者のプロフィール情報（人数，景品交換状態など）を更新する．
- **`execute(userId: string, updates: Partial<Profile>): Promise<boolean>`**
  - **引数**：
    - `userId`：更新対象利用者の識別子．
    - `updates`：更新したい項目を格納した構造体．
  - **戻り値**：更新の成否を示す真偽値（boolean）である．

### `GetStatsUseCase.ts`
管理者向けの集計資料（来場者数，装置数等）を算出する．
- **`execute(period: string, userId: string | null): Promise<any>`**
  - **引数**：
    - `period`：集計期間（"1h"，"24h"，"all" 等）．
    - `userId`：特定利用者の照会を行う場合はその識別子，全体統計の場合は null を指定する．
  - **処理内容**：
    1. 高速記憶（Redisキャッシュ）を確認し，存在すればそれを即座に返す．
    2. 全利用者から「運営側（管理者）」を除外する．
    3. 有効な利用者のプロフィールから，合計来場人数（総来場者数）などを算出する．
    4. 結果を高速記憶に保存した上で返却する．
  - **戻り値**：集計結果データである．
