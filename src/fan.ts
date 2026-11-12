export function fanStep(index: number, count: number, dx: number, stride = 72) {
  if (count < 1) return 0;
  return Math.max(0, Math.min(count - 1, index + Math.round(-dx / stride)));
}

export function fanPose(d: number, lift = 0) {
  const a = Math.abs(d);
  const near = 1 - Math.min(a, 1);
  return {
    transform: `translate3d(${d * 18}px, ${a * 8 - near * (34 + lift)}px, 0) rotate(${d * 5.5}deg) scale(${1.08 - 0.14 * Math.min(a, 1)})`,
    zIndex: String(Math.round(240 - a * 2)),
    opacity: String(Math.min(1, Math.max(0, 9 - a))),
  };
}

export function fanMiddle(count: number) {
  return Math.max(0, Math.floor((count - 1) / 2));
}

export const MOVE_MS = { riffle: 1300, overhand: 1150, wash: 1100, cut: 650 } as const;
export type Move = keyof typeof MOVE_MS;

const EASE = "cubic-bezier(0.42, 0, 0.3, 1)";
const DRIFT = "linear";
const SETTLE = "cubic-bezier(0.22, 0.8, 0.3, 1)";
type Frame = [t: number, transform: string, easing?: string];

function pose(x: number, y: number, r: number, s: number) {
  return `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${r.toFixed(1)}deg) scale(${s})`;
}

function noise(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

function stack(c: number) {
  return pose(c * 0.8, 18, c * 0.3, 0.9);
}

function moveFrames(move: Move, i: number, n: number): Frame[] {
  const c = i - (n - 1) / 2;
  const half = Math.ceil(n / 2);
  const left = i < half;
  const side = left ? -1 : 1;
  const k = left ? i : i - half;
  const home = stack(c);

  if (move === "riffle") {
    const drop = 0.34 + 0.42 * Math.min(1, (2 * k + (left ? 0 : 1)) / Math.max(1, n - 1));
    const bend = (drop - 0.24) / 0.52;
    return [
      [0, home],
      [0.24, pose(side * 68 + c * 0.4, -18 - k * 0.9, side * 12, 0.95), DRIFT],
      [drop, pose(side * (68 - bend * 8) + c * 0.4, -18 - k * 0.9 + bend * 6, side * (12 - bend * 4), 0.95)],
      [drop + 0.1, pose(c * 0.35, -2, side * -3, 0.94), DRIFT],
      [0.88, pose(c * 0.45, 4, 0, 0.94)],
      [0.95, pose(c * 0.5, 12, 0, 0.93)],
      [1, home],
    ];
  }

  if (move === "overhand") {
    const packets = 5;
    const p = Math.min(packets - 1, Math.floor((i * packets) / n));
    const go = 0.18 + (0.54 * p) / packets;
    return [
      [0, home],
      [0.16, pose(-46 + c * 0.4, -8, -9, 0.93), DRIFT],
      [go, pose(-46 + c * 0.4 + p * 1.5, -8 - p * 1.2, -9 + p * 0.8, 0.93)],
      [go + 0.08, pose(noise(p, 4) * 6, -36, 0, 0.95)],
      [go + 0.17, pose(44 + c * 0.4, 6 - p * 2.5, 8, 0.93), DRIFT],
      [0.86, pose(42 + c * 0.4, 8 - p * 2.5, 7, 0.93)],
      [1, home],
    ];
  }

  if (move === "wash") {
    const a = noise(i, 1);
    const b = noise(i, 2);
    const r = noise(i, 3);
    return [
      [0, home],
      [0.32, pose(a * 82, b * 40 - 8, r * 42, 0.88)],
      [0.64, pose(b * -72, a * 36, r * -30 + a * 20, 0.88)],
      [1, home],
    ];
  }

  return [
    [0, home],
    [0.42, left ? pose(-34 + c * 0.4, 12, -5, 0.9) : pose(54 + c * 0.4, -28, 9, 0.92), DRIFT],
    [0.56, left ? pose(-32 + c * 0.4, 13, -4.5, 0.9) : pose(50 + c * 0.4, -30, 8, 0.92)],
    [1, home],
  ];
}

export function shuffleTrack(moves: Move[], i: number, n: number, end: string, settleMs: number) {
  const duration = moves.reduce((sum, move) => sum + MOVE_MS[move], 0) + settleMs;
  const keyframes: Keyframe[] = [];
  let at = 0;
  for (const move of moves) {
    for (const [t, transform, easing = EASE] of moveFrames(move, i, n)) {
      if (t === 0 && keyframes.length) continue;
      keyframes.push({ offset: (at + t * MOVE_MS[move]) / duration, transform, easing });
    }
    at += MOVE_MS[move];
  }
  const last = keyframes.at(-1);
  if (last) last.easing = SETTLE;
  keyframes.push({ offset: 1, transform: end });
  return { keyframes, duration };
}
