import { expect, test } from "vitest";
import { byDeadline, monthGrid } from "@/lib/calendarView";

test("month grid: six Monday-first weeks around the month", () => {
  const oct = monthGrid(2026, 9); // October 2026 starts on a Thursday
  expect(oct).toHaveLength(42);
  expect(oct[0]).toEqual({ iso: "2026-09-28", day: 28, inMonth: false }); // the Monday before
  expect(oct[3]).toEqual({ iso: "2026-10-01", day: 1, inMonth: true });
  expect(oct.filter((d) => d.inMonth)).toHaveLength(31);
  expect(monthGrid(2027, 1)[0].iso).toBe("2027-02-01"); // Feb 2027 starts on a Monday
  expect(monthGrid(2026, 11).at(-1)!.iso).toBe("2027-01-10"); // runs into next year
});

test("applications grouped by deadline date", () => {
  const map = byDeadline([{ id: "a", deadline: "2026-10-20" }, { id: "b", deadline: "2026-10-20" }, { id: "c" }, { id: "d", deadline: "2026-10-22" }]);
  expect(map.get("2026-10-20")?.map((x) => x.id)).toEqual(["a", "b"]);
  expect(map.get("2026-10-22")).toHaveLength(1);
  expect(map.size).toBe(2);
});
