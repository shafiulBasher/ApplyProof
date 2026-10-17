import { normalize } from "./quotes";
import { type ApplicantFacts, type DocType, type Finding, type Requirement, type StoredDocument } from "./types";

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const ORDINALS = ["", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"];
const num = (n: number) => NUMBER_WORDS[n] ?? String(n);
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const plural = (name: string, n: number) => (n === 1 ? name : `${name}s`);
// Both names, so the wording fits scholarship and job applications alike.
const DOC_NAMES: Record<DocType, string> = {
  cv: "CV/résumé",
  motivation_letter: "motivation/cover letter",
  transcript: "transcript",
  recommendation_letter: "recommendation/reference letter",
  other: "document",
};
export const docName = (t?: DocType) => DOC_NAMES[t ?? "other"];
// "1 page", "2 pages".
export const qty = (n: number, unit: string) => `${n} ${n === 1 ? unit.replace(/s$/, "") : unit}`;

type Docs = Pick<StoredDocument, "fileName" | "confirmedType" | "pageCount" | "wordCount" | "readable">[];
type Verdict = Omit<Finding, "requirementId" | "title" | "quote" | "page" | "category" | "docType">;

// Readable files of a confirmed type. Shared by the checker and the requirements checklist.
export const countDocs = (docs: Docs, type?: DocType) => docs.filter((d) => d.readable && d.confirmedType === type).length;
export const countUnconfirmed = (docs: Docs) => docs.filter((d) => d.readable && !d.confirmedType).length;

// Turns each requirement into one finding. Plain code, no AI.
// `explanation` states facts from the guideline and files; `correction` is the suggested next step.
export function runChecks(requirements: Requirement[], documents: Docs, facts: ApplicantFacts): Finding[] {
  const docs = documents.filter((d) => d.readable);
  return requirements.map((req) => {
    const verdict: Verdict = req.quoteVerified
      ? check(req, docs, facts)
      : { status: "needs_verification", explanation: "We couldn't find this quote in the guideline.", correction: "Look up this rule in the original guideline before relying on it." };
    return { requirementId: req.id, category: req.category, docType: req.docType, title: req.title, quote: req.quote, page: req.page, ...verdict };
  });
}

function check(req: Requirement, docs: Docs, facts: ApplicantFacts): Verdict {
  switch (req.category) {
    case "required_document": return requiredDocument(req, docs);
    case "page_limit":
    case "word_limit": return lengthLimit(req, docs);
    case "eligibility": return eligibility(req, facts);
    case "deadline": return deadline(req);
    default: return { status: "needs_verification", explanation: "This rule can't be measured from your files.", correction: "Make sure your documents follow the quoted rule." };
  }
}

function requiredDocument(req: Requirement, docs: Docs): Verdict {
  const required = req.count ?? 1;
  const have = countDocs(docs, req.docType);
  const unconfirmed = countUnconfirmed(docs);
  const name = docName(req.docType);
  const evidence = `Uploaded ${plural(name, required)}: ${have}`;
  if (have >= required) return { status: "passed", explanation: `${cap(num(required))} required; ${num(have)} uploaded.`, evidence, measured: have, unit: "uploaded", limit: { min: required } };
  if (unconfirmed > 0)
    return {
      status: "needs_verification",
      explanation: `${cap(num(required))} required; ${num(have)} confirmed. ${unconfirmed} uploaded ${plural("file", unconfirmed)} ${unconfirmed === 1 ? "has" : "have"} no type yet.`,
      evidence,
      measured: have,
    unit: "uploaded",
    limit: { min: required },
      correction: "Choose a type for each uploaded file so it can be counted.",
    };
  const missing = required - have;
  return {
    status: "action_needed",
    explanation: required > 1 ? `${cap(num(required))} required; only ${num(have)} uploaded.` : `Required, but no ${name} was uploaded.`,
    evidence,
    measured: have,
    unit: "uploaded",
    limit: { min: required },
    correction:
      required === 1 ? `Upload your ${name}.`
      : missing === 1 ? `Upload the ${ORDINALS[required] ?? `${required}th`} ${name}.`
      : `Upload ${num(missing)} more ${plural(name, missing)}.`,
  };
}

function lengthLimit(req: Requirement, docs: Docs): Verdict {
  const unit = req.unit ?? (req.category === "page_limit" ? "pages" : "words");
  const name = docName(req.docType);
  const matching = docs.filter((d) => d.confirmedType === req.docType);
  const limit =
    req.min !== undefined && req.max !== undefined ? `Official range: ${req.min}–${req.max} ${unit}`
    : req.max !== undefined ? `Official limit: ${qty(req.max, unit)}`
    : req.min !== undefined ? `Official minimum: ${qty(req.min, unit)}`
    : undefined;
  if (!limit) return { status: "needs_verification", explanation: "The quoted limit isn't a number we can measure against.", correction: "Check your document against the quoted rule." };
  if (matching.length === 0) return { status: "needs_verification", explanation: `No ${name} uploaded to measure.`, correction: `Upload your ${name} to check its length.` };

  const measures = matching.map((d) => (unit === "pages" ? d.pageCount : d.wordCount));
  const bad = measures.findIndex((m) => (req.max !== undefined && m > req.max) || (req.min !== undefined && m < req.min));
  const shown = bad >= 0 ? bad : 0;
  const evidence = `${limit} · Uploaded ${name}: ${qty(measures[shown], unit)}`;
  if (bad < 0) return { status: "passed", explanation: `Your ${name} is within the limit.`, evidence, measured: measures[0], unit, limit: { min: req.min, max: req.max } };

  const over = req.max !== undefined && measures[bad] > req.max;
  return {
    status: "action_needed",
    explanation: over ? `Your ${name} is over the limit.` : `Your ${name} is under the minimum.`,
    evidence,
    measured: measures[bad],
    unit,
    limit: { min: req.min, max: req.max },
    correction: over ? `Upload a revised ${name} of no more than ${qty(req.max!, unit)}.` : `Upload a revised ${name} of at least ${qty(req.min!, unit)}.`,
  };
}

// The AI sometimes mislabels a measurable rule (a GPA rule marked unclear, missing numbers, a degree rule as "other").
// Fill the gaps from the verified quote itself, so the check stays grounded in the guideline's own words.
export function readEligibility(req: Requirement): Requirement["eligibility"] {
  // The AI may also leave the eligibility details out entirely; then only the quote can tell.
  const e = req.eligibility ?? { field: "other" as const, clear: false };
  const quote = req.quote;
  if (e.field === "gpa" || (e.field === "other" && /\bGPA\b|grade point average/i.test(quote))) {
    const m = quote.match(/(\d+(?:\.\d+)?)\s*(?:\/|out of|on an?)\s*(\d+(?:\.\d+)?)/i);
    const minGpa = e.minGpa ?? (m ? Number(m[1]) : undefined);
    const scale = e.scale ?? (m ? Number(m[2]) : undefined);
    return { ...e, field: "gpa", minGpa, scale, clear: minGpa !== undefined && scale !== undefined };
  }
  const level = quote.match(/\b(bachelor|master|doctorate|doctoral|ph\.?d)/i)?.[1];
  if (e.field === "degree" || (e.field === "other" && level && /degree/i.test(quote))) {
    const allowedValues = e.allowedValues?.filter(Boolean).length ? e.allowedValues : level ? [level] : [];
    return { ...e, field: "degree", allowedValues, clear: allowedValues!.length > 0 };
  }
  return e;
}

function eligibility(req: Requirement, facts: ApplicantFacts): Verdict {
  const e = readEligibility(req);
  const unclear: Verdict = {
    status: "needs_verification",
    explanation: "The quoted rule doesn't state a measurable standard or what proof is accepted.",
    correction: "Confirm the accepted evidence with the program organizer.",
  };
  if (!e || !e.clear) return unclear;

  if (e.field === "gpa") {
    if (e.minGpa === undefined || e.scale === undefined) return unclear;
    if (facts.gpa === undefined || facts.gpaScale === undefined)
      return { status: "needs_verification", explanation: `Requires a GPA of at least ${e.minGpa} on a ${e.scale} scale.`, correction: "Enter your GPA and grading scale in Applicant Information." };
    const evidence = `Required: ${e.minGpa} on a ${e.scale} scale · Yours: ${facts.gpa} on a ${facts.gpaScale} scale`;
    if (facts.gpaScale !== e.scale)
      return { status: "needs_verification", explanation: `Your GPA is on a ${facts.gpaScale} scale; the rule uses a ${e.scale} scale and states no conversion.`, evidence, correction: "Ask the program organizer how they convert your grading scale." };
    return facts.gpa >= e.minGpa
      ? { status: "passed", explanation: "Your GPA meets the minimum.", evidence, measured: facts.gpa }
      : { status: "action_needed", explanation: "Your GPA is below the stated minimum.", evidence, measured: facts.gpa, correction: "Ask the program organizer whether exceptions apply before submitting." };
  }

  if (e.field === "degree" || e.field === "nationality") {
    const fieldName = e.field;
    const value = facts[fieldName]?.trim();
    const allowed = e.allowedValues?.filter(Boolean) ?? [];
    if (allowed.length === 0) return unclear;
    if (!value) return { status: "needs_verification", explanation: `Accepted: ${allowed.join(", ")}.`, correction: `Enter your ${fieldName} in Applicant Information.` };
    const evidence = `Accepted: ${allowed.join(", ")} · Yours: ${value}`;
    if (fieldName === "nationality") {
      return allowed.some((a) => a.toLowerCase() === value.toLowerCase())
        ? { status: "passed", explanation: "Your nationality is on the accepted list.", evidence }
        : { status: "action_needed", explanation: "Your nationality isn't on the accepted list.", evidence, correction: "Ask the program organizer whether you're eligible before submitting." };
    }
    // Degree names vary ("Bachelor of Science" vs "bachelor's degree"): match on the key word, and ask rather than fail when unsure.
    const key = (s: string) => s.toLowerCase().replace(/'s\b/g, "").replace(/\bdegree\b/g, "").replace(/[^a-z ]/g, "").trim().split(/\s+/)[0];
    return allowed.some((a) => value.toLowerCase().includes(key(a)))
      ? { status: "passed", explanation: "Your degree matches the requirement.", evidence }
      : { status: "needs_verification", explanation: "Your degree doesn't clearly match the accepted ones.", evidence, correction: "Confirm with the program organizer that your degree qualifies." };
  }

  return unclear;
}

// Shows only the date, time, and timezone that literally appear in the quote; never fills in a missing one.
function deadline(req: Requirement): Verdict {
  const inQuote = (s?: string) => (s && normalize(req.quote).includes(normalize(s)) ? s.trim() : undefined);
  const date = inQuote(req.deadline?.date);
  const time = inQuote(req.deadline?.time);
  const zone = inQuote(req.deadline?.timezone);
  if (!date) return { status: "needs_verification", explanation: "We couldn't read a clear date from the quoted deadline.", correction: "Confirm the deadline with the program organizer." };
  if (time && zone) return { status: "needs_verification", explanation: `Deadline: ${date}, ${time} ${zone}.`, correction: `Submit by ${date}, ${time} ${zone}.` };
  const missing = !time && !zone ? "a closing time or timezone" : !time ? "a closing time" : "a timezone";
  return {
    status: "needs_verification",
    explanation: `Deadline: ${[date, time, zone].filter(Boolean).join(", ")}. The quoted deadline doesn't give ${missing}.`,
    correction: `Confirm ${missing} with the program organizer.`,
  };
}
