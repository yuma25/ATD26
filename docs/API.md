# API およびサービス仕様書

### システムの相互運用性とセキュリティ設計

本アプリケーションは、API レイヤーを介して高度なセキュリティ制御、データのバリデーション、およびトラフィック管理を実装している。

---

## 1. システム全体図

### ユースケース (Use Case)

ユーザー（来場者）と管理者がシステムを通じてどのようなアクションを行うかを定義する。

```mermaid
graph TD
    %% アクター
    Visitor((来場者))
    Admin((管理者))

    subgraph "ATD26 SCIENCE-ART システム"
        UC1[作品をスキャンして発見する]
        UC2[3DモデルをARで観察・撮影する]
        UC3[獲得した作品を図録で閲覧する]
        UC4[来場人数を登録する]
        UC5[景品と交換する]
        UC6[全体の統計データを閲覧する]
    end

    Visitor --> UC1
    Visitor --> UC2
    Visitor --> UC3
    Visitor --> UC4
    Visitor --> UC5
    Admin --> UC6

    %% スタイル定義
    style Visitor fill:#3e2f28,color:#fff
    style Admin fill:#3e2f28,color:#fff
    style UC1 fill:#fffdf0,stroke:#3e2f28
    style UC2 fill:#fffdf0,stroke:#3e2f28
    style UC3 fill:#fffdf0,stroke:#3e2f28
    style UC4 fill:#fffdf0,stroke:#3e2f28
    style UC5 fill:#f59e0b,stroke:#3e2f28,color:#000
    style UC6 fill:#f59e0b,stroke:#3e2f28,color:#000
```

### アクティビティフロー (Activity Flow)

主要な機能である「作品の発見から獲得まで」の論理フローである。

```mermaid
graph TD
    Start([<b>開始</b>]) --> Scan[絵画をスキャン]
    Scan --> Recognized{認識成功?}
    Recognized -- No --> Scan
    Recognized -- Yes --> ShowModel[3Dモデルを表示]
    
    ShowModel --> CheckAcquired{既に獲得済み?}
    
    CheckAcquired -- Yes --> ShowMsg[「データ取得済み」を表示]
    CheckAcquired -- No --> Progress[解析中... ゲージ蓄積]
    
    Progress --> Done{100% 完了?}
    Done -- No --> Progress
    Done -- Yes --> Save[<b>BadgeService で記録保存</b>]
    
    ShowMsg --> End([<b>詳細表示・撮影</b>])
    Save --> End

    %% スタイル定義
    classDef startEnd fill:#3e2f28,color:#fff,stroke:#3e2f28
    classDef decision fill:#d4c5a9,stroke:#3e2f28
    classDef action fill:#fffdf0,stroke:#3e2f28
    classDef highlight fill:#f59e0b,color:#000,stroke:#3e2f28
    
    class Start,End startEnd
    class Recognized,CheckAcquired,Done decision
    class Scan,ShowModel,ShowMsg,Progress action
    class Save highlight
```

---

## 2. API 一覧 (Endpoint Audit)

アプリケーション内で使用されているすべての API を分類してまとめる。

### 2.1 内部 API (Internal REST API)
Next.js の API Routes (`frontend/app/api/v1/`) で実装されているエンドポイントである。

| エンドポイント | メソッド | 説明 | 認証 | キャッシュ |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/badges` | `GET` | 全標本データのマスターリスト取得 | 不要 | L3 (CDN) |
| `/api/v1/badges/acquire` | `POST` | 標本獲得の記録 | 要 (匿名) | なし |
| `/api/v1/badges/acquired` | `GET` | ユーザーごとの獲得済みリスト取得 | 要 (匿名) | L1 (SWR) |
| `/api/v1/profile/get` | `GET` | ユーザープロフィールの取得 | 要 (匿名) | L1 (SWR) |
| `/api/v1/profile/update` | `POST` | 来場人数や交換フラグの更新 | 要 (匿名) | なし |
| `/api/v1/admin/stats` | `GET` | 管理者用統計データ（集計値） | 要 (Admin) | L2 (Redis) |

### 2.2 外部サービス・システム API
直接またはライブラリを介して通信している外部連携である。

| サービス | 用途 | 備考 |
| :--- | :--- | :--- |
| **Supabase Auth** | 匿名サインイン、セッション管理 | `supabase.auth.*` |
| **Supabase Database** | PostgreSQL への直接クエリ（サーバーサイド） | `PostgREST` |
| **Upstash Redis** | 統計データ、レートリミット用キャッシュ | REST 経由 |
| **Web Share API** | 撮影画像の OS 標準共有機能 | ブラウザネイティブ API |
| **Vercel Edge/CDN** | プログラムや 3D モデルの高速配信 | インフラレベル (L3) |

---

## 3. キャッシュ戦略の定義

ドキュメント内で使用されているキャッシュの階層定義である。

- **L1 (Client Cache)**: ブラウザ上の SWR キャッシュ。画面遷移を高速化する。
- **L2 (Server Cache)**: Redis によるサーバーサイドキャッシュ. 複雑な集計の負荷を下げる。
- **L3 (Edge Cache)**: CDN (Vercel) による静的ファイルのキャッシュ。地理的に近い場所から配信される。

---

## 4. 共通レスポンス形式 (Standard Response)

全ての内部 API は一貫した JSON 構造を返却する。

### ✅ 成功時 (Success: 200 OK)
```json
{
  "success": true,
  "data": { ... }
}
```

### ❌ 失敗時 (Failure: 4xx / 5xx)
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "ユーザー向けメッセージ"
  }
}
```
