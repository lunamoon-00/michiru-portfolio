// HUD（画面のすみの計器ふうの飾り）：スクロールの進み具合・FPS・時刻、構成図のラベル
import * as THREE from 'three';
import { byId } from './dom';
import { NODES } from './shapes';

export function setupHud() {
  const prog = byId('prog'), fps = byId('hud-fps'), time = byId('hud-time');
  let frames = 0, elapsed = 0;

  return function update(dt: number) {
    const max = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleY(${max > 0 ? scrollY / max : 0})`;
    frames++;
    elapsed += dt;
    if (elapsed >= 1) {   // 1秒ごとに書き換える
      fps.textContent = `${frames} FPS`;
      time.textContent = new Date().toLocaleTimeString('ja-JP', { hour12: false });
      frames = 0;
      elapsed = 0;
    }
  };
}

/** 構成図の形のとき、点の上に「PDF」「Slack」などの名前を出す */
export function setupGraphLabels() {
  const layer = byId('labels');
  const labels = NODES.map((n) => {
    const s = document.createElement('span');
    s.textContent = n.name;
    layer.appendChild(s);
    return s;
  });
  const tmp = new THREE.Vector3();

  return function update(show: boolean, object: THREE.Object3D, camera: THREE.Camera) {
    layer.style.opacity = show ? '1' : '0';
    if (!show) return;
    NODES.forEach((n, i) => {
      tmp.fromArray(n.p).applyMatrix4(object.matrixWorld).project(camera);   // 3Dの位置 → 画面の位置
      labels[i].style.left = `${(tmp.x + 1) / 2 * innerWidth}px`;
      labels[i].style.top = `${(1 - tmp.y) / 2 * innerHeight}px`;
    });
  };
}
