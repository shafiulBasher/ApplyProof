"use client";
import { useState } from "react";
import { AlertTriangle, ChevronDown, Clock } from "lucide-react";
import { whatChanged } from "@/lib/diff";
import type { Finding, FindingStatus, StoredResults } from "@/lib/types";
import FindingCard, { FINDING_STYLE } from "./FindingCard";
import WhatChanged from "./WhatChanged";

const ORDER: FindingStatus[] = ["action_needed", "needs_verification", "passed"];

export default function ResultsPanel({ results, outdated }: { results: StoredResults; outdated: boolean }) {
  const { current, previous, lastError } = results;
  if (!current && !lastError) return null;
  const changes = current && previous ? whatChanged(previous, current) : undefined;
  const justPassed = new Set(changes?.statusChanges.filter((c) => c.to === "passed").map((c) => c.requirementId));
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
      {current && ORDER.map((status) => {
        const items = current.findings.filter((f) => f.status === status);
        return (
          <Group key={`${status}-${current.ranAt}`} status={status} items={items} justPassed={justPassed} pasted={!!current.guidelinePasted}
            defaultOpen={items.length > 0 && (status !== "passed" || items.some((f) => justPassed.has(f.requirementId)))} />
        );
      })}
    </section>
  );
}

function Group({ status, items, justPassed, pasted, defaultOpen }: { status: FindingStatus; items: Finding[]; justPassed: Set<string>; pasted: boolean; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const s = FINDING_STYLE[status];
  return (
    <div>
      <button className="flex w-full items-center gap-2 rounded-xl py-2 text-left" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${s.pill}`}>
          <s.icon className="h-4 w-4" aria-hidden /> {s.label} <span className="tabular-nums">({items.length})</span>
        </span>
        <span className="h-px flex-1 bg-line" aria-hidden />
        <ChevronDown className={`h-4 w-4 text-muted transition ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <div className="mt-1 space-y-3">
          {items.length === 0 && <p className="px-1 text-sm text-muted">Nothing here.</p>}
          {items.map((f) => <FindingCard key={f.requirementId} finding={f} justPassed={justPassed.has(f.requirementId)} pasted={pasted} />)}
        </div>
      )}
    </div>
  );
}
