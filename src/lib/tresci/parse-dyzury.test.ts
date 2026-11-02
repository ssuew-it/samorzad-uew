import { describe, expect, it } from "vitest";
import { parseDyzury, parseSheetTime } from "./parse-dyzury";

const HEAD = "osoba,dzień,od,do,budynek,sala,teams,uwagi,uwagi EN,odwołane\n";

describe("parseDyzury", () => {
  it("czyta poprawne wiersze, także kilka dyżurów jednej osoby", () => {
    const { items, errors } = parseDyzury(
      HEAD +
        "Dziekan,czwartek,11:30,13:00,A,121,,Termin uzgodnij e-mailem.,Arrange by email.,\n" +
        "dr Wioletta Turowska,wtorek,9:00:00,10:00:00,bud. A,pok. 121,tak,,,\n" +
        "Wereńska,wt,8.30,9.30,Z,205,TAK,,,\"10.11.2026, 2026-11-17\"\n" +
        "Wereńska,czw,12:00,13:00,,,,,,\n",
    );
    expect(errors).toEqual([]);
    expect(items).toHaveLength(4);
    expect(items[0]).toEqual({
      person: "dziekan",
      weekday: 4,
      from: "11:30",
      to: "13:00",
      building: "A",
      room: "121",
      note: { pl: "Termin uzgodnij e-mailem.", en: "Arrange by email." },
    });
    expect(items[1]).toMatchObject({ person: "turowska", weekday: 2, from: "09:00", to: "10:00", building: "A", room: "121", teams: true });
    expect(items[2]).toMatchObject({ person: "werenska", from: "08:30", cancelled: ["2026-11-10", "2026-11-17"] });
    expect(items[3]).toEqual({ person: "werenska", weekday: 4, from: "12:00", to: "13:00" });
  });

  it("pomija wiersz z nieznaną osobą, dniem albo godziną i mówi, co poprawić", () => {
    const { items, errors } = parseDyzury(
      HEAD +
        "Kowalski,wtorek,9:00,10:00,A,121,,,,\n" +
        "Bobowski,sobota,9:00,10:00,A,121,,,,\n" +
        "Bobowski,czwartek,9,10:30,A,121,,,,\n" +
        "Bobowski,czwartek,11:00,10:30,A,121,,,,\n" +
        "Bobowski,czwartek,9:00,10:30,A,121,,,,32.11.2026\n",
    );
    expect(errors.map((e) => e.line)).toEqual([2, 3, 4, 5, 6]);
    expect(errors[0].message).toContain("Turowska");
    expect(errors[1].message).toContain("wtorek");
    // Zła data odwołania nie ukrywa dyżuru.
    expect(items).toEqual([{ person: "bobowski", weekday: 4, from: "09:00", to: "10:30", building: "A", room: "121" }]);
  });
});

describe("parseSheetTime", () => {
  it("przyjmuje typowe zapisy godziny", () => {
    expect(parseSheetTime("9:00")).toBe("09:00");
    expect(parseSheetTime("13.15")).toBe("13:15");
    expect(parseSheetTime("08:30:00")).toBe("08:30");
    expect(parseSheetTime("25:00")).toBeNull();
    expect(parseSheetTime("9")).toBeNull();
  });
});
