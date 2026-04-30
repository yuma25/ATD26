# 🔌 API & Service Specifications

### — システム間連携の定義 —

フロントエンドと Supabase の間に API レイヤー（Next.js API Routes）を置くことで、セキュリティとデータの整合性を担保しています。

---

## 1. 主要エンドポイント (API Endpoints)

### `GET /api/badges`

- **用途**: 標本の全マスターデータを取得。
- **特徴**: RLS（行レベルセキュリティ）をバイパスし、常に最新の標本リストを返します。

### `POST /api/badges/acquire`

- **用途**: 新たな標本の発見を記録。
- **リクエスト**: `{ userId: string, badgeId: string }`
- **安全策**:
  - ユーザープロフィールの自動生成（初回アクセス救済）。
  - 同一標本の重複登録防止。

### `GET /api/badges/acquired?userId=...`

- **用途**: 特定ユーザーの獲得履歴を取得。
- **返却値**: 獲得した標本のIDと、発見日時（JST）のリスト。

---

## 2. 内部サービス層 (`BadgeService`)

`backend/services/badgeService.ts` は、アプリの「知能」として、実行環境に応じた最適な通信手段を自動選択します。

| 実行環境                   | 通信手法                          | 理由                                         |
| :------------------------- | :-------------------------------- | :------------------------------------------- |
| **クライアント (Browser)** | `fetch()` で API ルートを呼び出し | セキュリティキーをブラウザに露出させないため |
| **サーバー (API Route)**   | `supabaseAdmin` で直接DB操作      | 高速な処理と管理者権限による確実な保存のため |

---

## 3. データバリデーション (Zod)

全ての外部データは `backend/types/index.ts` に定義された **Zod スキーマ** を通過します。これにより、型安全性が実行時にも保証されます。

```typescript
// 例: 標本データのスキーマ
export const BadgeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  target_index: z.number(),
  model_url: z.string(),
});
```
