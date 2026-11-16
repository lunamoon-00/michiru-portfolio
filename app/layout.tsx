// すべてのページの外枠。フォントの読み込みと、<html>・<body> の設定をする
import type { Metadata } from 'next';
import { Noto_Sans_JP, JetBrains_Mono, Space_Grotesk, DotGothic16, VT323, Zen_Old_Mincho, Bodoni_Moda } from 'next/font/google';
import './globals.css';

// next/font：Googleのフォントを、このサイトの中に置いて配信する（表示が速く、Googleに通信しない）。
// variable に書いた名前の CSS変数ができ、globals.css から var(--font-〇〇) で使える。
// 日本語のフォントは文字数が多く、先読み（preload）すると重いので preload: false にしている。
const noto = Noto_Sans_JP({ weight: ['400', '500', '700', '900'], variable: '--font-noto', preload: false });
const jbm = JetBrains_Mono({ weight: ['400', '600'], subsets: ['latin'], variable: '--font-jbm' });
const grotesk = Space_Grotesk({ weight: ['500', '700'], subsets: ['latin'], variable: '--font-grotesk' });
const dot = DotGothic16({ weight: '400', variable: '--font-dot', preload: false });
const vt = VT323({ weight: '400', subsets: ['latin'], variable: '--font-vt' });
const mincho = Zen_Old_Mincho({ weight: '900', variable: '--font-mincho', preload: false });
const bodoni = Bodoni_Moda({ weight: '700', style: 'italic', subsets: ['latin'], variable: '--font-bodoni' });

export const metadata: Metadata = {
  title: 'MICHIRU — AI Engineering × AI Creative',
  description: '福祉の現場を知るエンジニアとして、現場で使い続けられる業務システムをAIでつくっています。AIアイドル「I♥DOLL」などの映像制作も。',
};

// sessionStorage の 'michiru-mode'（lib/experience/dom.ts の MODE_KEY）を読む
const MODE_SCRIPT = `(function(){try{var m=sessionStorage.getItem("michiru-mode");if(m==="creative")document.documentElement.setAttribute("data-mode",m)}catch(e){}})()`;

const fontVars =[noto, jbm, grotesk, dot, vt, mincho, bodoni].map((f) => f.variable).join(' ');

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // data-mode：いまのモード。スクリプトが engineering / creative を切り替える
    // suppressHydrationWarning：下の小さなスクリプトが data-mode を書き換えても、React がエラー扱いしないようにする
    <html lang="ja" data-mode="engineering" className={fontVars} suppressHydrationWarning>
      <head>
        {/* 同じタブで前に選んだモードを、画面が描かれる前に反映する（一瞬だけ別の色が見えるのを防ぐ） */}
        <script dangerouslySetInnerHTML={{ __html: MODE_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
