"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { cachedExtraction } from "@/lib/runCheck";
import { byDeadline, isoDay, monthGrid } from "@/lib/calendarView";
import { guidelineDeadlineParts, trackingOf, type Tracking } from "@/lib/tracking";
import type { Application } from "@/lib/types";
import TrackingPill, { fmtDate } from "@/components/TrackingPill";
import { PaperPlane, Sparkle } from "@/components/Illustrations";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const tone = (t: Tracking) =>
  t.kind === "submitted" ? "bg-sage text-sage-ink"
  : t.kind === "missed" ? "bg-peach-ink text-white"
  : t.kind === "upcoming" && t.daysLeft <= 7 ? "bg-butter text-butter-ink"
  : "bg-lilac text-primary-ink";
const LEGEND = [
  ["bg-lilac", "Upcoming"],
  ["bg-butter", "Due within 7 days"],
  ["bg-peach-ink", "Missed"],
  ["bg-sage", "Submitted"],
];

export default function CalendarPage() {
  const now = new Date();
  const today = isoDay(now);
  const [apps, setApps] = useState<Application[]>([]);
  const [times, setTimes] = useState<Map<string, string>>(new Map());
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState(today);
  const [ready, setReady] = useState(false); // "today" must come from the browser, not the build

  useEffect(() => {
    setReady(true);
    (async () => {
      const all = await db.applications.toArray();
      setApps(all);
      // Exact time only when the guideline states it and the deadline date still matches.
      const found = new Map<string, string>();
      for (const a of all.filter((x) => x.deadline)) {
        const g = (await db.documents.where("applicationId").equals(a.id).toArray()).find((d) => d.role === "guideline" && d.readable);
        const ex = g && (await cachedExtraction(g));
        const parts = ex && guidelineDeadlineParts(ex.requirements);
        if (parts && parts.date === a.deadline && parts.time && parts.timezone) found.set(a.id, `${parts.time} ${parts.timezone}`);
      }
      setTimes(found);
    })();
  }, []);

  const due = useMemo(() => byDeadline(apps), [apps]);
  const grid = monthGrid(cursor.y, cursor.m);
  const monthName = new Date(cursor.y, cursor.m, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const move = (delta: number) => setCursor(({ y, m }) => ({ y: m + delta < 0 ? y - 1 : m + delta > 11 ? y + 1 : y, m: (m + delta + 12) % 12 }));
  const goToday = () => { setCursor({ y: now.getFullYear(), m: now.getMonth() }); setSelected(today); };
  const onDay = due.get(selected) ?? [];
  const upcoming = apps.filter((a) => a.deadline && !a.submittedAt && a.deadline >= today).sort((a, b) => a.deadline!.localeCompare(b.deadline!)).slice(0, 6);

  if (!ready) return null;
  return (
    <>
      <header className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Calendar</p>
          <h1 className="mt-1 text-4xl font-semibold leading-tight sm:text-5xl">Your deadlines</h1>
          <p className="mt-2 text-muted">Every application deadline in one place. Click a date to see what&apos;s due.</p>
        </div>
        <PaperPlane className="absolute -top-2 right-40 hidden h-8 w-12 -rotate-6 animate-[float_5s_ease-in-out_infinite] md:block" />
      </header>

      <section className="card ruled relative mt-8 overflow-hidden p-4 sm:p-6" aria-label={monthName}>
        <Sparkle className="absolute right-5 top-5 hidden h-6 w-6 animate-[twinkle_3s_ease-in-out_infinite] sm:block" />
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="mr-auto text-xl font-semibold sm:text-2xl">{monthName}</h2>
          <div className="flex shrink-0 gap-2 sm:mr-8">
            <button className="btn-ghost border border-line bg-white" onClick={() => move(-1)} aria-label="Previous month"><ChevronLeft className="h-4 w-4" aria-hidden /></button>
            <button className="btn-secondary py-1.5" onClick={goToday}>Today</button>
            <button className="btn-ghost border border-line bg-white" onClick={() => move(1)} aria-label="Next month"><ChevronRight className="h-4 w-4" aria-hidden /></button>
          </div>
        </div>
        <ul className="mt-3 flex flex-wrap gap-3 text-xs text-muted" aria-label="Legend">
          {LEGEND.map(([cls, label]) => <li key={label} className="flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-full ${cls}`} aria-hidden /> {label}</li>)}
        </ul>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wide text-muted" aria-hidden>
          {WEEKDAYS.map((d) => <div key={d} className="py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {grid.map(({ iso, day, inMonth }) => {
            const items = due.get(iso) ?? [];
            const isSel = iso === selected;
            return (
              <button
                key={iso}
                onClick={() => setSelected(iso)}
                aria-pressed={isSel}
                aria-label={`${fmtDate(iso)}${items.length ? `, ${items.length} due` : ""}`}
                className={`flex min-h-16 flex-col items-stretch gap-1 rounded-xl border p-1.5 text-left transition sm:min-h-24 ${inMonth ? "bg-white/80" : "bg-transparent opacity-50"} ${isSel ? "border-primary ring-2 ring-lilac" : "border-line/70 hover:border-primary/40 hover:bg-white"}`}
              >
                <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-semibold tabular-nums ${iso === today ? "bg-primary text-white" : "text-ink"}`}>{day}</span>
                {items.slice(0, 2).map((a) => (
                  <span key={a.id} className={`hidden truncate rounded-md px-1.5 py-0.5 text-[11px] font-semibold sm:block ${tone(trackingOf(a))}`}>{a.name}</span>
                ))}
                {items.length > 0 && (
                  <span className="flex gap-0.5 sm:hidden" aria-hidden>{items.slice(0, 3).map((a) => <span key={a.id} className={`h-1.5 w-1.5 rounded-full ${tone(trackingOf(a)).split(" ")[0]}`} />)}</span>
                )}
                {items.length > 2 && <span className="hidden text-[11px] text-muted sm:block">+{items.length - 2} more</span>}
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-5" aria-live="polite">
          <h3 className="font-display text-xl font-semibold">{fmtDate(selected)}</h3>
          {onDay.length === 0 ? (
            <p className="hand-note mt-3">Nothing due on this day ✦</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {onDay.map((a) => <DueRow key={a.id} app={a} time={times.get(a.id)} />)}
            </ul>
          )}
        </section>
        <section className="card p-5">
          <h3 className="font-display text-xl font-semibold">Upcoming deadlines</h3>
          {upcoming.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No upcoming deadlines. Add one on an application&apos;s page.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {upcoming.map((a) => <DueRow key={a.id} app={a} time={times.get(a.id)} showDate />)}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function DueRow({ app, time, showDate }: { app: Application; time?: string; showDate?: boolean }) {
  return (
    <li>
      <Link href={`/applications/${app.id}`} className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-oat/60 px-3 py-2.5 transition hover:border-primary/40 hover:bg-white">
        <span className="min-w-0">
          <span className="block font-medium">{app.name}</span>
          <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
            {app.organization && <span>{app.organization}</span>}
            {showDate && app.deadline && <span>{fmtDate(app.deadline)}</span>}
            {time && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden /> {time}</span>}
          </span>
        </span>
        <span className="ml-auto"><TrackingPill t={trackingOf(app)} /></span>
      </Link>
    </li>
  );
}
