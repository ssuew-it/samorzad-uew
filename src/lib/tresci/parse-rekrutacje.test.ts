import { describe, expect, it } from "vitest";
import { parseRekrutacje } from "./parse-rekrutacje";
import { openRecruitments } from "../recruitment";

const HEAD = "Rodzaj,Nazwa,Nazwa EN,Projekt,Opis,Opis EN,Termin,Przewodnik\n";

describe("parseRekrutacje", () => {
  it("czyta nabory obu rodzajów i układa po terminie", () => {
    const { items, errors } = parseRekrutacje(
      HEAD +
        "Samorząd,Komisja ds. Promocji,,,Szukamy grafików,,,\n" +
        "projekt,Team TEDxUEW,TEDxUEW team,TEDx,,,30.11.2026,https://drive.google.com/p\n",
    );
    expect(errors).toEqual([]);
    expect(items.map((r) => r.kind)).toEqual(["projekt", "samorzad"]);
    expect(items[0]).toMatchObject({
      project: "tedx",
      deadline: "2026-11-30",
      title: { en: "TEDxUEW team" },
      guideUrl: "https://drive.google.com/p",
    });
    expect(items[1].desc).toEqual({ pl: "Szukamy grafików", en: "Szukamy grafików" });
    expect(items[1].guideUrl).toBeUndefined();
  });

  it("pomija błędne wiersze z opisem", () => {
    const { items, errors } = parseRekrutacje(
      HEAD +
        "inne,Coś,,,,,,\n" +
        "projekt,,,,,,,\n" +
        "projekt,Team,,,,,,drive/x\n" +
        "projekt,Team,,kosmos,,,,\n" +
        "projekt,Team,,,,,jutro,\n",
    );
    expect(items).toEqual([]);
    expect(errors.map((e) => e.line)).toEqual([2, 3, 4, 5, 6]);
  });

  it("ukrywa nabory po terminie", () => {
    const { items } = parseRekrutacje(HEAD + "projekt,A,,,,,01.11.2026,\nprojekt,B,,,,,31.10.2026,\nprojekt,C,,,,,,\n");
    expect(openRecruitments(items, "2026-11-01").map((r) => r.title.pl)).toEqual(["A", "C"]);
  });
});
