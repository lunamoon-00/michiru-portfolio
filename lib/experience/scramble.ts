// 文字のデコード演出：ランダムな記号が、左から順に本来の文字に変わっていく
import { reduceMotion } from './dom';

const GLYPHS = 'アイウエオカキクケコサシスセソタチツ01<>/\\|#$%&*+=';
const running = new WeakMap<HTMLElement, number>();   // 要素ごとの、動いている演出の番号（途中で止めるため）

/**
 * @param dur     何ミリ秒かけて元の文字に戻すか
 * @param newText 渡すと、この文字に書き換える
 */
export function scramble(el: HTMLElement, dur = 650, newText?: string) {
  if (newText !== undefined) el.dataset.text = newText;
  const text = (el.dataset.text ??= el.textContent ?? '');
  if (reduceMotion) { el.textContent = text; return; }

  cancelAnimationFrame(running.get(el) ?? 0);
  const t0 = performance.now();
  const step = (now: number) => {
    const k = (now - t0) / dur;
    let out = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const settled = ch === ' ' || i / text.length < k * 1.25 - 0.25;
      out += settled ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = out;
    if (k < 1) running.set(el, requestAnimationFrame(step));
    else el.textContent = text;
  };
  running.set(el, requestAnimationFrame(step));
}

/** メニューのリンクや作品カードにマウスが乗ったら、文字をデコードし直す */
export function scrambleOnHover() {
  document.querySelectorAll<HTMLElement>('a[data-scramble], .wcard').forEach((el) => {
    const target = el.matches('[data-scramble]') ? el : el.querySelector<HTMLElement>('[data-scramble]');
    if (target) el.addEventListener('mouseenter', () => scramble(target, 450));
  });
}
