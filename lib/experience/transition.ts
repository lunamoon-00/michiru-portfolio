// 画面を横じまで覆い、真ん中に文字を出してから、横じまが引いていく演出（モード切替・作品を開くとき）
import { byId, wait } from './dom';
import { scramble } from './scramble';
import { sfx } from './sound';
import { glitch } from './state';

const BARS = 12;

export function setupTransition() {
  const tx = byId('tx');
  for (let i = 0; i < BARS; i++) {
    const bar = document.createElement('i');
    bar.style.setProperty('--d', `${Math.random() * 0.18}s`);        // 1本ずつ、少しずらして動かす
    bar.style.setProperty('--o', i % 2 ? 'right' : 'left');           // 左右から交互に伸びる
    tx.appendChild(bar);
  }
}

/** 横じまを引かせる（伸びてきた方向と反対へ縮む） */
function cover(off: boolean) {
  const tx = byId('tx');
  if (!off) { tx.classList.add('on'); return; }
  tx.classList.remove('show');
  glitch.bump(1.2);
  sfx.glitch();
  tx.querySelectorAll<HTMLElement>('i').forEach((bar) => {
    const from = getComputedStyle(bar).getPropertyValue('--o').trim();
    bar.style.setProperty('--o', from === 'left' ? 'right' : 'left');
  });
  tx.classList.remove('on');
}

type Options = {
  sub: string;              // 上の小さい文字
  title: string;            // 真ん中の大きい文字
  foot: string;             // 下の小さい文字
  kick: number;             // 始まりのグリッチの強さ
  hold: number;             // 文字を見せておく時間（ミリ秒）
  settle: number;           // 横じまが引ききるまで待つ時間（ミリ秒）
  onCovered?: () => void;   // 画面が隠れた瞬間にすること（モードの入れ替えなど）
  onReveal?: () => void;    // 横じまが引く直前にすること（作品の詳細を開くなど）
};

export async function playTransition(o: Options) {
  glitch.set(o.kick);
  sfx.tx();
  byId('txFoot').textContent = o.foot;
  cover(false);
  await wait(450);
  o.onCovered?.();
  byId('tx').classList.add('show');
  scramble(byId('txSub'), 400, o.sub);
  scramble(byId('txTitle'), 600, o.title);
  await wait(o.hold);
  o.onReveal?.();
  cover(true);
  await wait(o.settle);
}
