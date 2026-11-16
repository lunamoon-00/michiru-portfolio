// 3Dの粒（three.js）：画面の準備、粒の形、光のにじみなどの仕上げ、形の変身
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { isSmall, reduceMotion } from './dom';
import { shapeSphere, shapeGraph, shapeText, shapeFrame, shapeRing } from './shapes';
import { particleVertex, particleFragment, rgbShiftShader } from './shaders';
import { sfx } from './sound';

export const CAMERA_Z = 6;   // カメラの距離
export const CAMERA_FOV = 45; // カメラの視野の角度（度）

/** 作品カードを囲む枠の大きさ（3Dの空間での幅・高さ） */
export type FrameSize = { w: number; h: number };
/** 粒で描く文字のフォント（next/font が作ったフォント名） */
export type ParticleFonts = { vt: string; bodoni: string };

export type Particles = ReturnType<typeof createParticles>;

export function createParticles(canvas: HTMLCanvasElement, fonts: ParticleFonts, frame: FrameSize) {
  // 色の変換をしない（変換すると、暗い背景がグレーに持ち上がるため）
  THREE.ColorManagement.enabled = false;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, isSmall() ? 1.25 : 1.75));
  renderer.setClearColor(0x06050b, 1);
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100);
  camera.position.set(0, 0, CAMERA_Z);

  // ---------- 粒：6つの形の座標を、すべて最初に作っておく ----------
  // 性能の低い端末やスマホでは、粒を減らす
  const count = (isSmall() || (navigator.hardwareConcurrency || 4) <= 4) ? 9000 : 22000;
  const rand = new Float32Array(count);
  for (let i = 0; i < count; i++) rand[i] = Math.random();
  const geo = new THREE.BufferGeometry();
  const attr = (data: Float32Array, size = 3) => new THREE.BufferAttribute(data, size);
  geo.setAttribute('position', attr(shapeSphere(count)));
  geo.setAttribute('aS1', attr(shapeGraph(count)));
  geo.setAttribute('aS2', attr(shapeText(count, '1h→3min', `400 230px ${fonts.vt}`)));
  geo.setAttribute('aS3', attr(shapeFrame(count, frame.w, frame.h)));
  geo.setAttribute('aS4', attr(shapeRing(count)));
  geo.setAttribute('aS5', attr(shapeText(count, '105K', `italic 700 210px ${fonts.bodoni}`)));
  geo.setAttribute('aRand', attr(rand, 1));

  // シェーダーに渡す値（uniform＝ユニフォーム）
  const uniforms = {
    uTime: { value: 0 },
    uFrom: { value: 0 },                          // 変身前の形
    uTo: { value: 0 },                            // 変身後の形
    uMix: { value: 1 },                           // 変身の進み具合（0〜1）
    uIntro: { value: reduceMotion ? 1 : 0 },      // オープニングで粒が集まる進み具合（0〜1）
    uMouse: { value: new THREE.Vector3(99, 99, 0) },
    uCre: { value: 0 },                           // CREATIVE モードの度合い（0〜1）
    uSize: { value: isSmall() ? 20 : 26 },
    uPixel: { value: renderer.getPixelRatio() },
  };
  const material = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: particleVertex, fragmentShader: particleFragment,
  });
  const points = new THREE.Points(geo, material);
  scene.add(points);

  // ---------- 仕上げ：光のにじみ（ブルーム）→ 色のずれ ----------
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.55, 0.35, 0.22); // 強さ・広がり・光り始める明るさ
  composer.addPass(bloom);
  const rgb = new ShaderPass(rgbShiftShader);
  composer.addPass(rgb);

  // ---------- 形の変身 ----------
  let current = 0;
  function morphTo(shape: number) {
    if (shape === current) return;
    // 変身の途中で次の形に変わったときは、元の形から変身し直す
    uniforms.uFrom.value = uniforms.uMix.value > 0.5 ? current : uniforms.uFrom.value;
    uniforms.uTo.value = current = shape;
    uniforms.uMix.value = reduceMotion ? 1 : 0;
    sfx.morph();
  }
  /** 最初の形は、変身せずにいきなり表示する */
  function settle() {
    uniforms.uFrom.value = uniforms.uTo.value;
    uniforms.uMix.value = 1;
  }

  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    composer.setSize(innerWidth, innerHeight);
    bloom.resolution.set(innerWidth / 2, innerHeight / 2);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize);
  resize();

  /** 1コマ描く。glitchAmount は色ずれの強さ */
  function render(dt: number, glitchAmount: number) {
    uniforms.uTime.value += dt;
    uniforms.uMix.value = Math.min(1, uniforms.uMix.value + dt / 1.5);
    rgb.uniforms.uAmount.value = glitchAmount;
    rgb.uniforms.uTime.value = uniforms.uTime.value;
    composer.render();
  }

  return {
    camera, points, uniforms, morphTo, settle, render,
    /** いまの形の番号 */
    get current() { return current; },
    /** 変身の途中ほど大きくなる値（0〜1）。色ずれを強めるのに使う */
    get morphing() { return Math.sin(Math.min(1, uniforms.uMix.value) * Math.PI); },
  };
}
