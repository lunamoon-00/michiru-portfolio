'use client';
// サブページ用のモード切替。トップページで選んだモードを引き継ぎ、メニューのボタンで切り替えられる。
// （トップページのような3Dや横じまの演出はなく、色とフォントだけが変わる）
import { useEffect } from 'react';

const KEY = 'michiru-mode';   // lib/experience/dom.ts の MODE_KEY と同じ

function apply(mode: string) {
  document.documentElement.dataset.mode = mode;
  document.querySelectorAll<HTMLButtonElement>('[data-set]').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.set === mode));
  });
}

export function ModeSync() {
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(KEY);
      if (saved === 'creative' || saved === 'engineering') apply(saved);
    } catch { /* 保存場所が使えなくても、ENGINEERING のまま表示する */ }

    const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-set]')];
    const onClick = (e: Event) => {
      const mode = (e.currentTarget as HTMLButtonElement).dataset.set ?? 'engineering';
      apply(mode);
      try { sessionStorage.setItem(KEY, mode); } catch { /* 同上 */ }
    };
    buttons.forEach((b) => b.addEventListener('click', onClick));
    return () => buttons.forEach((b) => b.removeEventListener('click', onClick));
  }, []);
  return null;
}
