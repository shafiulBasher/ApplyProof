"use client";
import { CheckCircle2, Circle, Loader2, RefreshCw } from "lucide-react";
import { countDocs, countUnconfirmed, docName } from "@/lib/checks";
import type { Extraction, StoredDocument } from "@/lib/types";

interface Props {
  extraction?: Extraction;
  documents: StoredDocument[];
  reading: boolean;
  error: string;
  onRetry: () => void;
}

// What the guideline asks for, ticked off as files are uploaded. A tick means "uploaded", not "passes the rules".
export default function RequirementsChecklist({ extraction, documents, reading, error, onRetry }: Props) {
  const docs = documents.filter((d) => d.role === "applicant");

  if (reading) return <p className="mt-4 flex items-center gap-2 text-sm text-slate"><Loader2 className="h-4 w-4 animate-spin" /> Reading the guideline&apos;s requirements… this usually takes 10–20 seconds, and only happens once per guideline.</p>;
  if (!extraction)
    return (
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-amber/10 p-3 text-sm">
        <span>Couldn&apos;t read the requirements yet.{error && <span className="text-slate"> {error}</span>}</span>
        <button className="btn-ghost ml-auto" onClick={onRetry}><RefreshCw className="h-4 w-4" /> Retry</button>
      </div>
    );

  const required = extraction.requirements.filter((r) => r.category === "required_document");
  const unconfirmed = countUnconfirmed(docs);
  return (
    <div className="mt-4 rounded-xl bg-paper p-4">
      <p className="text-sm font-semibold">This guideline asks for:</p>
      {required.length === 0 && <p className="mt-2 text-sm text-slate">No specific documents are listed in this guideline.</p>}
      <ul className="mt-2 space-y-1.5">
        {required.map((r) => {
          const need = r.count ?? 1;
          const have = countDocs(docs, r.docType);
          const done = have >= need;
          const limits = extraction.requirements
            .filter((l) => (l.category === "page_limit" || l.category === "word_limit") && l.docType === r.docType && l.quoteVerified)
            .map((l) => (l.min !== undefined && l.max !== undefined ? `${l.min}–${l.max} ${l.unit}` : l.max !== undefined ? `max ${l.max} ${l.unit}` : `min ${l.min} ${l.unit}`));
          return (
            <li key={r.id} className="flex items-center gap-2 text-sm">
              {done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-mint" /> : <Circle className="h-4 w-4 shrink-0 text-slate/50" />}
              <span className={done ? "" : "font-medium"}>
                {need > 1 ? `${need} ${docName(r.docType)}s` : r.docType && r.docType !== "other" ? docName(r.docType).replace(/^./, (c) => c.toUpperCase()) : r.title}
              </span>
              {limits.length > 0 && <span className="text-slate">· {limits.join(", ")}</span>}
              {!r.quoteVerified && <span className="text-xs text-[#9a6a17]">· quote not confirmed</span>}
              <span className="ml-auto tabular-nums text-slate">{need > 1 ? `${have} of ${need}` : done ? "Uploaded" : "Not yet"}</span>
            </li>
          );
        })}
      </ul>
      {unconfirmed > 0 && <p className="mt-2 text-xs text-[#9a6a17]">{unconfirmed} uploaded {unconfirmed === 1 ? "file has" : "files have"} no type yet, so {unconfirmed === 1 ? "it isn't" : "they aren't"} counted.</p>}
    </div>
  );
}
