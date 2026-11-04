import { describe, expect, it } from "vitest";
import { academicWeek, yearPosition } from "./academic";

describe("academicWeek", () => {
  it("tydzień 1 zaczyna się w poniedziałek tygodnia z 1 października", () => {
    // 1.10.2026 to czwartek; poniedziałek tego tygodnia: 28.09.
    expect(academicWeek(new Date(2026, 9, 1))).toBe(1);
    expect(academicWeek(new Date(2026, 9, 4))).toBe(1); // niedziela
    expect(academicWeek(new Date(2026, 9, 5))).toBe(2); // poniedziałek
    expect(academicWeek(new Date(2026, 10, 4))).toBe(6);
  });

  it("liczy dalej po Nowym Roku i znika w wakacje", () => {
    expect(academicWeek(new Date(2027, 0, 4))).toBe(15);
    expect(academicWeek(new Date(2027, 6, 15))).toBeNull();
  });

  it("kartka i pasek używają tego samego numeru", () => {
    expect(yearPosition(new Date(2026, 10, 4))).toEqual({ kind: "week", value: 6 });
  });
});
