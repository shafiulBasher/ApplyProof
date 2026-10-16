import { AlertCircle, CheckCircle2, HelpCircle, Lightbulb } from "lucide-react";
import type { Finding, FindingStatus } from "@/lib/types";

export const FINDING_STYLE: Record<FindingStatus, { label: string; pill: string; icon: typeof CheckCircle2; iconCls: string; ring: string }> = {
  action_needed: { label: "Action Needed", pill: "bg-peach text-peach-ink", icon: AlertCircle, iconCls: "bg-peach text-peach-ink", ring: "border-peach" },
  needs_verification: { label: "Needs Verification", pill: "bg-butter text-butter-ink", icon: HelpCircle, iconCls: "bg-butter text-butter-ink", ring: "border-line" },
  passed: { label: "Passed", pill: "bg-sage text-sage-ink", icon: CheckCircle2, iconCls: "bg-sage text-sage-ink", ring: "border-line" },
};

export function FindingPill({ status }: { status: FindingStatus }) {
  const s = FINDING_STYLE[status];
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.pill}`}>{s.label}</span>;
}

export default function FindingCard({ finding, justPassed, pasted }: { finding: Finding; justPassed?: boolean; pasted?: boolean }) {
  const s = FINDING_STYLE[finding.status];
  // "Official limit: 1 page · Uploaded CV/résumé: 2 pages" → labeled boxes.
  const evidence = finding.evidence?.split(" · ").map((part) => {
    const i = part.indexOf(": ");
    return i > 0 ? { label: part.slice(0, i), value: part.slice(i + 2) } : { label: "", value: part };
  });
  return (
    <article className={`card border-2 p-4 sm:p-5 ${s.ring} ${justPassed ? "animate-[pass-pulse_900ms_ease-out]" : "animate-[fade-in_220ms_ease-out]"}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${s.iconCls}`}><s.icon className="h-4 w-4" aria-hidden /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h4 className="flex items-center gap-2 font-semibold">
              {finding.title}
              {justPassed && (
                <svg viewBox="0 0 16 16" className="h-4 w-4 text-sage-ink" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-label="Now passed">
                  <path d="M3.5 8.5l3 3 6-7" pathLength="1" className="animate-[draw-check_500ms_ease-out_200ms_both] [stroke-dasharray:1]" />
                </svg>
              )}
            </h4>
            <FindingPill status={finding.status} />
          </div>
          <p className="mt-0.5 text-sm text-muted">{finding.explanation}</p>

          <figure className="mt-3 rounded-xl border-l-4 border-butter-ink/30 bg-butter/45 px-4 py-2.5">
            <blockquote className="text-sm leading-6 text-ink">“{finding.quote}”</blockquote>
            <figcaption className="mt-1 text-xs font-medium text-butter-ink">{pasted ? "Pasted guideline" : `Guideline · p. ${finding.page}`}</figcaption>
          </figure>

          {evidence && (
            <dl className="mt-3 flex flex-wrap gap-2">
              {evidence.map((e, i) => (
                <div key={i} className={`rounded-xl border px-3 py-1.5 text-sm tabular-nums ${i > 0 && finding.status === "action_needed" ? "border-peach bg-peach/40" : "border-line bg-oat/70"}`}>
                  {e.label && <dt className="text-xs text-muted">{e.label}</dt>}
                  <dd className="font-semibold">{e.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {finding.correction && (
            <p className={`mt-3 flex items-start gap-2 text-sm ${finding.status === "action_needed" ? "text-peach-ink" : "text-butter-ink"}`}>
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> <span><span className="font-semibold">Next step:</span> {finding.correction}</span>
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
