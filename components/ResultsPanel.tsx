"use client";
import { useState } from "react";
import { AlertTriangle, ChevronDown, Clock, PartyPopper, UserCheck } from "lucide-react";
import { whatChanged } from "@/lib/diff";
import type { Application, FactField, Finding, FindingStatus, StoredResults } from "@/lib/types";
import { confirmationFor } from "@/lib/tracking";
import { ActionCard, CheckNote, FINDING_STYLE, PassedRow } from "./FindingCard";
import WhatChanged from "./WhatChanged";

export default function ResultsPanel({ results, outdated, onFix, app, onConfirm, onAddDetail }: {
  results: StoredResults; outdated: boolean; onFix?: (f: Finding) => void;
  app?: Pick<Application, "confirmations">; onConfirm?: (f: Finding, note: string | null) => void;
  onAddDetail?: (field: FactField) => void;
}) {
  const { current, previous, lastError } = results;
  if (!current && !lastError) return null;
  const changes = current && previous ? whatChanged(previous, current) : undefined;
  const justPassed = new Set(changes?.statusChanges.filter((c) => c.to === "passed").map((c) => c.requirementId));
  const pasted = !!current?.guidelinePasted;
  const of = (s: FindingStatus) => current?.findings.filter((f) => f.status === s) ?? [];
  const action = of("action_needed");
  // Confirmed items leave the pending group; their check result itself stays Needs Verification.
  const isConfirmed = (f: Finding) => !!(app && confirmationFor(app, f));
  const verify = of("needs_verification").filter((f) => !isConfirmed(f));
  const confirmed = of("needs_verification").filter(isConfirmed);
  const passed = of("passed");

  return (
    <section id="results" className="scroll-mt-6 space-y-4">
      <div>
        <p className="eyebrow">Step 4</p>
        <h2 className="mt-1 text-3xl font-semibold">Results</h2>
        <p className="mt-1 text-sm text-muted">We checked your documents against the official requirements. Fix the top group first.</p>
      </div>
      {current && outdated && (
        <p className="flex items-start gap-2 rounded-2xl border border-butter-ink/20 bg-butter/60 p-4 text-sm text-butter-ink" role="status">
          <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span><span className="font-semibold">Outdated.</span> Your files or details changed since this check. Run the check again to update the results.</span>
        </p>
      )}
      {lastError && (
        <p className="flex items-start gap-2 rounded-2xl border border-peach-ink/20 bg-peach/60 p-4 text-sm text-peach-ink" role="alert"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {lastError}</p>
      )}
      {changes && <WhatChanged key={current!.ranAt} changes={changes} />}

      {current && (
        <>
          <Group key={`a-${current.ranAt}`} status="action_needed" count={action.length} defaultOpen>
            {action.length === 0 ? (
              <p className="flex items-center gap-2 rounded-2xl bg-sage/70 px-4 py-3 text-sm font-medium text-sage-ink"><PartyPopper className="h-4 w-4" aria-hidden /> Nothing to fix right now.</p>
            ) : (
              <div className="space-y-5 pt-2">
                {action.map((f, i) => <ActionCard key={f.requirementId} f={f} index={i} pasted={pasted} onFix={onFix} />)}
              </div>
            )}
          </Group>
          <Group key={`v-${current.ranAt}`} status="needs_verification" count={verify.length} defaultOpen={verify.length > 0}>
            {verify.length === 0 ? (
              <p className="rounded-2xl bg-oat px-4 py-3 text-sm text-muted">Nothing left to check yourself.</p>
            ) : (
              <div className="grid gap-5 pt-3 md:grid-cols-2">
                {verify.map((f, i) => (
                  <CheckNote key={f.requirementId} f={f} index={i} pasted={pasted} onConfirm={onConfirm && ((note) => onConfirm(f, note))} onAddDetail={onAddDetail} />
                ))}
              </div>
            )}
          </Group>
          {confirmed.length > 0 && (
            <Group key={`c-${current.ranAt}`} label="Confirmed by you" pill="bg-lilac text-primary-ink" icon={UserCheck} count={confirmed.length} defaultOpen>
              <p className="pt-1 text-xs text-muted">You confirmed these yourself. ApplyProof couldn&apos;t verify them from your files.</p>
              <div className="grid gap-5 pt-3 md:grid-cols-2">
                {confirmed.map((f, i) => (
                  <CheckNote key={f.requirementId} f={f} index={i} pasted={pasted} confirmation={confirmationFor(app!, f)} onConfirm={onConfirm && ((note) => onConfirm(f, note))} />
                ))}
              </div>
            </Group>
          )}
          <Group key={`p-${current.ranAt}`} status="passed" count={passed.length} defaultOpen={passed.some((f) => justPassed.has(f.requirementId))}>
            <ul className="card divide-y divide-line/70 p-2">
              {passed.map((f) => <PassedRow key={f.requirementId} f={f} pasted={pasted} justPassed={justPassed.has(f.requirementId)} />)}
            </ul>
          </Group>
        </>
      )}
    </section>
  );
}

function Group({ status, label, pill, icon, count, defaultOpen, children }: {
  status?: FindingStatus; label?: string; pill?: string; icon?: typeof UserCheck; count: number; defaultOpen: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const s = status ? FINDING_STYLE[status] : { label: label!, pill: pill!, icon: icon! };
  return (
    <div>
      <button className="flex w-full items-center gap-2 rounded-xl py-2 text-left" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${s.pill}`}>
          <s.icon className="h-4 w-4" aria-hidden /> {s.label} <span className="tabular-nums">({count})</span>
        </span>
        <span className="h-px flex-1 bg-line" aria-hidden />
        <ChevronDown className={`h-4 w-4 text-muted transition ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && <div className="mt-1">{children}</div>}
    </div>
  );
}
