import { ArrowRight } from "lucide-react";
import type { Changes } from "@/lib/diff";
import { FindingPill } from "./FindingCard";
import { Sparkle } from "./Illustrations";

export default function WhatChanged({ changes }: { changes: Changes }) {
  const { newRequirements, statusChanges, measuredChanges, outstanding } = changes;
  const nothing = !newRequirements && statusChanges.length === 0 && measuredChanges.length === 0 && outstanding.from === outstanding.to;
  return (
    <div className="card relative overflow-hidden border-primary/20 p-5 animate-[fade-in_250ms_ease-out]">
      <Sparkle className="absolute right-4 top-4 h-6 w-6 animate-[twinkle_3s_ease-in-out_infinite]" />
      <h3 className="font-display text-xl font-semibold">What changed since your last check</h3>
      {newRequirements ? (
        <p className="mt-2 text-sm text-muted">Requirements were re-read from a new guideline, so this check can&apos;t be compared with the last one.</p>
      ) : nothing ? (
        <p className="mt-2 text-sm text-muted">No changes since your last check.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm tabular-nums">
          {statusChanges.map((c) => (
            <li key={`s-${c.requirementId}`} className="flex flex-wrap items-center gap-2 rounded-xl bg-oat/70 px-3 py-2">
              <span className="mr-auto font-medium">{c.title}</span>
              <FindingPill status={c.from} />
              <ArrowRight className="h-4 w-4 text-muted" aria-label="changed to" />
              <FindingPill status={c.to} />
            </li>
          ))}
          {measuredChanges.map((c) => (
            <li key={`m-${c.requirementId}`} className="px-3 text-muted">{c.title}: {c.from} → <span className="font-semibold text-ink">{c.to}</span>{c.unit ? ` ${c.unit}` : ""}</li>
          ))}
          {outstanding.from !== outstanding.to && (
            <li className="px-3 text-muted">Outstanding issues: {outstanding.from} → <span className="font-semibold text-ink">{outstanding.to}</span></li>
          )}
        </ul>
      )}
    </div>
  );
}
