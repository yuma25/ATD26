# システム全体のアーキテクチャとデータフロー図解

本ドキュメントは，本システムにおけるフロントエンド（Next.js）とバックエンド（クリーンアーキテクチャ）の結合構造，およびデータがどのように流れて処理されるかをわかりやすく解説するものである．

---

## 1. システムを構成する5つの階層と役割

システムは，内側に行くほど「ビジネスの本質（業務ルール）」に近く，外側に行くほど「具体的な技術（Webフレームワークやデータベース）」に依存する構造になっている．

| 階層                           | 役割                                                                           | 主なコードの配置場所                                                            |
| :----------------------------- | :----------------------------------------------------------------------------- | :------------------------------------------------------------------------------ |
| **① UI・プレゼンテーション層** | ユーザーへ画面を表示し，ボタン押下などの操作を受け付ける．                     | `frontend/components/`<br/>`frontend/app/`                                      |
| **② アダプター・BFF層**        | Webリクエスト（HTTPなど）と，システムのコアロジックを仲介する．                | `frontend/app/api/v1/`<br/>`backend/src/adapters/controllers/`                  |
| **③ アプリケーション層**       | 「プロフィールの取得」など，具体的な機能（ユースケース）の処理手順を記述する． | `backend/src/application/use-cases/`                                            |
| **④ ドメイン層 (核心部)**      | 業務のデータ構造やビジネスルールを定義する．他のどのレイヤーにも依存しない．   | `backend/src/domain/entities/`<br/>`backend/src/domain/repositories/`           |
| **⑤ インフラストラクチャ層**   | データベース操作の実体や，外部サービス（Redis，Supabase）との通信をおこなう．  | `backend/src/infrastructure/repositories/`<br/>`backend/src/infrastructure/db/` |

---

## 2. 依存関係のルール（一方通行の原則）

- **「外側から内側」へ一方通行で依存する**：
  内側のレイヤー（ドメイン層やアプリケーション層）は，外側にあるデータベースやWebフレームワークの種類を一切知らない．
- **依存関係逆転の原則 (DIP)**：
  アプリケーション層（ユースケース）は，インフラ層のデータベース処理を直接呼び出さない．ドメイン層に「リポジトリ・インターフェース」というデータの出入り口（窓口）だけを定義しておき，実際のデータベース処理は，インフラ層がその窓口の規格に合わせて後から実装を差し込む構造になっている．
  これにより，将来的にデータベースを差し替えても，ビジネスロジックは一切書き換える必要がない．

---

## 3. データフロー（リクエストからレスポンスまでの流れ）

ユーザーが画面を開いて「自分のプロフィールを取得する」際のデータの流れは以下の通りである．

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 ユーザー (ブラウザ)
    participant Front as 🖥️ UI (React/SWR)
    participant BFF as 🌐 APIルーター (Next.js)
    participant Controller as 🎮 コントローラー (Adapters)
    participant UseCase as ⚙️ ユースケース (Application)
    participant RepoIntf as 🔑 リポジトリ定義 (Domain: 抽象)
    participant DrizzleRepo as 💾 DB操作実装 (Infrastructure: 具象)
    participant DB as 🗄️ データベース (PostgreSQL)

    %% --- 1. リクエストが奥へと進む流れ ---
    User->>Front: 画面を開く (userId: 123)
    Front->>BFF: HTTP GET /api/v1/profile/get?userId=123 (SWRで通信)
    BFF->>Controller: profileController.get("123") を実行 (直接関数呼び出し)
    Controller->>UseCase: execute("123") を実行
    UseCase->>RepoIntf: findById("123") を呼び出し

    %% --- 2. DIPによるインフラ層の動作 ---
    Note over RepoIntf, DrizzleRepo: 依存関係逆転の原則 (DIP) により<br/>インターフェースを満たすインフラ層のクラスが動作する
    DrizzleRepo->>DB: SQLクエリを実行
    DB-->>DrizzleRepo: レコードデータを取得

    %% --- 3. レスポンスが手前へと戻る流れ ---
    DrizzleRepo-->>UseCase: Profileデータ (Zodで検証済み) を返却
    UseCase-->>Controller: Profileデータを返却
    Controller-->>BFF: 共通形式のJSON { success: true, data } を返却
    BFF-->>Front: HTTP レスポンス (JSON) を返却
    Front-->>User: データを画面に表示し，キャッシュに保存する
```

この一方通行のデータフローと階層分けにより，それぞれの部品が「画面の表示」「通信の仲介」「処理手順の実行」「データ操作」に完全に独立し，変更に強くテストがしやすいシステムが構築されている．
