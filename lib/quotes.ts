import type { Requirement } from "./types";

// Lowercase, unify quote styles, rejoin line-break hyphens, then drop whitespace entirely
// so PDF spacing quirks can't hide a real match.
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’‛′]/g, "'")
    .replace(/[“”″]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/(\w)-\s+(\w)/g, "$1$2")
    .replace(/\s+/g, "");
}

// Confirms the quote appears on its claimed page; corrects the page if it's on another one.
export function verifyQuote<T extends Pick<Requirement, "quote" | "page">>(req: T, pages: string[]): T & { quoteVerified: boolean } {
  const q = normalize(req.quote ?? "");
  if (!q) return { ...req, quoteVerified: false };
  const normPages = pages.map(normalize);
  if (normPages[req.page - 1]?.includes(q)) return { ...req, quoteVerified: true };
  const found = normPages.findIndex((p) => p.includes(q));
  return found >= 0 ? { ...req, page: found + 1, quoteVerified: true } : { ...req, quoteVerified: false };
}
