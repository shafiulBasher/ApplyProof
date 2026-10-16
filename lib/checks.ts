import { normalize } from "./quotes";
import { DOC_TYPE_LABELS, type ApplicantFacts, type DocType, type Finding, type Requirement, type StoredDocument } from "./types";

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const ORDINALS = ["", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"];
const num = (n: number) => NUMBER_WORDS[n] ?? String(n);
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const plural = (name: string, n: number) => (n === 1 ? name : `${name}s`);
export const docName = (t?: DocType) => (t === "cv" ? "CV" : t ? DOC_TYPE_LABELS[t].toLowerCase() : "document");

type Docs = Pick<StoredDocument, "fileName" | "confirmedType" | "pageCount" | "wordCount" | "readable">[];
type Verdict = Omit<Finding, "requirementId" | "title" | "quote" | "page">;

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
    return { requirementId: req.id, title: req.title, quote: req.quote, page: req.page, ...verdict };
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
  if (have >= required) return { status: "passed", explanation: `${cap(num(required))} required; ${num(have)} uploaded.`, evidence, measured: have };
  if (unconfirmed > 0)
    return {
      status: "needs_verification",
      explanation: `${cap(num(required))} required; ${num(have)} confirmed. ${unconfirmed} uploaded ${plural("file", unconfirmed)} ${unconfirmed === 1 ? "has" : "have"} no type yet.`,
      evidence,
      measured: have,
      correction: "Choose a type for each uploaded file so it can be counted.",
    };
  const missing = required - have;
  return {
    status: "action_needed",
    explanation: required > 1 ? `${cap(num(required))} required; only ${num(have)} uploaded.` : `Required, but no ${name} was uploaded.`,
    evidence,
    measured: have,
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
    : req.max !== undefined ? `Official limit: ${req.max} ${unit}`
    : req.min !== undefined ? `Official minimum: ${req.min} ${unit}`
    : undefined;
  if (!limit) return { status: "needs_verification", explanation: "The quoted limit isn't a number we can measure against.", correction: "Check your document against the quoted rule." };
  if (matching.length === 0) return { status: "needs_verification", explanation: `No ${name} uploaded to measure.`, correction: `Upload your ${name} to check its length.` };

  const measures = matching.map((d) => (unit === "pages" ? d.pageCount : d.wordCount));
  const bad = measures.findIndex((m) => (req.max !== undefined && m > req.max) || (req.min !== undefined && m < req.min));
  const shown = bad >= 0 ? bad : 0;
  const evidence = `${limit} · Uploaded ${name}: ${measures[shown]} ${unit}`;
  if (bad < 0) return { status: "passed", explanation: `Your ${name} is within the limit.`, evidence, measured: measures[0] };

  const over = req.max !== undefined && measures[bad] > req.max;
  return {
    status: "action_needed",
    explanation: over ? `Your ${name} is over the limit.` : `Your ${name} is under the minimum.`,
    evidence,
    measured: measures[bad],
    correction: over ? `Upload a revised ${name} of no more than ${req.max} ${unit}.` : `Upload a revised ${name} of at least ${req.min} ${unit}.`,
  };
}

function eligibility(req: Requirement, facts: ApplicantFacts): Verdict {
  const e = req.eligibility;
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
