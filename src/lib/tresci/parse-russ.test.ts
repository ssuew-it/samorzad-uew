import { describe, expect, it } from "vitest";
import { parsePosiedzenia, parseSheetTime, parseUchwaly } from "./parse-russ";
import { todayInWarsaw } from "../russ";

describe("parseSheetTime", () => {
  it("przyjmuje zapisy z arkusza", () => {
    expect(parseSheetTime("18:00")).toBe("18:00");
    expect(parseSheetTime("9.30")).toBe("09:30");
    expect(parseSheetTime("18:00:00")).toBe("18:00");
    expect(parseSheetTime("18")).toBe("18:00");
    expect(parseSheetTime("25:00")).toBeNull();
    expect(parseSheetTime("wieczorem")).toBeNull();
  });
});

describe("parsePosiedzenia", () => {
  const HEAD = "Data,Godzina,Miejsce,Miejsce EN,Rodzaj,Protokół\n";

  it("czyta wiersze i układa od najwcześniejszego", () => {
    const { items, errors } = parsePosiedzenia(
      HEAD +
        "18.11.2026,18:00,Sala 101 bud. Z,Room 101 building Z,zwyczajne,\n" +
        "2026-10-21,18.00,,,,https://drive.google.com/p\n" +
        "02.12.2026,,,,Nadzwyczajne,\n",
    );
    expect(errors).toEqual([]);
    expect(items.map((m) => m.date)).toEqual(["2026-10-21", "2026-11-18", "2026-12-02"]);
    expect(items[0]).toEqual({ date: "2026-10-21", time: "18:00", protocolHref: "https://drive.google.com/p" });
    expect(items[1].place).toEqual({ pl: "Sala 101 bud. Z", en: "Room 101 building Z" });
    expect(items[2].extraordinary).toBe(true);
  });

  it("pomija błędne wiersze z opisem", () => {
    const { items, errors } = parsePosiedzenia(
      HEAD + "jutro,18:00,,,,\n" + "18.11.2026,wieczór,,,,\n" + "18.11.2026,,,,tajne,\n" + "18.11.2026,,,,,drive/x\n",
    );
    expect(items).toEqual([]);
    expect(errors.map((e) => e.line)).toEqual([2, 3, 4, 5]);
  });
});

describe("parseUchwaly", () => {
  const HEAD = "Numer,Data,Tytuł,Tytuł EN,Link\n";

  it("czyta wiersze i układa od najnowszej", () => {
    const { items, errors } = parseUchwaly(
      HEAD + "1/2026/2027,21.10.2026,W sprawie budżetu,On the budget,https://x.pl/1\n" + "2/2026/2027,21.10.2026,W sprawie Komisji,,\n",
    );
    expect(errors).toEqual([]);
    expect(items.map((r) => r.number)).toEqual(["2/2026/2027", "1/2026/2027"]);
    expect(items[1]).toEqual({ number: "1/2026/2027", date: "2026-10-21", title: { pl: "W sprawie budżetu", en: "On the budget" }, href: "https://x.pl/1" });
  });

  it("pomija wiersz bez numeru albo z linkiem bez https", () => {
    const { items, errors } = parseUchwaly(HEAD + ",21.10.2026,Bez numeru,,\n" + "3/2026/2027,21.10.2026,Zły link,,x.pl\n");
    expect(items).toEqual([]);
    expect(errors.map((e) => e.line)).toEqual([2, 3]);
  });
});

describe("todayInWarsaw", () => {
  it("liczy datę w strefie Polski, nie UTC", () => {
    // 23:30 UTC 31 października = 00:30 1 listopada w Warszawie.
    expect(todayInWarsaw(new Date("2026-10-31T23:30:00Z"))).toBe("2026-11-01");
  });
});
