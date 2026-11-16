// 効果音。WebAudio（ウェブオーディオ）で、その場で電子音を合成する（音声ファイルは使わない）。
// 最初は音なし。右下の SOUND ボタンでオンにすると、次に来たときも覚えている。
import { storage } from './dom';

const KEY = 'michiru-sound';
let audio: AudioContext | null = null;
let soundOn = false;

const ctx = () => (audio ??= new AudioContext());

/** 高さが f0 → f1 に変わる音 */
function tone(f0: number, f1: number, dur: number, type: OscillatorType = 'sine', gain = 0.03) {
  if (!soundOn) return;
  const a = ctx(), t = a.currentTime, o = a.createOscillator(), g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

/** ザーッというノイズ。f0 → f1 の帯域だけを通す */
function noise(dur: number, gain = 0.04, f0 = 3000, f1 = f0) {
  if (!soundOn) return;
  const a = ctx(), t = a.currentTime;
  const buf = a.createBuffer(1, a.sampleRate * dur, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const s = a.createBufferSource(), bp = a.createBiquadFilter(), g = a.createGain();
  s.buffer = buf;
  bp.type = 'bandpass';
  bp.Q.value = 2;
  bp.frequency.setValueAtTime(f0, t);
  bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(bp).connect(g).connect(a.destination);
  s.start(t);
}

export const sfx = {
  hover: () => tone(2400, 2200, 0.03, 'sine', 0.025),
  click: () => tone(300, 1300, 0.16, 'square', 0.02),
  glitch: () => noise(0.14, 0.05, 2600),
  morph: () => noise(0.7, 0.025, 400, 2400),
  tx: () => { tone(1600, 70, 0.45, 'sawtooth', 0.025); noise(0.35, 0.04, 5000, 300); },
};

/** SOUND ボタンの準備 */
export function setupSoundButton(btn: HTMLButtonElement) {
  soundOn = storage.get(KEY) === '1';
  const paint = () => {
    btn.textContent = soundOn ? 'SOUND ON' : 'SOUND OFF';
    btn.classList.toggle('on', soundOn);
  };
  paint();
  btn.addEventListener('click', () => {
    soundOn = !soundOn;
    paint();
    storage.set(KEY, soundOn ? '1' : '0');
    if (soundOn) { void ctx().resume(); sfx.click(); }
  });
}
