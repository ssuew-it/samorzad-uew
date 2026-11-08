import { describe, expect, it } from "vitest";
import { celZHash, filtrujRejestr, komunikatBrakuWynikow, type FiltrRejestru } from "./rejestr-widok";
import type { PozycjaRejestru } from "./zarzadzenia-wewnetrzne";

const poz = (nad: Partial<PozycjaRejestru> & Pick<PozycjaRejestru, "number">): PozycjaRejestru => ({
  id: "z-" + nad.number.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  date: "2026-11-01",
  title: "W sprawie testu",
  issuer: "Zarząd",
  group: "zarzad",
  repeals: [],
  amends: [],
  repealedBy: [],
  amendedBy: [],
  ...nad,
});

const items = [
  poz({ number: "01/ZRZ-SIDO/2026-2027", title: "W sprawie zasad obiegu dokumentów", group: "wiceprzewodniczacy" }),
  poz({ number: "02/ZRZ/2026-2027", title: "W sprawie harmonogramu", repealedBy: ["03/ZRZ/2026-2027"] }),
  poz({ number: "01/CZ-FJG/2026-2027", title: "W sprawie Filii", group: "czlonek" }),
  poz({ number: "01/KR/2026-2027", title: "Bez grupy", group: null }),
];
const f = (nad: Partial<FiltrRejestru> = {}): FiltrRejestru => ({ q: "", grupa: "wszyscy", uchylone: false, ...nad });
const nr = (l: PozycjaRejestru[]) => l.map((i) => i.number);

describe("filtrujRejestr", () => {
  it("domyślnie ukrywa uchylone, przełącznik je pokazuje", () => {
    expect(nr(filtrujRejestr(items, f()))).not.toContain("02/ZRZ/2026-2027");
    expect(nr(filtrujRejestr(items, f({ uchylone: true })))).toContain("02/ZRZ/2026-2027");
  });

  it("filtr wydającego; „Wszyscy” zostawia też wiersze bez grupy", () => {
    expect(nr(filtrujRejestr(items, f({ grupa: "czlonek" })))).toEqual(["01/CZ-FJG/2026-2027"]);
    expect(nr(filtrujRejestr(items, f()))).toContain("01/KR/2026-2027");
  });

  it("szuka bez polskich znaków, po tytule i po numerze", () => {
    expect(nr(filtrujRejestr(items, f({ q: "obieg dokumentow" })))).toEqual(["01/ZRZ-SIDO/2026-2027"]);
    expect(nr(filtrujRejestr(items, f({ q: "zrz-sido" })))).toEqual(["01/ZRZ-SIDO/2026-2027"]);
    expect(nr(filtrujRejestr(items, f({ q: "FILII" })))).toEqual(["01/CZ-FJG/2026-2027"]);
    expect(filtrujRejestr(items, f({ q: "   " }))).toHaveLength(3);
  });
});

describe("komunikatBrakuWynikow", () => {
  it("z frazą cytuje frazę, bez frazy mówi o filtrach (zamiast „Nic nie pasuje do „””)", () => {
    expect(komunikatBrakuWynikow("  obieg ")).toBe("noResults");
    expect(komunikatBrakuWynikow("   ")).toBe("noResultsFilter");
  });
});

describe("celZHash", () => {
  it("znajduje zarządzenie po kotwicy z # albo bez", () => {
    expect(celZHash("#z-01-zrz-sido-2026-2027", items)?.number).toBe("01/ZRZ-SIDO/2026-2027");
    expect(celZHash("z-02-zrz-2026-2027", items)?.number).toBe("02/ZRZ/2026-2027");
  });

  it("pusta albo nieznana kotwica → brak celu", () => {
    expect(celZHash("", items)).toBeNull();
    expect(celZHash("#kontakt", items)).toBeNull();
  });
});
