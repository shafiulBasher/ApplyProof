"use client";
import { useState } from "react";
import { db, save } from "@/lib/db";
import { DEGREE_LEVELS, degreeLevelOf, type DegreeLevel } from "@/lib/degrees";
import type { ApplicantFacts } from "@/lib/types";

const toNum = (s: string) => (s.trim() === "" || isNaN(Number(s)) ? undefined : Number(s));

export default function ApplicantInfoForm({ applicationId, initial, onSaved }: { applicationId: string; initial: ApplicantFacts; onSaved: () => void }) {
  // Older applications stored one free-text degree; split it into level and field the first time.
  const [form, setForm] = useState({
    gpa: initial.gpa?.toString() ?? "",
    gpaScale: initial.gpaScale?.toString() ?? "",
    degreeLevel: initial.degreeLevel ?? degreeLevelOf(initial.degree) ?? "",
    degreeStatus: initial.degreeStatus ?? "",
    fieldOfStudy: initial.fieldOfStudy ?? initial.degree?.match(/\bin\s+(.+)$/i)?.[1] ?? "",
    nationality: initial.nationality ?? "",
  });
  const [error, setError] = useState("");

  // Saves as you type.
  async function change(field: keyof typeof form, value: string) {
    const next = { ...form, [field]: value };
    setForm(next);
    const applicant: ApplicantFacts = {
      gpa: toNum(next.gpa),
      gpaScale: toNum(next.gpaScale),
      degreeLevel: (next.degreeLevel || undefined) as DegreeLevel | undefined,
      degreeStatus: (next.degreeStatus || undefined) as ApplicantFacts["degreeStatus"],
      fieldOfStudy: next.fieldOfStudy.trim() || undefined,
      nationality: next.nationality.trim() || undefined,
    };
    try {
      await save("your applicant information", () => db.applications.update(applicationId, { applicant }));
      setError("");
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const label = "block space-y-1 text-sm font-medium";
  const input = (key: "gpa" | "gpaScale" | "fieldOfStudy" | "nationality", text: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className={label}>
      {text}
      <input id={`field-${key}`} className="input tabular-nums" value={form[key]} onChange={(e) => change(key, e.target.value)} {...props} />
    </label>
  );

  return (
    <section id="details" className="card scroll-mt-6 p-5 sm:p-6">
      <p className="eyebrow">Step 3</p>
      <h2 className="mt-1 text-2xl font-semibold">Your details</h2>
      <p className="mt-1 text-sm text-muted">Used only for the eligibility checks. Saved as you type, and it stays on this device. Leave blank anything the guideline doesn&apos;t ask about.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {input("gpa", "GPA", { inputMode: "decimal", placeholder: "3.6" })}
        {input("gpaScale", "Grading scale (max GPA)", { inputMode: "decimal", placeholder: "4.0" })}
        <label className={label}>
          Degree level
          <select id="field-degreeLevel" className="input" value={form.degreeLevel} onChange={(e) => change("degreeLevel", e.target.value)}>
            <option value="">Choose…</option>
            {DEGREE_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </label>
        <label className={label}>
          Degree status
          <select id="field-degreeStatus" className="input" value={form.degreeStatus} onChange={(e) => change("degreeStatus", e.target.value)}>
            <option value="">Choose…</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In progress</option>
          </select>
        </label>
        {input("fieldOfStudy", "Field of study", { placeholder: "Computer Science (CSE)" })}
        {input("nationality", "Nationality", { placeholder: "Kenyan" })}
      </div>
      {error && <p className="mt-3 rounded-xl bg-peach/60 px-3 py-2 text-sm text-peach-ink">{error}</p>}
    </section>
  );
}
