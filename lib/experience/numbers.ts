// NUMBERS：大きな数字が、スクロールに合わせて画面を横切りながらカウントアップする
import { byId, clamp01, isShown, pad2, progressOf } from './dom';
import { scramble } from './scramble';
import { sfx } from './sound';
import { glitch, state } from './state';

const fmt = (el: HTMLElement, v: number) =>
  (el.dataset.prefix ?? '') + Math.round(v).toLocaleString('en-US') + (el.dataset.suffix ?? '');

export function setupNumbers() {
  const sec = byId('numbers');
  const all = [...sec.querySelectorAll<HTMLElement>('.bignum')];
  let shown: HTMLElement[] = [];   // いまのモードで見せる数字
  let active = -1;                 // いま真ん中にある数字の番号

  // 輪郭だけの数字（ゴースト）は、最初から最終の値にしておく
  all.forEach((el) => {
    const ghost = el.querySelector('.ghost');
    if (ghost) ghost.textContent = fmt(el, Number(el.dataset.value));
  });

  /** モードが変わったら、見せる数字を選び直す */
  function refresh() {
    shown = all.filter(isShown);
    sec.style.setProperty('--n', String(shown.length));   // 数字の数で、セクションの長さが決まる
    active = -1;
  }

  function update() {
    const p = progressOf(sec), N = shown.length, seg = p * N;
    if (!N) return;
    shown.forEach((el, j) => {
      const local = seg - j;   // この数字の進み具合（0：右端 → 1：左端）
      if (local < -0.05 || local > 1.05) { el.style.opacity = '0'; return; }
      const u = 1 - 2 * clamp01(local);                         // 1（右端）→ 0（真ん中）→ -1（左端）
      const x = Math.sign(u) * Math.pow(Math.abs(u), 3) * 85;    // 真ん中でゆっくりになる
      const k = 1 - Math.pow(1 - clamp01(local * 2.2), 3);       // 前半でカウントアップ
      const val = el.querySelector('.val');
      if (val) val.textContent = fmt(el, Number(el.dataset.value) * k);
      el.style.opacity = String(1 - Math.pow(Math.abs(u), 4));
      el.style.transform = `translate(calc(-50% + ${x}vw), -50%) skewX(${u * -12}deg)`;
      const jit = Math.abs(u) > 0.55 ? 1 : 0;                    // 出入りのときだけ、輪郭がブレる
      el.style.setProperty('--gx', `${jit * (Math.random() - 0.5) * 18}px`);
      el.style.setProperty('--gy', `${jit * (Math.random() - 0.5) * 6}px`);
    });

    byId('numBar').style.transform = `scaleX(${p})`;
    const i = Math.min(N - 1, Math.floor(seg));
    if (i === active) return;
    active = i;
    const el = shown[i];
    scramble(byId('numIdx'), 300, `${pad2(i + 1)} / ${pad2(N)}`);
    scramble(byId('numUnit'), 500, el.dataset.unit ?? '');
    byId('numText').textContent = el.dataset.text ?? '';
    if (state.activeSec === sec) { glitch.bump(0.5); sfx.hover(); }
  }

  return { refresh, update };
}
