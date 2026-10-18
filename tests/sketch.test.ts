import { expect, test } from "vitest";
import { nextSketch, SKETCH_COUNT } from "@/components/Illustrations";

test("each new application gets a sketch nobody else uses", () => {
  expect(nextSketch([])).toBe(0);
  expect(nextSketch([0, 1, 3])).toBe(2);
  expect(nextSketch([undefined, 0])).toBe(1);
  // All taken: cycle instead of failing.
  expect(nextSketch(Array.from({ length: SKETCH_COUNT }, (_, i) => i))).toBe(0);
});
