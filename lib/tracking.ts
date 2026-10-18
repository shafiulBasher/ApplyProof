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

// The guideline's deadline: the date as YYYY-MM-DD plus any time and timezone, each kept only
// when it appears word for word in the verified quote.
export function guidelineDeadlineParts(requirements: Requirement[]): { date: string; time?: string; timezone?: string; quote: string } | undefined {
  for (const r of requirements) {
    const inQuote = (x?: string) => (x && normalize(r.quote).includes(normalize(x)) ? x.trim() : undefined);
    const date = inQuote(r.deadline?.date);
    if (r.category !== "deadline" || !r.quoteVerified || !date) continue;
    const t = new Date(date);
    if (isNaN(t.getTime())) continue;
    const iso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
    return { date: iso, time: inQuote(r.deadline?.time), timezone: inQuote(r.deadline?.timezone), quote: r.quote };
  }
}

export const guidelineDeadline = (requirements: Requirement[]) => guidelineDeadlineParts(requirements)?.date;

// Unsubmitted applications that are overdue, due today, or due within 7 days, most urgent first.
export function dueSoon<A extends Pick<Application, "deadline" | "submittedAt">>(apps: A[], now = Date.now()) {
  return apps
    .map((app) => ({ app, t: trackingOf(app, now) }))
    .filter(({ t }) => t.kind === "missed" || (t.kind === "upcoming" && t.daysLeft <= 7))
    .sort((x, y) => (x.t.kind === "missed" ? -1 : x.t.kind === "upcoming" ? x.t.daysLeft : 0) - (y.t.kind === "missed" ? -1 : y.t.kind === "upcoming" ? y.t.daysLeft : 0));
}

// The applicant's confirmation for this finding, if it was made for the same quoted rule.
export function confirmationFor(app: Pick<Application, "confirmations">, f: Pick<Finding, "requirementId" | "quote">): Confirmation | undefined {
  const c = app.confirmations?.[f.requirementId];
  return c && c.quote === f.quote ? c : undefined;
}

export const summaryFor = (app: Pick<Application, "confirmations">, result?: { findings: Finding[] }) =>
  summarize(result, (f) => !!confirmationFor(app, f));
