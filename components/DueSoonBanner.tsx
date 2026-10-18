"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BellRing, X } from "lucide-react";
import { dueSoon } from "@/lib/tracking";
import type { Application } from "@/lib/types";
import TrackingPill from "./TrackingPill";

const KEY = "applyproof-due-dismissed";
const today = () => new Date().toDateString();

// Overdue, due-today, and due-this-week applications that aren't submitted. "Hide until tomorrow"
// lasts only for today and only for this exact set: a newly urgent application brings it back.
export default function DueSoonBanner({ apps }: { apps: Application[] }) {
  const items = dueSoon(apps);
  const signature = `${today()}|${items.map((i) => i.app.id).join(",")}`;
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    let dismissed = "";
    try { dismissed = localStorage.getItem(KEY) ?? ""; } catch {}
    setHidden(dismissed === signature);
  }, [signature]);

  if (!items.length || hidden) return null;
  const hide = () => {
    try { localStorage.setItem(KEY, signature); } catch {}
    setHidden(true);
  };
  return (
    <section className="mt-8 rounded-2xl border border-butter-ink/20 bg-butter/60 p-4 animate-[fade-in_250ms_ease-out] sm:p-5" aria-labelledby="due-soon-title">
      <div className="flex items-start justify-between gap-3">
        <h2 id="due-soon-title" className="flex items-center gap-2 text-xl font-semibold text-ink">
          <BellRing className="h-5 w-5 text-butter-ink" aria-hidden /> Due soon
        </h2>
        <button className="btn-ghost py-1 text-butter-ink" onClick={hide}><X className="h-4 w-4" aria-hidden /> Hide until tomorrow</button>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map(({ app, t }) => (
          <li key={app.id}>
            <Link href={`/applications/${app.id}`} className="flex flex-wrap items-center gap-2 rounded-xl bg-white/70 px-3 py-2 transition hover:bg-white">
              <span className="font-medium">{app.name}</span>
              {app.organization && <span className="text-sm text-muted">· {app.organization}</span>}
              <span className="ml-auto"><TrackingPill t={t} /></span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
