import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseEntry, parseGrid, parseMenuExtras, parseSjoGroups, parseTree, parseWfIds } from "./parse";
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
    // Najpierw polskie tryby, potem anglojęzyczne; bez gałęzi SJO.
    expect(tree[0].modes.map((m) => m.code).slice(0, 4)).toEqual(["S1", "S2", "N1", "N2"]);
    expect(tree[0].modes.some((m) => m.code === "SJO")).toBe(false);
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

  it("czyta tryby anglojęzyczne i Erasmus ze strony głównej planu", () => {
    const tree = parseTree(fixture("menu.html"));
    const winter = tree.find((s) => s.se === 60)!;
    expect(winter.modes.map((m) => m.code)).toEqual(["S1", "S2", "N1", "N2", "BachelorFT", "BachelorPT", "MasterFT", "MasterPT", "Erasmus"]);
    const bachelor = winter.modes.find((m) => m.code === "BachelorFT")!;
    expect(bachelor.programs.map((p) => p.code)).toEqual(["BI", "BM", "F", "IN", "MC"]);
    expect(bachelor.programs[0].years[0]).toEqual({ year: "1", gr: "140/1" });
  });

  it("wyciąga z menu lektoraty (SJO) i stronę WF (SWFiS) każdego semestru", () => {
    const extras = parseMenuExtras(fixture("menu.html"));
    const winter = extras.find((e) => e.se === 60)!;
    expect(winter.wf).toBe("l_pozycjaplanu_ogl_3.php?se=60&wy=6");
    expect(winter.sjo).toContainEqual({ mode: "S1", year: "2", gr: "153/2" });
    expect(winter.sjo).toContainEqual({ mode: "S2", year: "1", gr: "154/1" });
  });

  it("czyta grupy lektoratów: sekcja kierunków, język, prowadzący, numer grupy", () => {
    const sections = parseSjoGroups(fixture("sjo.html"));
    expect(sections[0].programs).toEqual(["ZIIP", "NG", "IZ"]);
    expect(sections[0].groups).toContainEqual({ id: 3344379, label: "Język angielski (mgr Małgorzata Borsa) 3S" });
    // Pozycja zbiorcza bez prowadzącego („Język angielski”) to nie grupa do wyboru.
    expect(sections[0].groups.some((g) => g.label === "Język angielski")).toBe(false);
    expect(sections.some((s) => s.programs.includes("WSZYSTKIE KIERUNKI"))).toBe(true);
  });

  it("zbiera pozycje zajęć WF bez powtórzeń", () => {
    // Strona ma też link `id=0` w skrypcie - to nie są zajęcia.
    const ids = parseWfIds(fixture("wf.html") + "<script>'./p_pozycja.php?id=0&gr=0'</script>");
    expect(ids.length).toBe(100);
    expect(ids).not.toContain(0);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
