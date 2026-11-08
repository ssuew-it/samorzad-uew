import { describe, expect, it } from "vitest";
import { parseZarzadzeniaWewnetrzne } from "./parse-zarzadzenia-wewnetrzne";

const HEAD = "Wydający,Numer,Data,Tytuł,Link,Uchyla,Zmienia\n";

describe("parseZarzadzeniaWewnetrzne", () => {
  it("czyta poprawny wiersz z grupą wydającego i odnośnikami", () => {
    const { items, errors } = parseZarzadzeniaWewnetrzne(
      HEAD +
        'Wiceprzewodniczący ds. Strategii i Działań Operacyjnych,02/ZRZ-SIDO/2026-2027,05.11.2026,W sprawie stopki,https://drive.google.com/a,"01/ZRZ-SIDO/2026-2027, 03/ZRZ-SIDO/2026-2027",\n',
    );
    expect(errors).toEqual([]);
    expect(items).toEqual([
      {
        line: 2,
        number: "02/ZRZ-SIDO/2026-2027",
        date: "2026-11-05",
        title: "W sprawie stopki",
        issuer: "Wiceprzewodniczący ds. Strategii i Działań Operacyjnych",
        group: "wiceprzewodniczacy",
        href: "https://drive.google.com/a",
        repeals: ["01/ZRZ-SIDO/2026-2027", "03/ZRZ-SIDO/2026-2027"],
        amends: [],
      },
    ]);
  });

  it("pomija wiersz bez wydającego, numeru, tytułu albo z złą datą - i mówi, co poprawić", () => {
    const { items, errors } = parseZarzadzeniaWewnetrzne(
      HEAD +
        ",01/ZRZ-X/2026-2027,01.11.2026,Bez wydającego,,,\n" +
        "Zarząd,,01.11.2026,Bez numeru,,,\n" +
        "Zarząd,02/ZRZ/2026-2027,01.11.2026,,,,\n" +
        "Zarząd,03/ZRZ/2026-2027,32.11.2026,Zła data,,,\n",
    );
    expect(items).toEqual([]);
    expect(errors.map((e) => e.line)).toEqual([2, 3, 4, 5]);
    expect(errors[0]!.message).toContain("wydając");
  });

  it("wydający spoza grup: błąd, ale wiersz zostaje bez grupy", () => {
    const { items, errors } = parseZarzadzeniaWewnetrzne(HEAD + "Komisja Rewizyjna,01/KR/2026-2027,01.11.2026,W sprawie X,,,\n");
    expect(errors.map((e) => e.line)).toEqual([2]);
    expect(items).toHaveLength(1);
    expect(items[0]!.group).toBeNull();
  });

  it("zły link: błąd, zarządzenie bez pliku", () => {
    const { items, errors } = parseZarzadzeniaWewnetrzne(HEAD + "Zarząd,01/ZRZ/2026-2027,01.11.2026,W sprawie X,drive.google.com/x,,\n");
    expect(errors[0]!.message).toContain("https://");
    expect(items[0]!.href).toBeUndefined();
  });
});
