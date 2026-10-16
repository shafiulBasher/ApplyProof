"use client";
import { useState } from "react";
import { AlertCircle, CalendarDays, CheckCircle2, ChevronDown, FileText, GraduationCap, HelpCircle, Lightbulb, ListChecks, Ruler, Type, Upload } from "lucide-react";
import type { Finding, FindingStatus, RequirementCategory } from "@/lib/types";

export const FINDING_STYLE: Record<FindingStatus, { label: string; pill: string; icon: typeof CheckCircle2 }> = {
  action_needed: { label: "Action Needed", pill: "bg-peach text-peach-ink", icon: AlertCircle },
  needs_verification: { label: "Needs Verification", pill: "bg-butter text-butter-ink", icon: HelpCircle },
  passed: { label: "Passed", pill: "bg-sage text-sage-ink", icon: CheckCircle2 },
};

const CATEGORY: Record<RequirementCategory, { icon: typeof FileText; label: string }> = {
  required_document: { icon: FileText, label: "Required document" },
  page_limit: { icon: Ruler, label: "Length limit" },
  word_limit: { icon: Ruler, label: "Length limit" },
  eligibility: { icon: GraduationCap, label: "Eligibility" },
  deadline: { icon: CalendarDays, label: "Deadline" },
  formatting: { icon: Type, label: "Formatting" },
  other: { icon: ListChecks, label: "Requirement" },
};
const categoryOf = (f: Finding) => CATEGORY[f.category ?? "other"] ?? CATEGORY.other;

export function FindingPill({ status }: { status: FindingStatus }) {
  const s = FINDING_STYLE[status];
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.pill}`}>{s.label}</span>;
}

// "Official limit: 1 page · Uploaded CV/résumé: 2 pages" → labeled values.
const evidenceParts = (f: Finding) =>
  f.evidence?.split(" · ").map((part) => {
    const i = part.indexOf(": ");
    return i > 0 ? { label: part.slice(0, i), value: part.slice(i + 2) } : { label: "", value: part };
  }) ?? [];

function Quote({ f, pasted, className = "" }: { f: Finding; pasted?: boolean; className?: string }) {
  return (
    <figure className={`rounded-xl border-l-4 border-butter-ink/30 bg-butter/45 px-4 py-2.5 ${className}`}>
      <blockquote className="text-sm leading-6 text-ink">“{f.quote}”</blockquote>
      <figcaption className="mt-1 text-xs font-medium text-butter-ink">{pasted ? "Pasted guideline" : `Guideline · p. ${f.page}`}</figcaption>
    </figure>
  );
}

function Evidence({ f, tone }: { f: Finding; tone?: "alert" }) {
  const parts = evidenceParts(f);
  if (!parts.length) return null;
  return (
    <dl className="mt-3 flex flex-wrap gap-2">
      {parts.map((e, i) => (
        <div key={i} className={`rounded-xl border px-3 py-1.5 text-sm tabular-nums ${tone === "alert" && i > 0 ? "border-peach bg-peach/40" : "border-line bg-oat/70"}`}>
          {e.label && <dt className="text-xs text-muted">{e.label}</dt>}
          <dd className="font-semibold">{e.value}</dd>
        </div>
      ))}
    </dl>
  );
}

// A count shows as dots ("1 of 2"); a page/word limit as a bar with the limit marked.
function LimitMeter({ f }: { f: Finding }) {
  if (f.measured === undefined || !f.limit) return null;
  const over = f.status === "action_needed";
  if (f.unit === "uploaded") {
    const need = f.limit.min ?? 0;
    return (
      <div className="mt-3 flex items-center gap-2 text-sm" aria-label={`${f.measured} of ${need} uploaded`}>
        {Array.from({ length: Math.max(need, f.measured) }, (_, i) => (
          <span key={i} className={`h-4 w-4 rounded-full border-2 ${i < f.measured! ? "border-primary bg-primary" : "border-dashed border-peach-ink/60"}`} />
        ))}
        <span className="ml-1 font-semibold tabular-nums">{f.measured} of {need} uploaded</span>
      </div>
    );
  }
  const { min, max } = f.limit;
  const top = Math.max(f.measured, max ?? min ?? f.measured) * 1.25 || 1;
  const pct = (n: number) => `${Math.min(100, (n / top) * 100)}%`;
  return (
    <div className="mt-3" aria-label={`${f.measured} ${f.unit ?? ""}${max !== undefined ? `, limit ${max}` : ""}${min !== undefined ? `, minimum ${min}` : ""}`}>
      <div className="relative h-3 rounded-full bg-oat">
        {min !== undefined && max !== undefined && (
          <div className="absolute inset-y-0 rounded-full bg-sage" style={{ left: pct(min), width: `calc(${pct(max)} - ${pct(min)})` }} />
        )}
        <div className={`absolute inset-y-0 left-0 rounded-full ${over ? "bg-peach-ink/80" : "bg-sage-ink/70"}`} style={{ width: pct(f.measured), transition: "width 600ms cubic-bezier(.22,1,.36,1)" }} />
        {max !== undefined && <div className="absolute -inset-y-1 w-0.5 rounded bg-ink" style={{ left: pct(max) }} />}
        {min !== undefined && <div className="absolute -inset-y-1 w-0.5 rounded bg-ink/40" style={{ left: pct(min) }} />}
      </div>
      <div className="mt-1 flex justify-between text-xs tabular-nums text-muted">
        <span className={over ? "font-semibold text-peach-ink" : "font-semibold text-sage-ink"}>Yours: {f.measured} {f.unit}</span>
        <span>{min !== undefined && max !== undefined ? `Allowed: ${min}–${max}` : max !== undefined ? `Limit: ${max}` : `Minimum: ${min}`} {f.unit}</span>
      </div>
    </div>
  );
}

const canFix = (f: Finding) => !!f.docType && f.docType !== "other" && ["required_document", "page_limit", "word_limit"].includes(f.category ?? "");

// Action Needed: numbered, fix-first.
export function ActionCard({ f, index, pasted, onFix }: { f: Finding; index: number; pasted?: boolean; onFix?: (f: Finding) => void }) {
  const Cat = categoryOf(f);
  return (
    <article className="card relative border-2 border-peach p-4 animate-[fade-in_220ms_ease-out] sm:p-5">
      {index === 0 && <span className="absolute -top-3 left-5 rounded-full bg-peach-ink px-3 py-0.5 text-xs font-semibold text-white shadow-sm">Fix this first</span>}
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-peach font-display text-lg font-semibold text-peach-ink" aria-label={`Priority ${index + 1}`}>{index + 1}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted"><Cat.icon className="h-3.5 w-3.5" aria-hidden /> {Cat.label}</p>
              <h4 className="mt-0.5 text-lg font-semibold">{f.title}</h4>
            </div>
            <FindingPill status={f.status} />
          </div>
          <p className="mt-0.5 text-sm text-muted">{f.explanation}</p>
          <LimitMeter f={f} />
          <Quote f={f} pasted={pasted} className="mt-3" />
          <Evidence f={f} tone="alert" />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
            {f.correction && (
              <p className="flex items-start gap-2 text-sm text-peach-ink"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> <span><span className="font-semibold">Next step:</span> {f.correction}</span></p>
            )}
            {onFix && canFix(f) && (
              <button className="btn-primary py-2" onClick={() => onFix(f)}>
                <Upload className="h-4 w-4" aria-hidden /> {f.category === "required_document" ? "Upload file" : "Replace file"}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// Needs Verification: a sticky note led by what you should do.
export function CheckNote({ f, index, pasted }: { f: Finding; index: number; pasted?: boolean }) {
  const Cat = categoryOf(f);
  return (
    <article className={`relative rounded-2xl bg-butter/70 p-4 shadow-[0_10px_24px_-16px_rgba(122,90,18,0.55)] animate-[fade-in_220ms_ease-out] sm:p-5 ${index % 2 ? "rotate-[0.4deg]" : "-rotate-[0.4deg]"}`}>
      <span className="absolute -top-2.5 left-1/2 h-5 w-20 -translate-x-1/2 rotate-[-3deg] rounded-sm bg-lilac/80" aria-hidden />
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-medium text-butter-ink"><Cat.icon className="h-3.5 w-3.5" aria-hidden /> {Cat.label} · to check yourself</p>
        <FindingPill status={f.status} />
      </div>
      <h4 className="mt-1 text-lg font-semibold">{f.title}</h4>
      {f.correction && (
        <p className="mt-1 flex items-start gap-2 font-medium text-ink"><Lightbulb className="mt-1 h-4 w-4 shrink-0 text-butter-ink" aria-hidden /> <span><span className="font-semibold">Next step:</span> {f.correction}</span></p>
      )}
      <p className="mt-1 text-sm text-butter-ink">{f.explanation}</p>
      <Quote f={f} pasted={pasted} className="mt-3 bg-white/60" />
      <Evidence f={f} />
    </article>
  );
}

// Passed: a compact row; quote and evidence one click away.
export function PassedRow({ f, pasted, justPassed }: { f: Finding; pasted?: boolean; justPassed?: boolean }) {
  const [open, setOpen] = useState(!!justPassed);
  const Cat = categoryOf(f);
  const summary = evidenceParts(f).map((e) => e.value).join(" · ");
  return (
    <li className={`${justPassed ? "animate-[pass-pulse_900ms_ease-out] rounded-xl" : ""}`}>
      <button className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-oat/80" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sage text-sage-ink">
          {justPassed ? (
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-label="Now passed">
              <path d="M3.5 8.5l3 3 6-7" pathLength="1" className="animate-[draw-check_500ms_ease-out_200ms_both] [stroke-dasharray:1]" />
            </svg>
          ) : <CheckCircle2 className="h-4 w-4" aria-hidden />}
        </span>
        <Cat.icon className="h-4 w-4 shrink-0 text-muted" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="font-medium">{f.title}</span>
          {summary && <span className="ml-2 text-sm tabular-nums text-muted">· {summary}</span>}
        </span>
        {justPassed && <span className="hidden text-xs font-semibold text-sage-ink sm:inline">Just passed</span>}
        <span className="sr-only">Passed.</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <div className="mb-2 ml-12 mr-2 animate-[fade-in_200ms_ease-out]">
          <p className="text-sm text-muted">{f.explanation}</p>
          <Quote f={f} pasted={pasted} className="mt-2" />
          <Evidence f={f} />
        </div>
      )}
    </li>
  );
}
