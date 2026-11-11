import { expect, it } from "vitest";
import { fanMiddle, fanPose, fanStep } from "./fan";

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

it("opens the fan on the middle card", () => {
  expect(fanMiddle(10)).toBe(4);
  expect(fanMiddle(1)).toBe(0);
});
