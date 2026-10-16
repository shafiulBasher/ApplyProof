import { expect, test } from "vitest";
import { whatChanged } from "@/lib/diff";
import { inputHash } from "@/lib/status";
import type { CheckResult, Finding } from "@/lib/types";

const finding = (requirementId: string, status: Finding["status"], measured?: number, unit?: string): Finding =>
  ({ requirementId, status, title: requirementId, explanation: "", quote: "", page: 1, measured, unit });
const result = (findings: Finding[], over: Partial<CheckResult> = {}): CheckResult => ({
  ranAt: 1, inputHash: "i", guidelineHash: "g", extractedAt: 1, findings, status: "passed",
  outstanding: findings.filter((f) => f.status !== "passed").length, ...over,
});

test("CV fix: status, measured value, and outstanding count change", () => {
  const before = result([finding("CV length", "action_needed", 3, "pages"), finding("Transcript", "passed", 1)]);
  const after = result([finding("CV length", "passed", 2, "pages"), finding("Transcript", "passed", 1)]);
  const c = whatChanged(before, after);
  expect(c.newRequirements).toBe(false);
  expect(c.statusChanges).toEqual([{ requirementId: "CV length", title: "CV length", from: "action_needed", to: "passed" }]);
  expect(c.measuredChanges).toEqual([{ requirementId: "CV length", title: "CV length", from: 3, to: 2, unit: "pages" }]);
  expect(c.outstanding).toEqual({ from: 1, to: 0 });
});

test("a new guideline or re-read requirements claim no improvements", () => {
  const before = result([finding("r1", "action_needed", 3)]);
  for (const over of [{ guidelineHash: "other" }, { extractedAt: 2 }]) {
    const c = whatChanged(before, result([finding("r1", "passed", 2)], over));
    expect(c.newRequirements).toBe(true);
    expect(c.statusChanges).toHaveLength(0);
    expect(c.measuredChanges).toHaveLength(0);
  }
});

test("input fingerprint changes on any relevant change, not on document order", async () => {
  const docs = [{ contentHash: "a", confirmedType: "cv" as const }, { contentHash: "b", confirmedType: "transcript" as const }];
  const base = await inputHash("g", docs, { gpa: 3.6 });
  expect(await inputHash("g", [...docs].reverse(), { gpa: 3.6 })).toBe(base);
  // Same page/word counts but different bytes → different content hash → different fingerprint.
  expect(await inputHash("g", [{ ...docs[0], contentHash: "a2" }, docs[1]], { gpa: 3.6 })).not.toBe(base);
  expect(await inputHash("g", [{ ...docs[0], confirmedType: "other" }, docs[1]], { gpa: 3.6 })).not.toBe(base);
  expect(await inputHash("g", docs, { gpa: 3.7 })).not.toBe(base);
  expect(await inputHash("g2", docs, { gpa: 3.6 })).not.toBe(base);
});
