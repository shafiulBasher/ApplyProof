"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { db, save } from "@/lib/db";
import { getExtraction } from "@/lib/runCheck";
import type { Application, Extraction, StoredDocument } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import DocumentManager from "@/components/DocumentManager";
import DisclosureDialog from "@/components/DisclosureDialog";
import RunButton from "@/components/RunButton";

export default function ApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<Application | null | undefined>(undefined);
  const [docs, setDocs] = useState<StoredDocument[]>([]);
  const [asking, setAsking] = useState(false);
  const answer = useRef<(ok: boolean) => void>(() => {});
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [extraction, setExtraction] = useState<Extraction | null>(null);

  const load = useCallback(async () => {
    setApp((await db.applications.get(id)) ?? null);
    setDocs(await db.documents.where("applicationId").equals(id).sortBy("uploadedAt"));
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
    if (!guideline) return setError("Upload an official application guideline first.");
    setRunning(true);
    setError("");
    try {
      setExtraction(await getExtraction(guideline));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRunning(false);
    }
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
            <StatusBadge status="not_checked" />
          </div>
        </div>
        <RunButton canRun={!!guideline} running={running} onRun={run} />
      </header>

      <DocumentManager applicationId={id} documents={docs} onChange={load} beforeUpload={beforeUpload} />

      {error && <p className="card border-rose/30 p-4 text-sm text-rose">{error}</p>}

      {/* shortcut: plain requirements list until slice 3 replaces it with the Results Panel */}
      {extraction && (
        <section className="card p-6">
          <h2 className="text-xl font-bold">Requirements found ({extraction.requirements.length})</h2>
          <ul className="mt-4 space-y-3">
            {extraction.requirements.map((r) => (
              <li key={r.id} className="rounded-xl border border-navy/10 p-3">
                <p className="font-semibold">{r.title} <span className="text-xs font-normal text-slate">· {r.category}</span></p>
                <blockquote className="mt-2 rounded-lg bg-amber/10 px-3 py-2 text-sm">“{r.quote}”</blockquote>
                <p className="mt-1 text-xs text-slate">
                  Guideline · p. {r.page} {!r.quoteVerified && <span className="text-[#9a6a17]">· We couldn&apos;t confirm this quote in the guideline.</span>}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {asking && <DisclosureDialog onAnswer={(ok) => answer.current(ok)} />}
    </div>
  );
}
