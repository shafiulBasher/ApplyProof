// Degree level and field of study, compared separately. Plain code, no AI.
export type DegreeLevel = "high_school" | "associate" | "bachelor" | "master" | "doctorate";

export const DEGREE_LEVELS: { value: DegreeLevel; label: string }[] = [
  { value: "high_school", label: "High school / secondary" },
  { value: "associate", label: "Associate degree" },
  { value: "bachelor", label: "Bachelor's (BSc, BA, BEng…)" },
  { value: "master", label: "Master's (MSc, MA, MBA…)" },
  { value: "doctorate", label: "Doctorate (PhD)" },
];
const RANK: Record<DegreeLevel, number> = { high_school: 1, associate: 2, bachelor: 3, master: 4, doctorate: 5 };
export const levelLabel = (l: DegreeLevel) => ({ high_school: "high school", associate: "associate degree", bachelor: "bachelor's degree", master: "master's degree", doctorate: "doctorate" })[l];
export const meetsLevel = (have: DegreeLevel, need: DegreeLevel) => RANK[have] >= RANK[need];

// Order matters: the most specific titles first. Abbreviations need the letter pattern itself
// (b.sc, bsc, b.a.) so a subject such as "CSE" or "science" never implies a level.
const LEVEL_PATTERNS: [DegreeLevel, RegExp][] = [
  ["doctorate", /\b(ph\.?\s?d|doctorate|doctoral|d\.?\s?phil)\b/i],
  ["master", /\b(master'?s?|m\.?\s?sc|m\.\s?s\.|m\.?\s?eng|m\.?\s?phil|m\.?\s?tech|mba|m\.\s?a\.)(?![a-z])/i],
  ["bachelor", /\b(bachelor'?s?|b\.?\s?sc|b\.\s?s\.|b\.?\s?eng|b\.?\s?tech|b\.?\s?com|bba|b\.\s?a\.|undergraduate degree)(?![a-z])/i],
  ["associate", /\bassociate'?s?\s+(degree|of)\b/i],
  ["high_school", /\b(high school|secondary school|a-levels?)\b/i],
];
export function degreeLevelOf(text?: string): DegreeLevel | undefined {
  if (!text) return undefined;
  const found = LEVEL_PATTERNS.find(([, re]) => re.test(text))?.[0];
  if (found) return found;
  // Two-letter forms only in capitals ("BA", "MS"), so ordinary words never match.
  if (/\b(BA|BS)\b/.test(text)) return "bachelor";
  if (/\b(MA|MS)\b/.test(text)) return "master";
}

// Field families: any shared family counts as the same field.
const FIELD_FAMILIES: [string, RegExp][] = [
  ["computer science", /\b(cse|cs|comp\.?\s?sci|computer science|computing|informatics)\b/i],
  ["computer engineering", /\b(cse|computer engineering|computer science and engineering)\b/i],
  ["economics", /\b(econ|economics)\b/i],
  ["statistics", /\b(stats?|statistics)\b/i],
  ["mathematics", /\b(maths?|mathematics)\b/i],
  ["business", /\b(business|bba|mba|management)\b/i],
  ["engineering", /\bengineering\b/i],
  ["public policy", /\b(public policy|public administration)\b/i],
];
const families = (text: string) => new Set(FIELD_FAMILIES.filter(([, re]) => re.test(text)).map(([f]) => f));

// Does the applicant's field match any of the accepted ones?
export function fieldMatches(applicantField: string, accepted: string[]): boolean {
  const mine = families(applicantField);
  const a = applicantField.toLowerCase().trim();
  return accepted.some((acc) => {
    const b = acc.toLowerCase().trim();
    if (b && (a.includes(b) || b.includes(a))) return true;
    return [...families(acc)].some((f) => mine.has(f));
  });
}

export const allowsRelatedField = (texts: string[]) => texts.some((t) => /related (field|subject|discipline)/i.test(t));
// "hold a bachelor's degree, or expect to complete one before the program starts"
export const allowsExpectedCompletion = (quote: string) => /\b(expect(ed)? to (complete|graduate|finish)|final[- ]year|before the program (starts|begins)|due to graduate)\b/i.test(quote);
// Accepted fields from the AI's list, without the level words or the "related field" catch-all.
export const acceptedFields = (values: string[] = []) =>
  values.filter((v) => v && !degreeLevelOf(v) && !/^(a |any )?related (field|subject|discipline)s?$/i.test(v.trim()) && !/^(a )?degree$/i.test(v.trim()));
