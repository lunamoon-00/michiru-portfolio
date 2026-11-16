// 画面の動きで共通して使う、小さな道具

/** id で要素を取り出す。見つからないときは、原因がすぐ分かるようにエラーにする */
export function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} が見つかりません`);
  return el as T;
}

export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const pad2 = (n: number) => String(n).padStart(2, '0');

/** スマホ・タブレットくらいの幅か */
export const isSmall = () => innerWidth < 960;

/** 「動きを減らす」設定（OSのアクセシビリティ設定）がオンか。オンなら演出を控えめにする */
export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/** CSSで display:none になっていないか（いまのモードで見えているか） */
export const isShown = (el: HTMLElement) => getComputedStyle(el).display !== 'none';

/** 固定表示（sticky）のセクションの中で、どこまでスクロールが進んだか（0〜1） */
export function progressOf(sec: HTMLElement) {
  const r = sec.getBoundingClientRect();
  return clamp01(-r.top / (r.height - innerHeight));
}

/** data-text（スクランブル演出で使う本来の文字）があればそれを、なければ表示中の文字を返す */
export const textOf = (el: HTMLElement) => el.dataset.text || el.textContent || '';

/** いま見ているモードを、ページを移動しても続けるための保存場所（タブを閉じると消える） */
export const MODE_KEY = 'michiru-mode';
export const session = {
  get(key: string) {
    try { return sessionStorage.getItem(key); } catch { return null; }
  },
  set(key: string, value: string) {
    try { sessionStorage.setItem(key, value); } catch { /* 保存できなくても動きには影響しない */ }
  },
};

/** ブラウザに小さな設定を覚えておく。プライベートモードなどで使えなくても、止まらないようにする */
export const storage = {
  get(key: string) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key: string, value: string) {
    try { localStorage.setItem(key, value); } catch { /* 保存できなくても動きには影響しない */ }
  },
};
