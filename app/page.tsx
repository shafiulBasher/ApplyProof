"use client";
import { useEffect, useState } from "react";
import { FileCheck2, Plus } from "lucide-react";
import { db } from "@/lib/db";
import type { Application, StoredResults } from "@/lib/types";
import Logo from "@/components/Logo";
import ApplicationCard from "@/components/ApplicationCard";
import NewApplicationDialog from "@/components/NewApplicationDialog";

export default function Dashboard() {
  const [apps, setApps] = useState<Application[] | null>(null);
  const [results, setResults] = useState<Map<string, StoredResults>>(new Map());
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    (async () => {
      setApps(await db.applications.orderBy("createdAt").reverse().toArray());
      setResults(new Map((await db.results.toArray()).map((r) => [r.applicationId, r])));
    })();
  }, []);

  return (
    <>
      <header className="mb-8 flex items-center justify-between gap-4">
        <Logo />
        <button className="btn-primary" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> New Application
        </button>
      </header>
      <h1 className="mb-6 text-[32px] font-bold tracking-tight">Your applications</h1>

      {apps && apps.length === 0 && (
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <FileCheck2 className="h-10 w-10 text-violet" />
          <p className="text-lg font-semibold">Know what&apos;s missing before you submit.</p>
          <p className="max-w-md text-slate">
            Create an application, upload its official guideline and your documents, and ApplyProof checks every requirement, with the guideline&apos;s own words as evidence.
          </p>
          <button className="btn-primary mt-2" onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New Application</button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {apps?.map((a) => <ApplicationCard key={a.id} app={a} result={results.get(a.id)?.current} />)}
      </div>

      {apps && apps.length > 0 && (
        <p className="mt-8 text-xs text-slate">Your applications and files are stored only in this browser. Clearing your browser data removes them.</p>
      )}

      {creating && <NewApplicationDialog onClose={() => setCreating(false)} />}
    </>
  );
}
