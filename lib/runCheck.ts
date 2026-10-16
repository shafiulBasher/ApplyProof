import { db, save } from "./db";
import { guidelineHash } from "./hash";
import { runChecks } from "./checks";
import { inputHash, outstanding, overallStatus } from "./status";
import type { Application, CheckResult, Extraction, StoredDocument } from "./types";

// Bump when the extraction prompt or schema changes, so cached requirements are re-read.
const EXTRACTION_VERSION = 3;

// The saved requirements for this guideline, if it has been read already. No network call.
export async function cachedExtraction(guideline: StoredDocument): Promise<Extraction | undefined> {
  const cached = await db.extractions.get(await guidelineHash(guideline.pages));
  return cached?.version === EXTRACTION_VERSION ? cached : undefined;
}

// Returns the cached extraction for this guideline, asking the Extract Route only the first time.
// Only the guideline's page texts are sent.
export async function getExtraction(guideline: StoredDocument): Promise<Extraction> {
  const cached = await cachedExtraction(guideline);
  if (cached) return cached;
  const hash = await guidelineHash(guideline.pages);

  const res = await fetch("/api/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pages: guideline.pages }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error);

  const extraction: Extraction = { guidelineHash: hash, pages: body.pages, requirements: body.requirements, model: body.model, version: EXTRACTION_VERSION, createdAt: Date.now() };
  await save("the guideline's requirements", () => db.extractions.put(extraction));
  return extraction;
}

// Fingerprint of the current inputs, compared with the stored result to show Outdated.
export async function currentInputHash(docs: StoredDocument[], facts: Application["applicant"]): Promise<string> {
  const guideline = docs.find((d) => d.role === "guideline" && d.readable);
  return inputHash(guideline ? await guidelineHash(guideline.pages) : "none", docs.filter((d) => d.role === "applicant"), facts);
}

// Extract (or reuse) → check → store. On failure the stored results stay and only lastError changes.
export async function runCheck(app: Application, docs: StoredDocument[]): Promise<void> {
  const stored = (await db.results.get(app.id)) ?? { applicationId: app.id };
  try {
    const guideline = docs.find((d) => d.role === "guideline" && d.readable);
    if (!guideline) throw new Error("Upload an official application guideline first.");
    const extraction = await getExtraction(guideline);
    const findings = runChecks(extraction.requirements, docs.filter((d) => d.role === "applicant"), app.applicant);
    const result: CheckResult = {
      ranAt: Date.now(),
      inputHash: await currentInputHash(docs, app.applicant),
      guidelineHash: extraction.guidelineHash,
      guidelinePasted: guideline.source === "pasted",
      extractedAt: extraction.createdAt,
      findings,
      status: overallStatus(findings),
      outstanding: outstanding(findings),
    };
    await save("the check results", () => db.results.put({ applicationId: app.id, previous: stored.current, current: result }));
  } catch (e) {
    await db.results.put({ ...stored, lastError: (e as Error).message });
  }
}
