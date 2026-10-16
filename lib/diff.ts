import type { CheckResult, FindingStatus } from "./types";

export interface Changes {
  // The requirements were re-read (new guideline), so nothing can be compared.
  newRequirements: boolean;
  statusChanges: { requirementId: string; title: string; from: FindingStatus; to: FindingStatus }[];
  measuredChanges: { requirementId: string; title: string; from: number; to: number; unit?: string }[];
  outstanding: { from: number; to: number };
}

// Matches findings by requirement ID, which is stable while the same extraction is reused.
export function whatChanged(previous: CheckResult, current: CheckResult): Changes {
  const outstanding = { from: previous.outstanding, to: current.outstanding };
  if (previous.guidelineHash !== current.guidelineHash || previous.extractedAt !== current.extractedAt)
    return { newRequirements: true, statusChanges: [], measuredChanges: [], outstanding };

  const before = new Map(previous.findings.map((f) => [f.requirementId, f]));
  const statusChanges: Changes["statusChanges"] = [];
  const measuredChanges: Changes["measuredChanges"] = [];
  for (const f of current.findings) {
    const p = before.get(f.requirementId);
    if (!p) continue;
    if (p.status !== f.status) statusChanges.push({ requirementId: f.requirementId, title: f.title, from: p.status, to: f.status });
    if (p.measured !== undefined && f.measured !== undefined && p.measured !== f.measured)
      measuredChanges.push({ requirementId: f.requirementId, title: f.title, from: p.measured, to: f.measured, unit: f.unit });
  }
  return { newRequirements: false, statusChanges, measuredChanges, outstanding };
}
