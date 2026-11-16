// WORKS：縦にスクロールすると、作品カードが横に流れる。← → ボタンとキーボードでも移動できる
import { byId, isShown, pad2, progressOf, reduceMotion } from './dom';
import { isCaseOpen } from './caseDialog';
import { sfx } from './sound';
import { glitch, state } from './state';

export function setupWorks() {
  const sec = byId('works'), track = byId('track');
  const prev = byId<HTMLButtonElement>('wPrev'), next = byId<HTMLButtonElement>('wNext');
  const all = [...track.querySelectorAll<HTMLAnchorElement>('.wcard')];
  let cards: HTMLAnchorElement[] = [];   // いまのモードで見せるカード
  let active = -1;                       // いま真ん中にあるカードの番号

  /** モードが変わったら、見せるカードを選び直して、番号を振り直す */
  function refresh() {
    cards = all.filter(isShown);
    sec.style.setProperty('--n', String(cards.length));
    cards.forEach((c, j) => {
      const big = c.querySelector('.big');
      if (big) big.textContent = pad2(j + 1);
    });
    byId('wTotal').textContent = pad2(cards.length);
    active = -1;
  }

  function update() {
    const p = progressOf(sec);
    const max = track.scrollWidth - innerWidth;
    track.style.transform = `translate(${-p * max}px, -50%)`;
    const i = Math.round(p * (cards.length - 1));
    if (i === active) return;
    active = i;
    cards.forEach((c, j) => c.classList.toggle('active', j === i));
    byId('wIdx').textContent = pad2(i + 1);
    prev.disabled = i === 0;
    next.disabled = i === cards.length - 1;
    if (state.activeSec === sec) { glitch.bump(0.4); sfx.hover(); }
  }

  /** i 番目のカードが真ん中に来る位置まで、スクロールする */
  function go(i: number) {
    const target = Math.max(0, Math.min(cards.length - 1, i));
    const top = sec.getBoundingClientRect().top + scrollY;
    const range = sec.offsetHeight - innerHeight;
    const ratio = cards.length > 1 ? target / (cards.length - 1) : 0;
    scrollTo({ top: top + range * ratio, behavior: reduceMotion ? 'auto' : 'smooth' });
    sfx.click();
  }

  prev.addEventListener('click', () => go(active - 1));
  next.addEventListener('click', () => go(active + 1));
  addEventListener('keydown', (e) => {
    if (state.activeSec !== sec || isCaseOpen()) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); }
  });

  return { all, refresh, update };
}
