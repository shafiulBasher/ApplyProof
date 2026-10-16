"use client";
import { Circle, FileCheck2, Loader2, RefreshCw } from "lucide-react";
import { countDocs, countUnconfirmed, docName, qty } from "@/lib/checks";
import type { Extraction, StoredDocument } from "@/lib/types";

interface Props {
  extraction?: Extraction;
  documents: StoredDocument[];
  reading: boolean;
  error: string;
  onRetry: () => void;
}

// What the guideline asks for, ticked off as files are uploaded. "Uploaded" is shown in lilac with a file
// icon, never the green "passed" style: whether a file meets the rules is the readiness check's job.
export default function RequirementsChecklist({ extraction, documents, reading, error, onRetry }: Props) {
  const docs = documents.filter((d) => d.role === "applicant");

  if (reading)
    return (
      <p className="mt-4 flex items-center gap-2 rounded-2xl bg-lilac/50 px-4 py-3 text-sm text-muted" aria-live="polite">
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden /> Reading the guideline&apos;s requirements… this usually takes 10–20 seconds, and only happens once per guideline.
      </p>
    );
  if (!extraction)
    return (
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-butter/70 px-4 py-3 text-sm text-butter-ink" aria-live="polite">
        <span>Couldn&apos;t read the requirements yet.{error && <span className="opacity-80"> {error}</span>}</span>
        <button className="btn-secondary ml-auto py-1.5" onClick={onRetry}><RefreshCw className="h-4 w-4" aria-hidden /> Retry</button>
      </div>
    );

  const required = extraction.requirements.filter((r) => r.category === "required_document");
  const unconfirmed = countUnconfirmed(docs);
  return (
    <div className="ruled mt-4 rounded-2xl border border-line bg-[#fffaf1] p-4 sm:p-5">
      <p className="font-display text-lg font-semibold">This guideline asks for:</p>
      {required.length === 0 && <p className="mt-2 text-sm text-muted">No specific documents are listed in this guideline.</p>}
      <ul className="mt-2 divide-y divide-line/70">
        {required.map((r) => {
          const need = r.count ?? 1;
          const have = countDocs(docs, r.docType);
          const done = have >= need;
          const limits = extraction.requirements
            .filter((l) => (l.category === "page_limit" || l.category === "word_limit") && l.docType === r.docType && l.quoteVerified)
            .map((l) => (l.min !== undefined && l.max !== undefined ? `${l.min}–${l.max} ${l.unit}` : l.max !== undefined ? `max ${qty(l.max, l.unit ?? "")}` : `min ${qty(l.min ?? 0, l.unit ?? "")}`));
          const name = need > 1 ? `${need} ${docName(r.docType)}s` : r.docType && r.docType !== "other" ? docName(r.docType).replace(/^./, (c) => c.toUpperCase()) : r.title;
          return (
            <li key={r.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 py-2 text-sm">
              {done ? <FileCheck2 className="h-4 w-4 shrink-0 text-primary" aria-hidden /> : <Circle className="h-4 w-4 shrink-0 text-muted/50" aria-hidden />}
              <span className={done ? "text-ink" : "font-medium"}>{name}</span>
              {limits.length > 0 && <span className="text-muted">· {limits.join(", ")}</span>}
              {!r.quoteVerified && <span className="text-xs text-butter-ink">· quote not confirmed</span>}
              <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${done ? "bg-lilac text-primary-ink" : "text-muted"}`}>
                {need > 1 ? `${have} of ${need} uploaded` : done ? "Uploaded" : "Not yet"}
              </span>
            </li>
          );
        })}
      </ul>
      {unconfirmed > 0 && <p className="mt-2 text-xs text-butter-ink">{unconfirmed} uploaded {unconfirmed === 1 ? "file has" : "files have"} no type yet, so {unconfirmed === 1 ? "it isn't" : "they aren't"} counted.</p>}
      <p className="mt-3 text-xs text-muted">Uploaded isn&apos;t the same as passed. Run the readiness check to see whether each file meets the rules.</p>
    </div>
  );
}
