import Link from "next/link";
import { CalendarDays } from "lucide-react";
import type { Application, CheckResult } from "@/lib/types";
import StatusBadge from "./StatusBadge";

const ACCENT = { not_checked: "border-l-navy/15", passed: "border-l-mint", action_needed: "border-l-rose", needs_verification: "border-l-amber" } as const;

export default function ApplicationCard({ app, result }: { app: Application; result?: CheckResult }) {
  const status = result?.status ?? "not_checked";
  const total = result?.findings.length ?? 0;
  const passed = result ? total - result.outstanding : 0;
  return (
    <Link href={`/applications/${app.id}`} className={`card flex flex-col gap-3 border-l-4 p-5 transition hover:-translate-y-0.5 hover:shadow-md ${ACCENT[status]}`}>
      <div>
        <p className="font-semibold leading-snug">{app.name}</p>
        {app.organization && <p className="text-sm text-slate">{app.organization}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={status} />
        {app.deadline && (
          <span className="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2.5 py-0.5 text-xs text-slate"><CalendarDays className="h-3.5 w-3.5" /> {app.deadline}</span>
        )}
      </div>
      {result && (
        <div className="mt-auto space-y-1.5">
          <div className="flex justify-between text-xs tabular-nums text-slate">
            <span>{result.outstanding === 0 ? "No outstanding issues" : `${result.outstanding} outstanding ${result.outstanding === 1 ? "issue" : "issues"}`}</span>
            <span>{passed}/{total} passed</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-navy/5" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={passed} aria-label="Requirements passed">
            <div className="h-full rounded-full bg-mint transition-all" style={{ width: `${total ? (passed / total) * 100 : 0}%` }} />
          </div>
        </div>
      )}
    </Link>
  );
}
