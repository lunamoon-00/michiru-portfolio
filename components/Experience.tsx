'use client';
// 画面の動きを始めるための、小さなクライアントコンポーネント（ブラウザで動く部品）。
// 画面（HTML）はサーバーで作っておき、表示されたあとにここで動きのスクリプトを読み込む。
// three.js（3Dの道具）はブラウザでしか動かないので、useEffect の中で読み込んでいる。
import { useEffect } from 'react';

export function Experience() {
  useEffect(() => {
    import('@/lib/experience').then((m) => m.startExperience());
  }, []);
  return null;   // 見た目は何も出さない
}
