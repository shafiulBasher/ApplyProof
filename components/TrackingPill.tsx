import { CalendarClock, CalendarX2, Send } from "lucide-react";
import type { Tracking } from "@/lib/tracking";

export const fmtDate = (t: number | string) =>
  new Date(typeof t === "string" ? `${t}T00:00` : t).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

// Where the application stands (separate from how ready it is).
export default function TrackingPill({ t }: { t: Tracking }) {
  const base = "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold";
  if (t.kind === "submitted") return <span className={`${base} bg-sage text-sage-ink`}><Send className="h-3.5 w-3.5" aria-hidden /> Submitted · {fmtDate(t.submittedAt)}</span>;
  if (t.kind === "missed") return <span className={`${base} bg-peach-ink text-white`}><CalendarX2 className="h-3.5 w-3.5" aria-hidden /> Missed · was due {fmtDate(t.deadline)}</span>;
  if (t.kind === "no_deadline") return <span className={`${base} bg-oat text-muted`}><CalendarClock className="h-3.5 w-3.5" aria-hidden /> No deadline set</span>;
  const soon = t.daysLeft <= 7;
  return (
    <span className={`${base} ${soon ? "bg-butter text-butter-ink" : "bg-lilac text-primary-ink"}`}>
      <CalendarClock className="h-3.5 w-3.5" aria-hidden /> Not submitted · {t.daysLeft === 0 ? "due today" : `due in ${t.daysLeft} ${t.daysLeft === 1 ? "day" : "days"}`}
    </span>
  );
}
