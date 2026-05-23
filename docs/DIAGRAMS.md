# 📊 システム図面集 (System Diagrams)

本ドキュメントでは、アプリケーションの構造、振る舞い、および配置を多角的に解説する。

---

## 1. クラス図 (Class Diagram)

システムの静的な構造と、主要なサービスクラス間の関係を示す。

```mermaid
classDiagram
    class BadgeService {
        <<Service>>
        +getAllBadges(signal)
        +getProfile(userId, signal)
        +acquireBadge(userId, badgeId)
        +getAcquiredBadges(userId, signal)
        +updateProfile(userId, updates)
    }
    class CacheService {
        <<Service>>
        +get(key)
        +set(key, value, ttl)
        +delete(key)
    }
    class SpecimenSettings {
        <<Interface>>
        +scale: string
        +position: string
        +outerAnimation: string
    }
    class Badge {
        <<Entity>>
        +id: UUID
        +name: string
        +target_index: number
    }

    BadgeService ..> Badge : データを管理
    BadgeService --> CacheService : キャッシュ処理を委譲

    style BadgeService fill:#3e2f28,color:#fff,stroke:#3e2f28,stroke-width:2px
    style CacheService fill:#f59e0b,color:#000,stroke:#3e2f28,stroke-width:2px
    style Badge fill:#d4c5a9,color:#3e2f28,stroke:#3e2f28
```

---

## 2. シーケンス図 (Sequence Diagram)

管理者ダッシュボードの統計表示における、キャッシュ（Redis）の活用フローである。

```mermaid
sequenceDiagram
    autonumber
    participant Admin as 🏛️ 管理者
    participant API as 📜 管理API
    participant Redis as ⚡ Redis
    participant DB as 🗄️ PostgreSQL

    Admin->>API: 統計データを要求 (GET)
    API->>Redis: キャッシュ確認

    alt キャッシュあり (Hit)
        Redis-->>API: データを返却
    else キャッシュなし (Miss)
        API->>DB: 作品数・獲得数を集計
        DB-->>API: 集計結果
        API->>Redis: 結果を保存 (300s)
    end

    API-->>Admin: 統計データを返却
```

---

## 3. アクティビティ図 (Activity Diagram)

ユーザーが体験する「発見と記録」のメインループである。

```mermaid
graph TD
    Start([<b>アプリ起動</b>]) --> Auth[匿名サインイン]
    Auth --> Home{ホーム画面}

    Home -- 探索 --> AR[ARスキャン開始]
    AR --> Scan{作品を発見?}
    Scan -- Yes --> Analysis[解析ゲージを貯める]
    Analysis --> Acquired[<b>標本獲得 / 記録</b>]
    Acquired --> AR
    Scan -- No --> AR

    Home -- 閲覧 --> Journal[図録を閲覧]
    Journal --> Detail[詳細鑑賞]
    Detail --> Journal

    Journal --> Exchange[景品交換]
    Exchange --> Finish([<b>体験終了</b>])

    %% スタイル定義
    classDef startEnd fill:#3e2f28,color:#fff,stroke:#3e2f28,stroke-width:2px
    classDef action fill:#fffdf0,color:#3e2f28,stroke:#3e2f28,stroke-dasharray: 5 5
    classDef important fill:#f59e0b,color:#000,stroke:#3e2f28,stroke-width:2px

    class Start,Finish startEnd
    class Auth,AR,Journal,Detail,Analysis action
    class Acquired,Exchange important
```

---

## 4. ステートマシン図 (State Machine Diagram)

`/ar` ページ内における AR エンジンの内部状態遷移である。

```mermaid
stateDiagram-v2
    [*] --> 読み込み中: ページ遷移
    読み込み中 --> スキャン中: カメラ準備完了

    state スキャン中 {
        [*] --> 探索中
        探索中 --> 解析中: マーカー検出 (Found)
        解析中 --> 探索中: マーカー紛失 (Lost)
        解析中 --> 記録中: ゲージ100%
    }

    記録中 --> 獲得済み: DB保存完了
    獲得済み --> 探索中: ダイアログを閉じる

    獲得済み --> [*]: ホームへ戻る
```

---

## 5. 配置図 (Deployment Diagram)

システムを支えるクラウドインフラとプロトコルの全体構成である。

```mermaid
graph TB
    subgraph Client ["📱 ユーザー端末 (Browser)"]
        UI["Webアプリ (Next.js)"]
    end

    subgraph Vercel ["☁️ Vercel Edge"]
        API["API Routes / Edge Functions"]
        CDN["Vercel CDN (Assets)"]
    end

    subgraph Backend ["⚙️ Backend Services"]
        Supa[("🗄️ Supabase / DB")]
        Redis[("⚡ Upstash / Redis")]
    end

    UI -- HTTPS/JWT --> API
    UI -- HTTPS --> CDN
    API -- SQL --> Supa
    API -- REST --> Redis

    %% スタイル定義
    style Client fill:#e8e2d2,stroke:#3e2f28,stroke-width:2px
    style Vercel fill:#d4c5a9,stroke:#3e2f28,stroke-width:2px
    style Backend fill:#3e2f28,color:#fff,stroke:#3e2f28,stroke-width:2px
    style UI fill:#fffdf0,color:#3e2f28,stroke:#3e2f28
    style API fill:#fffdf0,color:#3e2f28,stroke:#3e2f28
    style CDN fill:#fffdf0,color:#3e2f28,stroke:#3e2f28
    style Supa fill:#f59e0b,color:#000,stroke:#3e2f28
    style Redis fill:#f59e0b,color:#000,stroke:#3e2f28
```
