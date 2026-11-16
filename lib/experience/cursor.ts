// マウス：照準マークのカーソル、粒をよける位置、HUD の座標表示
import * as THREE from 'three';
import { byId } from './dom';
import { sfx } from './sound';

/**
 * @param camera   マウスの位置を、3Dの空間の位置に変換するのに使う
 * @param uMouse   シェーダーに渡す、マウスの3Dの位置
 */
export function setupCursor(camera: THREE.Camera, uMouse: THREE.Vector3) {
  const OFF = 9;   // マウスが画面の外にあるとき
  const mouse = new THREE.Vector2(OFF, OFF);   // -1〜1 の範囲（画面の左下が -1, -1）
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const px = { x: innerWidth / 2, y: innerHeight / 2 }, ring = { ...px };
  const hudXY = byId('hud-xy'), curRing = byId('curRing'), curDot = byId('curDot'), curLabel = byId('curLabel');

  addEventListener('pointermove', (e) => {
    px.x = e.clientX; px.y = e.clientY;
    mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(mouse, camera);
    ray.ray.intersectPlane(plane, uMouse);
    const p4 = (n: number) => String(Math.round(n)).padStart(4, '0');
    hudXY.textContent = `X:${p4(e.clientX)} Y:${p4(e.clientY)}`;
  });
  document.addEventListener('pointerleave', () => { mouse.set(OFF, OFF); uMouse.set(99, 99, 0); });

  // リンクやボタンに乗ると、照準が広がって「VIEW」「SWITCH」などの文字が出る
  document.querySelectorAll<HTMLElement>('a, button').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('hovering');
      curLabel.textContent = el.dataset.cursor || 'OPEN';
      sfx.hover();
    });
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
  });

  /** 毎フレーム：輪は少し遅れて、点はぴったりマウスについていく */
  function update(dt: number) {
    const k = Math.min(1, dt * 14);
    ring.x += (px.x - ring.x) * k;
    ring.y += (px.y - ring.y) * k;
    curRing.style.transform = `translate(${ring.x}px,${ring.y}px)`;
    curDot.style.transform = `translate(${px.x}px,${px.y}px)`;
  }

  return {
    mouse, update,
    /** マウスが画面の中にあるか */
    get inside() { return Math.abs(mouse.x) <= 1; },
  };
}
