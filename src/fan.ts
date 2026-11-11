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
