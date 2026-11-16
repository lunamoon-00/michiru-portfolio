// 画面の動き（3Dの粒・スクロール演出・カーソル・音・オープニング）をまとめたスクリプト。
// 試作（prototype/index.html）の <script> をそのまま移したもの。
// React が画面（HTML）を作り終えたあとに、components/Experience.tsx から一度だけ呼ばれる。
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

import { works } from '@/lib/content';

let started = false;   // 開発中は React が2回呼ぶことがあるので、2回目は何もしない

export async function startExperience(){
  if (started) return;
  started = true;

  const root = document.documentElement;
  const fontOf = v => getComputedStyle(root).getPropertyValue(v).trim();   // 例：--font-vt → 'VT323', 'VT323 Fallback'
  const VT = fontOf('--font-vt'), BODONI = fontOf('--font-bodoni');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmall = () => innerWidth < 960;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const clamp01 = v => Math.min(1, Math.max(0, v));

  /* ================================================================
     音（WebAudio で、その場で電子音を合成する。音声ファイルは使わない）
     ================================================================ */
  let audio = null, soundOn = false;
  try { soundOn = localStorage.getItem('michiru-sound') === '1'; } catch {}
  const ac = () => (audio ??= new AudioContext());
  function tone(f0, f1, dur, type = 'sine', gain = .03){
    if (!soundOn) return;
    const a = ac(), t = a.currentTime, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + .02);
  }
  function noise(dur, gain = .04, f0 = 3000, f1 = f0){
    if (!soundOn) return;
    const a = ac(), t = a.currentTime, buf = a.createBuffer(1, a.sampleRate * dur, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = a.createBufferSource(), bp = a.createBiquadFilter(), g = a.createGain();
    s.buffer = buf; bp.type = 'bandpass'; bp.Q.value = 2;
    bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(bp).connect(g).connect(a.destination); s.start(t);
  }
  const sfx = {
    hover:  () => tone(2400, 2200, .03, 'sine', .025),
    click:  () => tone(300, 1300, .16, 'square', .02),
    glitch: () => noise(.14, .05, 2600),
    morph:  () => noise(.7, .025, 400, 2400),
    tx:     () => { tone(1600, 70, .45, 'sawtooth', .025); noise(.35, .04, 5000, 300); },
  };
  const sndBtn = document.getElementById('snd');
  const paintSnd = () => { sndBtn.textContent = soundOn ? 'SOUND ON' : 'SOUND OFF'; sndBtn.classList.toggle('on', soundOn); };
  paintSnd();
  sndBtn.addEventListener('click', () => {
    soundOn = !soundOn; paintSnd();
    try { localStorage.setItem('michiru-sound', soundOn ? '1' : '0'); } catch {}
    if (soundOn){ ac().resume(); sfx.click(); }
  });

  /* ================================================================
     文字のデコード演出（ランダムな記号 → 本来の文字）
     ================================================================ */
  const GLYPHS = 'アイウエオカキクケコサシスセソタチツ01<>/\\|#$%&*+=';
  function scramble(el, dur = 650, newText){
    if (newText !== undefined) el.dataset.text = newText;
    const text = el.dataset.text ??= el.textContent;
    if (reduceMotion){ el.textContent = text; return; }
    cancelAnimationFrame(el._raf);
    const t0 = performance.now();
    const step = now => {
      const k = (now - t0) / dur; let out = '';
      for (let i = 0; i < text.length; i++){
        const ch = text[i];
        out += (ch === ' ' || i / text.length < k * 1.25 - .25) ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (k < 1) el._raf = requestAnimationFrame(step); else el.textContent = text;
    };
    el._raf = requestAnimationFrame(step);
  }
  document.querySelectorAll('a[data-scramble], .wcard').forEach(el => {
    const target = el.matches('[data-scramble]') ? el : el.querySelector('[data-scramble]');
    el.addEventListener('mouseenter', () => scramble(target, 450));
  });

  /* ================================================================
     粒の「形」を5種類つくる
     ================================================================ */
  const COUNT = (isSmall() || (navigator.hardwareConcurrency || 4) <= 4) ? 9000 : 22000;
  function pixelsOf(draw, W, H){
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'); draw(g);
    const d = g.getImageData(0, 0, W, H).data, pts = [];
    for (let i = 0; i < W * H; i += 2) if (d[i * 4 + 3] > 128) pts.push(i);
    return pts;
  }
  // 形0：光の球と、そのまわりを回る輪（音楽・MVの世界観）
  function shapeSphere(n){
    const out = new Float32Array(n * 3), golden = Math.PI * (3 - Math.sqrt(5)), tilt = .42;
    for (let i = 0; i < n; i++){
      let x, y, z;
      if (Math.random() < .68){                       // 球の表面に均等に並べる
        const k = i / n, yy = 1 - 2 * k, rr = Math.sqrt(1 - yy * yy), th = golden * i;
        x = Math.cos(th) * rr * 1.25; y = yy * 1.25; z = Math.sin(th) * rr * 1.25;
      } else {                                        // 斜めに傾いた輪
        const ang = Math.random() * Math.PI * 2, R = 1.7 + Math.pow(Math.random(), 2) * .55;
        const rx = Math.cos(ang) * R, rz = Math.sin(ang) * R, ry = (Math.random() - .5) * .03;
        x = rx; y = ry * Math.cos(tilt) - rz * Math.sin(tilt); z = ry * Math.sin(tilt) + rz * Math.cos(tilt);
      }
      out[i*3] = x; out[i*3+1] = y; out[i*3+2] = z;
    }
    return out;
  }
  // 形1：システムの構成図
  const NODES = [
    { name:'PDF', p:[-1.25,.9,0] }, { name:'OCR', p:[-0.4,.9,.3] }, { name:'LLM API', p:[0.5,.9,-.2] },
    { name:'Slack', p:[1.7,1.4,.2] }, { name:'Cloud Run', p:[0.4,-.4,.4] }, { name:'Supabase', p:[-0.7,-.9,-.3] },
    { name:'GAS', p:[1.6,-.2,-.3] }, { name:'Monthly Report', p:[1.4,-1.4,.2] },
  ];
  const EDGES = [[0,1],[1,2],[2,3],[2,4],[4,5],[4,6],[6,3],[5,7],[6,7],[1,5]];
  function shapeGraph(n){
    const out = new Float32Array(n * 3);
    for (let i = 0; i < n; i++){
      let x, y, z;
      if (Math.random() < .42){
        const c = NODES[(Math.random() * NODES.length) | 0].p;
        const r = .16 * Math.cbrt(Math.random()), th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
        x = c[0] + r*Math.sin(ph)*Math.cos(th); y = c[1] + r*Math.sin(ph)*Math.sin(th); z = c[2] + r*Math.cos(ph);
      } else {
        const [a, b] = EDGES[(Math.random() * EDGES.length) | 0], t = Math.random(), A = NODES[a].p, B = NODES[b].p, j = .018;
        x = A[0]+(B[0]-A[0])*t+(Math.random()-.5)*j; y = A[1]+(B[1]-A[1])*t+(Math.random()-.5)*j; z = A[2]+(B[2]-A[2])*t+(Math.random()-.5)*j;
      }
      out[i*3] = x; out[i*3+1] = y; out[i*3+2] = z;
    }
    return out;
  }
  // 形2：数字「1h→3min」
  function shapeText(n, label = '1h→3min', font = `400 230px ${VT}`){
    const W = 1024, H = 256;
    const pts = pixelsOf(g => {
      g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = font; g.fillText(label, W/2, H/2);
    }, W, H);
    const out = new Float32Array(n * 3);
    for (let i = 0; i < n; i++){
      const idx = pts[(Math.random() * pts.length) | 0];
      out[i*3]   = ((idx % W) - W/2) / (W/2) * 2.7 + (Math.random() - .5) * .01;
      out[i*3+1] = -(((idx / W) | 0) - H/2) / (W/2) * 2.7 + (Math.random() - .5) * .01;
      out[i*3+2] = (Math.random() - .5) * .25;
    }
    return out;
  }
  // 形3：作品を囲むフレーム（真ん中のカードを、粒の照準が囲む）
  const CARD_AR = isSmall() ? 10/9 : 16/11;   // カードの縦横の比。粒の枠もこれに合わせる
  document.documentElement.style.setProperty('--ar', CARD_AR);
  const FW = 3.2, FH = FW / CARD_AR;
  function shapeFrame(n){
    const out = new Float32Array(n * 3);
    for (let i = 0; i < n; i++){
      let x, y; const r = Math.random();
      if (r < .45){                       // 四隅のかぎかっこ（濃く）
        const cx = Math.random() < .5 ? -1 : 1, cy = Math.random() < .5 ? -1 : 1, L = .42, o = .1, t = Math.random() * L;
        if (Math.random() < .5){ x = cx * (FW/2 + o - t); y = cy * (FH/2 + o); }
        else                   { x = cx * (FW/2 + o);     y = cy * (FH/2 + o - t); }
      } else if (r < .8){                 // 外枠
        const side = (Math.random() * 4) | 0, t = Math.random() - .5;
        x = side < 2 ? t * FW : (side === 2 ? -.5 : .5) * FW;
        y = side < 2 ? (side ? -.5 : .5) * FH : t * FH;
      } else {                            // 外側にただよう粒
        const a = Math.random() * Math.PI * 2, d = 2.2 + Math.random() * 2.5;
        x = Math.cos(a) * d * 1.3; y = Math.sin(a) * d * .8;
      }
      out[i*3] = x + (Math.random() - .5) * .012; out[i*3+1] = y + (Math.random() - .5) * .012; out[i*3+2] = (Math.random() - .5) * .3;
    }
    return out;
  }
  // 形4：数字の後ろで回る、光の輪（トンネル）
  function shapeRing(n){
    const out = new Float32Array(n * 3);
    for (let i = 0; i < n; i++){
      const a = Math.random() * Math.PI * 2, layer = (Math.random() * 3) | 0;
      const R = 1.7 + layer * .55 + (Math.random() - .5) * .08, z = -layer * 1.2 + (Math.random() - .5) * .2;
      out[i*3] = Math.cos(a) * R; out[i*3+1] = Math.sin(a) * R; out[i*3+2] = z;
    }
    return out;
  }

  /* ================================================================
     Three.js の準備
     ================================================================ */
  await Promise.race([Promise.all([document.fonts.load(`400 230px ${VT}`), document.fonts.load(`italic 700 210px ${BODONI}`)]), wait(2000)]);

  // 色の変換をしない（変換すると暗い背景がグレーに持ち上がるため）
  THREE.ColorManagement.enabled = false;
  const canvas = document.getElementById('gl');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:false, powerPreference:'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, isSmall() ? 1.25 : 1.75));
  renderer.setClearColor(0x06050b, 1);
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, .1, 100);
  camera.position.set(0, 0, 6);

  const geo = new THREE.BufferGeometry();
  const rand = new Float32Array(COUNT); for (let i = 0; i < COUNT; i++) rand[i] = Math.random();
  geo.setAttribute('position', new THREE.BufferAttribute(shapeSphere(COUNT), 3));
  geo.setAttribute('aS1', new THREE.BufferAttribute(shapeGraph(COUNT), 3));
  geo.setAttribute('aS2', new THREE.BufferAttribute(shapeText(COUNT), 3));
  geo.setAttribute('aS3', new THREE.BufferAttribute(shapeFrame(COUNT), 3));
  geo.setAttribute('aS4', new THREE.BufferAttribute(shapeRing(COUNT), 3));
  geo.setAttribute('aS5', new THREE.BufferAttribute(shapeText(COUNT, '105K', `italic 700 210px ${BODONI}`), 3));
  geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));

  const uniforms = {
    uTime:{value:0}, uFrom:{value:0}, uTo:{value:0}, uMix:{value:1}, uIntro:{value:reduceMotion ? 1 : 0},
    uMouse:{value:new THREE.Vector3(99,99,0)}, uCre:{value:0}, uSize:{value:isSmall() ? 20 : 26}, uPixel:{value:renderer.getPixelRatio()},
  };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
    vertexShader:/* glsl */`
      attribute vec3 aS1, aS2, aS3, aS4, aS5; attribute float aRand;
      uniform float uTime, uFrom, uTo, uMix, uIntro, uSize, uPixel, uCre; uniform vec3 uMouse;
      varying vec3 vColor; varying float vAlpha;
      vec3 sphereWave(vec3 q){
        // 球の表面が、音楽に合わせるように波打つ。輪はゆっくり回る
        if (length(q) < 1.4){
          float w = sin(q.x*3.1 + uTime*1.7) * sin(q.y*3.7 - uTime*1.3) * sin(q.z*2.9 + uTime*.9);
          return q * (1. + .14*w);
        }
        float a = uTime * .18;
        return vec3(cos(a)*q.x - sin(a)*q.z, q.y, sin(a)*q.x + cos(a)*q.z);
      }
      vec3 shapeOf(float i){ if(i<.5) return sphereWave(position); if(i<1.5) return aS1; if(i<2.5) return aS2; if(i<3.5) return aS3; if(i<4.5) return aS4; return aS5; }
      vec3 colorOf(float i, float r){
        if(i<.5) return mix(vec3(1.,.42,.82), vec3(.62,.45,1.), r);
        if(i<1.5) return mix(vec3(.3,1.,.7), vec3(.25,.75,1.), r);
        if(i<2.5) return mix(vec3(.35,.95,1.), vec3(1.,.4,.85), r);
        vec3 purple = mix(vec3(.72,.45,1.), vec3(1.,.45,.82), r);   // クリエイティブのときは、枠や輪も紫に
        if(i<3.5) return mix(mix(vec3(.55,.5,1.), vec3(.3,.9,.9), r), purple, uCre);
        if(i<4.5) return mix(mix(vec3(1.,.4,.85), vec3(.35,.95,1.), r), purple, uCre);
        return mix(vec3(.72,.45,1.), vec3(1.,.45,.82), r);   // 105K：紫〜ピンク
      }
      float brightOf(float i){ if(i<.5) return 1.; if(i<1.5) return .6; if(i<2.5) return .38; if(i<3.5) return .55; if(i<4.5) return .32; return .4; }
      vec3 dir(float r){ return normalize(vec3(sin(r*91.7), cos(r*57.3), sin(r*13.1+1.))); }
      float hash(float n){ return fract(sin(n)*43758.5453); }
      void main(){
        float d = clamp(uMix*1.5 - aRand*.5, 0., 1.);
        float t = d*d*(3.-2.*d);
        float burst = sin(t*3.14159);
        vec3 p = mix(shapeOf(uFrom), shapeOf(uTo), t);
        // 輪の形のときは、ゆっくり回す
        float spin = uTime*.15*(1.+aRand);
        vec3 ring = vec3(cos(spin)*p.x - sin(spin)*p.y, sin(spin)*p.x + cos(spin)*p.y, p.z);
        p = mix(p, ring, (uTo > 3.5 && uTo < 4.5 ? t : 0.) + (uFrom > 3.5 && uFrom < 4.5 ? 1.-t : 0.));
        p += dir(aRand) * burst * 1.1;
        p.x += step(.96, hash(aRand*999. + floor(uTime*24.))) * burst * .5;
        p += .025*vec3(sin(uTime*1.3+aRand*40.), cos(uTime+aRand*30.), sin(uTime*.7+aRand*20.));
        vec3 scatter = dir(aRand*3.7) * (6. + aRand*6.);
        float it = smoothstep(0., 1., clamp(uIntro*1.4 - aRand*.4, 0., 1.));
        p = mix(scatter, p, it);

        vec4 world = modelMatrix * vec4(p, 1.);
        vec2 away = world.xy - uMouse.xy;
        world.xy += normalize(away + 1e-4) * smoothstep(.9, 0., length(away)) * .45;
        vec4 view = viewMatrix * world;
        gl_Position = projectionMatrix * view;
        gl_PointSize = uSize * uPixel * (.35 + aRand*.75) / -view.z;
        vColor = mix(colorOf(uFrom, aRand), colorOf(uTo, aRand), t);
        vAlpha = (.8 + .25*sin(uTime*2. + aRand*60.)) * mix(brightOf(uFrom), brightOf(uTo), t) * it;
      }`,
    fragmentShader:/* glsl */`
      varying vec3 vColor; varying float vAlpha;
      void main(){
        float a = smoothstep(.5, .0, length(gl_PointCoord - .5));
        gl_FragColor = vec4(vColor, a*a*vAlpha);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  /* ================================================================
     ポストエフェクト：光のにじみ（ブルーム）＋色のずれ（色収差）＋横ずれノイズ
     ================================================================ */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), .55, .35, .22); // 強さ・広がり・光り始める明るさ
  composer.addPass(bloom);
  const rgb = new ShaderPass({
    uniforms:{ tDiffuse:{value:null}, uAmount:{value:.0015}, uTime:{value:0} },
    vertexShader:`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader:/* glsl */`
      uniform sampler2D tDiffuse; uniform float uAmount, uTime; varying vec2 vUv;
      float hash(float n){ return fract(sin(n)*43758.5453); }
      void main(){
        vec2 uv = vUv, c = uv - .5;
        // 強いときだけ、横じまの帯がランダムにずれる
        float band = floor(uv.y*36.) + floor(uTime*28.);
        uv.x += step(1. - uAmount*9., hash(band)) * (hash(band+7.)-.5) * uAmount * 8.;
        float a = uAmount * (.4 + length(c)*1.6);
        vec4 col = texture2D(tDiffuse, uv);
        col.r = texture2D(tDiffuse, uv + c*a).r;
        col.b = texture2D(tDiffuse, uv - c*a).b;
        gl_FragColor = col;
      }`,
  });
  composer.addPass(rgb);
  let kick = 0;   // グリッチの強さ。切り替えの瞬間に上げて、すぐ下がる

  /* ================================================================
     形の切り替え
     ================================================================ */
  let current = 0;
  function morphTo(shape){
    if (shape === current) return;
    uniforms.uFrom.value = uniforms.uMix.value > .5 ? current : uniforms.uFrom.value;
    uniforms.uTo.value = current = shape;
    uniforms.uMix.value = reduceMotion ? 1 : 0;
    sfx.morph();
  }
  const shapeFor = sec => +(mode === 'engineering' ? sec.dataset.eng : sec.dataset.cre);
  const pxPerUnit = () => innerHeight / (2 * 6 * Math.tan(THREE.MathUtils.degToRad(22.5)));
  function placeFor(name){
    const a = camera.aspect, small = isSmall();
    if (name === 'WORKS'){       // 真ん中のカードをぴったり囲む大きさにする
      const cw = Math.min(620, innerWidth * .8);
      return [0, 0, (cw + 30) / (FW * pxPerUnit())];
    }
    if (small) return { HERO:[0,1.55,Math.min(.5,a*.75)], IMPACT:[0,1.45,Math.min(.5,a*.55)], NUMBERS:[0,.45,Math.min(.85,a*.7)], CONTACT:[0,1.6,Math.min(.48,a*.7)] }[name];
    return { HERO:[1.8,.05,.9], IMPACT:[.2,1.3,.75], NUMBERS:[0,.1,1.2], CONTACT:[1.9,0,.85] }[name];
  }
  function resize(){
    renderer.setSize(innerWidth, innerHeight, false);
    composer.setSize(innerWidth, innerHeight);
    bloom.resolution.set(innerWidth / 2, innerHeight / 2);
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();

  /* ================================================================
     モード切替
     ================================================================ */
  let mode = 'engineering', switching = false;
  const modeButtons = document.querySelectorAll('[data-set]');
  function applyMode(m){
    mode = m; root.dataset.mode = m;
    modeButtons.forEach(b => b.setAttribute('aria-pressed', b.dataset.set === m));
    const k = m === 'engineering' ? 'eng' : 'cre';
    document.querySelectorAll(`.${k}[data-scramble], [data-m="${k}"] [data-scramble]`).forEach(el => scramble(el));
    scramble(document.getElementById('hud-mode'), 500, `MODE: ${m.toUpperCase()}`);
    refreshLists();
    if (activeSec) morphTo(shapeFor(activeSec));
  }
  async function setMode(m){
    if (m === mode || switching) return;
    if (reduceMotion){ applyMode(m); return; }
    switching = true;
    // 画面が横じまで埋まる → 世界が入れ替わる → 横じまが引いていく
    kick = 1.4; sfx.tx(); tx.classList.add('on');
    await wait(450);
    applyMode(m);
    document.getElementById('txFoot').textContent = '';
    tx.classList.add('show');
    scramble(document.getElementById('txSub'), 400, 'SWITCHING MODE');
    scramble(document.getElementById('txTitle'), 600, m.toUpperCase());
    await wait(700);
    txOut();
    await wait(550); switching = false;
  }
  modeButtons.forEach(b => b.addEventListener('click', () => setMode(b.dataset.set)));
  addEventListener('keydown', e => {
    if (e.code === 'Space' && !document.getElementById('intro') && !document.getElementById('case').classList.contains('open')){ e.preventDefault(); setMode(mode === 'creative' ? 'engineering' : 'creative'); }
  });

  /* ================================================================
     スクロール：今見ているセクションの判定 → 粒の変身＋グリッチ
     ================================================================ */
  const sections = [...document.querySelectorAll('.sec')];
  let activeSec = null;
  function updateSection(){
    const mid = innerHeight / 2;
    let best = sections[0], bestDist = Infinity;
    for (const s of sections){
      const r = s.getBoundingClientRect();
      const dist = (r.top <= mid && r.bottom >= mid) ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
      if (dist < bestDist){ bestDist = dist; best = s; }
    }
    if (best === activeSec) return;
    const first = activeSec === null;
    activeSec = best;
    morphTo(shapeFor(best));
    const idx = String(sections.indexOf(best) + 1).padStart(2, '0');
    scramble(document.getElementById('hud-sec'), 400, `${idx} / ${best.dataset.name}`);
    if (!first && !reduceMotion){
      document.body.classList.remove('glitching'); void document.body.offsetWidth;
      document.body.classList.add('glitching'); kick = 1; sfx.glitch();
    }
    if (!best.classList.contains('in') && best.id !== 'hero'){
      best.classList.add('in');
      best.querySelectorAll('[data-scramble]').forEach((el, i) => setTimeout(() => scramble(el, 800), i * 70));
    }
  }
  document.body.addEventListener('animationend', e => { if (e.animationName === 'flash') document.body.classList.remove('glitching'); });
  addEventListener('scroll', updateSection, { passive:true });
  // 固定セクションの中で、どこまで進んだか（0〜1）
  const progressOf = sec => { const r = sec.getBoundingClientRect(); return clamp01(-r.top / (r.height - innerHeight)); };

  /* ---------- NUMBERS：巨大な数字が画面を横切りながらカウントアップ ---------- */
  const numSec = document.getElementById('numbers');
  const allBigs = [...numSec.querySelectorAll('.bignum')];
  let bigs = [];
  const fmt = (el, v) => (el.dataset.prefix || '') + Math.round(v).toLocaleString('en-US') + (el.dataset.suffix || '');
  allBigs.forEach(el => el.querySelector('.ghost').textContent = fmt(el, +el.dataset.value));
  let numActive = -1;
  function updateNumbers(){
    const p = progressOf(numSec), N = bigs.length, seg = p * N;
    bigs.forEach((el, j) => {
      const local = seg - j;
      if (local < -.05 || local > 1.05){ el.style.opacity = 0; return; }
      const u = 1 - 2 * clamp01(local);                       // 1（右端）→ 0（真ん中）→ -1（左端）
      const x = Math.sign(u) * Math.pow(Math.abs(u), 3) * 85;  // 真ん中でゆっくりになる
      const k = 1 - Math.pow(1 - clamp01(local * 2.2), 3);     // 前半でカウントアップ
      el.querySelector('.val').textContent = fmt(el, +el.dataset.value * k);
      el.style.opacity = 1 - Math.pow(Math.abs(u), 4);
      el.style.transform = `translate(calc(-50% + ${x}vw), -50%) skewX(${u * -12}deg)`;
      const jit = Math.abs(u) > .55 ? 1 : 0;                   // 出入りのときだけ、輪郭がブレる
      el.style.setProperty('--gx', `${jit * (Math.random() - .5) * 18}px`);
      el.style.setProperty('--gy', `${jit * (Math.random() - .5) * 6}px`);
    });
    const i = Math.min(N - 1, Math.floor(seg));
    document.getElementById('numBar').style.transform = `scaleX(${p})`;
    if (i !== numActive){
      numActive = i; const el = bigs[i];
      scramble(document.getElementById('numIdx'), 300, `${String(i + 1).padStart(2,'0')} / ${String(N).padStart(2,'0')}`);
      scramble(document.getElementById('numUnit'), 500, el.dataset.unit);
      document.getElementById('numText').textContent = el.dataset.text;
      if (activeSec === numSec){ kick = Math.max(kick, .5); sfx.hover(); }
    }
  }

  /* ---------- WORKS：縦スクロールで横に流れる ---------- */
  const workSec = document.getElementById('works'), track = document.getElementById('track');
  const allCards = [...track.querySelectorAll('.wcard')];
  let cards = [];
  const shown = el => getComputedStyle(el).display !== 'none';
  function refreshLists(){
    bigs = allBigs.filter(shown); cards = allCards.filter(shown);
    numSec.style.setProperty('--n', bigs.length); workSec.style.setProperty('--n', cards.length);
    cards.forEach((c, j) => c.querySelector('.big').textContent = String(j + 1).padStart(2, '0'));
    document.getElementById('wTotal').textContent = String(cards.length).padStart(2, '0');
    numActive = workActive = -1;
  }
  let workActive = -1;
  function updateWorks(){
    const p = progressOf(workSec);
    const max = track.scrollWidth - innerWidth;
    track.style.transform = `translate(${-p * max}px, -50%)`;
    const i = Math.round(p * (cards.length - 1));
    if (i !== workActive){
      workActive = i;
      cards.forEach((c, j) => c.classList.toggle('active', j === i));
      document.getElementById('wIdx').textContent = String(i + 1).padStart(2, '0');
      if (activeSec === workSec){ kick = Math.max(kick, .4); sfx.hover(); }
      document.getElementById('wPrev').disabled = i === 0;
      document.getElementById('wNext').disabled = i === cards.length - 1;
    }
  }
  function goWork(i){
    i = Math.max(0, Math.min(cards.length - 1, i));
    const top = workSec.getBoundingClientRect().top + scrollY;
    const range = workSec.offsetHeight - innerHeight;
    scrollTo({ top: top + range * (cards.length > 1 ? i / (cards.length - 1) : 0), behavior: reduceMotion ? 'auto' : 'smooth' });
    sfx.click();
  }
  document.getElementById('wPrev').addEventListener('click', () => goWork(workActive - 1));
  document.getElementById('wNext').addEventListener('click', () => goWork(workActive + 1));
  // 作品セクションにいるときは、キーボードの ← → でも移動できる
  addEventListener('keydown', e => {
    if (activeSec !== workSec || document.getElementById('case').classList.contains('open')) return;
    if (e.key === 'ArrowRight'){ e.preventDefault(); goWork(workActive + 1); }
    if (e.key === 'ArrowLeft'){ e.preventDefault(); goWork(workActive - 1); }
  });

  /* ---------- 作品クリック：画面が崩れて、組み上がる ---------- */
  const tx = document.getElementById('tx');
  for (let i = 0; i < 12; i++){
    const b = document.createElement('i');
    b.style.setProperty('--d', `${Math.random() * .18}s`);
    b.style.setProperty('--o', i % 2 ? 'right' : 'left');
    tx.appendChild(b);
  }
  let txBusy = false;
  function txOut(){
    tx.classList.remove('show'); kick = Math.max(kick, 1.2); sfx.glitch();
    tx.querySelectorAll('i').forEach(b => b.style.setProperty('--o', getComputedStyle(b).getPropertyValue('--o').trim() === 'left' ? 'right' : 'left'));
    tx.classList.remove('on');
  }
  const CASES = works.map(w => w.detail);
  const caseEl = document.getElementById('case'), caseBody = document.getElementById('caseBody');
  const esc = t => String(t).replace(/[&<>"]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[ch]));
  let caseFrom = null;
  function openCase(c){
    const d = CASES[allCards.indexOf(c)];
    const no = c.querySelector('.big').textContent;
    const visual = d.img ? `<img src="${d.img}" alt="">` : d.dev ? '' : c.querySelector('.thumb').innerHTML;
    caseBody.innerHTML = `
      <p class="meta">CASE ${no} — ${esc(c.querySelector('.meta').textContent)}</p>
      <h2>${esc(c.querySelector('h3').dataset.text || c.querySelector('h3').textContent)}</h2>
      <div class="visual${d.dev ? ' dev' : ''}" style="${c.style.getPropertyValue('--g') ? '--g:' + c.style.getPropertyValue('--g') : ''}">${visual}</div>
      <div class="stat"><b>${d.stat[0]}</b><span>${d.stat[1]}</span></div>
      ${d.blocks.map(([en, ja, body], k) => `<div class="blk"><h4>${String(k + 1).padStart(2,'0')} / ${en}<small>${ja}</small></h4><div>${
        Array.isArray(body) ? `<ul>${body.map(li => `<li>${li}</li>`).join('')}</ul>` : `<p>${body}</p>`}</div></div>`).join('')}
      <div class="tags">${d.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>
      ${d.links ? `<div class="links">${d.links.map(([href, en, ja]) => `<a class="btn" href="${href}" target="_blank" rel="noopener"><small>${en} ↗</small>${ja}</a>`).join('')}</div>` : ''}
      ${d.note ? `<p class="note">${d.note}</p>` : ''}`;
    caseEl.scrollTop = 0;
    caseEl.classList.add('open'); document.body.classList.add('locked');
    caseFrom = c;
    document.getElementById('caseClose').focus({ preventScroll:true });
  }
  function closeCase(){
    if (!caseEl.classList.contains('open')) return;
    caseEl.classList.remove('open'); document.body.classList.remove('locked');
    kick = Math.max(kick, .8); sfx.click();
    if (caseFrom) caseFrom.focus({ preventScroll:true });
  }
  document.getElementById('caseClose').addEventListener('click', closeCase);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeCase(); });
  allCards.forEach(c => c.addEventListener('click', async e => {
    e.preventDefault(); if (txBusy) return; txBusy = true;
    kick = 1.6; sfx.tx(); tx.classList.add('on'); document.getElementById('txFoot').textContent = 'LOADING';
    await wait(450);
    tx.classList.add('show');
    scramble(document.getElementById('txSub'), 400, `CASE STUDY — W/${c.querySelector('.big').textContent}`);
    scramble(document.getElementById('txTitle'), 600, c.querySelector('h3').dataset.text || c.querySelector('h3').textContent);
    await wait(800);
    openCase(c);
    txOut();
    await wait(650); txBusy = false;
  }));

  /* ================================================================
     マウス・カーソル
     ================================================================ */
  const mouse = new THREE.Vector2(9, 9), ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0,0,1), 0);
  const px = { x: innerWidth/2, y: innerHeight/2 }, ring = { x: px.x, y: px.y };
  const hudXY = document.getElementById('hud-xy');
  addEventListener('pointermove', e => {
    px.x = e.clientX; px.y = e.clientY;
    mouse.set(e.clientX/innerWidth*2-1, -(e.clientY/innerHeight)*2+1);
    ray.setFromCamera(mouse, camera); ray.ray.intersectPlane(plane, uniforms.uMouse.value);
    hudXY.textContent = `X:${String(Math.round(e.clientX)).padStart(4,'0')} Y:${String(Math.round(e.clientY)).padStart(4,'0')}`;
  });
  document.addEventListener('pointerleave', () => { mouse.set(9, 9); uniforms.uMouse.value.set(99,99,0); });
  const curRing = document.getElementById('curRing'), curDot = document.getElementById('curDot'), curLabel = document.getElementById('curLabel');
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => { document.body.classList.add('hovering'); curLabel.textContent = el.dataset.cursor || 'OPEN'; sfx.hover(); });
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
  });

  /* ================================================================
     毎フレームの処理
     ================================================================ */
  const labelLayer = document.getElementById('labels');
  const labels = NODES.map(n => { const s = document.createElement('span'); s.textContent = n.name; labelLayer.appendChild(s); return s; });
  const tmp = new THREE.Vector3(), prog = document.getElementById('prog');
  const hudFps = document.getElementById('hud-fps'), hudTime = document.getElementById('hud-time');
  let tiltX = 0, tiltY = 0, frames = 0, fpsT = 0;
  const clock = new THREE.Clock();

  function frame(){
    const dt = Math.min(clock.getDelta(), .05);
    uniforms.uTime.value += dt;
    uniforms.uMix.value = Math.min(1, uniforms.uMix.value + dt / 1.5);
    uniforms.uCre.value += ((mode === 'creative' ? 1 : 0) - uniforms.uCre.value) * Math.min(1, dt * 3);

    if (activeSec){
      const [x, y, s] = placeFor(activeSec.dataset.name), k = Math.min(1, dt * 2.5);
      points.position.x += (x - points.position.x) * k;
      points.position.y += (y - points.position.y) * k;
      points.scale.setScalar(points.scale.x + (s - points.scale.x) * k);
    }
    const on = Math.abs(mouse.x) <= 1, flat = current === 3;   // フレームのときは傾けない（カードとずれるため）
    tiltX += ((on && !flat ? mouse.y*.15 : 0) - tiltX) * dt*2;
    tiltY += ((on && !flat ? mouse.x*.25 : 0) - tiltY) * dt*2;
    points.rotation.set(-tiltX, tiltY + (flat ? 0 : Math.sin(uniforms.uTime.value*.25)*.12), 0);
    points.updateMatrixWorld();

    const showLabels = current === 1 && uniforms.uMix.value > .95;
    labelLayer.style.opacity = showLabels ? 1 : 0;
    if (showLabels) NODES.forEach((n, i) => {
      tmp.fromArray(n.p).applyMatrix4(points.matrixWorld).project(camera);
      labels[i].style.left = ((tmp.x+1)/2*innerWidth) + 'px';
      labels[i].style.top  = ((1-tmp.y)/2*innerHeight) + 'px';
    });

    updateNumbers(); updateWorks();

    ring.x += (px.x - ring.x) * Math.min(1, dt*14); ring.y += (px.y - ring.y) * Math.min(1, dt*14);
    curRing.style.transform = `translate(${ring.x}px,${ring.y}px)`;
    curDot.style.transform = `translate(${px.x}px,${px.y}px)`;

    const max = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleY(${max > 0 ? scrollY / max : 0})`;
    frames++; fpsT += dt;
    if (fpsT >= 1){
      hudFps.textContent = `${frames} FPS`; frames = 0; fpsT = 0;
      hudTime.textContent = new Date().toLocaleTimeString('ja-JP', { hour12:false });
    }

    // 色のずれ：ふだんはわずか。粒の変身中とグリッチの瞬間に強くなる
    kick *= Math.exp(-dt * 5);
    const morphing = Math.sin(Math.min(1, uniforms.uMix.value) * Math.PI);
    rgb.uniforms.uAmount.value = reduceMotion ? 0 : .0015 + morphing * .006 + kick * .014;
    rgb.uniforms.uTime.value = uniforms.uTime.value;
    composer.render();
    requestAnimationFrame(frame);
  }
  refreshLists();
  updateSection();
  uniforms.uFrom.value = uniforms.uTo.value; uniforms.uMix.value = 1;
  frame();

  /* ================================================================
     オープニング演出の流れ
     ================================================================ */
  const intro = document.getElementById('intro');
  let seen = false; try { seen = localStorage.getItem('michiru-intro') === '1'; } catch {}
  if (new URLSearchParams(location.search).has('intro')) seen = false;   // URLに ?intro を付けると、オープニングをもう一度見られる
  let skipped = false;
  intro.addEventListener('click', () => { skipped = true; });
  function tween(obj, key, to, ms){
    return new Promise(res => {
      const from = obj[key], t0 = performance.now();
      (function step(now){
        const k = Math.min((now - t0) / ms, 1), e = 1 - Math.pow(1-k, 3);
        obj[key] = from + (to-from)*e;
        if (k < 1) requestAnimationFrame(step); else res();
      })(t0);
    });
  }
  async function runIntro(){
    if (!reduceMotion && !seen){
      const num = document.querySelector('#count b'), fill = document.getElementById('barfill');
      for (let i = 0; i <= 100 && !skipped; i += Math.ceil(Math.random()*7)){
        num.textContent = Math.min(i,100); fill.style.width = Math.min(i,100) + '%';
        await wait(40 + Math.random()*50);
      }
      if (!skipped){ intro.classList.add('title'); kick = 1.4; await wait(1300); }
      intro.classList.add('flashline'); await wait(380);
    }
    intro.classList.add('open'); kick = 1;
    try { localStorage.setItem('michiru-intro','1'); } catch {}
    document.body.classList.remove('locked');
    tween(uniforms.uIntro, 'value', 1, reduceMotion ? 1 : 2600);
    await wait(500);
    document.body.classList.add('ready');
    document.querySelectorAll(`nav [data-scramble], .hero .${mode === 'engineering' ? 'eng' : 'cre'}[data-scramble]`).forEach((el, i) => setTimeout(() => scramble(el, 900), i * 90));
    await wait(900); intro.remove();
  }
  runIntro();
}
