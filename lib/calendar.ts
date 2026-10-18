// Builds a standard .ics calendar file (RFC 5545) for an application deadline. Works with
// Google Calendar, Outlook, and Apple Calendar. Plain code, no network.

// Fixed offsets for timezone abbreviations guidelines commonly use, taken literally as written
// (CET = UTC+1, CEST = UTC+2). Anything else becomes an all-day event rather than a guess.
const ZONES: Record<string, number> = {
  UTC: 0, GMT: 0, WET: 0, BST: 60, CET: 60, WEST: 60, WAT: 60, CEST: 120, EET: 120, SAST: 120, EEST: 180, EAT: 180, MSK: 180,
  GST: 240, PKT: 300, IST: 330, BDT: 360, ICT: 420, WIB: 420, SGT: 480, HKT: 480, AWST: 480, JST: 540, KST: 540, AEST: 600, AEDT: 660, NZST: 720, NZDT: 780,
  EST: -300, EDT: -240, CST: -360, CDT: -300, MST: -420, MDT: -360, PST: -480, PDT: -420,
};

export function offsetMinutes(zone?: string): number | undefined {
  if (!zone) return undefined;
  const z = zone.trim().toUpperCase();
  const m = z.match(/^(?:UTC|GMT)\s*([+-])\s*(\d{1,2})(?::?(\d{2}))?$/);
  if (m) return (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0));
  return ZONES[z];
}

// "23:59", "11:59 PM", "5 pm", "17.00" → minutes after midnight.
export function minutesOf(time?: string): number | undefined {
  const m = time?.trim().match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?$/i);
  if (!m) return undefined;
  let h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  const ampm = m[3]?.toLowerCase()[0];
  if (ampm === "p" && h < 12) h += 12;
  if (ampm === "a" && h === 12) h = 0;
  return h > 23 || min > 59 ? undefined : h * 60 + min;
}

const pad = (n: number) => String(n).padStart(2, "0");
const utcStamp = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
// Lines longer than 75 octets are folded with CRLF + space.
const fold = (line: string) => {
  const out: string[] = [];
  let rest = line;
  while (new TextEncoder().encode(rest).length > 75) {
    let cut = 74;
    while (new TextEncoder().encode(rest.slice(0, cut)).length > 74) cut--;
    out.push(rest.slice(0, cut));
    rest = " " + rest.slice(cut);
  }
  out.push(rest);
  return out.join("\r\n");
};

export interface DeadlineEvent {
  id: string;
  title: string; // application name
  organization?: string;
  date: string; // YYYY-MM-DD
  time?: string; // as written in the guideline
  timezone?: string; // as written in the guideline
  note?: string; // e.g. the guideline's quote
  now?: Date;
}

export function deadlineIcs(e: DeadlineEvent): string {
  const [y, mo, d] = e.date.split("-").map(Number);
  const minutes = minutesOf(e.time);
  const offset = offsetMinutes(e.timezone);
  const timed = minutes !== undefined && offset !== undefined;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ApplyProof//Deadline//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.id}-deadline@applyproof.local`,
    `DTSTAMP:${utcStamp(e.now ?? new Date())}`,
  ];
  if (timed) {
    // The stated local time minus its offset gives the exact moment in UTC.
    const start = new Date(Date.UTC(y, mo - 1, d, 0, minutes! - offset!));
    lines.push(`DTSTART:${utcStamp(start)}`, `DTEND:${utcStamp(new Date(start.getTime() + 60_000))}`);
  } else {
    const next = new Date(Date.UTC(y, mo - 1, d + 1));
    lines.push(`DTSTART;VALUE=DATE:${y}${pad(mo)}${pad(d)}`, `DTEND;VALUE=DATE:${next.getUTCFullYear()}${pad(next.getUTCMonth() + 1)}${pad(next.getUTCDate())}`);
  }
  const summary = `Deadline: ${e.title}${e.organization ? ` (${e.organization})` : ""}`;
  const description = [
    timed ? `Deadline as stated: ${e.time} ${e.timezone}.` : "All-day: the guideline gives no exact time and timezone we can use.",
    e.note && `Guideline: "${e.note}"`,
    "Added from ApplyProof.",
  ].filter(Boolean).join("\n");
  lines.push(`SUMMARY:${escape(summary)}`, `DESCRIPTION:${escape(description)}`, "TRANSP:TRANSPARENT");
  for (const [trigger, when] of [["-P7D", "in 7 days"], ["-P1D", "tomorrow"]]) {
    lines.push("BEGIN:VALARM", "ACTION:DISPLAY", `TRIGGER:${trigger}`, `DESCRIPTION:${escape(`${e.title} is due ${when}`)}`, "END:VALARM");
  }
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
