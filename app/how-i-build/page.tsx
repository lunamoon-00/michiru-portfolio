// HOW I BUILD：仕事の進め方（ヒアリングから、導入・改善まで）と、道具の選び方
import type { Metadata } from 'next';
import { SubPage, PageHead, PageCta } from '@/components/SubPage';
import { steps, toolbox } from '@/lib/profile';

export const metadata: Metadata = {
  title: 'HOW I BUILD — MICHIRU',
  description: '現場の話を聞くところから、Claude Code での実装、導入後の計測と改善まで。業務の仕組み化の進め方。',
};

const pad2 = (n: number) => String(n).padStart(2, '0');

export default function HowIBuildPage() {
  return (
    <SubPage current="/how-i-build">
      <PageHead
        eyebrow="HOW I BUILD"
        title={<>現場の話を聞くことから、<br /><em>はじめます。</em></>}
        lead={<>いいシステムは、いいコードより先に「現場の困りごとを正しくつかむこと」から生まれると考えています。ヒアリングから導入・改善まで、一人で一貫して担当しています。</>}
      />

      <section className="block">
        <p className="eyebrow">PROCESS</p>
        <h2>仕組みができるまでの5ステップ</h2>
        <ol className="steps">
          {steps.map((s, i) => (
            <li className="step" key={s.en}>
              <div><div className="no">{pad2(i + 1)}</div><span className="en">{s.en}</span></div>
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <div className="ex"><small>EXAMPLE</small>{s.example}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="block">
        <p className="eyebrow">TOOLBOX</p>
        <h2>道具の選び方</h2>
        <p className="lead">使う道具は、作るものに合わせて選びます。</p>
        <div className="cards">
          {toolbox.map((t, i) => (
            <div className="card" key={t.title}>
              <div className="no">{pad2(i + 1)}</div>
              <h3>{t.title}</h3>
              <p>{t.text}</p>
              <div className="chips">{t.items.map((x) => <span key={x}>{x}</span>)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="block">
        <p className="eyebrow">THIS SITE</p>
        <h2>このサイトも、<br />Claude Code と作りました。</h2>
        <div className="story">
          <p>1枚のHTMLで試作をつくり、見た目と動きを何度も直してから、Next.js と TypeScript に移しました。3Dの粒は three.js で、形の変身や光のにじみはGPUで動くプログラム（シェーダー）で描いています。</p>
          <p>コードはすべて公開しています。</p>
        </div>
        <div className="ctas">
          <a className="btn" href="https://github.com/lunamoon-00/michiru-portfolio" target="_blank" rel="noopener"><small>SOURCE CODE ↗</small>GitHub で見る</a>
        </div>
      </section>

      <PageCta />
    </SubPage>
  );
}
