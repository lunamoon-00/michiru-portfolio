// いくつものファイルが読み書きする「いまの状態」

export type ModeName = 'engineering' | 'creative';

export const state = {
  /** いまのモード */
  mode: 'engineering' as ModeName,
  /** いま画面の真ん中にあるセクション */
  activeSec: null as HTMLElement | null,
};

/** グリッチ（色ずれ・横ずれノイズ）の強さ。何かが切り替わる瞬間に上げると、毎フレーム少しずつ下がる */
export const glitch = {
  kick: 0,
  /** この強さにする */
  set(v: number) { this.kick = v; },
  /** いまより弱ければ、この強さまで上げる */
  bump(v: number) { this.kick = Math.max(this.kick, v); },
  /** 時間とともに弱める */
  decay(dt: number) { this.kick *= Math.exp(-dt * 5); },
};
