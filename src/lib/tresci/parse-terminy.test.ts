import { describe, expect, it } from "vitest";
import { parseCsv } from "../csv";
import { parseSheetDate, parseTerminy, parseZamiany } from "./parse-terminy";

const HEADER = '"rodzaj","tytuł","tytuł EN","od","do","dla kogo","dla kogo EN","źródło","źródło EN","link źródła","link na stronie","id"';

describe("parseCsv", () => {
  it("obsługuje cudzysłowy, przecinki i nowe linie w polu", () => {
    expect(parseCsv('a,"b, c","d ""e""","f\ng"\r\n1,2,3,4')).toEqual([
      ["a", "b, c", 'd "e"', "f\ng"],
      ["1", "2", "3", "4"],
    ]);
  });
});

describe("parseSheetDate", () => {
  it("przyjmuje zapis ISO i polski", () => {
    expect(parseSheetDate("2027-02-09")).toBe("2027-02-09");
    expect(parseSheetDate("9.02.2027")).toBe("2027-02-09");
    expect(parseSheetDate("09.02.2027")).toBe("2027-02-09");
  });
  it("odrzuca nieistniejące daty i inne zapisy", () => {
    expect(parseSheetDate("31.02.2027")).toBeNull();
    expect(parseSheetDate("2/9/2027")).toBeNull();
    expect(parseSheetDate("")).toBeNull();
  });
});

describe("parseTerminy", () => {
  it("czyta poprawne wiersze, a błędne pomija z numerem wiersza", () => {
    const csv = [
      HEADER,
      '"sesja","Zimowa sesja egzaminacyjna","Winter exam session","9.02.2027","22.02.2027","","","Harmonogram 2026/2027","","https://bip.ue.wroc.pl/x","/infopacki/zaliczenie-semestru",""',
      '"Dzień wolny","Dzień rektorski","","2026-11-02","","","","","","","",""',
      '"egzamin","Coś","","2027-01-01","","","","","","","",""',
      '"przerwa","Przerwa","","2026-12-23","2026-12-01","","","","","","",""',
      '"wniosek","Wnioski","","2026-11-30","","","","","","","stypendia#fundusz",""',
      '"","","","","","","","","","","",""',
      '"zajecia","Bez daty","","jutro","","","","","","","",""',
    ].join("\n");
    const { items, errors } = parseTerminy(csv);

    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      kind: "sesja",
      start: "2027-02-09",
      end: "2027-02-22",
      title: { pl: "Zimowa sesja egzaminacyjna", en: "Winter exam session" },
      source: { href: "https://bip.ue.wroc.pl/x" },
      href: "/infopacki/zaliczenie-semestru",
    });
    // Brak tytułu EN = polski; brak „do” = jeden dzień; id z rodzaju i daty.
    expect(items[1]).toMatchObject({ kind: "wolne", id: "wolne-2026-11-02", title: { en: "Dzień rektorski" } });
    expect(items[1].end).toBeUndefined();

    expect(errors.map((e) => e.line)).toEqual([4, 5, 6, 8]);
    expect(errors[0].message).toContain("nie jest znany rodzaj");
    expect(errors[1].message).toContain("wcześniejsza");
    expect(errors[2].message).toContain("musi zaczynać się od „/”");
    expect(errors[3].message).toContain("2027-02-09 albo 09.02.2027");
  });
});

describe("parseZamiany", () => {
  it("czyta dni tygodnia z ogonkami i bez, tydzień opcjonalny", () => {
    const csv = ['"data","plan z dnia","tydzień"', '"6.11.2026","poniedziałek","T1"', '"2027-03-31","Wtorek",""', '"2027-06-08","sobota","T2"'].join("\n");
    const { items, errors } = parseZamiany(csv);
    expect(items).toEqual([
      { date: "2026-11-06", weekday: "mon", week: "T1" },
      { date: "2027-03-31", weekday: "tue" },
    ]);
    expect(errors).toHaveLength(1);
    expect(errors[0].line).toBe(4);
  });
});

describe("szablon arkusza", () => {
  it("szablon z docs/szablony daje dokładnie dane z kodu", async () => {
    const { readFileSync } = await import("node:fs");
    const { TERMINY_Z_KODU, ZAMIANY_Z_KODU } = await import("../terminy");
    const terminy = parseTerminy(readFileSync("docs/szablony/tresci-terminy.csv", "utf8"));
    const zamiany = parseZamiany(readFileSync("docs/szablony/tresci-zamiany-dni.csv", "utf8"));
    expect(terminy.errors).toEqual([]);
    expect(zamiany.errors).toEqual([]);
    expect(terminy.items).toEqual(TERMINY_Z_KODU);
    expect(zamiany.items).toEqual(ZAMIANY_Z_KODU);
  });
});
