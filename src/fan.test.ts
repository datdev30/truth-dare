import { expect, it } from "vitest";
import { fanMiddle, fanPose, fanStep, MOVE_MS, shuffleTrack, type Move } from "./fan";

it("slides the fan and stays in range", () => {
  expect(fanStep(0, 10, -80)).toBe(1);
  expect(fanStep(2, 10, 80)).toBe(1);
  expect(fanStep(0, 10, 80)).toBe(0);
  expect(fanStep(9, 10, -200)).toBe(9);
});

it("lifts the centre card and fades cards far from it", () => {
  expect(fanPose(0, 20)).toEqual({
    transform: "translate3d(0px, -54px, 0) rotate(0deg) scale(1.08)",
    zIndex: "240",
    opacity: "1",
  });
  expect(fanPose(-2).zIndex).toBe("236");
  expect(fanPose(8.5).opacity).toBe("0.5");
  expect(fanPose(12).opacity).toBe("0");
});

it("chains shuffle moves into one ordered track that lands on the fan", () => {
  const moves: Move[] = ["riffle", "overhand", "wash", "cut"];
  for (const n of [1, 2, 7, 33]) {
    for (let i = 0; i < n; i++) {
      const { keyframes, duration } = shuffleTrack(moves, i, n, "END", 300);
      expect(duration).toBe(MOVE_MS.riffle + MOVE_MS.overhand + MOVE_MS.wash + MOVE_MS.cut + 300);
      const offsets = keyframes.map((frame) => frame.offset as number);
      expect(offsets[0]).toBe(0);
      expect(offsets.at(-1)).toBe(1);
      for (let k = 1; k < offsets.length; k++) expect(offsets[k]).toBeGreaterThanOrEqual(offsets[k - 1]);
      expect(keyframes.at(-1)?.transform).toBe("END");
      expect(keyframes.every((frame) => !String(frame.transform).includes("NaN"))).toBe(true);
    }
  }
});

it("drops riffled cards one at a time instead of all together", () => {
  const dropAt = (i: number) => shuffleTrack(["riffle"], i, 10, "END", 0).keyframes[2].offset as number;
  const drops = Array.from({ length: 10 }, (_, i) => dropAt(i));
  expect(new Set(drops).size).toBe(10);
});

it("opens the fan on the middle card", () => {
  expect(fanMiddle(10)).toBe(4);
  expect(fanMiddle(1)).toBe(0);
});
