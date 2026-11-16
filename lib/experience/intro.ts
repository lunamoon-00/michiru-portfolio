// オープニング：LOADING のカウント → 「MICHIRU」のグリッチ → 画面が上下に開く
// 一度見た人は次から飛ばす。URLの最後に ?intro を付けると、もう一度見られる。
import { byId, reduceMotion, storage, wait } from './dom';
import { scramble } from './scramble';
import { glitch, state } from './state';

const KEY = 'michiru-intro';

/** obj[key] の値を、ms ミリ秒かけて to まで滑らかに動かす */
function tween<K extends string>(obj: Record<K, number>, key: K, to: number, ms: number) {
  return new Promise<void>((resolve) => {
    const from = obj[key], t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min((now - t0) / ms, 1), e = 1 - Math.pow(1 - k, 3);
      obj[key] = from + (to - from) * e;
      if (k < 1) requestAnimationFrame(step); else resolve();
    };
    step(t0);
  });
}

/** @param uIntro 粒が集まってくる進み具合（シェーダーの値） */
export async function runIntro(uIntro: { value: number }) {
  const intro = byId('intro');
  const seen = storage.get(KEY) === '1' && !new URLSearchParams(location.search).has('intro');
  let skipped = false;
  intro.addEventListener('click', () => { skipped = true; });

  if (!reduceMotion && !seen) {
    const num = intro.querySelector('#count b'), fill = byId('barfill');
    for (let i = 0; i <= 100 && !skipped; i += Math.ceil(Math.random() * 7)) {
      if (num) num.textContent = String(Math.min(i, 100));
      fill.style.width = `${Math.min(i, 100)}%`;
      await wait(40 + Math.random() * 50);
    }
    if (!skipped) { intro.classList.add('title'); glitch.set(1.4); await wait(1300); }
    intro.classList.add('flashline');
    await wait(380);
  }

  intro.classList.add('open');
  glitch.set(1);
  storage.set(KEY, '1');
  document.body.classList.remove('locked');   // スクロールできるようにする
  void tween(uIntro, 'value', 1, reduceMotion ? 1 : 2600);
  await wait(500);
  document.body.classList.add('ready');       // 文字がふわっと出てくる
  const k = state.mode === 'engineering' ? 'eng' : 'cre';
  document.querySelectorAll<HTMLElement>(`nav [data-scramble], .hero .${k}[data-scramble]`)
    .forEach((el, i) => setTimeout(() => scramble(el, 900), i * 90));
  await wait(900);
  intro.remove();
}
