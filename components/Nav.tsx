// 上に固定されるメニュー。ロゴ・モード切替・ページ内リンク

export function ModeButtons() {
  return (
    <>
      <button data-set="engineering" aria-pressed="true" data-cursor="SWITCH">ENGINEERING</button>
      <button data-set="creative" aria-pressed="false" data-cursor="SWITCH">CREATIVE</button>
    </>
  );
}

export function Nav() {
  return (
    <nav>
      <a href="#hero" className="logo">MICHIRU<span>.</span></a>
      <div className="mswitch" role="group" aria-label="表示モード">
        <ModeButtons />
      </div>
      <div className="links">
        <a href="#works" data-scramble="" data-cursor="JUMP">WORKS</a>
        <a href="#" data-scramble="" data-cursor="SOON">HOW I BUILD</a>
        <a href="#" data-scramble="" data-cursor="SOON">ABOUT</a>
        <a href="#contact" data-scramble="" data-cursor="JUMP">CONTACT</a>
      </div>
    </nav>
  );
}
