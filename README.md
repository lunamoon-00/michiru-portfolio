# MICHIRU Portfolio

AIエンジニアリング × AIクリエイティブのポートフォリオサイト。
ENGINEERING / CREATIVE の2つのモードを切り替えて、開発の実績と映像の実績を見せる。

## 使っている技術

| 道具 | 使いどころ |
|---|---|
| Next.js（App Router） | ページをあらかじめ作っておき、速く表示する |
| TypeScript | 載せる中身（数字・作品）に型を付け、書き間違いを防ぐ |
| Tailwind CSS | スタイルの土台 |
| three.js | 3Dの粒（形が変わる演出）、光のにじみ・色ずれのポストエフェクト |
| next/font | フォントをサイト内から配信する |
| Vercel | 公開 |

## ファイルの場所

| ファイル | 中身 |
|---|---|
| `lib/content.ts` | トップページの数字・作品・説明文（文章を直すときはここ） |
| `lib/profile.ts` | ABOUT・HOW I BUILD ページの中身 |
| `lib/visuals.ts` | 作品カードのイメージ図（SVG） |
| `components/` | 画面の部品（セクション・メニュー・HUDなど） |
| `lib/experience/` | 動き（3Dの粒・スクロール演出・カーソル・音・オープニング）。役目ごとにファイルを分けている（入り口は `index.ts`） |
| `app/globals.css` | 見た目 |

## 手元で動かす

```bash
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開く。URLの最後に `?intro` を付けると、オープニングをもう一度見られる。

## これからやること

- 作品の詳しいページ（`/works/[slug]`）
- SkillScope の完成後に掲載
