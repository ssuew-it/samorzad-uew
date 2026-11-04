import { describe, expect, it } from "vitest";
import { parseWydarzenia } from "./parse-wydarzenia";

const HEAD = "nazwa,nazwa EN,data,godzina,miejsce,link,tag\n";

describe("parseWydarzenia", () => {
  it("czyta pełne i minimalne wiersze, sortuje po dacie i godzinie", () => {
    const { items, errors } = parseWydarzenia(
      HEAD +
        "Bal UEW,UEW Ball,2027-01-24,19:00:00,Hala Stulecia,https://example.com/bal,bal\n" +
        "Wybory do Rady,,20.11.2026,,,,wybory\n",
    );
    expect(errors).toEqual([]);
    expect(items).toEqual([
      { name: "Wybory do Rady", date: "2026-11-20", tag: "wybory" },
      { name: "Bal UEW", nameEn: "UEW Ball", date: "2027-01-24", time: "19:00", place: "Hala Stulecia", href: "https://example.com/bal", tag: "bal" },
    ]);
  });

  it("pomija wiersz bez nazwy albo z błędną datą i mówi dlaczego", () => {
    const { items, errors } = parseWydarzenia(HEAD + ",,2026-11-20,,,,\nJuwenalia,,maj,,,,\n");
    expect(items).toEqual([]);
    expect(errors.map((e) => e.line)).toEqual([2, 3]);
  });

  it("zła godzina albo link bez https nie ukrywają wydarzenia", () => {
    const { items, errors } = parseWydarzenia(HEAD + "TEDxUEW,,2027-03-10,wieczorem,,www.ted.com,ted\n");
    expect(items).toEqual([{ name: "TEDxUEW", date: "2027-03-10", tag: "ted" }]);
    expect(errors).toHaveLength(2);
  });
});
