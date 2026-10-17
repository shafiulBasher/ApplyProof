"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Undo2 } from "lucide-react";
import { guidelineDeadline, trackingOf } from "@/lib/tracking";
import TrackingPill from "@/components/TrackingPill";
import { db, save } from "@/lib/db";
import { cachedExtraction, currentInputHash, getExtraction, runCheck } from "@/lib/runCheck";
import type { Application, Extraction, Finding, StoredDocument, StoredResults } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import DocumentManager from "@/components/DocumentManager";
import DisclosureDialog from "@/components/DisclosureDialog";
import RunButton from "@/components/RunButton";
import ApplicantInfoForm from "@/components/ApplicantInfoForm";
import ResultsPanel from "@/components/ResultsPanel";
import RequirementsChecklist from "@/components/RequirementsChecklist";
import { University } from "@/components/Illustrations";
import { countDocs } from "@/lib/checks";

export default function ApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<Application | null | undefined>(undefined);
  const [docs, setDocs] = useState<StoredDocument[]>([]);
  const [results, setResults] = useState<StoredResults>({ applicationId: id });
  const [asking, setAsking] = useState(false);
  const answer = useRef<(ok: boolean) => void>(() => {});
  const [running, setRunning] = useState(false);
  const [extraction, setExtraction] = useState<Extraction>();
  const [reading, setReading] = useState(false);
  const [readError, setReadError] = useState("");
  const [outdated, setOutdated] = useState(false);

  const load = useCallback(async () => {
    setApp((await db.applications.get(id)) ?? null);
    const documents = await db.documents.where("applicationId").equals(id).sortBy("uploadedAt");
    setDocs(documents);
    setResults((await db.results.get(id)) ?? { applicationId: id });
    const g = documents.find((d) => d.role === "guideline" && d.readable);
    setExtraction(g ? await cachedExtraction(g) : undefined);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Outdated whenever the current inputs differ from the ones the last successful check used.
  useEffect(() => {
    if (!app || !results.current) return setOutdated(false);
    const expected = results.current.inputHash;
    currentInputHash(docs, app.applicant).then((h) => setOutdated(h !== expected));
  }, [app, docs, results]);

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

  // Reads the guideline's requirements right after upload (or on Retry). Only after the disclosure was accepted.
  async function readRequirements() {
    // Set before any await, so the checklist never flashes "Couldn't read" while the read is starting.
    setReading(true);
    setReadError("");
    const fresh = await db.applications.get(id);
    const g = (await db.documents.where("applicationId").equals(id).toArray()).find((d) => d.role === "guideline" && d.readable);
    if (!g || !fresh?.disclosureAccepted) return setReading(false);
    try {
      const ex = await getExtraction(g);
      setExtraction(ex);
      // No deadline entered yet: take the guideline's, but only a date that appears in its verified quote.
      const due = guidelineDeadline(ex.requirements);
      if (!fresh.deadline && due) await updateApp("the deadline", { deadline: due });
    } catch (e) {
      setReadError((e as Error).message);
    } finally {
      setReading(false);
    }
  }

  async function updateApp(what: string, changes: Partial<Application>) {
    await save(what, () => db.applications.update(id, changes));
    await load();
  }

  async function run() {
    if (!app) return;
    setRunning(true);
    // Re-read so the check uses the latest saved applicant info.
    await runCheck((await db.applications.get(id)) ?? app, docs);
    await load();
    setRunning(false);
  }

  // "Replace file" on a fix-first card: open the picker for that document, or the upload area if it's missing.
  function fix(f: Finding) {
    const row = document.querySelector<HTMLElement>(`#documents [data-doctype="${f.docType}"]`);
    const target = row ?? document.querySelector<HTMLElement>("#documents");
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    row?.animate([{ boxShadow: "0 0 0 0 rgba(120,97,207,0.6)" }, { boxShadow: "0 0 0 10px rgba(120,97,207,0)" }], { duration: 1200 });
    const input = row?.querySelector<HTMLInputElement>("input[type=file]") ?? document.querySelector<HTMLInputElement>("#documents input[type=file][multiple]");
    input?.click();
  }

  if (app === undefined) return null;
  if (app === null) return <p>This application wasn&apos;t found. <Link className="text-primary underline" href="/applications">Back to your applications</Link></p>;

  // Progress tracker: each step reflects real state, not just page position.
  const required = extraction?.requirements.filter((r) => r.category === "required_document") ?? [];
  const applicantDocs = docs.filter((d) => d.role === "applicant");
  const steps = [
    { href: "#guideline", label: "Guideline", done: !!extraction },
    { href: "#documents", label: "Documents", done: required.length > 0 && required.every((r) => countDocs(applicantDocs, r.docType) >= (r.count ?? 1)) },
    { href: "#details", label: "Details", done: Object.values(app.applicant).some((v) => v !== undefined && v !== "") },
    { href: "#results", label: "Results", done: !!results.current && !outdated },
  ];

  return (
    <div className="space-y-6">
      <Link href="/applications" className="btn-ghost -ml-2.5"><ArrowLeft className="h-4 w-4" aria-hidden /> All applications</Link>

      <header className="card relative overflow-hidden p-5 sm:p-6">
        <University variant={1} className="pointer-events-none absolute -bottom-2 right-2 hidden h-28 w-52 opacity-60 md:block" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{app.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted">
              {app.organization && <span>{app.organization}</span>}
              <StatusBadge status={results.current?.status ?? "not_checked"} />
              {results.current && <span className="tabular-nums">{results.current.outstanding} outstanding</span>}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <TrackingPill t={trackingOf(app)} />
              <label className="inline-flex items-center gap-2 text-muted">
                Deadline
                <input type="date" className="input w-auto py-1" value={app.deadline ?? ""} onChange={(e) => updateApp("the deadline", { deadline: e.target.value || undefined })} />
              </label>
              {app.submittedAt ? (
                <button className="btn-ghost" onClick={() => updateApp("the submission status", { submittedAt: undefined })}><Undo2 className="h-4 w-4" aria-hidden /> Undo submitted</button>
              ) : (
                <button className="btn-secondary py-1.5" onClick={() => updateApp("the submission status", { submittedAt: Date.now() })}><Send className="h-4 w-4" aria-hidden /> Mark as submitted</button>
              )}
            </div>
          </div>
          <RunButton canRun={!!guideline} running={running || reading} onRun={run} />
        </div>
        <ol className="relative mt-6 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm" aria-label="Progress">
          {steps.map((s, i) => (
            <li key={s.href} className="flex items-center gap-2">
              <a href={s.href} className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-medium transition hover:bg-lilac ${s.done ? "bg-lilac text-primary-ink" : "text-muted"}`}>
                <span className={`grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold ${s.done ? "bg-primary text-white" : "border border-muted/40"}`}>
                  {s.done ? "✓" : i + 1}
                </span>
                {s.label}
                <span className="sr-only">{s.done ? "(done)" : "(to do)"}</span>
              </a>
              {i < steps.length - 1 && <span className="h-px w-5 bg-line" aria-hidden />}
            </li>
          ))}
        </ol>
      </header>

      <DocumentManager
        applicationId={id}
        documents={docs}
        onChange={load}
        beforeUpload={beforeUpload}
        onGuidelineUploaded={readRequirements}
        guidelineExtra={<RequirementsChecklist extraction={extraction} documents={docs} reading={reading} error={readError} onRetry={readRequirements} />}
      />
      <ApplicantInfoForm applicationId={id} initial={app.applicant} onSaved={load} />
      <ResultsPanel results={results} outdated={outdated} onFix={fix} />

      {asking && <DisclosureDialog onAnswer={(ok) => answer.current(ok)} />}
    </div>
  );
}
