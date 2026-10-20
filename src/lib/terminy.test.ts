import { describe, expect, it } from "vitest";
import { terminById, terminState, terminy, toIcs, upcomingTerminy, zamianyDni } from "./terminy";

const day = (s: string) => new Date(`${s}T00:00:00`).getTime();

describe("terminy", () => {
  it("każdy termin ma poprawne daty, a koniec nie jest przed początkiem", () => {
    for (const t of terminy) {
      expect(t.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(day(t.start))).toBe(false);
      if (t.end) expect(day(t.end)).toBeGreaterThanOrEqual(day(t.start));
    }
    for (const z of zamianyDni) expect(Number.isNaN(day(z.date))).toBe(false);
  });

  it("identyfikatory są unikalne", () => {
    const ids = terminy.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("liczy dni do sesji i dni do końca trwającej sesji", () => {
    const sesja = terminById("sesja-zimowa-2027")!;
    expect(terminState(sesja, day("2027-02-01"))).toEqual({ kind: "soon", daysTo: 8 });
    // Pierwszy dzień sesji: 14 dni włącznie z dzisiejszym (09-22.02).
    expect(terminState(sesja, day("2027-02-09"))).toEqual({ kind: "now", daysLeft: 14 });
    expect(terminState(sesja, day("2027-02-22"))).toEqual({ kind: "now", daysLeft: 1 });
    expect(terminState(sesja, day("2027-02-23"))).toBeNull();
  });

  it("termin jednodniowy trwa tylko tego dnia", () => {
    const wfs = terminById("wfs-wnioski-2026")!;
    expect(terminState(wfs, day("2026-11-30"))).toEqual({ kind: "now", daysLeft: 1 });
    expect(terminState(wfs, day("2026-12-01"))).toBeNull();
  });

  it("pomija minione i może pominąć terminy wybranych roczników", () => {
    const all = upcomingTerminy(day("2026-12-10"));
    expect(all.some((x) => x.termin.id === "wolne-2026-11-02")).toBe(false);
    expect(all.some((x) => x.termin.id === "ziip-poprawka-2026")).toBe(true);
    const general = upcomingTerminy(day("2026-12-10"), { includeAudience: false });
    expect(general.every((x) => !x.termin.audience)).toBe(true);
  });

  it("eksport .ics ma wyłączny DTEND i podpis rocznika", () => {
    const ics = toIcs([terminById("ziip-poprawka-2026")!], "pl");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261207");
    expect(ics).toContain("DTEND;VALUE=DATE:20261214");
    expect(ics).toContain("SUMMARY:Zimowa sesja zaliczeniowa poprawkowa (IV rok ZIiP)");
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
  });
});
