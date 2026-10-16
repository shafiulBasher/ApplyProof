import { expect, test } from "vitest";
import { runChecks } from "@/lib/checks";
import { outstanding, overallStatus } from "@/lib/status";
import type { DocType, Requirement } from "@/lib/types";

const req = (r: Partial<Requirement>): Requirement => ({ id: "r", title: "T", quote: "q", page: 1, quoteVerified: true, category: "other", ...r });
const doc = (confirmedType: DocType | undefined, pageCount = 1, wordCount = 100, readable = true) => ({ fileName: "f.pdf", confirmedType, pageCount, wordCount, readable });
const one = (r: Partial<Requirement>, docs = [doc("cv")], facts = {}) => runChecks([req(r)], docs, facts)[0];

test("3-page CV against a 2-page limit is Action Needed with evidence and correction", () => {
  const f = one({ category: "page_limit", docType: "cv", max: 2, unit: "pages" }, [doc("cv", 3)]);
  expect(f.status).toBe("action_needed");
  expect(f.evidence).toBe("Official limit: 2 pages · Uploaded CV/résumé: 3 pages");
  expect(f.correction).toBe("Upload a revised CV/résumé of no more than 2 pages.");
  expect(one({ category: "page_limit", docType: "cv", max: 2, unit: "pages" }, [doc("cv", 2)]).status).toBe("passed");
});

test("620 words within 500–800 passes; outside fails", () => {
  const r = { category: "word_limit" as const, docType: "motivation_letter" as const, min: 500, max: 800, unit: "words" as const };
  expect(one(r, [doc("motivation_letter", 2, 620)]).status).toBe("passed");
  expect(one(r, [doc("motivation_letter", 2, 450)]).status).toBe("action_needed");
});

test("1 of 2 recommendation letters is Action Needed", () => {
  const f = one({ category: "required_document", docType: "recommendation_letter", count: 2 }, [doc("recommendation_letter"), doc("cv")]);
  expect(f.status).toBe("action_needed");
  expect(f.explanation).toBe("Two required; only one uploaded.");
  expect(f.correction).toBe("Upload the second recommendation/reference letter.");
});

test("unconfirmed file types and unreadable files", () => {
  expect(one({ category: "required_document", docType: "transcript" }, [doc(undefined)]).status).toBe("needs_verification");
  expect(one({ category: "required_document", docType: "transcript" }, [doc("transcript", 1, 0, false)]).status).toBe("action_needed");
});

test("GPA: same scale compares, different scale or missing value needs verification", () => {
  const r = { category: "eligibility" as const, eligibility: { field: "gpa" as const, minGpa: 3, scale: 4, clear: true } };
  expect(one(r, [], { gpa: 3.6, gpaScale: 4 }).status).toBe("passed");
  expect(one(r, [], { gpa: 2.8, gpaScale: 4 }).status).toBe("action_needed");
  expect(one(r, [], { gpa: 8, gpaScale: 10 }).status).toBe("needs_verification");
  expect(one(r, [], {}).explanation).toMatch(/GPA/);
});

test("degree, nationality, and unclear rules", () => {
  const degree = { category: "eligibility" as const, eligibility: { field: "degree" as const, allowedValues: ["bachelor's degree"], clear: true } };
  expect(one(degree, [], { degree: "Bachelor of Science" }).status).toBe("passed");
  expect(one(degree, [], {}).explanation).toMatch(/degree/);
  const nat = { category: "eligibility" as const, eligibility: { field: "nationality" as const, allowedValues: ["Kenya"], clear: true } };
  expect(one(nat, [], { nationality: "kenya" }).status).toBe("passed");
  expect(one(nat, [], { nationality: "Peru" }).status).toBe("action_needed");
  expect(one({ category: "eligibility", eligibility: { field: "other", clear: false } }).status).toBe("needs_verification");
});

test("unverified quote is always Needs Verification; deadline too", () => {
  expect(one({ category: "page_limit", docType: "cv", max: 2, quoteVerified: false }, [doc("cv", 1)]).status).toBe("needs_verification");
  expect(one({ category: "deadline" }).status).toBe("needs_verification");
});

test("every Action Needed finding has a correction", () => {
  const findings = runChecks(
    [req({ id: "a", category: "required_document", docType: "transcript" }), req({ id: "b", category: "page_limit", docType: "cv", max: 2 })],
    [doc("cv", 3)], {},
  );
  expect(findings.filter((f) => f.status === "action_needed" && !f.correction)).toHaveLength(0);
});

test("overall status and outstanding count", () => {
  const f = (status: "passed" | "action_needed" | "needs_verification") => ({ requirementId: "x", status, title: "", explanation: "", quote: "", page: 1 });
  expect(overallStatus([f("passed"), f("needs_verification"), f("action_needed")])).toBe("action_needed");
  expect(overallStatus([f("passed"), f("needs_verification")])).toBe("needs_verification"); // never Passed with anything unverified
  expect(overallStatus([f("passed")])).toBe("passed");
  expect(outstanding([f("passed"), f("needs_verification"), f("action_needed")])).toBe(2);
});

test("deadline shows only the parts that appear in the quote", () => {
  const quote = "The application deadline is October 20, 2027, at 23:59 CET.";
  const full = one({ category: "deadline", quote, deadline: { date: "October 20, 2027", time: "23:59", timezone: "CET" } });
  expect(full.status).toBe("needs_verification");
  expect(full.correction).toBe("Submit by October 20, 2027, 23:59 CET.");
  // A timezone the AI made up isn't in the quote, so it's flagged instead of shown.
  const invented = one({ category: "deadline", quote: "Apply by October 20, 2027.", deadline: { date: "October 20, 2027", time: "23:59", timezone: "UTC" } });
  expect(invented.explanation).toBe("Deadline: October 20, 2027. The quoted deadline doesn't give a closing time or timezone.");
  expect(invented.correction).toMatch(/Confirm a closing time or timezone/);
  expect(one({ category: "deadline", quote }).correction).toMatch(/Confirm the deadline/);
});

test("unclear eligibility gives a grounded next step", () => {
  const f = one({ category: "eligibility", eligibility: { field: "other", clear: false } });
  expect(f.status).toBe("needs_verification");
  expect(f.correction).toBe("Confirm the accepted evidence with the program organizer.");
});

test("every Needs Verification finding has a next step", () => {
  const reqs = [
    req({ id: "a", category: "deadline" }), req({ id: "b", category: "formatting" }),
    req({ id: "c", category: "eligibility", eligibility: { field: "gpa", minGpa: 3, scale: 4, clear: true } }),
    req({ id: "d", category: "page_limit", docType: "cv", max: 2, quoteVerified: false }),
  ];
  expect(runChecks(reqs, [], {}).filter((f) => !f.correction)).toHaveLength(0);
});

test("a 1-page limit reads in the singular", () => {
  const f = one({ category: "page_limit", docType: "cv", max: 1, unit: "pages" }, [doc("cv", 2)]);
  expect(f.evidence).toBe("Official limit: 1 page · Uploaded CV/résumé: 2 pages");
  expect(f.correction).toBe("Upload a revised CV/résumé of no more than 1 page.");
});
