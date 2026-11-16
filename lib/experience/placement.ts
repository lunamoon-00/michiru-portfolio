// セクションごとに、3Dの粒をどこに・どの大きさで置くか
import * as THREE from 'three';
import { isSmall } from './dom';
import { CAMERA_FOV, CAMERA_Z } from './particles';

/** [x, y, 大きさ] */
type Place = [number, number, number];

/** 3Dの空間の「1」が、画面の何ピクセルにあたるか（カメラから距離 CAMERA_Z の面で） */
const pxPerUnit = () => innerHeight / (2 * CAMERA_Z * Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2)));

/** 作品カードの縦横の比。CSS（--ar）と、粒の枠の両方をこれに合わせる */
export const cardAspect = () => (isSmall() ? 10 / 9 : 16 / 11);

/** 作品の枠の、3Dの空間での幅 */
export const FRAME_W = 3.2;

/**
 * @param name   セクションの data-name
 * @param aspect 画面の横 ÷ 縦
 */
export function placeFor(name: string, aspect: number): Place {
  if (name === 'WORKS') {   // 真ん中のカードをぴったり囲む大きさにする
    const cardWidth = Math.min(620, innerWidth * 0.8);
    return [0, 0, (cardWidth + 30) / (FRAME_W * pxPerUnit())];
  }
  // スマホ：文字とかぶらないように、上に寄せて小さめに
  const small: Record<string, Place> = {
    HERO: [0, 1.55, Math.min(0.5, aspect * 0.75)], IMPACT: [0, 1.45, Math.min(0.5, aspect * 0.55)],
    NUMBERS: [0, 0.45, Math.min(0.85, aspect * 0.7)], CONTACT: [0, 1.6, Math.min(0.48, aspect * 0.7)],
  };
  // パソコン：文字の右側に置く
  const wide: Record<string, Place> = {
    HERO: [1.8, 0.05, 0.9], IMPACT: [0.2, 1.3, 0.75], NUMBERS: [0, 0.1, 1.2], CONTACT: [1.9, 0, 0.85],
  };
  return (isSmall() ? small : wide)[name] ?? [0, 0, 1];
}
