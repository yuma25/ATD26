# 📊 システム図面集 (System Diagrams)

本ドキュメントでは、アプリケーションの構造、振る舞い、および配置を UML および各種図面を用いて多角的に解説します。エンジニアがシステムの全体像を把握し、新しい機能の追加や修正を行う際の指針となります。

---

## 1. クラス図 (Class Diagram)

システムの「静的な構造」を表します。主要なサービスクラスと、データベースとやり取りされるデータの型（エンティティ）の関係を定義しています。

**解説:** `BadgeService` はビジネスロジックの中心であり、`CacheService`（Redis連携）を利用しながら `Badge`（作品）や `Profile`（ユーザー情報）を管理します。

```mermaid
classDiagram
    class BadgeService {
        <<Service>>
        +getAllBadges(signal) 標本一覧取得
        +getProfile(userId, signal) プロフィール取得
        +acquireBadge(userId, badgeId) 標本獲得の記録
        +getAcquiredBadges(userId, signal) 獲得済み一覧取得
        +updateProfile(userId, updates) プロフィール更新
    }
    class CacheService {
        <<Service>>
        +get(key) キャッシュ取得
        +set(key, value, ttl) キャッシュ保存
        +delete(key) キャッシュ削除
    }
    class SpecimenSettings {
        <<Interface>>
        +scale: スケール
        +position: 位置補正
        +rotation: 回転補正
        +outerAnimation: 外側アニメーション
        +innerAnimation: 内側アニメーション
    }
    class Badge {
        <<Entity>>
        +id: ID (UUID)
        +name: 作品名
        +artist: 作者名
        +model_url: 3DモデルURL
        +image_url: 画像URL
        +target_index: マーカー番号
    }
    class UserBadge {
        <<Entity>>
        +user_id: ユーザーID
        +badge_id: 標本ID
        +acquired_at: 獲得日時
    }
    class Profile {
        <<Entity>>
        +id: ID (UUID)
        +party_size: パーティー人数
        +is_exchanged: 景品交換済みフラグ
    }
    
    BadgeService ..> Badge : データを管理
    BadgeService ..> UserBadge : 獲得記録を管理
    BadgeService ..> Profile : ユーザー情報を管理
    BadgeService --> CacheService : 高速化のために利用
```

---

## 2. シーケンス図 (Sequence Diagram)

「時間の経過」に沿ったオブジェクト間のやり取りを表します。

**解説:** 管理者ダッシュボードの統計表示における、キャッシュ（Redis）の活用フローです。一度 DB で集計した結果を Redis に保存（SET）し、次回以降は DB に負荷をかけずに高速に返却（GET）する仕組みを可視化しています。

```mermaid
sequenceDiagram
    autonumber
    participant Admin as 管理者ブラウザ
    participant API as 管理API (/stats)
    participant Redis as Redis (キャッシュ)
    participant DB as PostgreSQL (DB)

    Admin->>API: 統計データを要求 (GET)
    API->>Redis: キャッシュがあるか確認
    
    alt キャッシュあり (Hit)
        Redis-->>API: キャッシュデータを返す
    else キャッシュなし (Miss)
        API->>DB: 作品数・獲得数を集計
        DB-->>API: 集計結果を返す
        API->>Redis: 結果を保存 (300秒間)
    end
    
    API-->>Admin: 統計データを返却 (JSON)
```

---

## 3. アクティビティ図 (Activity Diagram)

ユーザーが体験する「一連の業務フロー」を表します。

**解説:** アプリを起動してから、ARで作品を見つけ、図録を完成させ、最後に景品と交換するまでのメインループです。

```mermaid
graph TD
    Start([アプリ起動]) --> Auth[匿名サインイン / セッション復元]
    Auth --> Home[ホーム画面]
    
    Home --> AR[ARスキャン開始]
    AR --> Scan{作品を発見?}
    Scan -- Yes --> Analysis[解析ゲージを貯める]
    Analysis --> Acquired[標本獲得 / DBに保存]
    Acquired --> AR
    Scan -- No --> AR
    
    Home --> Journal[図録を閲覧]
    Journal --> Detail[作品の拡大・詳細鑑賞]
    Detail --> Journal
    
    Journal --> Exchange[景品交換画面]
    Exchange --> Finish([体験終了])
```

---

## 4. ステートマシン図 (State Machine Diagram)

特定の画面やオブジェクトの「状態の変化」を表します。

**解説:** `/ar` ページ内における AR エンジンの内部状態です。カメラの起動から、マーカーを見つけて解析が完了するまでの条件分岐を定義しています。

```mermaid
stateDiagram-v2
    [*] --> 初期化中: ページ遷移
    初期化中 --> 読み込み中: A-Frame/MindAR起動
    読み込み中 --> スキャン中: カメラ準備完了
    
    スキャン中 --> 解析中: マーカー検出 (Found)
    解析中 --> スキャン中: マーカー紛失 (Lost)
    
    解析中 --> 登録中: 解析ゲージ100%
    登録中 --> 獲得済み: DB保存完了
    
    獲得済み --> スキャン中: ダイアログを閉じる
    スキャン中 --> [*]: ホームへ戻る
```

---

## 5. コミュニケーション図 (Communication Diagram)

オブジェクト間の「関係性とメッセージ」に注目した図です。

**解説:** フロントエンドの各モジュールが、どのような順番で連携してデータを取得・表示しているかを示します。

```mermaid
graph LR
    Page[ARページ] -- "1. フックを呼び出し" --> Hook[useAR Hook]
    Hook -- "2. データを要求" --> Service[BadgeService]
    Service -- "3. API通信" --> API[内部API]
    API -- "4. クエリ実行" --> DB[(Supabase)]
    
    Hook -- "5. UIを表示" --> UI[獲得成功画面]
    Hook -- "6. 3D描画制御" --> AFrame[A-Frame / MindAR]
```

---

## 6. 配置図 (Deployment Diagram)

システムが「どのハードウェア/クラウド」で動作しているかを表します。

**解説:** Vercel によるホスティングと、バックエンドの BaaS (Supabase, Upstash) の連携、および通信プロトコル（HTTPS/JWT）の全体構成です。

```mermaid
graph TD
    User((ユーザーのスマホ))
    
    subgraph CloudVercel ["Vercel (ホスティング・エッジ)"]
        Next["Next.js アプリ / API"]
        CDN["Vercel CDN / 画像・3Dモデル"]
    end
    
    subgraph BaaS ["バックエンドサービス"]
        Supa[("Supabase / DB & 認証")]
        Redis[("Upstash / Redisキャッシュ")]
    end
    
    User -- "HTTPS (通信)" --> CDN
    User -- "HTTPS (通信)" --> Next
    Next -- "SQL (データ)" --> Supa
    Next -- "REST (キャッシュ)" --> Redis
    Next -- "JWT (認証)" --> Supa
```

---

## 7. パッケージ図 (Package Diagram)

システムの「ディレクトリ構造と依存関係」を表します。

**解説:** モノレポ構造を採用しており、`frontend` が `backend` の共通ロジックを参照し、双方が `docs` の仕様書を参照する関係を示します。

```mermaid
graph TD
    subgraph Root ["プロジェクトルート"]
        subgraph FE ["frontend (フロントエンド)"]
            App["app (画面)"]
            Comp["components (部品)"]
            Hooks["hooks (ロジック)"]
        end
        
        subgraph BE ["backend (バックエンド共通)"]
            Services["services (機能)"]
            Lib["lib (基礎)"]
            Types["types (型定義)"]
        end
        
        subgraph Docs ["docs (ドキュメント)"]
            API_MD["API仕様書"]
            ARCH_MD["設計仕様書"]
        end
    end
    
    FE -- import --> BE
    FE -- 参照 --> Docs
    BE -- 参照 --> Docs
```

---

## 8. コンポーネント図 (Component Diagram)

システムの「機能ブロック」とそのインターフェースを表します。

**解説:** フロントエンド内部の主要な構成要素をグループ化したものです。`LogicHooks` がオーケストレーターとして機能し、UI と AR エンジンを制御します。

```mermaid
graph TD
    subgraph "フロントエンドシステム (Frontend System)"
        Router["Next.js App Router"]
        LogicHooks["カスタムフック (Logic)"]
        UI["UIコンポーネント"]
        AREngine["ARエンジン (MindAR)"]
    end
    
    Router --> LogicHooks
    LogicHooks --> UI
    LogicHooks --> AREngine
    AREngine -.-> Models["3Dモデル (.glb)"]
    UI -- イベント --> LogicHooks
```

---

## 9. オブジェクト図 (Object Diagram)

ある時点での「具体的なデータの状態」を表します。

**解説:** ID `user_123` のユーザーが「自然に寄り添う者たち」を 獲得した瞬間の、メモリ上のデータ構造を例示したものです。

```mermaid
graph TD
    UserInstance["<u>currentUser: Profile</u><br/>id = 'user_123'<br/>party_size = 3<br/>is_exchanged = false"]
    
    Badge1["<u>butterfly: Badge</u><br/>id = 'b_001'<br/>name = '自然に寄り添う者たち'"]
    
    Record1["<u>record1: UserBadge</u><br/>user_id = 'user_123'<br/>badge_id = 'b_001'<br/>acquired_at = '2026-05-20 10:00'"]
    
    UserInstance --- Record1
    Record1 --- Badge1
```
