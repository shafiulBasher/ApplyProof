import { expect, test } from "vitest";
import { verifyQuote } from "@/lib/quotes";

const pages = [
  "Eligibility\nApplicants must have a minimum GPA of 3.0 on a 4.0 scale.",
  "A curriculum vitae (CV) of no more than 2 pages.\nAn official aca-\ndemic transcript.",
];

test("quote on its claimed page is verified", () => {
  expect(verifyQuote({ quote: "minimum GPA of 3.0 on a 4.0 scale", page: 1 }, pages)).toMatchObject({ page: 1, quoteVerified: true });
});

test("quote on a different page gets its page corrected", () => {
  expect(verifyQuote({ quote: "no more than 2 pages", page: 1 }, pages)).toMatchObject({ page: 2, quoteVerified: true });
});

test("quote that isn't anywhere is unverified", () => {
  expect(verifyQuote({ quote: "no more than 3 pages", page: 2 }, pages).quoteVerified).toBe(false);
  expect(verifyQuote({ quote: "", page: 1 }, pages).quoteVerified).toBe(false);
});

test("line-break hyphens, curly quotes, and spacing don't block a match", () => {
  expect(verifyQuote({ quote: "An official academic  transcript", page: 2 }, pages).quoteVerified).toBe(true);
  expect(verifyQuote({ quote: "curriculum vitae (CV)", page: 2 }, ["A Curriculum   Vitae (CV) is required"]).quoteVerified).toBe(true);
  expect(verifyQuote({ quote: "applicant’s degree", page: 1 }, ["The applicant's degree"]).quoteVerified).toBe(true);
});
