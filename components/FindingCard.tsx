import { Wrench } from "lucide-react";
import type { Finding } from "@/lib/types";

const ACCENT = { action_needed: "border-l-rose", needs_verification: "border-l-amber", passed: "border-l-mint" } as const;

export default function FindingCard({ finding, justPassed }: { finding: Finding; justPassed?: boolean }) {
  return (
    <article className={`card border-l-4 p-4 ${ACCENT[finding.status]} ${justPassed ? "animate-[pass-pulse_900ms_ease-out]" : "animate-[fade-in_200ms_ease-out]"}`}>
      <h4 className="flex items-center gap-2 font-semibold">
        {finding.title}
        {justPassed && (
          <svg viewBox="0 0 16 16" className="h-4 w-4 text-mint" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-label="Now passed">
            <path d="M3.5 8.5l3 3 6-7" pathLength="1" className="animate-[draw-check_500ms_ease-out_200ms_both] [stroke-dasharray:1]" />
          </svg>
        )}
      </h4>
      <p className="mt-0.5 text-sm text-slate">{finding.explanation}</p>
      <figure className="mt-3">
        <blockquote className="rounded-lg bg-amber/10 px-3 py-2 text-sm">“{finding.quote}”</blockquote>
        <figcaption className="mt-1 text-xs text-slate">Guideline · p. {finding.page}</figcaption>
      </figure>
      {finding.evidence && <p className="mt-3 text-sm font-medium tabular-nums">{finding.evidence}</p>}
      {finding.correction && (
        <p className={`mt-2 flex items-start gap-2 text-sm ${finding.status === "action_needed" ? "text-rose" : "text-[#9a6a17]"}`}>
          <Wrench className="mt-0.5 h-4 w-4 shrink-0" /> <span><span className="font-semibold">Next step:</span> {finding.correction}</span>
        </p>
      )}
    </article>
  );
}
