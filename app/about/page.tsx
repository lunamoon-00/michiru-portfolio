// ABOUT：自己紹介（経歴・スキル・大事にしていること）
import type { Metadata } from 'next';
import { SubPage, PageHead, PageCta } from '@/components/SubPage';
import { career, facts, skills, values } from '@/lib/profile';

export const metadata: Metadata = {
  title: 'ABOUT — MICHIRU',
  description: '福祉・医療の現場で対人支援を経験し、いまは生成AIで業務を仕組み化するエンジニア。経歴・スキル・大事にしていること。',
};

const pad2 = (n: number) => String(n).padStart(2, '0');

export default function AboutPage() {
  return (
    <SubPage current="/about">
      <PageHead
        eyebrow="ABOUT"
        title={<>現場を知っているから、<br /><em>使われる仕組み</em>をつくれる。</>}
        lead={<>MICHIRUです。福祉・医療の現場で対人支援の仕事を経験したあと、2025年10月に生成AIを学び始めました。いまは業務委託で4社と取引し、AIを使った業務システムの開発と、AI映像の制作をしています。</>}
      />

      <div className="facts">
        {facts.map((f) => (
          <div key={f.value}><b>{f.value}</b><span style={{ whiteSpace: 'pre-line' }}>{f.label}</span></div>
        ))}
      </div>

      <section className="block">
        <p className="eyebrow">STORY</p>
        <h2>「スキルが足りない」から<br />始まりました。</h2>
        <div className="story">
          <p>趣味で触り始めたAIが大好きになり、「仕事にしたら、ずっとAIを触っていられる」と思ってAIスクールの仕事に応募しました。勉強を始めて、まだ3か月のころです。</p>
          <p className="quote">「熱意はあるけど、スキルが足りない」</p>
          <p>面接ではそう言われました。「努力で追いつきます」と伝えて採用していただき、働き始める前に、1日10時間かけてスクールの教材をすべて学びました。</p>
          <p>いまは教材をつくる側として、専門知識のない方にもAIの使い方を伝えています。言ったことは、行動で証明する。それが、わたしの仕事のやり方です。</p>
        </div>
      </section>

      <section className="block">
        <p className="eyebrow">CAREER</p>
        <h2>経歴</h2>
        <ol className="timeline">
          {career.map((c) => (
            <li key={c.title} className={c.now ? 'now' : undefined}>
              <time>{c.when}</time>
              <h3>{c.title}</h3>
              {c.text && <p>{c.text}</p>}
              {c.points && <ul>{c.points.map((p) => <li key={p}>{p}</li>)}</ul>}
            </li>
          ))}
        </ol>
      </section>

      <section className="block">
        <p className="eyebrow">SKILLS</p>
        <h2>使える技術・道具</h2>
        <div className="skills">
          {skills.map((s) => (
            <div key={s.group}>
              <h3>{s.group}</h3>
              <div className="chips">{s.items.map((i) => <span key={i}>{i}</span>)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="block">
        <p className="eyebrow">VALUES</p>
        <h2>仕事で大事にしていること</h2>
        <div className="cards">
          {values.map((v, i) => (
            <div className="card" key={v.title}>
              <div className="no">{pad2(i + 1)}</div>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="block">
        <p className="eyebrow">CERTIFICATION</p>
        <h2>資格</h2>
        <div className="chips">
          <span>JADP認定 上級心理カウンセラー</span>
        </div>
      </section>

      <PageCta />
    </SubPage>
  );
}
