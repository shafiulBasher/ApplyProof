import { sha256 } from "./hash";
import type { ApplicantFacts, Finding, FindingStatus, StoredDocument } from "./types";

// Any Action Needed wins, then any Needs Verification; Passed only when everything passed.
export function overallStatus(findings: Finding[]): FindingStatus {
  if (findings.some((f) => f.status === "action_needed")) return "action_needed";
  if (findings.some((f) => f.status === "needs_verification")) return "needs_verification";
  return "passed";
}

export const outstanding = (findings: Finding[]) => findings.filter((f) => f.status !== "passed").length;

// Fingerprint of everything a check depends on. Any change (even a same-length file replacement) marks results Outdated.
export function inputHash(
  guidelineHash: string,
  applicantDocs: Pick<StoredDocument, "contentHash" | "confirmedType">[],
  facts: ApplicantFacts,
): Promise<string> {
  const docs = applicantDocs.map((d) => `${d.contentHash}:${d.confirmedType ?? ""}`).sort();
  const { gpa, gpaScale, degreeLevel, degreeStatus, fieldOfStudy, nationality, degree } = facts;
  return sha256(JSON.stringify({ guidelineHash, docs, facts: { gpa, gpaScale, degreeLevel, degreeStatus, fieldOfStudy, nationality, degree } }));
}

export interface Summary {
  status: FindingStatus | "not_checked";
  pending: number; // Action Needed + unconfirmed Needs Verification
  confirmed: number; // Needs Verification items the applicant confirmed
}

// Readiness as shown to the applicant. Confirmed items leave the pending count but are reported
// separately ("Ready to submit · 1 confirmed by you"); the stored check result is never changed.
export function summarize(result: { findings: Finding[] } | undefined, isConfirmed: (f: Finding) => boolean): Summary {
  if (!result) return { status: "not_checked", pending: 0, confirmed: 0 };
  const confirmedSet = result.findings.filter((f) => f.status === "needs_verification" && isConfirmed(f));
  const pending = result.findings.filter((f) => f.status !== "passed" && !confirmedSet.includes(f));
  const status = pending.some((f) => f.status === "action_needed") ? "action_needed" : pending.length ? "needs_verification" : "passed";
  return { status, pending: pending.length, confirmed: confirmedSet.length };
}
