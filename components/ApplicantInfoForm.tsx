"use client";
import { useState } from "react";
import { db, save } from "@/lib/db";
import type { ApplicantFacts } from "@/lib/types";

const toNum = (s: string) => (s.trim() === "" || isNaN(Number(s)) ? undefined : Number(s));

export default function ApplicantInfoForm({ applicationId, initial, onSaved }: { applicationId: string; initial: ApplicantFacts; onSaved: () => void }) {
  const [form, setForm] = useState({
    gpa: initial.gpa?.toString() ?? "",
    gpaScale: initial.gpaScale?.toString() ?? "",
    degree: initial.degree ?? "",
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
      degree: next.degree.trim() || undefined,
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

  const field = (key: keyof typeof form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block space-y-1 text-sm font-medium">
      {label}
      <input className="input tabular-nums" value={form[key]} onChange={(e) => change(key, e.target.value)} {...props} />
    </label>
  );

  return (
    <section id="details" className="card scroll-mt-6 p-5 sm:p-6">
      <p className="eyebrow">Step 3</p>
      <h2 className="mt-1 text-2xl font-semibold">Your details</h2>
      <p className="mt-1 text-sm text-muted">Used only for the eligibility checks. Saved as you type, and it stays on this device. Leave blank anything the guideline doesn&apos;t ask about.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {field("gpa", "GPA", { inputMode: "decimal", placeholder: "3.6" })}
        {field("gpaScale", "Grading scale (max GPA)", { inputMode: "decimal", placeholder: "4.0" })}
        {field("degree", "Degree", { placeholder: "Bachelor of Science" })}
        {field("nationality", "Nationality", { placeholder: "Kenyan" })}
      </div>
      {error && <p className="mt-3 rounded-xl bg-peach/60 px-3 py-2 text-sm text-peach-ink">{error}</p>}
    </section>
  );
}
