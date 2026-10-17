import { normalize } from "./quotes";
import { summarize } from "./status";
import type { Application, Confirmation, Finding, Requirement } from "./types";

export type Tracking =
  | { kind: "submitted"; submittedAt: number }
  | { kind: "missed"; deadline: string }
  | { kind: "upcoming"; deadline: string; daysLeft: number }
  | { kind: "no_deadline" };

const DAY = 86_400_000;
// "2027-10-20" → that day's local midnight.
const localDay = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
};

// shortcut: compares whole local days and ignores the guideline's timezone (e.g. "23:59 CET"),
// so "Missed" appears only after the deadline day ends here; upgrade if exact cut-off times matter.
export function trackingOf(app: Pick<Application, "deadline" | "submittedAt">, now = Date.now()): Tracking {
  if (app.submittedAt) return { kind: "submitted", submittedAt: app.submittedAt };
  if (!app.deadline) return { kind: "no_deadline" };
  const today = new Date(now);
  const daysLeft = Math.round((localDay(app.deadline) - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / DAY);
  return daysLeft < 0 ? { kind: "missed", deadline: app.deadline } : { kind: "upcoming", deadline: app.deadline, daysLeft };
}

// The guideline's deadline as YYYY-MM-DD, only when its date appears word for word in the verified quote.
export function guidelineDeadline(requirements: Requirement[]): string | undefined {
  for (const r of requirements) {
    const date = r.deadline?.date;
    if (r.category !== "deadline" || !r.quoteVerified || !date || !normalize(r.quote).includes(normalize(date))) continue;
    const t = new Date(date);
    if (isNaN(t.getTime())) continue;
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  }
}

// The applicant's confirmation for this finding, if it was made for the same quoted rule.
export function confirmationFor(app: Pick<Application, "confirmations">, f: Pick<Finding, "requirementId" | "quote">): Confirmation | undefined {
  const c = app.confirmations?.[f.requirementId];
  return c && c.quote === f.quote ? c : undefined;
}

export const summaryFor = (app: Pick<Application, "confirmations">, result?: { findings: Finding[] }) =>
  summarize(result, (f) => !!confirmationFor(app, f));
