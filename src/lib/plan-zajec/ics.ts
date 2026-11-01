/**
 * Pozycje planu zajęć → kalendarz iCalendar do subskrypcji (Google, Apple,
 * Outlook). Godziny w strefie Europe/Warsaw z definicją VTIMEZONE, żeby
 * zajęcia nie przesuwały się o godzinę przy zmianie czasu.
 */
import type { PlanEntry } from "./parse";

const VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  "TZID:Europe/Warsaw",
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:+0100",
  "TZOFFSETTO:+0200",
  "TZNAME:CEST",
  "DTSTART:19700329T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:+0200",
  "TZOFFSETTO:+0100",
  "TZNAME:CET",
  "DTSTART:19701025T030000",
  "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
];

const text = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** RFC 5545: linie najwyżej 75 bajtów, kontynuacja od spacji. */
function fold(line: string): string {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let start = 0;
  let limit = 75;
  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    // Nie tniemy w środku znaku UTF-8.
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
    parts.push(bytes.subarray(start, end).toString("utf8"));
    start = end;
    limit = 74;
  }
  return parts.join("\r\n ");
}

const local = (date: string, time: string) => {
  const [h, m] = time.split(":");
  return `${date.replace(/-/g, "")}T${h.padStart(2, "0")}${m}00`;
};

export function planToIcs(entries: PlanEntry[], calendarName: string, now: Date = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Samorzad Studentow UEW//Plan zajec//PL",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${text(calendarName)}`,
    "X-WR-TIMEZONE:Europe/Warsaw",
    // Podpowiedź dla klientów, jak często pobierać zmiany.
    "REFRESH-INTERVAL;VALUE=DURATION:PT6H",
    "X-PUBLISHED-TTL:PT6H",
    ...VTIMEZONE,
  ];
  for (const e of entries) {
    const title = [e.subject, e.kind].filter(Boolean).join(" · ") + (e.half ? ` (połowa ${e.half})` : "");
    for (const d of e.dates) {
      lines.push(
        "BEGIN:VEVENT",
        `UID:uew-plan-${e.id}-${d.date}-${d.from.replace(":", "")}@samorzad.ue.wroc.pl`,
        `DTSTAMP:${stamp}`,
        `DTSTART;TZID=Europe/Warsaw:${local(d.date, d.from)}`,
        `DTEND;TZID=Europe/Warsaw:${local(d.date, d.to)}`,
        `SUMMARY:${text(title)}`,
        ...(d.room ? [`LOCATION:${text(`Sala ${d.room}`)}`] : []),
        ...(d.lecturer ? [`DESCRIPTION:${text(`Prowadzący: ${d.lecturer}`)}`] : []),
        "END:VEVENT",
      );
    }
  }
  lines.push("END:VCALENDAR", "");
  return lines.map(fold).join("\r\n");
}
