import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseEntry, parseGrid, parseTree } from "./parse";
import { planToIcs } from "./ics";

const fixture = (name: string) => readFileSync(join(__dirname, "__fixtures__", name), "utf8");

describe("plan zajęć UEW", () => {
  it("czyta drzewo: semestry, tryby, kierunki i roczniki", () => {
    const tree = parseTree(fixture("drzewo.txt"));
    expect(tree.map((s) => [s.se, s.label])).toEqual([
      [59, "2025/26 letni"],
      [60, "2026/27 zimowy"],
    ]);
    const s1 = tree[0].modes.find((m) => m.code === "S1")!;
    expect(s1.label).toBe("Stacjonarne I stopień");
    const fir = s1.programs.find((p) => p.code === "FIR")!;
    expect(fir.years).toEqual([
      { year: "1", gr: "101/1" },
      { year: "2", gr: "101/2" },
      { year: "3", gr: "101/3" },
    ]);
    // Tylko polskie tryby, w ustalonej kolejności.
    expect(tree[0].modes.map((m) => m.code)).toEqual(["S1", "S2", "N1", "N2"]);
  });

  it("przypisuje pozycje z siatki do podgrup", () => {
    const grid = parseGrid(fixture("siatka.html"));
    expect(grid.get("01 FiR")).toContain(3337057);
    expect(grid.get("01 FiR")).toContain(3335663);
    expect([...grid.keys()]).toContain("11 FiR");
  });

  it("czyta pozycję z terminami i połową grupy", () => {
    const e = parseEntry(3337057, fixture("pozycja.html"))!;
    expect(e).toMatchObject({ subject: "Statystyka", kind: "Ćwiczenia", half: "A" });
    expect(e.dates[0]).toEqual({
      date: "2026-03-02",
      from: "08:00",
      to: "09:30",
      room: "006Z1",
      lecturer: "Ewa Szabela-Pasierbińska",
    });
    expect(e.dates.length).toBeGreaterThan(5);
  });

  it("buduje poprawny iCalendar w strefie Warszawy", () => {
    const e = parseEntry(3337057, fixture("pozycja.html"))!;
    const ics = planToIcs([e], "FiR 01", new Date("2026-11-01T12:00:00Z"));
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("DTSTART;TZID=Europe/Warsaw:20260302T080000");
    expect(ics).toContain("DTEND;TZID=Europe/Warsaw:20260302T093000");
    expect(ics).toContain("SUMMARY:Statystyka · Ćwiczenia (połowa A)");
    expect(ics).toContain("LOCATION:Sala 006Z1");
    // Żadna linia nie przekracza 75 bajtów.
    for (const line of ics.split("\r\n")) expect(Buffer.byteLength(line, "utf8")).toBeLessThanOrEqual(75);
  });
});
