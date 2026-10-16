import Link from "next/link";
import { CalendarDays } from "lucide-react";
import type { Application, CheckResult } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import { University } from "./Illustrations";

const SKY = { not_checked: "bg-lilac/60", passed: "bg-sage/80", action_needed: "bg-peach/70", needs_verification: "bg-butter/70" } as const;

// Stable per application, so each card keeps its own sketch.
const variantOf = (id: string) => [...id].reduce((n, c) => n + c.charCodeAt(0), 0) % 3;

export default function ApplicationCard({ app, result }: { app: Application; result?: CheckResult }) {
  const status = result?.status ?? "not_checked";
  const total = result?.findings.length ?? 0;
  const passed = result ? total - result.outstanding : 0;
  return (
    <Link
      href={`/applications/${app.id}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(48,43,64,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div className={`relative h-28 border-b border-line ${SKY[status]}`}>
        <University variant={variantOf(app.id)} className="absolute inset-x-4 bottom-0 h-24 transition group-hover:scale-[1.02]" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="font-display text-lg font-semibold leading-snug">{app.name}</p>
          {app.organization && <p className="text-sm text-muted">{app.organization}</p>}
        </div>
        <div><StatusBadge status={status} /></div>
        <div className="mt-auto space-y-2">
          {result ? (
            <>
              <div className="flex justify-between text-xs tabular-nums text-muted">
                <span>{result.outstanding === 0 ? "No outstanding issues" : `${result.outstanding} outstanding ${result.outstanding === 1 ? "issue" : "issues"}`}</span>
                <span>{passed}/{total} passed</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-lilac" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={passed} aria-label="Requirements passed">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${total ? (passed / total) * 100 : 0}%` }} />
              </div>
            </>
          ) : (
            <p className="text-xs text-muted">Not checked yet</p>
          )}
          {app.deadline && (
            <p className="flex items-center gap-1.5 pt-1 text-xs text-muted"><CalendarDays className="h-3.5 w-3.5" aria-hidden /> {app.deadline}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
