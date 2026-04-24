# 🔌 API & Service Specifications

フロントエンドと Supabase の間に API レイヤーを置くことで、セキュリティと安定性を確保しています。

## 1. 主要エンドポイント

### `GET /api/badges`

- **用途**: 全標本データの取得
- **仕様**: DB の RLS 設定に関わらず、マスターデータを返却。

### `POST /api/badges/acquire`

- **用途**: 発見した標本の保存
- **機能**:
  1. プロフィールの自動修復（プロフィールがないユーザーを救済）。
  2. 重複登録の防止。
  3. 管理者権限による強制書き込み。

### `GET /api/badges/acquired?userId=...`

- **用途**: ユーザーごとの獲得済みリスト取得
- **返却値**: `badge_id` と `acquired_at`（獲得日時）のリスト。

## 2. 内部サービス (`BadgeService`)

`backend/services/badgeService.ts` は、実行環境に応じて挙動を変えます。

- **Client**: ネットワーク経由で上記の API ルートを呼び出し。
- **Server**: Supabase クライアント（Admin）を使い直接データを操作。
