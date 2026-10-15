"use client";
import { Loader2, Play } from "lucide-react";

export default function RunButton({ canRun, running, onRun }: { canRun: boolean; running: boolean; onRun: () => void }) {
  return (
    <div className="flex flex-col items-end gap-1">
      <button className="btn-primary" disabled={!canRun || running} onClick={onRun}>
        {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        {running ? "Checking…" : "Run Readiness Check"}
      </button>
      {!canRun && <p className="text-xs text-slate">Upload an official application guideline first.</p>}
    </div>
  );
}
