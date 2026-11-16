// ENGINEERING ⇄ CREATIVE のモード切替
import { byId, MODE_KEY, reduceMotion, session } from './dom';
import { isCaseOpen } from './caseDialog';
import { scramble } from './scramble';
import { playTransition } from './transition';
import { state, type ModeName } from './state';

/** @param onApply モードが入れ替わった直後にすること（見せる数字・作品の選び直し、粒の形の変更） */
export function setupModeSwitch(onApply: () => void) {
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-set]');
  let switching = false;

  function apply(m: ModeName) {
    state.mode = m;
    document.documentElement.dataset.mode = m;   // CSS はこの値を見て、色・フォント・中身を入れ替える
    session.set(MODE_KEY, m);                     // ABOUT などへ移動しても、同じモードで見られるように
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.set === m)));
    const k = m === 'engineering' ? 'eng' : 'cre';
    document.querySelectorAll<HTMLElement>(`.${k}[data-scramble], [data-m="${k}"] [data-scramble]`).forEach((el) => scramble(el));
    scramble(byId('hud-mode'), 500, `MODE: ${m.toUpperCase()}`);
    onApply();
  }

  async function set(m: ModeName) {
    if (m === state.mode || switching) return;
    if (reduceMotion) { apply(m); return; }
    switching = true;
    // 画面が横じまで埋まる → 世界が入れ替わる → 横じまが引いていく
    await playTransition({
      sub: 'SWITCHING MODE', title: m.toUpperCase(), foot: '',
      kick: 1.4, hold: 700, settle: 550,
      onCovered: () => apply(m),
    });
    switching = false;
  }

  buttons.forEach((b) => b.addEventListener('click', () => set(b.dataset.set as ModeName)));
  // スペースキーでも切り替えられる（オープニング中と、作品の詳細を開いているときは除く）
  addEventListener('keydown', (e) => {
    if (e.code !== 'Space' || document.getElementById('intro') || isCaseOpen()) return;
    e.preventDefault();
    void set(state.mode === 'creative' ? 'engineering' : 'creative');
  });

  // 同じタブで前に CREATIVE を見ていたら、演出なしでそのモードから始める
  if (session.get(MODE_KEY) === 'creative') apply('creative');
}
