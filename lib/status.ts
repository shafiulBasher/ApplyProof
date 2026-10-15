import type { Finding, FindingStatus } from "./types";

// Any Action Needed wins, then any Needs Verification; Passed only when everything passed.
export function overallStatus(findings: Finding[]): FindingStatus {
  if (findings.some((f) => f.status === "action_needed")) return "action_needed";
  if (findings.some((f) => f.status === "needs_verification")) return "needs_verification";
  return "passed";
}

export const outstanding = (findings: Finding[]) => findings.filter((f) => f.status !== "passed").length;
