import { describe, expect, it } from "vitest";
import { allowedExtraIds, lectoratesFor, sjoModeFor, wfOptions } from "./extras";
import type { SjoSection } from "./parse";

const sections: SjoSection[] = [
  { programs: ["ZIIP", "NG", "IZ"], groups: [{ id: 1, label: "Język angielski (mgr A) 3S" }] },
  { programs: ["FIR", "MSG"], groups: [{ id: 2, label: "Język angielski (mgr B) 11S" }] },
  { programs: ["BM", "BI", "IN", "F", "MC"], groups: [{ id: 3, label: "Język hiszpański (mgr C) 4S" }] },
  { programs: ["WSZYSTKIE KIERUNKI"], groups: [{ id: 4, label: "Język włoski (mgr D) 9S" }] },
];
const snap = {
  semesters: [60],
  sjo: { "60|S1|2": sections },
  wf: { "60": [10, 11] },
  entries: {
    "10": { subject: "Wychowanie fizyczne (Siłownia)", kind: "Ćwiczenia", half: "", dates: [{ date: "2026-10-06", from: "9:45", to: "11:15", room: "SWFiS", lecturer: "Jan Nowak" }] },
    "11": { subject: "Wychowanie fizyczne (Basen)", kind: "Ćwiczenia", half: "", dates: [{ date: "2026-10-08", from: "12:00", to: "13:30", room: "", lecturer: "Anna Kowalska" }] },
  },
};

describe("dodatki do planu: lektoraty i WF", () => {
  it("tryby anglojęzyczne korzystają z lektoratów odpowiedniego stopnia", () => {
    expect(sjoModeFor("S1")).toBe("S1");
    expect(sjoModeFor("BachelorFT")).toBe("S1");
    expect(sjoModeFor("MasterPT")).toBe("N2");
    expect(sjoModeFor("Erasmus")).toBeNull();
  });

  it("pokazuje sekcje kierunku studenta i wspólne dla wszystkich, a nie cudze", () => {
    const fir = lectoratesFor(snap, "S1", "FIR", "2");
    expect(fir.map((s) => s.programs[0])).toEqual(["FIR", "WSZYSTKIE KIERUNKI"]);
    const finance = lectoratesFor(snap, "BachelorFT", "F", "2");
    expect(finance.map((s) => s.programs[0])).toEqual(["BM", "WSZYSTKIE KIERUNKI"]);
  });

  it("gdy żadna sekcja nie pasuje do kierunku, pokazuje wszystkie", () => {
    expect(lectoratesFor(snap, "S1", "XYZ", "2")).toHaveLength(4);
    expect(lectoratesFor(snap, "S1", "FIR", "1")).toEqual([]);
  });

  it("opisuje zajęcia WF: dyscyplina, dzień i godziny, prowadzący", () => {
    expect(wfOptions(snap)).toEqual([
      { id: 11, discipline: "Basen", label: "czwartek 12:00-13:30, Anna Kowalska" },
      { id: 10, discipline: "Siłownia", label: "wtorek 9:45-11:15, Jan Nowak" },
    ]);
  });

  it("do kalendarza wpuszcza tylko pozycje lektoratów i WF z pliku", () => {
    const allowed = allowedExtraIds(snap);
    expect([1, 2, 3, 4, 10, 11].every((id) => allowed.has(id))).toBe(true);
    expect(allowed.has(999)).toBe(false);
  });
});
