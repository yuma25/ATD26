# バックエンド クリーンアーキテクチャ ガイド

本書は，本プロジェクト（`backend`）における**クリーンアーキテクチャ**の設計思想，各レイヤーの役割，データの流れ，および具体的な実装例について説明する．

---

## 1. クリーンアーキテクチャの全体像と依存の方向

クリーンアーキテクチャの最も重要なルールは **「依存の方向は常に外側から内側へ向かう」** という点である．

- **内側のレイヤー**（Domain, Application）は，外側のレイヤー（Adapters, Infrastructure, 外部フレームワークなど）について何も知らない．
- **外側のレイヤー**が変更（データベースやWebフレームワークの変更など）されても，内側のビジネスロジックは一切影響を受けない．

### 依存関係の構造

```mermaid
graph TD
    subgraph InfrastructureLayer ["Infrastructure Layer (インフラ層)"]
        DB[("Database (Drizzle)")]
        DI["DI Container (container.ts)"]
        APIRoute["API Routes (Next.js)"]
    end

    subgraph AdaptersLayer ["Adapters Layer (アダプター層)"]
        Controller["Controllers"]
    end

    subgraph ApplicationLayer ["Application Layer (アプリケーション層)"]
        UseCase["Use Cases"]
    end

    subgraph DomainLayer ["Domain Layer (ドメイン層)"]
        Entity["Entities"]
        RepoIntf["Repository Interfaces"]
    end

    %% 依存関係の矢印 (外側から内側へ)
    APIRoute --> DI
    DI --> Controller
    Controller --> UseCase
    UseCase --> RepoIntf
    UseCase --> Entity

    %% インフラ層の実装クラスはドメイン層のインターフェースを実装する (DIP)
    DBRepo["Drizzle Repositories"] -.->|Implements| RepoIntf
    DBRepo --> DB
    DI -.->|Injects| DBRepo
```

---

## 2. 各レイヤーの役割と記述内容

プロジェクトのディレクトリ構成に沿って，各レイヤーの役割と具体的なコードの記述内容を解説する．

### ① Domain（ドメイン）レイヤー

- **ディレクトリ**: `domain`
- **役割**: ビジネスの「本質的なルール」や「データ構造」を定義する，システムのコアとなるレイヤーである．他のどのレイヤーにも依存しない．
- **記述するもの**:
  - **Entities (`domain/entities`)**: ビジネスオブジェクトの構造と，データ構造そのものに対するバリデーション．本プロジェクトでは **Zod** を使用して定義されている．
    - _例_: `Profile.ts`
  - **Repository Interfaces (`domain/repositories`)**: データの永続化（保存や取得）を行うためのインターフェース定義．「どのような手段で保存するか」は定義せず，「どのようなデータ操作が必要か」のみを定義する．
    - _例_: `IProfileRepository.ts`
  - **Services / Logic**: 複数のエンティティをまたぐビジネスロジックや，ドメイン特有 of 計算処理など．

### ② Application（アプリケーション）レイヤー

- **ディレクトリ**: `application`
- **役割**: 「ユースケース（＝システムの利用シナリオ）」を実現するレイヤーである．ドメインオブジェクトを操作して，特定の処理手順（ワークフロー）を実行する．
- **記述するもの**:
  - **Use Cases (`application/use-cases`)**: 単一のタスクを実行するクラス．ドメインリポジトリのインターフェースに依存し，具象クラス（データベースへの実際の接続コードなど）には依存しない（**依存関係逆転の原則: DIP**）．
    - _例_: `GetProfileUseCase.ts`

### ③ Adapters（アダプター）レイヤー

- **ディレクトリ**: `adapters`
- **役割**: 外部世界（Webリクエストなど）とアプリケーション層の仲介を行うレイヤーである．
- **記述するもの**:
  - **Controllers (`adapters/controllers`)**: HTTPリクエストなどのパラメータを受け取り，ユースケースを呼び出し，結果をレスポンス用オブジェクトに変換して返す．Webフレームワーク（Next.jsやExpress等）に直接依存しないように，純粋なオブジェクトを入力・出力とするのが特徴である．
    - _例_: `ProfileController.ts`

### ④ Infrastructure（インフラストラクチャ）レイヤー

- **ディレクトリ**: `infrastructure`
- **役割**: データベース，Webサーバー，DIツールなどの「具体的な技術要素」が集まるレイヤーである．
- **記述するもの**:
  - **DB Configuration (`infrastructure/db`)**: Drizzle ORM や PostgreSQL の接続設定，スキーマ定義．
  - **Repositories Implementation (`infrastructure/repositories`)**: ドメイン層で定義したリポジトリインターフェース（`IProfileRepository` など）の具象実装クラスである．ここで SQL の発行や ORM の操作を行う．
    - _例_: `DrizzleProfileRepository.ts`
  - **Dependency Injection (`infrastructure/di`)**: クラス間の依存関係を解消し，インスタンス化して組み立てる場所（`container.ts` で手動DIを実行し，コントローラーをエクスポートする）．
  - **Services / External**: Redisキャッシュや Supabase クライアントなど，外部サービスに依存した具体的な実装．

---

## 3. 具体的な処理フロー（データの流れ）

ユーザーがプロフィール情報を取得するリクエスト `GET /api/v1/profile/get?userId=123` を送信した際の，制御の実行順序とデータフローは以下の通りである．

```mermaid
sequenceDiagram
    autonumber
    actor Client as クライアント (Browser)
    participant Route as Next.js API Route (Infrastructure層)
    participant Container as DI Container (Infrastructure層)
    participant Controller as ProfileController (Adapters層)
    participant UseCase as GetProfileUseCase (Application層)
    participant RepoIntf as IProfileRepository (Domain層: 抽象)
    participant DrizzleRepo as DrizzleProfileRepository (Infrastructure層: 具象)
    participant DB as PostgreSQL / Drizzle

    %% 1. リクエスト受付
    Client->>Route: GET /api/v1/profile/get?userId=123
    Note over Route: userIdの存在チェックなどの<br/>Web固有のバリデーション

    %% 2. コントローラの取得 (DI)
    Route->>Container: profileController の参照を取得

    %% 3. コントローラ呼び出し
    Route->>Controller: get("123")

    %% 4. ユースケースの実行
    Controller->>UseCase: execute("123")

    %% 5. インターフェース経由でのリポジトリ呼び出し
    UseCase->>RepoIntf: findById("123")

    %% DIPにより、実際にはインフラ層の具象クラスが動作する
    RepoIntf->>DrizzleRepo: (実体の呼び出し)

    %% 6. DBアクセス
    DrizzleRepo->>DB: SQL クエリ実行
    DB-->>DrizzleRepo: レコード返却

    %% 7. ドメインエンティティへの変換とバリデーション
    Note over DrizzleRepo: DBスキーマから<br/>Profileエンティティ(Zod)へ変換
    DrizzleRepo-->>UseCase: Profileエンティティを返却

    %% 8. レスポンス返却
    UseCase-->>Controller: Profileエンティティ
    Note over Controller: 共通のレスポンス形式に整形<br/>{ success: true, data: ... }
    Controller-->>Route: JSON オブジェクト
    Route-->>Client: 200 OK (JSON)
```

---

## 4. このアーキテクチャのメリット

1. **テストが容易になる (Testability)**
   - ビジネスロジック（`UseCase`）をテストする際，実際のデータベースを起動する必要はない．リポジトリをモック化することで，インメモリで高速かつ安定したユニットテストが行える．
2. **データベースや外部ライブラリの変更に強い (Maintainability)**
   - もし将来的にデータベースやORMを変更することになっても，変更が必要なのはインフラ層のリポジトリ実装と DB 設定ファイルのみである．ドメイン層やユースケースのロジックを書き換える必要は一切ない．
3. **ビジネスルールが技術的詳細に汚染されない (Readability)**
   - ドメイン層のコードを見るだけで，「このシステムがどのような仕様で動いているか」を把握できる．SQLクエリやHTTPヘッダーの処理といったノイズが混ざらない．
