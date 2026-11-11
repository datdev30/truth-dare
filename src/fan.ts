export function fanStep(index: number, count: number, dx: number, stride = 72) {
  if (count < 1) return 0;
  return Math.max(0, Math.min(count - 1, index + Math.round(-dx / stride)));
}

export function fanMiddle(count: number) {
  return Math.max(0, Math.floor((count - 1) / 2));
}
