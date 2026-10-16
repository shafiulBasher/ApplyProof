"use client";
import { ShieldCheck } from "lucide-react";

export default function DisclosureDialog({ onAnswer }: { onAnswer: (ok: boolean) => void }) {
  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-navy/30 p-4" role="dialog" aria-modal="true" aria-labelledby="disclosure-title">
      <div className="card w-full max-w-lg space-y-4 p-6">
        <h2 id="disclosure-title" className="flex items-center gap-2 text-xl font-bold">
          <ShieldCheck className="h-5 w-5 text-violet" /> What gets sent, and where
        </h2>
        <p className="text-slate">
          When you upload an official guideline, its text is sent to Google&apos;s Gemini API to extract its requirements. On the free tier, Google may use this data to improve its products. Your own documents (CV, letters, transcripts) are never sent; they&apos;re read and checked on this device. Use sample or non-sensitive guidelines if you&apos;re unsure.
        </p>
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={() => onAnswer(false)}>Cancel</button>
          <button className="btn-primary" autoFocus onClick={() => onAnswer(true)}>Continue</button>
        </div>
      </div>
    </div>
  );
}
