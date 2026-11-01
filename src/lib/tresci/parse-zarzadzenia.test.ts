import { describe, expect, it } from "vitest";
import { parseZarzadzenia } from "./parse-zarzadzenia";

const HEAD = "Numer,Data,Tytuł,Tytuł EN,Link,Link EN\n";

describe("parseZarzadzenia", () => {
  it("czyta poprawne wiersze i sortuje od najnowszego", () => {
    const { items, errors } = parseZarzadzenia(
      HEAD +
        "1/2026/2027,01.10.2026,W sprawie powołania Komisji,On appointing a committee,https://drive.google.com/a,https://drive.google.com/a-en\n" +
        "2/2026/2027,2026-10-15,W sprawie zasad naboru,,https://drive.google.com/b\n",
    );
    expect(errors).toEqual([]);
    expect(items.map((z) => z.number)).toEqual(["2/2026/2027", "1/2026/2027"]);
    expect(items[0]).toMatchObject({ date: "2026-10-15", title: { pl: "W sprawie zasad naboru", en: "W sprawie zasad naboru" } });
    expect(items[1].title.en).toBe("On appointing a committee");
    expect(items[1].hrefEn).toBe("https://drive.google.com/a-en");
  });

  it("pomija wiersz bez numeru albo z złą datą, zły link tylko usuwa plik, i mówi, co poprawić", () => {
    const { items, errors } = parseZarzadzenia(
      HEAD +
        ",01.10.2026,Bez numeru,,https://x.pl\n" +
        "3/2026/2027,32.10.2026,Zła data,,https://x.pl\n" +
        "4/2026/2027,01.11.2026,Zły link,,drive.google.com/x\n" +
        "5/2026/2027,01.11.2026,Bez linku,,\n",
    );
    expect(errors.map((e) => e.line)).toEqual([2, 3, 4]);
    expect(errors[2].message).toContain("https://");
    // Brak albo zły link nie ukrywa zarządzenia - widać je w rejestrze bez pliku.
    expect(items.map((z) => z.number).sort()).toEqual(["4/2026/2027", "5/2026/2027"]);
    expect(items.every((z) => z.href === undefined)).toBe(true);
  });
});
