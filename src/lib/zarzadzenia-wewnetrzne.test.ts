import { describe, expect, it } from "vitest";
import { grupaWydajacego, idZarzadzenia, kluczNumeru, zbudujRejestr, type ZarzadzenieWewn } from "./zarzadzenia-wewnetrzne";

const wewn = (nad: Partial<ZarzadzenieWewn> & Pick<ZarzadzenieWewn, "number">): ZarzadzenieWewn => ({
  line: 2,
  date: "2026-10-01",
  title: "W sprawie testu",
  issuer: "Wiceprzewodniczący ds. Strategii i Działań Operacyjnych",
  group: "wiceprzewodniczacy",
  repeals: [],
  amends: [],
  ...nad,
});

describe("grupaWydajacego", () => {
  it.each([
    ["Przewodniczący", "przewodniczacy"],
    ["Przewodnicząca", "przewodniczacy"],
    ["Wiceprzewodniczący ds. Strategii i Działań Operacyjnych", "wiceprzewodniczacy"],
    ["Wiceprzewodnicząca ds. Projektów", "wiceprzewodniczacy"],
    ["Członek Zarządu ds. Filii w Jeleniej Górze", "czlonek"],
    ["Członkini Zarządu ds. X", "czlonek"],
    ["Zarząd", "zarzad"],
    ["  zarząd ", "zarzad"],
    ["Komisja Rewizyjna", null],
  ])("„%s” → %s", (wydajacy, grupa) => {
    expect(grupaWydajacego(wydajacy)).toBe(grupa);
  });
});

describe("numery", () => {
  it("id do linku i klucz porównania", () => {
    expect(idZarzadzenia("01/ZRZ-SIDO/2026-2027")).toBe("z-01-zrz-sido-2026-2027");
    expect(kluczNumeru(" 01/zrz-sido/2026-2027 ")).toBe("01/ZRZ-SIDO/2026-2027");
    expect(kluczNumeru("01 / ZRZ-SIDO / 2026-2027")).toBe("01/ZRZ-SIDO/2026-2027");
  });
});

describe("zbudujRejestr", () => {
  it("uchyla: stan liczony po obu stronach, numer w brzmieniu z wiersza docelowego", () => {
    const { items, errors } = zbudujRejestr(
      [
        wewn({ number: "01/ZRZ-SIDO/2026-2027", line: 2 }),
        wewn({ number: "02/ZRZ-SIDO/2026-2027", line: 3, date: "2026-11-01", repeals: ["01/zrz-sido/2026-2027 "] }),
      ],
      [],
    );
    expect(errors).toEqual([]);
    const x = items.find((i) => i.number === "01/ZRZ-SIDO/2026-2027")!;
    const y = items.find((i) => i.number === "02/ZRZ-SIDO/2026-2027")!;
    expect(x.repealedBy).toEqual(["02/ZRZ-SIDO/2026-2027"]);
    expect(y.repeals).toEqual(["01/ZRZ-SIDO/2026-2027"]);
    expect(x.id).toBe("z-01-zrz-sido-2026-2027");
  });

  it("zmienia: zmienione zarządzeniem, bez uchylenia", () => {
    const { items } = zbudujRejestr(
      [
        wewn({ number: "01/ZRZ-PR/2026-2027", line: 2 }),
        wewn({ number: "02/ZRZ-PR/2026-2027", line: 3, amends: ["01/ZRZ-PR/2026-2027"] }),
      ],
      [],
    );
    const x = items.find((i) => i.number === "01/ZRZ-PR/2026-2027")!;
    expect(x.amendedBy).toEqual(["02/ZRZ-PR/2026-2027"]);
    expect(x.repealedBy).toEqual([]);
    expect(items.find((i) => i.number === "02/ZRZ-PR/2026-2027")!.amends).toEqual(["01/ZRZ-PR/2026-2027"]);
  });

  it("nieistniejący numer w „Uchyla” to błąd wiersza, a nie fałszywy stan", () => {
    const { items, errors } = zbudujRejestr(
      [wewn({ number: "01/ZRZ-SIDO/2026-2027", line: 2 }), wewn({ number: "02/ZRZ-SIDO/2026-2027", line: 5, repeals: ["09/ZRZ-SIDO/2026-2027"] })],
      [],
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]!.line).toBe(5);
    expect(errors[0]!.message).toContain("09/ZRZ-SIDO/2026-2027");
    expect(items.every((i) => i.repealedBy.length === 0)).toBe(true);
    expect(items.find((i) => i.number === "02/ZRZ-SIDO/2026-2027")!.repeals).toEqual([]);
  });

  it("zarządzenie nie uchyla samego siebie", () => {
    const { items, errors } = zbudujRejestr([wewn({ number: "01/ZRZ-SIDO/2026-2027", line: 4, repeals: ["01/ZRZ-SIDO/2026-2027"] })], []);
    expect(errors.map((e) => e.line)).toEqual([4]);
    expect(items[0]!.repealedBy).toEqual([]);
  });

  it("powtórzony numer: drugi wiersz to błąd, w rejestrze jedna pozycja", () => {
    const { items, errors } = zbudujRejestr(
      [wewn({ number: "01/ZRZ-SIDO/2026-2027", line: 2 }), wewn({ number: "01/zrz-sido/2026-2027", line: 7 })],
      [],
    );
    expect(items).toHaveLength(1);
    expect(errors).toHaveLength(1);
    expect(errors[0]!.line).toBe(7);
    expect(errors[0]!.message).toContain("2");
  });

  it("zarządzenia Przewodniczącego wchodzą do rejestru i mogą być uchylane", () => {
    const { items, errors } = zbudujRejestr(
      [wewn({ number: "01/ZRZ-SIDO/2026-2027", line: 2, repeals: ["1/2026/2027"] })],
      [{ number: "1/2026/2027", date: "2026-09-01", title: { pl: "W sprawie powołania", en: "On appointing" }, href: "https://drive.google.com/x" }],
    );
    expect(errors).toEqual([]);
    const p = items.find((i) => i.number === "1/2026/2027")!;
    expect(p).toMatchObject({ issuer: "Przewodniczący", group: "przewodniczacy", title: "W sprawie powołania", href: "https://drive.google.com/x" });
    expect(p.repealedBy).toEqual(["01/ZRZ-SIDO/2026-2027"]);
  });

  it("od najnowszego; przy tej samej dacie wyższy numer wyżej", () => {
    const { items } = zbudujRejestr(
      [
        wewn({ number: "02/ZRZ-SIDO/2026-2027", date: "2026-10-01" }),
        wewn({ number: "10/ZRZ-SIDO/2026-2027", date: "2026-10-01" }),
        wewn({ number: "01/ZRZ-SIDO/2026-2027", date: "2026-11-05" }),
      ],
      [],
    );
    expect(items.map((i) => i.number)).toEqual(["01/ZRZ-SIDO/2026-2027", "10/ZRZ-SIDO/2026-2027", "02/ZRZ-SIDO/2026-2027"]);
  });
});
