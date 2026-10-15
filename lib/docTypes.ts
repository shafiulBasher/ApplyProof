import type { DocType } from "./types";

const KEYWORDS: [DocType, string[]][] = [
  ["cv", ["cv", "resume"]],
  ["motivation_letter", ["motivation", "statement", "essay"]],
  ["transcript", ["transcript", "grades"]],
  ["recommendation_letter", ["recommendation", "reference", "rec"]],
];

// Suggests a type only when exactly one type matches the filename; otherwise the user is asked.
export function suggestType(fileName: string): DocType | undefined {
  const words = fileName.toLowerCase().replace(/\.pdf$/, "").split(/[^a-z]+/);
  const hits = KEYWORDS.filter(([, keys]) => keys.some((k) => words.includes(k))).map(([t]) => t);
  return hits.length === 1 ? hits[0] : undefined;
}
