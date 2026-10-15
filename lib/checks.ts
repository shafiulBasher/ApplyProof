import { DOC_TYPE_LABELS, type ApplicantFacts, type DocType, type Finding, type Requirement, type StoredDocument } from "./types";

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const num = (n: number) => NUMBER_WORDS[n] ?? String(n);
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const label = (t?: DocType) => (t ? DOC_TYPE_LABELS[t] : "document");
const lower = (t?: DocType) => (t === "cv" ? "CV" : label(t).toLowerCase());

type Docs = Pick<StoredDocument, "fileName" | "confirmedType" | "pageCount" | "wordCount" | "readable">[];
type Verdict = Omit<Finding, "requirementId" | "title" | "quote" | "page">;

// Turns each requirement into one finding. Plain code, no AI.
export function runChecks(requirements: Requirement[], documents: Docs, facts: ApplicantFacts): Finding[] {
  const docs = documents.filter((d) => d.readable);
  return requirements.map((req) => {
    const verdict: Verdict = req.quoteVerified
      ? check(req, docs, facts)
      : { status: "needs_verification", explanation: "We couldn't confirm this quote in the guideline. Check this rule yourself." };
    return { requirementId: req.id, title: req.title, quote: req.quote, page: req.page, ...verdict };
  });
}

function check(req: Requirement, docs: Docs, facts: ApplicantFacts): Verdict {
  switch (req.category) {
    case "required_document": return requiredDocument(req, docs);
    case "page_limit":
    case "word_limit": return lengthLimit(req, docs);
    case "eligibility": return eligibility(req, facts);
    case "deadline": return { status: "needs_verification", explanation: "Deadlines can't be checked from your files. Make sure you submit before this date." };
    default: return { status: "needs_verification", explanation: "This rule can't be checked automatically. Check it yourself against the quote." };
  }
}

function requiredDocument(req: Requirement, docs: Docs): Verdict {
  const required = req.count ?? 1;
  const have = docs.filter((d) => d.confirmedType === req.docType).length;
  const unconfirmed = docs.filter((d) => !d.confirmedType).length;
  const name = lower(req.docType);
  const evidence = `Uploaded ${name}${required > 1 ? "s" : ""}: ${have}`;
  if (have >= required) return { status: "passed", explanation: `${cap(num(required))} required; ${num(have)} uploaded.`, evidence, measured: have };
  if (unconfirmed > 0)
    return { status: "needs_verification", explanation: `${unconfirmed} uploaded file${unconfirmed > 1 ? "s have" : " has"} no type yet. Choose a type so we can count it.`, evidence, measured: have };
  return {
    status: "action_needed",
    explanation: required > 1 ? `${cap(num(required))} required; only ${num(have)} uploaded.` : `Required, but no ${name} was uploaded.`,
    evidence,
    measured: have,
    correction: `Upload ${num(required - have)} more ${name}${required - have > 1 ? "s" : ""}.`,
  };
}

function lengthLimit(req: Requirement, docs: Docs): Verdict {
  const unit = req.unit ?? (req.category === "page_limit" ? "pages" : "words");
  const name = lower(req.docType);
  const matching = docs.filter((d) => d.confirmedType === req.docType);
  const limit =
    req.min !== undefined && req.max !== undefined ? `Official range: ${req.min}–${req.max} ${unit}`
    : req.max !== undefined ? `Official limit: ${req.max} ${unit}`
    : req.min !== undefined ? `Official minimum: ${req.min} ${unit}`
    : undefined;
  if (!limit) return { status: "needs_verification", explanation: "The limit couldn't be read as a number. Check it yourself." };
  if (matching.length === 0) return { status: "needs_verification", explanation: `No ${name} uploaded to measure.` };

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
    correction: over ? `Shorten your ${name} to ${req.max} ${unit} or fewer.` : `Lengthen your ${name} to at least ${req.min} ${unit}.`,
  };
}

const NV_UNCLEAR: Verdict = { status: "needs_verification", explanation: "This rule can't be checked objectively. Check it yourself." };

function eligibility(req: Requirement, facts: ApplicantFacts): Verdict {
  const e = req.eligibility;
  if (!e || !e.clear) return NV_UNCLEAR;

  if (e.field === "gpa") {
    if (e.minGpa === undefined || e.scale === undefined) return NV_UNCLEAR;
    if (facts.gpa === undefined || facts.gpaScale === undefined)
      return { status: "needs_verification", explanation: "Enter your GPA and grading scale in Applicant Information to check this." };
    const evidence = `Required: ${e.minGpa} on a ${e.scale} scale · Yours: ${facts.gpa} on a ${facts.gpaScale} scale`;
    if (facts.gpaScale !== e.scale)
      return { status: "needs_verification", explanation: `Your GPA is on a ${facts.gpaScale} scale and the rule uses a ${e.scale} scale, with no stated conversion.`, evidence };
    return facts.gpa >= e.minGpa
      ? { status: "passed", explanation: "Your GPA meets the minimum.", evidence, measured: facts.gpa }
      : { status: "action_needed", explanation: "Your GPA is below the stated minimum.", evidence, measured: facts.gpa, correction: "Check with the program whether exceptions apply before submitting." };
  }

  if (e.field === "degree" || e.field === "nationality") {
    const fieldName = e.field;
    const value = facts[fieldName]?.trim();
    const allowed = e.allowedValues?.filter(Boolean) ?? [];
    if (allowed.length === 0) return NV_UNCLEAR;
    if (!value) return { status: "needs_verification", explanation: `Enter your ${fieldName} in Applicant Information to check this.` };
    const evidence = `Accepted: ${allowed.join(", ")} · Yours: ${value}`;
    if (fieldName === "nationality") {
      return allowed.some((a) => a.toLowerCase() === value.toLowerCase())
        ? { status: "passed", explanation: "Your nationality is on the accepted list.", evidence }
        : { status: "action_needed", explanation: "Your nationality isn't on the accepted list.", evidence, correction: "Check with the program whether you're eligible before submitting." };
    }
    // Degree names vary ("Bachelor of Science" vs "bachelor's degree"): match on the key word, and ask rather than fail when unsure.
    const key = (s: string) => s.toLowerCase().replace(/'s\b/g, "").replace(/\bdegree\b/g, "").replace(/[^a-z ]/g, "").trim().split(/\s+/)[0];
    return allowed.some((a) => value.toLowerCase().includes(key(a)))
      ? { status: "passed", explanation: "Your degree matches the requirement.", evidence }
      : { status: "needs_verification", explanation: "We couldn't match your degree to the accepted ones. Check this yourself.", evidence };
  }

  return NV_UNCLEAR;
}
