"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { db } from "@/lib/db";
import type { Application, StoredDocument } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import DocumentManager from "@/components/DocumentManager";

export default function ApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<Application | null | undefined>(undefined);
  const [docs, setDocs] = useState<StoredDocument[]>([]);

  const load = useCallback(async () => {
    setApp((await db.applications.get(id)) ?? null);
    setDocs(await db.documents.where("applicationId").equals(id).sortBy("uploadedAt"));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (app === undefined) return null;
  if (app === null) return <p>This application wasn&apos;t found. <Link className="text-violet underline" href="/">Back to dashboard</Link></p>;

  return (
    <div className="space-y-6">
      <Link href="/" className="btn-ghost -ml-2.5"><ArrowLeft className="h-4 w-4" /> All applications</Link>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold leading-tight tracking-tight">{app.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate">
            {app.organization && <span>{app.organization}</span>}
            {app.deadline && <span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4" /> {app.deadline}</span>}
            <StatusBadge status="not_checked" />
          </div>
        </div>
      </header>
      <DocumentManager applicationId={id} documents={docs} onChange={load} />
    </div>
  );
}
