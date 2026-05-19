# APIおよびサービス仕様書

### システムの相互運用性とセキュリティ設計

本アプリケーションは、API レイヤーを介して高度なセキュリティ制御、データのバリデーション、およびトラフィック管理を実装しています。

---

## 1. システム全体図

### ユースケース図 (Use Case Diagram)

ユーザー（来場者）と管理者がシステムを通じてどのようなアクションを行うかを定義します。

```mermaid
useCaseDiagram
    actor "来場者 (Visitor)" as U
    actor "管理者 (Admin)" as A
    
    package "ATD26 SCIENCE-ART System" {
        usecase "作品をスキャンして発見する" as UC1
        usecase "3DモデルをARで観察・撮影する" as UC2
        usecase "獲得した作品を図録で閲覧する" as UC3
        usecase "来場人数を登録する" as UC4
        usecase "景品と交換する" as UC5
        usecase "全体の統計データを閲覧する" as UC6
    }
    
    U --> UC1
    U --> UC2
    U --> UC3
    U --> UC4
    U --> UC5
    A --> UC6
```

### アクティビティ図 (Activity Diagram)

主要な機能である「作品の発見から獲得まで」の論理フローです。

```mermaid
activityDiagram
    start
    :ARカメラを起動;
    repeat
        :絵画（マーカー）をスキャン;
    backward:カメラを向ける;
    repeat while (マーカーを認識したか?) is (No)
    
    :3Dモデルを顕現（表示）;
    :解析（ゲージ蓄積）開始;
    
    if (既に獲得済みか?) then (Yes)
        :「データ取得済み」を表示;
    else (No)
        while (ゲージ < 100%?) is (Yes)
            :解析を継続;
        endwhile
        :獲得アニメーション表示;
        :BadgeService.acquireBadge() 実行;
        :データベースに記録;
    endif
    
    :詳細情報の閲覧・撮影が可能に;
    stop
```

---

## 2. API一覧 (Endpoint Audit)

アプリケーション内で使用されているすべての API を分類してまとめます。

### 2.1 内部 API (Internal REST API)
Next.js の API Routes (`frontend/app/api/v1/`) で実装されているエンドポイントです。

| エンドポイント | メソッド | 説明 | 認証 | キャッシュ |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/badges` | `GET` | 全標本データのマスターリスト取得 | 不要 | L3 (CDN) |
| `/api/v1/badges/acquire` | `POST` | 標本獲得の記録 | 要 (匿名) | なし |
| `/api/v1/badges/acquired` | `GET` | ユーザーごとの獲得済みリスト取得 | 要 (匿名) | L1 (SWR) |
| `/api/v1/profile/get` | `GET` | ユーザープロフィールの取得 | 要 (匿名) | L1 (SWR) |
| `/api/v1/profile/update` | `POST` | 来場人数や交換フラグの更新 | 要 (匿名) | なし |
| `/api/v1/admin/stats` | `GET` | 管理者用統計データ（集計値） | 要 (Admin) | L2 (Redis) |

### 2.2 外部サービス API (BaaS / SDK)
直接またはライブラリを介して通信している外部 API です。

| サービス | 用途 | 備考 |
| :--- | :--- | :--- |
| **Supabase Auth** | 匿名サインイン、セッション管理 | `supabase.auth.*` |
| **Supabase Database** | PostgreSQL への直接クエリ（サーバーサイド） | `PostgREST` |
| **Upstash Redis** | 統計データ、レートリミット用キャッシュ | REST 経由 |
| **Web Share API** | 撮影画像の OS 標準共有機能 | ブラウザネイティブ API |

---

## 3. 共通レスポンス形式 (Standard Response)

全ての内部 API は一貫した JSON 構造を返します。

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

---

## 4. セキュリティと認可

- **匿名認証 (Anonymous Auth)**: Supabase を使用。ユーザーは登録不要で UUID を付与されます。
- **RLS (Row Level Security)**: データベース側で「自分のデータのみ読み書き可能」にする制限をかけています。
- **Service Role**: 管理者用統計 API 等では、制限を回避できる強力なキーをサーバーサイドでのみ使用します。
