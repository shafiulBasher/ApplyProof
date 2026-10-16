import { Wrench } from "lucide-react";
import type { Finding } from "@/lib/types";

const ACCENT = { action_needed: "border-l-rose", needs_verification: "border-l-amber", passed: "border-l-mint" } as const;

export default function FindingCard({ finding }: { finding: Finding }) {
  return (
    <article className={`card animate-[fade-in_200ms_ease-out] border-l-4 p-4 ${ACCENT[finding.status]}`}>
      <h4 className="font-semibold">{finding.title}</h4>
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
