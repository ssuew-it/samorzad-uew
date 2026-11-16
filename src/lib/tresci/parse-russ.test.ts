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

  it("przykładowy link z instrukcji nie ukrywa posiedzenia", () => {
    const { items, errors } = parsePosiedzenia(HEAD + "18.11.2026,18:00,,,zwyczajne,https://drive.google.com/…\n");
    expect(items).toEqual([{ date: "2026-11-18", time: "18:00" }]);
    expect(errors.map((e) => e.line)).toEqual([2]);
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

  it("czyta opcjonalną kolumnę „link EN” z angielską wersją uchwały", () => {
    const { items, errors } = parseUchwaly(
      "Numer,Data,Tytuł,Tytuł EN,Link,Link EN\n" +
        "1/2026/2027,21.10.2026,W sprawie budżetu,On the budget,https://x.pl/1,https://x.pl/1-en\n" +
        "2/2026/2027,22.10.2026,W sprawie Komisji,,https://x.pl/2,x.pl/zly\n",
    );
    expect(items.find((r) => r.number === "1/2026/2027")?.hrefEn).toBe("https://x.pl/1-en");
    // Zły „link EN” nie ukrywa uchwały - znika tylko wersja angielska.
    expect(items.find((r) => r.number === "2/2026/2027")).toEqual({ number: "2/2026/2027", date: "2026-10-22", title: { pl: "W sprawie Komisji", en: "W sprawie Komisji" }, href: "https://x.pl/2" });
    expect(errors.map((e) => e.line)).toEqual([3]);
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
