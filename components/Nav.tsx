// 上に固定されるメニュー。ロゴ・モード切替・ページへのリンク
// ページをまたぐリンクは、ふつうの <a> にしている（ページを読み込み直して、動きのスクリプトを最初から始めるため）
/* eslint-disable @next/next/no-html-link-for-pages -- 上の理由で、わざと <Link> を使っていない */

export function ModeButtons() {
  return (
    <>
      <button data-set="engineering" aria-pressed="true" data-cursor="SWITCH">ENGINEERING</button>
      <button data-set="creative" aria-pressed="false" data-cursor="SWITCH">CREATIVE</button>
    </>
  );
}

const LINKS = [
  { href: '/#works', label: 'WORKS', cursor: 'JUMP' },
  { href: '/how-i-build', label: 'HOW I BUILD', cursor: 'OPEN' },
  { href: '/about', label: 'ABOUT', cursor: 'OPEN' },
  { href: '/#contact', label: 'CONTACT', cursor: 'JUMP' },
];

/** @param current いま開いているページ（そのリンクに下線を引く） */
export function Nav({ current }: { current?: '/how-i-build' | '/about' }) {
  return (
    <nav>
      <a href="/" className="logo">MICHIRU<span>.</span></a>
      <div className="mswitch" role="group" aria-label="表示モード">
        <ModeButtons />
      </div>
      <div className="links">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} data-scramble="" data-cursor={l.cursor}
            aria-current={l.href === current ? 'page' : undefined}>{l.label}</a>
        ))}
      </div>
    </nav>
  );
}
