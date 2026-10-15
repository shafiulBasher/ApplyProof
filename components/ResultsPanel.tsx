"use client";
import { useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import type { Finding, FindingStatus, StoredResults } from "@/lib/types";
import FindingCard from "./FindingCard";

const GROUPS: { status: FindingStatus; label: string; dot: string }[] = [
  { status: "action_needed", label: "Action Needed", dot: "bg-rose" },
  { status: "needs_verification", label: "Needs Verification", dot: "bg-amber" },
  { status: "passed", label: "Passed", dot: "bg-mint" },
];

export default function ResultsPanel({ results }: { results: StoredResults }) {
  const { current, lastError } = results;
  if (!current && !lastError) return null;
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold">Results</h2>
      {lastError && (
        <p className="card flex items-start gap-2 border-rose/30 p-4 text-sm text-rose"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {lastError}</p>
      )}
      {current && GROUPS.map((g) => {
        const items = current.findings.filter((f) => f.status === g.status);
        return <Group key={`${g.status}-${current.ranAt}`} {...g} items={items} defaultOpen={g.status !== "passed" && items.length > 0} />;
      })}
    </section>
  );
}

function Group({ label, dot, items, defaultOpen }: { label: string; dot: string; items: Finding[]; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button className="flex w-full items-center gap-2 py-2 text-left font-semibold" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        {label}
        <span className="rounded-full bg-navy/5 px-2 text-sm tabular-nums text-slate">{items.length}</span>
        <ChevronDown className={`ml-auto h-4 w-4 text-slate transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="space-y-3">{items.map((f) => <FindingCard key={f.requirementId} finding={f} />)}</div>}
    </div>
  );
}
