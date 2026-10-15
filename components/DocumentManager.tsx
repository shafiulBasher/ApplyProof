"use client";
import { useRef, useState } from "react";
import { FileText, RefreshCw, Trash2, Upload, AlertTriangle } from "lucide-react";
import { db, save } from "@/lib/db";
import { sha256 } from "@/lib/hash";
import { suggestType } from "@/lib/docTypes";
import { DOC_TYPE_LABELS, type DocType, type ParsedPdf, type StoredDocument } from "@/lib/types";

const UNREADABLE = "We couldn't extract readable text from this PDF. It may be scanned or image-based. Please upload a text-readable PDF.";

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
}

export default function DocumentManager({ applicationId, documents, onChange, beforeUpload }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
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
    });
  }

  const setType = (doc: StoredDocument, t: string) =>
    run(() => save(`the type for "${doc.fileName}"`, () => db.documents.update(doc.id, { confirmedType: (t || undefined) as DocType | undefined })).then(() => {}));

  const remove = (doc: StoredDocument) => run(() => db.documents.delete(doc.id));

  return (
    <section className="card p-6">
      <h2 className="text-xl font-bold">Documents</h2>

      <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-slate">Official guideline</h3>
      {guideline ? (
        <DocRow doc={guideline} onReplace={(f) => upload([f], "guideline", guideline)} onRemove={() => remove(guideline)} busy={busy} />
      ) : (
        <PickFiles label="Upload guideline PDF" onPick={(f) => upload(f, "guideline")} busy={busy} />
      )}

      <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate">Your documents</h3>
      <div className="space-y-2">
        {applicantDocs.map((d) => (
          <DocRow key={d.id} doc={d} onReplace={(f) => upload([f], "applicant", d)} onRemove={() => remove(d)} onType={(t) => setType(d, t)} busy={busy} />
        ))}
      </div>
      <div className="mt-2"><PickFiles label="Add documents" multiple onPick={(f) => upload(f, "applicant")} busy={busy} /></div>

      {busy && <p className="mt-3 text-sm text-slate">Reading PDF…</p>}
      {error && <p className="mt-3 text-sm text-rose">{error}</p>}
    </section>
  );
}

function PickFiles({ label, multiple, onPick, busy }: { label: string; multiple?: boolean; onPick: (f: File[]) => void; busy: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button className="btn-ghost border border-dashed border-navy/20" disabled={busy} onClick={() => ref.current?.click()}>
        <Upload className="h-4 w-4" /> {label}
      </button>
      <input ref={ref} type="file" accept="application/pdf,.pdf" multiple={multiple} hidden
        onChange={(e) => { const f = Array.from(e.target.files ?? []); e.target.value = ""; if (f.length) onPick(f); }} />
    </>
  );
}

function DocRow({ doc, onReplace, onRemove, onType, busy }: {
  doc: StoredDocument; onReplace: (f: File) => void; onRemove: () => void; onType?: (t: string) => void; busy: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="rounded-xl border border-navy/10 p-3">
      <div className="flex flex-wrap items-center gap-3">
        <FileText className="h-5 w-5 shrink-0 text-violet" />
        <span className="min-w-0 flex-1 truncate font-medium">{doc.fileName}</span>
        {onType && (
          <select className="input w-auto py-1" value={doc.confirmedType ?? ""} onChange={(e) => onType(e.target.value)} aria-label={`Type of ${doc.fileName}`}>
            <option value="">Choose type…</option>
            {Object.entries(DOC_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        )}
        <span className="text-sm tabular-nums text-slate">{doc.pageCount} {doc.pageCount === 1 ? "page" : "pages"} · {doc.wordCount} words</span>
        <button className="btn-ghost" disabled={busy} onClick={() => ref.current?.click()}><RefreshCw className="h-4 w-4" /> Replace</button>
        <button className="btn-ghost" disabled={busy} onClick={onRemove}><Trash2 className="h-4 w-4" /> Remove</button>
        <input ref={ref} type="file" accept="application/pdf,.pdf" hidden
          onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) onReplace(f); }} />
      </div>
      {!doc.readable && (
        <p className="mt-2 flex items-start gap-2 text-sm text-rose"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {UNREADABLE}</p>
      )}
      {onType && doc.readable && !doc.confirmedType && (
        <p className="mt-2 text-sm text-[#9a6a17]">We couldn&apos;t tell this file&apos;s type from its name. Please choose one.</p>
      )}
    </div>
  );
}
