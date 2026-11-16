// ABOUT・HOW I BUILD などのサブページの外枠。
// 背景（マス目・星雲・走査線）と四隅の枠だけを出し、3Dの粒は出さない（読みやすさを優先）
import type { ReactNode } from 'react';
import { CONTACT_EMAIL } from '@/lib/content';
import { Nav } from './Nav';
import { ModeSync } from './ModeSync';

export function SubPage({ current, children }: { current: '/how-i-build' | '/about'; children: ReactNode }) {
  return (
    <>
      <div className="gridlines" />
      <div className="nebula" />
      <div className="scanlines" />
      <div className="hud" aria-hidden="true">
        <i className="c tl" /><i className="c tr" /><i className="c bl" /><i className="c br" />
      </div>
      <Nav current={current} />
      <main className="page">{children}</main>
      <footer>© 2026 MICHIRU — BUILT WITH CLAUDE CODE</footer>
      <ModeSync />
    </>
  );
}

/** ページの見出し部分 */
export function PageHead({ eyebrow, title, lead }: { eyebrow: string; title: ReactNode; lead: ReactNode }) {
  return (
    <header className="page-head">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="lead">{lead}</p>
    </header>
  );
}

/** ページの最後のお問い合わせ */
export function PageCta() {
  const mailto = (subject: string) => `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
  return (
    <section className="page-cta">
      <p className="eyebrow">CONTACT</p>
      <h2>LET&apos;S<br /><em>BUILD.</em></h2>
      <div className="ctas">
        <a href={mailto('【採用・業務委託】ポートフォリオを拝見しました')} className="btn primary"><small>FOR RECRUITERS</small>採用・業務委託のご連絡</a>
        <a href={mailto('【ご相談】MV・映像・仕組み化について')} className="btn"><small>FOR CLIENTS</small>MV・映像・仕組み化のご相談</a>
      </div>
    </section>
  );
}
