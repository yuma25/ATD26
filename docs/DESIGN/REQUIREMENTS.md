# 📄 要件定義書 (Requirements) - Immersive AR Badge Collection

## 1. プロジェクト概要

AR（拡張現実）と高品質な3D演出を組み合わせた、没入型のバッジ収集・管理システム。
「匿名チェックイン」によるシームレスな体験と、管理者の「リアルタイム監視」を両立する。

## 2. コア体験 (Core Experience)

- **バッジの没入感**: React Three Fiber + React Spring による、粒子が集まって形になる高品質な3D演出。ポケモン風の質感。
- **AR体験**: ブラウザ完結（8th Wall / Image Target）で、現実世界にバッジが浮かび上がる演出。
- **シームレスな参加**: 名前入力不要。QRスキャン即スタート（匿名認証）。
- **知識の深化**: AI生成による「生きた」バッジケース（知識グラフ）。

## 3. 技術スタック (Technical Stack)

- **Frontend**: Next.js (App Router), React Three Fiber, React Spring, 8th Wall (OSS/MindAR等), Lism CSS.
- **Backend**: Supabase (Auth, DB: PostgreSQL, Realtime).
- **AI**: Gemini CLI, 自動知識グラフ生成.
- **Infrastructure**: Vercel (CI/CD: GitHub Actions).

## 4. 機能要件 (Features)

### ユーザー向け

- **匿名ログイン**: UUIDベースの即時参加機能。
- **ARカメラ**: 特定のマーカー（Image Target）を認識し、3Dバッジを描画。
- **バッジケース**: 獲得したバッジの一覧表示と、3D演出の再確認。
- **知識グラフ表示**: バッジに紐づく解説テキストの可視化。

### 管理者向け

- **リアルタイムダッシュボード**: 参加状況やバッジ獲得ログのリアルタイム表示。
- **バッジ管理**: 配布するバッジの管理（画像、3Dモデル、解説文）。

## 5. デザイン方針 (Visual Style)

- **Vibe**: Stripeのようなクリーンで洗練されたUI。
- **Texture**: バッジの光沢感、浮かび上がる3D、物理挙動のあるアニメーション。
- **Framework**: Lism CSS による一貫した設計。
