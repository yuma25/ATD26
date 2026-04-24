# 🗄️ Database Design

## 1. 認識インデックス・マッピング

| Index | 標本名 (badges.name) | モデル (.glb) | 特徴                        |
| :---- | :------------------- | :------------ | :-------------------------- |
| 1     | Common Blue          | butterfly.glb | 小さい。scale: 5.0 推奨     |
| 2     | Leviathan            | whale.glb     | 巨大。scale: 0.07 推奨      |
| 3     | Moon Jelly           | jellyfish.glb | 繊細。scale: 0.08 推奨      |
| 4     | Antique Sword        | sword.glb     | 細長い。scale: 0.06 推奨    |
| 5     | Great Wave           | wave.glb      | 荒々しい。scale: 0.025 推奨 |

## 2. データベース機能 (SQL)

### プロフィール自動作成

`auth.users` に新規登録があった際、自動で `public.profiles` にレコードを作成する PostgreSQL トリガーを設定済み。

### 時間設定

全ての `created_at` および `acquired_at` は、デフォルトで **JST (UTC+9)** で保存されるよう調整されています。
