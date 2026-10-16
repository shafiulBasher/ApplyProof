"use client";
import { useRef, useState } from "react";
import { ClipboardPaste, FileText, RefreshCw, Trash2, Upload, AlertTriangle } from "lucide-react";
import { db, save } from "@/lib/db";
import { sha256 } from "@/lib/hash";
import { suggestType } from "@/lib/docTypes";
import { DOC_TYPE_LABELS, type DocType, type ParsedPdf, type StoredDocument } from "@/lib/types";

const UNREADABLE = "We couldn't extract readable text from this PDF. It may be scanned or image-based. Please upload a text-readable PDF.";
const MIN_PASTED_WORDS = 30;

async function readPdf(file: File): Promise<ParsedPdf & { contentHash: string }> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/parse", { method: "POST", body: form });
  const body = await res.json();
  if (!res.ok) throw new Error(`${file.name}: ${body.error}`);
  return { ...body, contentHash: await sha256(await file.arrayBuffer()) };
}

interface Props {
  applicationId: string;
  documents: StoredDocument[];
  onChange: () => void;
  // Called before the first upload; resolves false if the user cancels.
  beforeUpload?: () => Promise<boolean>;
  // Called after a guideline is uploaded or replaced.
  onGuidelineUploaded?: () => Promise<void>;
  // Shown under the guideline (the requirements checklist).
  guidelineExtra?: React.ReactNode;
}

export default function DocumentManager({ applicationId, documents, onChange, beforeUpload, onGuidelineUploaded, guidelineExtra }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pasting, setPasting] = useState(false);
  const [mode, setMode] = useState<"pdf" | "paste">("pdf");
  const guideline = documents.find((d) => d.role === "guideline");
  const applicantDocs = documents.filter((d) => d.role === "applicant");

  async function run(task: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await task();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      onChange();
    }
  }

  // Adds new files, or overwrites `existing` when replacing.
  function upload(files: File[], role: StoredDocument["role"], existing?: StoredDocument) {
    return run(async () => {
      if (beforeUpload && !(await beforeUpload())) return;
      for (const file of files) {
        const parsed = await readPdf(file);
        const suggested = role === "applicant" ? suggestType(file.name) : undefined;
        const doc: StoredDocument = {
          ...parsed,
          id: existing?.id ?? crypto.randomUUID(),
          applicationId,
          role,
          fileName: file.name,
          blob: file,
          suggestedType: suggested,
          confirmedType: suggested ?? existing?.confirmedType,
          uploadedAt: Date.now(),
        };
        await save(`"${file.name}"`, () => db.documents.put(doc));
      }
      if (role === "guideline") {
        const reading = onGuidelineUploaded?.();
        onChange();
        await reading;
      }
    });
  }

  // Saves pasted guideline text as the guideline (one "page"), replacing any existing guideline.
  async function savePasted(text: string): Promise<boolean> {
    const clean = text.trim();
    if (clean.split(/\s+/).filter(Boolean).length < MIN_PASTED_WORDS) {
      setError(`Paste the full guideline text (at least ${MIN_PASTED_WORDS} words) so its requirements can be read.`);
      return false;
    }
    let saved = false;
    await run(async () => {
      if (beforeUpload && !(await beforeUpload())) return;
      const doc: StoredDocument = {
        id: guideline?.id ?? crypto.randomUUID(),
        applicationId,
        role: "guideline",
        source: "pasted",
        fileName: "Pasted guideline",
        blob: new Blob([clean], { type: "text/plain" }),
        contentHash: await sha256(clean),
        pages: [clean],
        pageCount: 1,
        wordCount: clean.split(/\s+/).length,
        readable: true,
        uploadedAt: Date.now(),
      };
      await save("the pasted guideline", () => db.documents.put(doc));
      saved = true;
      const reading = onGuidelineUploaded?.();
      onChange();
      await reading;
    });
    return saved;
  }

  const setType = (doc: StoredDocument, t: string) =>
    run(() => save(`the type for "${doc.fileName}"`, () => db.documents.update(doc.id, { confirmedType: (t || undefined) as DocType | undefined })).then(() => {}));

  const remove = (doc: StoredDocument) => run(() => db.documents.delete(doc.id));

  const status = (busy || error) && (
    <div aria-live="polite">
      {busy && <p className="mt-3 text-sm text-muted">Reading…</p>}
      {error && <p className="mt-3 rounded-xl bg-peach/60 px-3 py-2 text-sm text-peach-ink">{error}</p>}
    </div>
  );

  return (
    <>
      <section id="guideline" className="card scroll-mt-6 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Step 1</p>
            <h2 className="mt-1 text-2xl font-semibold">Official guideline</h2>
          </div>
          {!guideline && !pasting && (
            <div className="flex rounded-xl bg-lilac/60 p-1 text-sm" role="tablist" aria-label="How to add the guideline">
              <button role="tab" aria-selected={mode === "pdf"} onClick={() => setMode("pdf")} className={`rounded-lg px-3 py-1.5 font-medium ${mode === "pdf" ? "bg-white text-primary-ink shadow-sm" : "text-muted"}`}>Upload PDF</button>
              <button role="tab" aria-selected={mode === "paste"} onClick={() => setMode("paste")} className={`rounded-lg px-3 py-1.5 font-medium ${mode === "paste" ? "bg-white text-primary-ink shadow-sm" : "text-muted"}`}>Paste text</button>
            </div>
          )}
        </div>

        {guideline && !pasting && (
          <div className="mt-4">
            <DocRow doc={guideline} onReplace={(f) => upload([f], "guideline", guideline)} onRemove={() => remove(guideline)} busy={busy} />
            <button className="btn-ghost mt-2" disabled={busy} onClick={() => setPasting(true)}>
              <ClipboardPaste className="h-4 w-4" /> Replace with pasted text
            </button>
          </div>
        )}
        {(pasting || (!guideline && mode === "paste")) && (
          <PasteBox
            busy={busy}
            onCancel={guideline ? () => { setPasting(false); setError(""); } : undefined}
            onSave={async (t) => { if (await savePasted(t)) setPasting(false); }}
          />
        )}
        {!guideline && !pasting && mode === "pdf" && (
          <DropZone label="Drop your guideline PDF here" hint="or click to browse · PDF only" onPick={(f) => upload(f.slice(0, 1), "guideline")} busy={busy} />
        )}
        {guideline?.readable && guidelineExtra}
        {status && !applicantDocs.length && status}
      </section>

      <section id="documents" className="card relative scroll-mt-6 p-5 sm:p-6">
        <p className="hand-note absolute right-6 top-4 hidden rotate-[-5deg] md:block" aria-hidden>You&apos;re one step closer ✦</p>
        <p className="eyebrow">Step 2</p>
        <h2 className="mt-1 text-2xl font-semibold">Your documents</h2>
        <p className="mt-1 text-sm text-muted">PDFs only. They&apos;re read on this computer and never sent anywhere.</p>
        <div className="mt-4 space-y-2">
          {applicantDocs.map((d) => (
            <DocRow key={d.id} doc={d} onReplace={(f) => upload([f], "applicant", d)} onRemove={() => remove(d)} onType={(t) => setType(d, t)} busy={busy} />
          ))}
        </div>
        <DropZone label="Drop your documents here" hint="CV, letters, transcript · or click to browse" multiple onPick={(f) => upload(f, "applicant")} busy={busy} compact={applicantDocs.length > 0} />
        {applicantDocs.length > 0 && status}
      </section>
    </>
  );
}

function DropZone({ label, hint, multiple, onPick, busy, compact }: { label: string; hint: string; multiple?: boolean; onPick: (f: File[]) => void; busy: boolean; compact?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const pick = (files: File[]) => { const pdfs = files.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")); if (pdfs.length) onPick(pdfs); };
  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => ref.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); pick(Array.from(e.dataTransfer.files)); }}
        className={`mt-4 flex w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed text-center transition disabled:opacity-50 ${compact ? "py-4" : "py-9"} ${over ? "border-primary bg-lilac/60" : "border-primary/25 bg-oat/60 hover:border-primary/50 hover:bg-lilac/30"}`}
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-primary shadow-sm"><Upload className="h-4 w-4" aria-hidden /></span>
        <span className="mt-1 text-sm font-semibold text-ink">{label}</span>
        <span className="text-xs text-muted">{hint}</span>
      </button>
      <input ref={ref} type="file" accept="application/pdf,.pdf" multiple={multiple} hidden
        onChange={(e) => { const f = Array.from(e.target.files ?? []); e.target.value = ""; pick(f); }} />
    </>
  );
}

function DocRow({ doc, onReplace, onRemove, onType, busy }: {
  doc: StoredDocument; onReplace: (f: File) => void; onRemove: () => void; onType?: (t: string) => void; busy: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const pasted = doc.source === "pasted";
  return (
    <div data-doctype={doc.role === "applicant" ? doc.confirmedType : undefined} className="rounded-2xl border border-line bg-white p-3 transition animate-[fade-in_200ms_ease-out]">
      <div className="flex flex-wrap items-center gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${doc.readable ? "bg-lilac text-primary-ink" : "bg-peach text-peach-ink"}`}>
          {pasted ? <ClipboardPaste className="h-5 w-5" aria-hidden /> : <FileText className="h-5 w-5" aria-hidden />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{doc.fileName}</p>
          <p className="text-xs tabular-nums text-muted">{pasted ? "Pasted text" : `${doc.pageCount} ${doc.pageCount === 1 ? "page" : "pages"}`} · {doc.wordCount} words</p>
        </div>
        {onType && (
          <select className="input w-auto py-1.5" value={doc.confirmedType ?? ""} onChange={(e) => onType(e.target.value)} aria-label={`Type of ${doc.fileName}`}>
            <option value="">Choose type…</option>
            {Object.entries(DOC_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        )}
        <div className="flex">
          <button className="btn-ghost" disabled={busy} onClick={() => ref.current?.click()} aria-label={pasted ? "Replace with a PDF" : `Replace ${doc.fileName}`}><RefreshCw className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">{pasted ? "Replace with PDF" : "Replace"}</span></button>
          <button className="btn-ghost" disabled={busy} onClick={onRemove} aria-label={`Remove ${doc.fileName}`}><Trash2 className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Remove</span></button>
        </div>
        <input ref={ref} type="file" accept="application/pdf,.pdf" hidden
          onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) onReplace(f); }} />
      </div>
      {!doc.readable && (
        <p className="mt-2 flex items-start gap-2 rounded-xl bg-peach/50 px-3 py-2 text-sm text-peach-ink"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {UNREADABLE}</p>
      )}
      {onType && doc.readable && !doc.confirmedType && (
        <p className="mt-2 rounded-xl bg-butter/60 px-3 py-2 text-sm text-butter-ink">We couldn&apos;t tell this file&apos;s type from its name. Please choose one.</p>
      )}
    </div>
  );
}

function PasteBox({ busy, onSave, onCancel }: { busy: boolean; onSave: (text: string) => void; onCancel?: () => void }) {
  const [text, setText] = useState("");
  return (
    <div className="mt-4 space-y-2">
      <label className="block text-sm font-medium" htmlFor="paste-guideline">Paste the official guideline or job description</label>
      <textarea id="paste-guideline" className="input ruled min-h-52 leading-6" value={text} onChange={(e) => setText(e.target.value)}
        placeholder="Copy the full requirements from the program's or employer's website and paste them here." />
      <div className="flex justify-end gap-2">
        {onCancel && <button className="btn-ghost" onClick={onCancel} disabled={busy}>Cancel</button>}
        <button className="btn-primary" onClick={() => onSave(text)} disabled={busy || !text.trim()}>Save guideline</button>
      </div>
    </div>
  );
}
