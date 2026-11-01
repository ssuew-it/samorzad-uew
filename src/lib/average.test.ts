import { describe, expect, it } from "vitest";
import { computeAverage, isExcludedFromAverage } from "./average";

describe("computeAverage", () => {
  it("returns null for an empty list", () => {
    expect(computeAverage([])).toEqual({ average: null, graded: 0, total: 0 });
  });

  it("counts ungraded courses in total but not in the average", () => {
    const s = computeAverage([{ grade: 4 }, { grade: null }]);
    expect(s).toEqual({ average: 4, graded: 1, total: 2 });
  });

  it("is an arithmetic mean, not weighted (Regulamin świadczeń § 21 ust. 4)", () => {
    // 3 + 5 + 5 = 13 / 3
    expect(computeAverage([{ grade: 3 }, { grade: 5 }, { grade: 5 }]).average).toBeCloseTo(13 / 3, 10);
  });

  it("includes failing grades", () => {
    expect(computeAverage([{ grade: 2 }, { grade: 5 }]).average).toBe(3.5);
  });

  it("never returns NaN when nothing is graded", () => {
    expect(computeAverage([{ grade: null }, { grade: null }]).average).toBeNull();
  });
});

describe("isExcludedFromAverage", () => {
  it.each(["Proseminarium", "Seminarium dyplomowe", "Wychowanie fizyczne", "Praktyka zawodowa", "Egzamin dyplomowy", "Praca dyplomowa", "Pracownia dyplomowa"])(
    "excludes %s",
    (name) => expect(isExcludedFromAverage(name)).toBe(true),
  );

  it.each(["Statystyka", "Matematyka II", "Rachunkowość"])("keeps %s", (name) => expect(isExcludedFromAverage(name)).toBe(false));
});
