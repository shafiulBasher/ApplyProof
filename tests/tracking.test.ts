import { expect, test } from "vitest";
import { confirmationFor, guidelineDeadline, trackingOf } from "@/lib/tracking";
import type { Requirement } from "@/lib/types";

const now = new Date(2026, 9, 17, 15, 0).getTime(); // Oct 17, 2026, 3 pm local

test("upcoming, due today, missed, submitted, no deadline", () => {
  expect(trackingOf({ deadline: "2026-10-27" }, now)).toEqual({ kind: "upcoming", deadline: "2026-10-27", daysLeft: 10 });
  expect(trackingOf({ deadline: "2026-10-17" }, now)).toMatchObject({ kind: "upcoming", daysLeft: 0 });
  expect(trackingOf({ deadline: "2026-10-16" }, now)).toMatchObject({ kind: "missed" });
  expect(trackingOf({ deadline: "2026-10-16", submittedAt: now - 1000 }, now)).toMatchObject({ kind: "submitted" });
  expect(trackingOf({}, now)).toEqual({ kind: "no_deadline" });
});

test("guideline deadline only when its date is in the verified quote", () => {
  const req = (r: Partial<Requirement>): Requirement => ({
    id: "d", category: "deadline", title: "Deadline", page: 3, quoteVerified: true,
    quote: "The application deadline is October 20, 2027, at 23:59 CET.", deadline: { date: "October 20, 2027" }, ...r,
  });
  expect(guidelineDeadline([req({})])).toBe("2027-10-20");
  expect(guidelineDeadline([req({ deadline: { date: "October 21, 2027" } })])).toBeUndefined(); // not in the quote
  expect(guidelineDeadline([req({ quoteVerified: false })])).toBeUndefined();
  expect(guidelineDeadline([req({ deadline: undefined })])).toBeUndefined();
});

test("a confirmation applies only to the same quoted rule", () => {
  const app = { confirmations: { r9: { quote: "Applicants must demonstrate strong English proficiency.", note: "IELTS 7.0", at: 1 } } };
  expect(confirmationFor(app, { requirementId: "r9", quote: "Applicants must demonstrate strong English proficiency." })?.note).toBe("IELTS 7.0");
  expect(confirmationFor(app, { requirementId: "r9", quote: "Applicants must submit an IELTS score of 7.0." })).toBeUndefined();
  expect(confirmationFor(app, { requirementId: "r1", quote: "x" })).toBeUndefined();
  expect(confirmationFor({}, { requirementId: "r9", quote: "x" })).toBeUndefined();
});

test("readiness summary keeps confirmed items apart from pending ones", async () => {
  const { summarize } = await import("@/lib/status");
  const f = (id: string, status: "passed" | "action_needed" | "needs_verification") => ({ requirementId: id, status, title: "", explanation: "", quote: id, page: 1 });
  const result = { findings: [f("a", "passed"), f("b", "needs_verification"), f("c", "needs_verification")] };
  expect(summarize(result, () => false)).toEqual({ status: "needs_verification", pending: 2, confirmed: 0 });
  expect(summarize(result, (x) => x.requirementId === "b")).toEqual({ status: "needs_verification", pending: 1, confirmed: 1 });
  expect(summarize(result, () => true)).toEqual({ status: "passed", pending: 0, confirmed: 2 }); // "Ready · 2 confirmed by you"
  expect(summarize({ findings: [f("x", "action_needed")] }, () => true)).toEqual({ status: "action_needed", pending: 1, confirmed: 0 }); // only Needs Verification can be confirmed
  expect(summarize(undefined, () => true).status).toBe("not_checked");
});
