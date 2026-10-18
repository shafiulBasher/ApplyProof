import { expect, test } from "vitest";
import { deadlineIcs, minutesOf, offsetMinutes } from "@/lib/calendar";

const now = new Date(Date.UTC(2026, 9, 18, 12, 0, 0));
const base = { id: "app1", title: "Global Future Scholars Scholarship", date: "2027-10-20", now };

test("a stated time and timezone become the exact moment in UTC", () => {
  const ics = deadlineIcs({ ...base, time: "23:59", timezone: "CET" });
  expect(ics).toContain("DTSTART:20271020T225900Z"); // 23:59 CET = 22:59 UTC
  expect(ics).toContain("DTEND:20271020T230000Z");
  expect(ics).toContain("Deadline as stated: 23:59 CET.");
  expect(deadlineIcs({ ...base, time: "5 pm", timezone: "UTC+2" })).toContain("DTSTART:20271020T150000Z");
});

test("a date only, or an unknown timezone, becomes an all-day event", () => {
  for (const extra of [{}, { time: "23:59" }, { time: "23:59", timezone: "local time" }]) {
    const ics = deadlineIcs({ ...base, ...extra });
    expect(ics).toContain("DTSTART;VALUE=DATE:20271020");
    expect(ics).toContain("DTEND;VALUE=DATE:20271021");
    expect(ics).not.toMatch(/DTSTART:\d/);
  }
  expect(deadlineIcs({ ...base, date: "2026-12-31" })).toContain("DTEND;VALUE=DATE:20270101"); // year rollover
});

test("reminders 7 days and 1 day before, valid structure", () => {
  const ics = deadlineIcs({ ...base, organization: "Fictional Foundation, Inc.", note: "The deadline is October 20; late; no." });
  expect(ics).toContain("TRIGGER:-P7D");
  expect(ics).toContain("TRIGGER:-P1D");
  expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
  expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
  expect(ics.replace(/\r\n /g, "")).toContain("Fictional Foundation\\, Inc."); // escaped comma, after unfolding
  expect(ics.split("\r\n").every((l) => new TextEncoder().encode(l).length <= 75)).toBe(true); // folded
});

test("time and timezone parsing", () => {
  expect(minutesOf("11:59 PM")).toBe(23 * 60 + 59);
  expect(minutesOf("12 a.m.")).toBe(0);
  expect(minutesOf("noon")).toBeUndefined();
  expect(offsetMinutes("IST")).toBe(330);
  expect(offsetMinutes("GMT-5")).toBe(-300);
  expect(offsetMinutes("Europe time")).toBeUndefined();
});
