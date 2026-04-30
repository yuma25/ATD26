# 🗄️ Database Design

### — 記憶の保管庫 —

全てのデータは Supabase (PostgreSQL) 上で一元管理され、日本時間 (JST) を基準に記録されます。

---

## 1. 標本マスターデータ (`badges`)

| Column         | Type      | Description                             |
| :------------- | :-------- | :-------------------------------------- |
| `id`           | UUID (PK) | 標本の固有識別子                        |
| `name`         | String    | 標本の名称（Leviathan, Great Wave 等）  |
| `target_index` | Integer   | AR学習データ (`.mind`) 内のインデックス |
| `model_url`    | String    | 3Dモデルファイル (`.glb`) のパス        |

---

## 2. ユーザー獲得記録 (`user_badges`)

| Column        | Type      | Description                     |
| :------------ | :-------- | :------------------------------ |
| `user_id`     | UUID (FK) | 獲得したユーザーのID            |
| `badge_id`    | UUID (FK) | 獲得された標本のID              |
| `acquired_at` | Timestamp | 発見された日時 (デフォルト JST) |

---

## 3. 特殊な機能 (Custom Functions)

### プロフィールの自動修復

ユーザーが初めて標本を獲得した際、もし `profiles` テーブルにレコードが存在しなければ、トリガーまたは API 経由で自動的に作成されます。

### 時系列ソートの仕組み

ジャーナルの表示順は、`badges.target_index`（マスター順）ではなく、`user_badges.acquired_at`（実際に発見した順）を優先してソートされます。これにより、**「あなただけの冒険の軌跡」**がページ上部に積み重なっていきます。
