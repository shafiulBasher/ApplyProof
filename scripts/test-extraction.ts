// Early accuracy test: runs the real extraction on samples/guideline.pdf and compares with
// samples/expected-requirements.json. Run: npm run test:extraction (uses 1 free Gemini request).
import { readFileSync } from "node:fs";
import { parsePdf } from "../lib/pdf";
import { extractVerified } from "../lib/extract";
import type { Requirement } from "../lib/types";

type Expected = { label: string; category: string; docType?: string; count?: number; min?: number; max?: number; field?: string; minGpa?: number; scale?: number; clear?: boolean };

const matches = (e: Expected, r: Requirement) =>
  e.category === r.category &&
  (e.docType === undefined || e.docType === r.docType) &&
  (e.count === undefined || e.count === r.count) &&
  (e.min === undefined || e.min === r.min) &&
  (e.max === undefined || e.max === r.max) &&
  (e.field === undefined || e.field === r.eligibility?.field) &&
  (e.minGpa === undefined || e.minGpa === r.eligibility?.minGpa) &&
  (e.scale === undefined || e.scale === r.eligibility?.scale) &&
  (e.clear === undefined || e.clear === r.eligibility?.clear);

async function main() {
  const { pages } = await parsePdf(new Uint8Array(readFileSync("samples/guideline.pdf")));
  const expected: Expected[] = JSON.parse(readFileSync("samples/expected-requirements.json", "utf8"));
  const { requirements, model } = await extractVerified(pages);

  console.log(`Model: ${model}\n`);
  const used = new Set<string>();
  const missing: string[] = [];
  for (const e of expected) {
    const hit = requirements.find((r) => !used.has(r.id) && matches(e, r));
    if (hit) used.add(hit.id);
    else missing.push(e.label);
    console.log(`${hit ? "FOUND  " : "MISSING"} ${e.label}${hit ? `  ->  "${hit.quote}" (p. ${hit.page})` : ""}`);
  }
  const extra = requirements.filter((r) => !used.has(r.id));
  for (const r of extra) console.log(`EXTRA   ${r.title} [${r.category}] "${r.quote}" (p. ${r.page})`);

  const unverified = requirements.filter((r) => !r.quoteVerified);
  for (const r of unverified) console.log(`UNVERIFIED QUOTE  ${r.title}: "${r.quote}"`);

  console.log(`\nFound ${expected.length - missing.length}/${expected.length} · extra ${extra.length} · quotes verified ${requirements.length - unverified.length}/${requirements.length}`);
  const pass = missing.length === 0 && unverified.length === 0;
  console.log(pass ? "PASS: meets the bar." : "FAIL: below the bar.");
  process.exit(pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
