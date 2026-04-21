# 🗄 データベース設計書 (Database Schema)

## 1. 概要

Supabase (PostgreSQL) を使用し、ユーザーのバッジ獲得状況をリアルタイムに管理する。

## 2. テーブル定義

### `profiles` (ユーザープロフィール)

匿名認証されたユーザーの基本情報。

- `id`: uuid (Primary Key, references auth.users)
- `created_at`: timestamp with time zone
- `last_seen`: timestamp with time zone

### `badges` (バッジマスター)

配布するバッジの定義。

- `id`: uuid (Primary Key)
- `name`: text (バッジ名)
- `description`: text (解説文)
- `image_url`: text (プレビュー画像)
- `model_url`: text (.glbファイルへのパス)
- `target_index`: int (MindARのターゲット番号)

### `user_badges` (ユーザー獲得バッジ)

ユーザーとバッジの紐付け。

- `id`: uuid (Primary Key)
- `user_id`: uuid (References profiles.id)
- `badge_id`: uuid (References badges.id)
- `acquired_at`: timestamp with time zone (獲得日時)

## 3. セキュリティ (RLS)

- `profiles`: 本人のみ読み書き可能。
- `badges`: 全員読み取り可能。
- `user_badges`: 本人のみ読み書き可能。管理者は全表示。
