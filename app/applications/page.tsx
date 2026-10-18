"use client";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import type { Application, StoredResults } from "@/lib/types";
import ApplicationCard from "@/components/ApplicationCard";
import NewApplicationDialog from "@/components/NewApplicationDialog";
import { nextSketch, Notebook, Sparkle } from "@/components/Illustrations";
import type { OverallStatus } from "@/components/StatusBadge";
import { summaryFor, trackingOf } from "@/lib/tracking";

// Readiness filters plus two tracking filters.
const FILTERS: { key: "all" | OverallStatus | "submitted" | "missed"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "action_needed", label: "Action Needed" },
  { key: "needs_verification", label: "Needs Verification" },
  { key: "passed", label: "Ready to submit" },
  { key: "not_checked", label: "Not Checked" },
  { key: "submitted", label: "Submitted" },
  { key: "missed", label: "Missed" },
];

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

export default function Dashboard() {
  const [apps, setApps] = useState<Application[] | null>(null);
  const [results, setResults] = useState<Map<string, StoredResults>>(new Map());
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [hello, setHello] = useState("");

  useEffect(() => {
    setHello(greeting());
    (async () => {
      const all = await db.applications.orderBy("createdAt").toArray();
      // Older applications have no sketch yet: give each a distinct one, once, oldest first.
      for (const a of all.filter((x) => x.sketch === undefined)) {
        a.sketch = nextSketch(all.map((x) => x.sketch));
        await db.applications.update(a.id, { sketch: a.sketch }).catch(() => {});
      }
      setApps(all.reverse());
      setResults(new Map((await db.results.toArray()).map((r) => [r.applicationId, r])));
    })();
  }, []);

  const statusOf = (a: Application): OverallStatus => summaryFor(a, results.get(a.id)?.current).status;
  // Submitted or missed applications leave the readiness tabs: they're no longer something to get ready.
  const active = (a: Application) => !["submitted", "missed"].includes(trackingOf(a).kind);
  const matches = (a: Application, k: (typeof FILTERS)[number]["key"]) =>
    k === "all" || (k === "submitted" || k === "missed" ? trackingOf(a).kind === k : active(a) && statusOf(a) === k);
  const count = (k: (typeof FILTERS)[number]["key"]) => (apps ?? []).filter((a) => matches(a, k)).length;
  const shown = (apps ?? []).filter((a) => matches(a, filter));

  return (
    <>
      <header className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{hello && `${hello},`}</p>
          <h1 className="mt-1 text-4xl font-semibold leading-tight sm:text-5xl">
            Your next chapter <br className="hidden sm:block" />starts here.
          </h1>
          <p className="mt-2 text-muted">Keep track of your applications and make sure you&apos;re always ready.</p>
        </div>
        <button className="btn-primary" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> New Application
        </button>
        <Sparkle className="absolute -top-2 right-48 hidden h-7 w-7 animate-[twinkle_3s_ease-in-out_infinite] md:block" />
      </header>

      {apps && apps.length > 0 && (
        <div className="mt-8 flex gap-1 overflow-x-auto border-b border-line" role="tablist" aria-label="Filter applications">
          {FILTERS.filter((f) => f.key === "all" || count(f.key) > 0).map((f) => (
            <button
              key={f.key}
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition ${filter === f.key ? "border-primary text-primary-ink" : "border-transparent text-muted hover:text-ink"}`}
            >
              {f.label} <span className="tabular-nums">({count(f.key)})</span>
            </button>
          ))}
        </div>
      )}

      {apps && apps.length === 0 && (
        <div className="card mt-10 flex flex-col items-center gap-3 px-6 py-12 text-center">
          <Notebook className="h-28 w-36" />
          <h2 className="text-2xl font-semibold">Know what&apos;s missing before you submit.</h2>
          <p className="max-w-md text-muted">
            Create an application, add its official guideline and your documents, and ApplyProof checks every requirement, with the guideline&apos;s own words as evidence.
          </p>
          <button className="btn-primary mt-2" onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New Application</button>
          <p className="hand-note mt-2">Every big dream starts somewhere…</p>
        </div>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((a) => <ApplicationCard key={a.id} app={a} result={results.get(a.id)?.current} />)}
      </div>

      {apps && apps.length > 0 && (
        <p className="mt-10 text-xs text-muted">Your applications and files are stored only in this browser. Clearing your browser data removes them.</p>
      )}

      {creating && <NewApplicationDialog onClose={() => setCreating(false)} />}
    </>
  );
}
