import { expect, test } from "vitest";
import { suggestType } from "@/lib/docTypes";

test("suggests a type when exactly one matches", () => {
  expect(suggestType("CV_Jane.pdf")).toBe("cv");
  expect(suggestType("cv-3-pages.pdf")).toBe("cv");
  expect(suggestType("motivation-letter.pdf")).toBe("motivation_letter");
  expect(suggestType("transcript.pdf")).toBe("transcript");
  expect(suggestType("recommendation-1.pdf")).toBe("recommendation_letter");
  expect(suggestType("cover-letter.pdf")).toBe("motivation_letter");
  expect(suggestType("reference-2.pdf")).toBe("recommendation_letter");
  expect(suggestType("resume-1-page.pdf")).toBe("cv");
});

test("asks the user when unclear", () => {
  expect(suggestType("document.pdf")).toBeUndefined();
  expect(suggestType("cv_and_transcript.pdf")).toBeUndefined();
  expect(suggestType("record.pdf")).toBeUndefined(); // "rec" must be a whole word
});
