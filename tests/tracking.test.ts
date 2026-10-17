import { expect, test } from "vitest";
import { guidelineDeadline, trackingOf } from "@/lib/tracking";
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
