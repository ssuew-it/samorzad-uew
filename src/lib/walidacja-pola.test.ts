import { describe, expect, it } from "vitest";
import { sprawdzPole } from "./walidacja-pola";

describe("walidacja pola formularza (reguła jako dane)", () => {
  it("minimalna długość liczy się bez spacji na brzegach", () => {
    const r = { minLength: 2, message: "Za krótko" };
    expect(sprawdzPole(r, "  a ")).toBe("Za krótko");
    expect(sprawdzPole(r, "Ala")).toBeUndefined();
  });

  it("adres e-mail", () => {
    const r = { email: true, message: "Zły e-mail" };
    expect(sprawdzPole(r, "ala@")).toBe("Zły e-mail");
    expect(sprawdzPole(r, "ala@ue.wroc.pl")).toBeUndefined();
  });

  it("reguła jest zwykłym obiektem - da się ją przekazać z serwera do przeglądarki", () => {
    const r = { minLength: 10, message: "Za krótko" };
    expect(JSON.parse(JSON.stringify(r))).toEqual(r);
  });
});
