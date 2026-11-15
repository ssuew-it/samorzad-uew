import { describe, expect, it } from "vitest";
import { sierotki, sierotkiWTekstach } from "./typografia";

const NBSP = " ";

describe("typografia: twarde spacje po jednoliterowych słowach", () => {
  it("wiąże „w”, „z”, „i”, „a”, „o”, „u” z następnym słowem", () => {
    expect(sierotki("Napisz do nas w sprawie stypendium i zapomogi")).toBe(`Napisz do nas w${NBSP}sprawie stypendium i${NBSP}zapomogi`);
    expect(sierotki("A potem o tym, u Dziekana z wnioskiem")).toBe(`A${NBSP}potem o${NBSP}tym, u${NBSP}Dziekana z${NBSP}wnioskiem`);
  });

  it("łańcuch jednoliterowych słów wiąże po kolei („i w”, „a z”)", () => {
    expect(sierotki("studenci i w Senacie")).toBe(`studenci i${NBSP}w${NBSP}Senacie`);
    expect(sierotki("praca a w domu")).toBe(`praca a${NBSP}w${NBSP}domu`);
  });

  it("wiąże paragraf z numerem", () => {
    expect(sierotki("zgodnie z § 18 regulaminu")).toBe(`zgodnie z${NBSP}§${NBSP}18 regulaminu`);
  });

  it("nie rusza liter wewnątrz słów, skrótów ani placeholderów ICU", () => {
    expect(sierotki("Mosty Ekonomiczne {n} razy")).toBe("Mosty Ekonomiczne {n} razy");
    expect(sierotki("TEDx UEW")).toBe("TEDx UEW");
    expect(sierotki("wiedza")).toBe("wiedza");
  });

  it("przechodzi przez całe drzewo tłumaczeń, tablice też, i nie zmienia innych typów", () => {
    const wynik = sierotkiWTekstach({ a: { b: "list w sprawie", c: ["o tym", 5] }, d: true });
    expect(wynik).toEqual({ a: { b: `list w${NBSP}sprawie`, c: [`o${NBSP}tym`, 5] }, d: true });
  });
});
