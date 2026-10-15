import { db, save } from "./db";
import { guidelineHash } from "./hash";
import type { Extraction, StoredDocument } from "./types";

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
