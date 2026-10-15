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
    <section className="card p-6">
      <h2 className="text-xl font-bold">Applicant information</h2>
      <p className="mt-1 text-sm text-slate">Used only for the eligibility checks. It stays on this device.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {field("gpa", "GPA", { inputMode: "decimal", placeholder: "3.6" })}
        {field("gpaScale", "Grading scale (max GPA)", { inputMode: "decimal", placeholder: "4.0" })}
        {field("degree", "Degree", { placeholder: "Bachelor of Science" })}
        {field("nationality", "Nationality", { placeholder: "Kenyan" })}
      </div>
      {error && <p className="mt-3 text-sm text-rose">{error}</p>}
    </section>
  );
}
