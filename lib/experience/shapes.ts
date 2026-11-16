// 3Dの粒が変身する「形」を作る。どの形も、粒 n 個ぶんの座標 [x, y, z, x, y, z, ...] を返す。
// セクションの data-eng / data-cre に書く番号は、この SHAPE の値。

export const SHAPE = {
  sphere: 0,    // 光の球と、まわりを回る輪（トップ・CREATIVE）
  graph: 1,     // システムの構成図（トップ・ENGINEERING）
  impactEng: 2, // 「1h→3min」の文字
  frame: 3,     // 作品カードを囲む枠
  ring: 4,      // 数字の後ろで回る光の輪
  impactCre: 5, // 「105K」の文字
} as const;

type Vec3 = [number, number, number];

/** 構成図の点（名前は画面にラベルとして表示する） */
export const NODES: { name: string; p: Vec3 }[] = [
  { name: 'PDF', p: [-1.25, 0.9, 0] }, { name: 'OCR', p: [-0.4, 0.9, 0.3] }, { name: 'LLM API', p: [0.5, 0.9, -0.2] },
  { name: 'Slack', p: [1.7, 1.4, 0.2] }, { name: 'Cloud Run', p: [0.4, -0.4, 0.4] }, { name: 'Supabase', p: [-0.7, -0.9, -0.3] },
  { name: 'GAS', p: [1.6, -0.2, -0.3] }, { name: 'Monthly Report', p: [1.4, -1.4, 0.2] },
];
/** 構成図の線（NODES の何番と何番をつなぐか） */
const EDGES: [number, number][] = [[0, 1], [1, 2], [2, 3], [2, 4], [4, 5], [4, 6], [6, 3], [5, 7], [6, 7], [1, 5]];

const pick = <T,>(list: T[]) => list[(Math.random() * list.length) | 0];
const jitter = (amount: number) => (Math.random() - 0.5) * amount;

/** 形0：光の球と、斜めに傾いて回る輪 */
export function shapeSphere(n: number) {
  const out = new Float32Array(n * 3), golden = Math.PI * (3 - Math.sqrt(5)), tilt = 0.42;
  for (let i = 0; i < n; i++) {
    let x: number, y: number, z: number;
    if (Math.random() < 0.68) {                       // 球の表面に均等に並べる
      const k = i / n, yy = 1 - 2 * k, rr = Math.sqrt(1 - yy * yy), th = golden * i;
      x = Math.cos(th) * rr * 1.25; y = yy * 1.25; z = Math.sin(th) * rr * 1.25;
    } else {                                          // 斜めに傾いた輪
      const ang = Math.random() * Math.PI * 2, R = 1.7 + Math.pow(Math.random(), 2) * 0.55;
      const rx = Math.cos(ang) * R, rz = Math.sin(ang) * R, ry = jitter(0.03);
      x = rx; y = ry * Math.cos(tilt) - rz * Math.sin(tilt); z = ry * Math.sin(tilt) + rz * Math.cos(tilt);
    }
    out.set([x, y, z], i * 3);
  }
  return out;
}

/** 形1：システムの構成図（点のまわりに粒を集め、残りを線の上に並べる） */
export function shapeGraph(n: number) {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    let x: number, y: number, z: number;
    if (Math.random() < 0.42) {
      const c = pick(NODES).p;
      const r = 0.16 * Math.cbrt(Math.random()), th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      x = c[0] + r * Math.sin(ph) * Math.cos(th); y = c[1] + r * Math.sin(ph) * Math.sin(th); z = c[2] + r * Math.cos(ph);
    } else {
      const [a, b] = pick(EDGES), t = Math.random(), A = NODES[a].p, B = NODES[b].p;
      x = A[0] + (B[0] - A[0]) * t + jitter(0.018);
      y = A[1] + (B[1] - A[1]) * t + jitter(0.018);
      z = A[2] + (B[2] - A[2]) * t + jitter(0.018);
    }
    out.set([x, y, z], i * 3);
  }
  return out;
}

/** 文字を2Dのキャンバスに描き、色が付いたピクセルの位置を集める */
function pixelsOf(draw: (g: CanvasRenderingContext2D) => void, W: number, H: number) {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  if (!g) return [0];
  draw(g);
  const d = g.getImageData(0, 0, W, H).data, pts: number[] = [];
  for (let i = 0; i < W * H; i += 2) if (d[i * 4 + 3] > 128) pts.push(i);
  return pts.length ? pts : [0];
}

/** 形2・5：文字（例：「1h→3min」）。font は CSS の font と同じ書き方 */
export function shapeText(n: number, label: string, font: string) {
  const W = 1024, H = 256;
  const pts = pixelsOf((g) => {
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = font; g.fillText(label, W / 2, H / 2);
  }, W, H);
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const idx = pick(pts);
    out.set([
      ((idx % W) - W / 2) / (W / 2) * 2.7 + jitter(0.01),
      -(((idx / W) | 0) - H / 2) / (W / 2) * 2.7 + jitter(0.01),
      jitter(0.25),
    ], i * 3);
  }
  return out;
}

/** 形3：作品カードを囲む枠。w・h は枠の幅と高さ */
export function shapeFrame(n: number, w: number, h: number) {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    let x: number, y: number;
    const r = Math.random();
    if (r < 0.45) {                       // 四隅のかぎかっこ（濃く）
      const cx = Math.random() < 0.5 ? -1 : 1, cy = Math.random() < 0.5 ? -1 : 1, L = 0.42, o = 0.1, t = Math.random() * L;
      if (Math.random() < 0.5) { x = cx * (w / 2 + o - t); y = cy * (h / 2 + o); }
      else                     { x = cx * (w / 2 + o);     y = cy * (h / 2 + o - t); }
    } else if (r < 0.8) {                 // 外枠
      const side = (Math.random() * 4) | 0, t = Math.random() - 0.5;
      x = side < 2 ? t * w : (side === 2 ? -0.5 : 0.5) * w;
      y = side < 2 ? (side ? -0.5 : 0.5) * h : t * h;
    } else {                              // 外側にただよう粒
      const a = Math.random() * Math.PI * 2, d = 2.2 + Math.random() * 2.5;
      x = Math.cos(a) * d * 1.3; y = Math.sin(a) * d * 0.8;
    }
    out.set([x + jitter(0.012), y + jitter(0.012), jitter(0.3)], i * 3);
  }
  return out;
}

/** 形4：3重の光の輪（奥に向かうトンネル） */
export function shapeRing(n: number) {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, layer = (Math.random() * 3) | 0;
    const R = 1.7 + layer * 0.55 + jitter(0.08), z = -layer * 1.2 + jitter(0.2);
    out.set([Math.cos(a) * R, Math.sin(a) * R, z], i * 3);
  }
  return out;
}
