"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import type { Application } from "@/lib/types";
import Logo from "@/components/Logo";
import StatusBadge from "@/components/StatusBadge";
import NewApplicationDialog from "@/components/NewApplicationDialog";

export default function Dashboard() {
  const [apps, setApps] = useState<Application[] | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    db.applications.orderBy("createdAt").reverse().toArray().then(setApps);
  }, []);

  return (
    <>
      <header className="mb-8 flex items-center justify-between gap-4">
        <Logo />
        <button className="btn-primary" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> New Application
        </button>
      </header>
      <h1 className="mb-6 text-[32px] font-bold tracking-tight">Your applications</h1>

      {apps && apps.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-lg font-semibold">Know what&apos;s missing before you submit.</p>
          <p className="mt-2 text-slate">Create an application, upload its official guideline and your documents, and ApplyProof checks every requirement with evidence.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {apps?.map((a) => (
          <Link key={a.id} href={`/applications/${a.id}`} className="card p-5 transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="font-semibold">{a.name}</p>
            {a.organization && <p className="text-sm text-slate">{a.organization}</p>}
            <div className="mt-3"><StatusBadge status="not_checked" /></div>
          </Link>
        ))}
      </div>

      {creating && <NewApplicationDialog onClose={() => setCreating(false)} />}
    </>
  );
}
