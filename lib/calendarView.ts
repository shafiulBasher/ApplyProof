// Month grid for the in-app calendar. Weeks start on Monday; dates are YYYY-MM-DD in local time.
export const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Six full weeks covering the month (42 days), so the grid never changes height.
export function monthGrid(year: number, month: number): { iso: string; day: number; inMonth: boolean }[] {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - ((first.getDay() + 6) % 7)); // back to Monday
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    return { iso: isoDay(d), day: d.getDate(), inMonth: d.getMonth() === month };
  });
}

// Applications grouped by their deadline date.
export function byDeadline<A extends { deadline?: string }>(apps: A[]): Map<string, A[]> {
  const map = new Map<string, A[]>();
  for (const a of apps) if (a.deadline) map.set(a.deadline, [...(map.get(a.deadline) ?? []), a]);
  return map;
}
