"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { db, save } from "@/lib/db";
import { runCheck } from "@/lib/runCheck";
import type { Application, StoredDocument, StoredResults } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import DocumentManager from "@/components/DocumentManager";
import DisclosureDialog from "@/components/DisclosureDialog";
import RunButton from "@/components/RunButton";
import ApplicantInfoForm from "@/components/ApplicantInfoForm";
import ResultsPanel from "@/components/ResultsPanel";

export default function ApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<Application | null | undefined>(undefined);
  const [docs, setDocs] = useState<StoredDocument[]>([]);
  const [results, setResults] = useState<StoredResults>({ applicationId: id });
  const [asking, setAsking] = useState(false);
  const answer = useRef<(ok: boolean) => void>(() => {});
  const [running, setRunning] = useState(false);

  const load = useCallback(async () => {
    setApp((await db.applications.get(id)) ?? null);
    setDocs(await db.documents.where("applicationId").equals(id).sortBy("uploadedAt"));
    setResults((await db.results.get(id)) ?? { applicationId: id });
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const guideline = docs.find((d) => d.role === "guideline" && d.readable);

  // Shown once per application, before its first upload.
  async function beforeUpload() {
    if (app?.disclosureAccepted) return true;
    setAsking(true);
    const ok = await new Promise<boolean>((resolve) => (answer.current = resolve));
    setAsking(false);
    if (ok) await save("your acknowledgment", () => db.applications.update(id, { disclosureAccepted: true }));
    await load();
    return ok;
  }

  async function run() {
    if (!app) return;
    setRunning(true);
    // Re-read so the check uses the latest saved applicant info.
    await runCheck((await db.applications.get(id)) ?? app, docs);
    await load();
    setRunning(false);
  }

  if (app === undefined) return null;
  if (app === null) return <p>This application wasn&apos;t found. <Link className="text-violet underline" href="/">Back to dashboard</Link></p>;

  return (
    <div className="space-y-6">
      <Link href="/" className="btn-ghost -ml-2.5"><ArrowLeft className="h-4 w-4" /> All applications</Link>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold leading-tight tracking-tight">{app.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate">
            {app.organization && <span>{app.organization}</span>}
            {app.deadline && <span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4" /> {app.deadline}</span>}
            <StatusBadge status={results.current?.status ?? "not_checked"} />
            {results.current && <span className="tabular-nums">{results.current.outstanding} outstanding</span>}
          </div>
        </div>
        <RunButton canRun={!!guideline} running={running} onRun={run} />
      </header>

      <DocumentManager applicationId={id} documents={docs} onChange={load} beforeUpload={beforeUpload} />
      <ApplicantInfoForm applicationId={id} initial={app.applicant} onSaved={load} />
      <ResultsPanel results={results} />

      {asking && <DisclosureDialog onAnswer={(ok) => answer.current(ok)} />}
    </div>
  );
}
