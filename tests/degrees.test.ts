import { expect, test } from "vitest";
import { acceptedFields, allowsExpectedCompletion, allowsRelatedField, degreeLevelOf, fieldMatches, meetsLevel } from "@/lib/degrees";

test("equivalent bachelor's terms are recognized", () => {
  for (const t of ["Bachelor of Science", "BSc", "B.Sc.", "B.Sc", "bachelor's degree", "BEng in CSE", "B.Tech", "BA in Economics"]) {
    expect(degreeLevelOf(t), t).toBe("bachelor");
  }
  expect(degreeLevelOf("MSc Computer Science")).toBe("master");
  expect(degreeLevelOf("Master of Science")).toBe("master");
  expect(degreeLevelOf("PhD")).toBe("doctorate");
});

test("a subject alone never implies a level", () => {
  for (const t of ["CSE", "Computer Science", "Computer Science and Engineering", "Science", "Economics", "basics of business"]) {
    expect(degreeLevelOf(t), t).toBeUndefined();
  }
});

test("levels compare as a minimum", () => {
  expect(meetsLevel("bachelor", "bachelor")).toBe(true);
  expect(meetsLevel("master", "bachelor")).toBe(true);
  expect(meetsLevel("associate", "bachelor")).toBe(false);
});

test("CSE, Computer Science, and Computer Science and Engineering match each other", () => {
  expect(fieldMatches("CSE", ["computer science"])).toBe(true);
  expect(fieldMatches("Computer Science and Engineering", ["computer science"])).toBe(true);
  expect(fieldMatches("Computer Science", ["CSE"])).toBe(true);
  expect(fieldMatches("Economics", ["statistics", "economics", "computer science"])).toBe(true);
  expect(fieldMatches("Biology", ["statistics", "economics", "computer science"])).toBe(false);
});

test("reading the rule's wording", () => {
  expect(allowsExpectedCompletion("Applicants must hold a bachelor's degree, or expect to complete one before the program starts.")).toBe(true);
  expect(allowsExpectedCompletion("Applicants must hold a bachelor's degree.")).toBe(false);
  expect(allowsRelatedField(["statistics", "related field"])).toBe(true);
  expect(acceptedFields(["bachelor's degree", "statistics", "economics", "related field"])).toEqual(["statistics", "economics"]);
});
