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
  const { gpa, gpaScale, degree, nationality } = facts;
  return sha256(JSON.stringify({ guidelineHash, docs, facts: { gpa, gpaScale, degree, nationality } }));
}
