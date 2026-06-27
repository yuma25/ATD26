# バックエンドAPI仕様および構築まとめ

本ドキュメントは，本プロジェクトで提供されている各APIの処理内容と，それを構築するためにクリーンアーキテクチャの各レイヤー（Domain，Application，Adapters，Infrastructure）でどのような作業（コード記述）がおこなわれているかをまとめたものである．

---

## 1. 提供されているAPI一覧と処理内容

本システムには，以下の3つのドメインカテゴリに関するAPIが存在する．

### ① プロフィール関連 (Profile)

- **`GET /api/v1/profile/get?userId=xxx`**:
  指定されたユーザーのプロフィール情報（ID，パーティ人数，景品交換状態，作成日時，最終活動日時）を取得する．
- **`POST /api/v1/profile/update`**:
  指定されたユーザーの属性情報（パーティ人数，景品交換状態）を更新する．
- **`POST /api/v1/profile/sync`**:
  ユーザーのアクティビティを最新にする同期処理．空の更新内容をDBに送信することで，最終活動日時（`last_seen`）を現在時刻に更新する（生存確認・活動記録用）．

### ② バッジ（標本）関連 (Badges)

- **`GET /api/v1/badges`**:
  システムに登録されている全バッジの一覧を取得する．
- **`GET /api/v1/badges/acquired?userId=xxx`**:
  指定されたユーザーが獲得（発見）したバッジの一覧を取得する．
- **`POST /api/v1/badges/acquire`**:
  ユーザーによる新しいバッジの獲得を記録する．

### ③ 管理者関連 (Admin)

- **`GET /api/v1/admin/stats`**:
  ダッシュボード用の統計データ（総来場者数，デバイス数，平均発見率，日付ごとのアクティビティ推移など）を集計して取得する．スタッフアカウントによる操作は集計対象から除外され，パフォーマンス向上のために Redis キャッシュが適用される．

---

## 2. 各APIの構築における各レイヤーでの作業

これらのAPIをクリーンアーキテクチャに則って構築する際，各レイヤーでおこなわれている具体的な開発・作業内容を「プロフィール取得（`GET /api/v1/profile/get`）」を例に解説する．

### ① Domain（ドメイン）レイヤーでの作業

ビジネスルールとデータ定義をおこなう．

1. **エンティティの定義**:
   `domain/entities/Profile.ts` にて，Zod スキーマを用いてプロフィールのオブジェクト構造（`id`，`party_size`，`is_exchanged` 等）とバリデーションルールを記述する．
2. **リポジトリインターフェースの宣言**:
   `domain/repositories/IProfileRepository.ts` にて，データアクセス層が提供すべきメソッド（`findById` や `upsert` など）のシグネチャをインターフェースとして宣言する．

### ② Application（アプリケーション）レイヤーでの作業

ユースケースを実行する手順を記述する．

1. **ユースケースの作成**:
   `application/use-cases/GetProfileUseCase.ts` を作成する．コンストラクタで `IProfileRepository`（インターフェース）を受け取り，`execute(userId)` メソッド内でリポジトリの `findById(userId)` を呼び出してデータを返却するビジネス手順を記述する．（インフラの実装には一切依存させない）

### ③ Adapters（アダプター）レイヤーでの作業

Webの表現形式とユースケースを接続する．

1. **コントローラーの作成**:
   `adapters/controllers/ProfileController.ts` を作成する．コンストラクタで `GetProfileUseCase` などのユースケースを受け取り，`get(userId)` メソッド内でユースケースを実行する．結果が取得できた場合は Zod スキーマでデータをパースして整形し，成功/失敗の共通フォーマット（`{ success: true, data }` または `{ success: false, error }`）に落とし込んで返却する．（Next.jsなどのフレームワーク機能は使用しない）

### ④ Infrastructure（インフラストラクチャ）レイヤーでの作業

外部の具象技術やフレームワークと結合する．

1. **スキーマの定義とDB接続**:
   `infrastructure/db/schema.ts` で Drizzle ORM 用のデータベーステーブル（`profiles` テーブル）を定義する．
2. **リポジトリの具象実装**:
   `infrastructure/repositories/DrizzleProfileRepository.ts` を作成する．`IProfileRepository` インターフェースを実装（`implements`）し，Drizzle ORM を使って実際にデータベース（PostgreSQL）に問い合わせるコードを記述する．取得したデータはドメインエンティティの形式に変換して返却する．
3. **依存性注入 (DI)**:
   `infrastructure/di/container.ts` にて，リポジトリの具象クラス（`DrizzleProfileRepository`）をインスタンス化し，それをユースケース（`GetProfileUseCase`）へ渡し，さらにそれをコントローラー（`ProfileController`）に渡して組み立て，APIルートから使えるようにエクスポートする．
4. **API Route（エントリーポイント）の作成**:
   フロントエンドの `app/api/v1/profile/get/route.ts` にて，Next.js API Routes の `GET` ハンドラを定義する．クエリパラメータから `userId` を取得してバリデーションをおこない，DIコンテナからインポートした `profileController.get(userId)` を呼び出し，結果を `NextResponse.json` でブラウザに返却する．
