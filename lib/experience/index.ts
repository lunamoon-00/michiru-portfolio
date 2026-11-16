// 画面の動き（3Dの粒・スクロール演出・カーソル・音・オープニング）の入り口。
// React が画面（HTML）を作り終えたあとに、components/Experience.tsx から一度だけ呼ばれる。
// それぞれの役目は、同じフォルダの別のファイルに分けてある：
//   particles.ts（3Dの粒）  shapes.ts（粒の形）  shaders.ts（GPUのプログラム）  placement.ts（粒の置き場所）
//   numbers.ts（数字）  works.ts（作品の横スクロール）  caseDialog.ts（作品の詳細）  mode.ts（モード切替）
//   transition.ts（横じまの演出）  cursor.ts（カーソル）  hud.ts（計器の飾り）  sound.ts（効果音）
//   scramble.ts（文字のデコード）  intro.ts（オープニング）  state.ts（いまの状態）  dom.ts（共通の道具）
import { byId, reduceMotion, wait } from './dom';
import { state, glitch } from './state';
import { setupSoundButton, sfx } from './sound';
import { scramble, scrambleOnHover } from './scramble';
import { createParticles } from './particles';
import { SHAPE } from './shapes';
import { cardAspect, FRAME_W, placeFor } from './placement';
import { setupTransition } from './transition';
import { setupModeSwitch } from './mode';
import { setupNumbers } from './numbers';
import { setupWorks } from './works';
import { setupCaseDialog } from './caseDialog';
import { setupCursor } from './cursor';
import { setupHud, setupGraphLabels } from './hud';
import { runIntro } from './intro';
import * as THREE from 'three';

let started = false;   // 開発中は React が2回呼ぶことがあるので、2回目は何もしない

export async function startExperience() {
  if (started) return;
  started = true;

  document.documentElement.classList.add('fx');   // CSS：照準マークのカーソルを有効にする
  setupSoundButton(byId<HTMLButtonElement>('snd'));
  scrambleOnHover();
  setupTransition();

  // ---------- 3Dの粒 ----------
  // next/font が作ったフォント名を、CSS変数から読む（例：'VT323', 'VT323 Fallback'）
  const fontOf = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const fonts = { vt: fontOf('--font-vt'), bodoni: fontOf('--font-bodoni') };
  // 粒で文字を描く前に、フォントの読み込みを待つ（最大2秒）
  await Promise.race([
    Promise.all([document.fonts.load(`400 230px ${fonts.vt}`), document.fonts.load(`italic 700 210px ${fonts.bodoni}`)]),
    wait(2000),
  ]);
  const aspect = cardAspect();
  document.documentElement.style.setProperty('--ar', String(aspect));
  const particles = createParticles(byId<HTMLCanvasElement>('gl'), fonts, { w: FRAME_W, h: FRAME_W / aspect });
  const { camera, points, uniforms } = particles;

  // ---------- スクロールの演出 ----------
  const numbers = setupNumbers();
  const works = setupWorks();
  setupCaseDialog(works.all);

  /** セクションごと・モードごとの粒の形（data-eng / data-cre） */
  const shapeFor = (sec: HTMLElement) => Number(state.mode === 'engineering' ? sec.dataset.eng : sec.dataset.cre);

  const sections = [...document.querySelectorAll<HTMLElement>('.sec')];
  /** いま画面の真ん中にあるセクションを調べ、変わったら粒を変身させてグリッチを入れる */
  function updateSection() {
    const mid = innerHeight / 2;
    let best = sections[0], bestDist = Infinity;
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      const dist = (r.top <= mid && r.bottom >= mid) ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
      if (dist < bestDist) { bestDist = dist; best = s; }
    }
    if (best === state.activeSec) return;
    const first = state.activeSec === null;
    state.activeSec = best;
    particles.morphTo(shapeFor(best));
    const idx = String(sections.indexOf(best) + 1).padStart(2, '0');
    scramble(byId('hud-sec'), 400, `${idx} / ${best.dataset.name}`);
    if (!first && !reduceMotion) {
      document.body.classList.remove('glitching');
      void document.body.offsetWidth;   // アニメーションを最初からやり直すためのおまじない
      document.body.classList.add('glitching');
      glitch.set(1);
      sfx.glitch();
    }
    // はじめて来たセクションは、文字を出す演出をする
    if (!best.classList.contains('in') && best.id !== 'hero') {
      best.classList.add('in');
      best.querySelectorAll<HTMLElement>('[data-scramble]').forEach((el, i) => setTimeout(() => scramble(el, 800), i * 70));
    }
  }
  document.body.addEventListener('animationend', (e) => {
    if (e.animationName === 'flash') document.body.classList.remove('glitching');
  });
  addEventListener('scroll', updateSection, { passive: true });

  setupModeSwitch(() => {
    numbers.refresh();
    works.refresh();
    if (state.activeSec) particles.morphTo(shapeFor(state.activeSec));
  });

  const cursor = setupCursor(camera, uniforms.uMouse.value);
  const updateHud = setupHud();
  const updateLabels = setupGraphLabels();

  // ---------- 毎フレームの処理 ----------
  const clock = new THREE.Clock();
  let tiltX = 0, tiltY = 0;
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    // CREATIVE の度合いを、なめらかに 0 ⇄ 1 へ
    uniforms.uCre.value += ((state.mode === 'creative' ? 1 : 0) - uniforms.uCre.value) * Math.min(1, dt * 3);

    // 粒を、いまのセクションの置き場所へ少しずつ動かす
    if (state.activeSec) {
      const [x, y, s] = placeFor(state.activeSec.dataset.name ?? '', camera.aspect), k = Math.min(1, dt * 2.5);
      points.position.x += (x - points.position.x) * k;
      points.position.y += (y - points.position.y) * k;
      points.scale.setScalar(points.scale.x + (s - points.scale.x) * k);
    }
    // マウスの方向に少し傾ける（作品の枠のときは、カードとずれるので傾けない）
    const flat = particles.current === SHAPE.frame, tilt = cursor.inside && !flat;
    tiltX += ((tilt ? cursor.mouse.y * 0.15 : 0) - tiltX) * dt * 2;
    tiltY += ((tilt ? cursor.mouse.x * 0.25 : 0) - tiltY) * dt * 2;
    points.rotation.set(-tiltX, tiltY + (flat ? 0 : Math.sin(uniforms.uTime.value * 0.25) * 0.12), 0);
    points.updateMatrixWorld();

    updateLabels(particles.current === SHAPE.graph && uniforms.uMix.value > 0.95, points, camera);
    numbers.update();
    works.update();
    cursor.update(dt);
    updateHud(dt);

    // 色のずれ：ふだんはわずか。粒の変身中とグリッチの瞬間に強くなる
    glitch.decay(dt);
    const amount = reduceMotion ? 0 : 0.0015 + particles.morphing * 0.006 + glitch.kick * 0.014;
    particles.render(dt, amount);
    requestAnimationFrame(frame);
  }

  numbers.refresh();
  works.refresh();
  updateSection();
  particles.settle();
  frame();

  await runIntro(uniforms.uIntro);
}
