import { db, save } from "./db";
import { guidelineHash } from "./hash";
import { runChecks } from "./checks";
import { outstanding, overallStatus } from "./status";
import type { Application, CheckResult, Extraction, StoredDocument } from "./types";

// Returns the cached extraction for this guideline, asking the Extract Route only the first time.
// Only the guideline's page texts are sent.
export async function getExtraction(guideline: StoredDocument): Promise<Extraction> {
  const hash = await guidelineHash(guideline.pages);
  const cached = await db.extractions.get(hash);
  if (cached) return cached;

  const res = await fetch("/api/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pages: guideline.pages }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error);

  const extraction: Extraction = { guidelineHash: hash, pages: body.pages, requirements: body.requirements, model: body.model, createdAt: Date.now() };
  await save("the guideline's requirements", () => db.extractions.put(extraction));
  return extraction;
}

// Extract (or reuse) → check → store. On failure the stored results stay and only lastError changes.
export async function runCheck(app: Application, docs: StoredDocument[]): Promise<void> {
  const stored = (await db.results.get(app.id)) ?? { applicationId: app.id };
  try {
    const guideline = docs.find((d) => d.role === "guideline" && d.readable);
    if (!guideline) throw new Error("Upload an official application guideline first.");
    const extraction = await getExtraction(guideline);
    const findings = runChecks(extraction.requirements, docs.filter((d) => d.role === "applicant"), app.applicant);
    const result: CheckResult = { ranAt: Date.now(), guidelineHash: extraction.guidelineHash, findings, status: overallStatus(findings), outstanding: outstanding(findings) };
    await save("the check results", () => db.results.put({ applicationId: app.id, previous: stored.current, current: result }));
  } catch (e) {
    await db.results.put({ ...stored, lastError: (e as Error).message });
  }
}
