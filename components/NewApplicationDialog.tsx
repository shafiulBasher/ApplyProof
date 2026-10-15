"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { db, save } from "@/lib/db";

export default function NewApplicationDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const id = crypto.randomUUID();
    try {
      await save("the new application", () =>
        db.applications.add({
          id,
          name: name.trim(),
          organization: organization.trim() || undefined,
          deadline: deadline || undefined,
          applicant: {},
          disclosureAccepted: false,
          createdAt: Date.now(),
        }),
      );
      router.push(`/applications/${id}`);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-navy/30 p-4" role="dialog" aria-modal="true" aria-labelledby="new-app-title">
      <form onSubmit={create} className="card w-full max-w-md space-y-4 p-6">
        <h2 id="new-app-title" className="text-xl font-bold">New application</h2>
        <label className="block space-y-1 text-sm font-medium">
          Program name <span className="text-rose">*</span>
          <input className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Global Future Scholars Scholarship" />
        </label>
        <label className="block space-y-1 text-sm font-medium">
          University or organization <span className="font-normal text-slate">(optional)</span>
          <input className="input" value={organization} onChange={(e) => setOrganization(e.target.value)} />
        </label>
        <label className="block space-y-1 text-sm font-medium">
          Deadline <span className="font-normal text-slate">(optional)</span>
          <input className="input" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </label>
        {error && <p className="text-sm text-rose">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={!name.trim()}>Create</button>
        </div>
      </form>
    </div>
  );
}
