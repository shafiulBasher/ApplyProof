import { AiBadOutputError, getProvider } from "./ai/provider";
import { verifyQuote } from "./quotes";
import type { Requirement } from "./types";

// The Extract Route's logic, shared with scripts/test-extraction.ts.
export async function extractVerified(pages: string[]): Promise<{ requirements: Requirement[]; model: string }> {
  const provider = getProvider();
  let raw;
  try {
    raw = await provider.extractRequirements(pages);
  } catch (e) {
    if (!(e instanceof AiBadOutputError)) throw e;
    raw = await provider.extractRequirements(pages); // one retry on malformed JSON
  }
  const requirements = raw.map((r, i) => verifyQuote({ ...r, id: `r${i + 1}` }, pages));
  return { requirements, model: provider.model };
}
