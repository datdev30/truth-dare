import { expect, it } from "vitest";
import { fanMiddle, fanStep } from "./fan";

it("slides the fan and stays in range", () => {
  expect(fanStep(0, 10, -80)).toBe(1);
  expect(fanStep(2, 10, 80)).toBe(1);
  expect(fanStep(0, 10, 80)).toBe(0);
  expect(fanStep(9, 10, -200)).toBe(9);
});

it("opens the fan on the middle card", () => {
  expect(fanMiddle(10)).toBe(4);
  expect(fanMiddle(1)).toBe(0);
});
