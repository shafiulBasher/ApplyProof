import { ArrowRight, History } from "lucide-react";
import type { Changes } from "@/lib/diff";
import type { FindingStatus } from "@/lib/types";

const LABEL: Record<FindingStatus, string> = { passed: "Passed", action_needed: "Action Needed", needs_verification: "Needs Verification" };
const COLOR: Record<FindingStatus, string> = { passed: "text-[#1f8a63]", action_needed: "text-rose", needs_verification: "text-[#9a6a17]" };

export default function WhatChanged({ changes }: { changes: Changes }) {
  const { newRequirements, statusChanges, measuredChanges, outstanding } = changes;
  const nothing = !newRequirements && statusChanges.length === 0 && measuredChanges.length === 0 && outstanding.from === outstanding.to;
  return (
    <div className="card animate-[fade-in_200ms_ease-out] border-violet/20 p-5">
      <h3 className="flex items-center gap-2 font-semibold"><History className="h-4 w-4 text-violet" /> What changed since your last check</h3>
      {newRequirements ? (
        <p className="mt-2 text-sm text-slate">Requirements were re-read from a new guideline, so this check can&apos;t be compared with the last one.</p>
      ) : nothing ? (
        <p className="mt-2 text-sm text-slate">No changes since your last check.</p>
      ) : (
        <ul className="mt-3 space-y-1.5 text-sm tabular-nums">
          {statusChanges.map((c) => (
            <li key={`s-${c.requirementId}`} className="flex flex-wrap items-center gap-1.5">
              <span className="font-medium">{c.title}:</span>
              <span className={COLOR[c.from]}>{LABEL[c.from]}</span> <ArrowRight className="h-3.5 w-3.5 text-slate" /> <span className={`font-semibold ${COLOR[c.to]}`}>{LABEL[c.to]}</span>
            </li>
          ))}
          {measuredChanges.map((c) => (
            <li key={`m-${c.requirementId}`} className="text-slate">{c.title}: {c.from} → {c.to}{c.unit ? ` ${c.unit}` : ""}</li>
          ))}
          {outstanding.from !== outstanding.to && <li className="text-slate">Outstanding issues: {outstanding.from} → {outstanding.to}</li>}
        </ul>
      )}
    </div>
  );
}
