import { describe, expect, it } from "vitest";
import { OBSZARY, parseTablica, walidujKarteczke } from "./kaizen";

describe("karteczki Kaizen: walidacja", () => {
  const ok = { obszar: "komunikacja", zauwazam: "Ogłoszenia giną w czacie.", proponuje: "Przypinać jedno podsumowanie tygodnia." };

  it("przyjmuje karteczkę z obszarem z listy i dwoma polami", () => {
    expect(walidujKarteczke(ok)).toEqual({ ok: true, karteczka: ok });
  });

  it("odrzuca nieznany obszar i puste albo zbyt krótkie pola", () => {
    expect(walidujKarteczke({ ...ok, obszar: "finanse" }).ok).toBe(false);
    expect(walidujKarteczke({ ...ok, zauwazam: "   " }).ok).toBe(false);
    expect(walidujKarteczke({ ...ok, proponuje: "ok" }).ok).toBe(false);
  });

  it("przycina pola do 800 znaków i zbędne spacje", () => {
    const r = walidujKarteczke({ ...ok, zauwazam: `  ${"a".repeat(900)}  ` });
    expect(r.ok && r.karteczka.zauwazam).toHaveLength(800);
  });

  it("ma obszar „inne” na wszystko, co nie pasuje", () => {
    expect(OBSZARY).toContain("inne");
  });
});

describe("karteczki Kaizen: tablica z arkusza", () => {
  const wiersz = {
    data: "2026-11-12T10:00:00.000Z",
    obszar: "komunikacja",
    zauwazam: "Ogłoszenia giną w czacie.",
    proponuje: "Przypinać podsumowanie tygodnia.",
    status: "wdrożone",
    odpowiedz: "Od grudnia piątkowe podsumowanie przypina Członek Zarządu ds. PR.",
  };

  it("zamienia status z arkusza na stały klucz", () => {
    const [k] = parseTablica([wiersz]);
    expect(k.status).toBe("wdrozone");
    expect(parseTablica([{ ...wiersz, status: "Omawiamy" }])[0].status).toBe("omawiane");
    expect(parseTablica([{ ...wiersz, status: "nie wdrażamy" }])[0].status).toBe("odrzucone");
  });

  it("pomija wiersze bez treści albo z nieznanym statusem i sortuje od najnowszych", () => {
    const lista = parseTablica([
      wiersz,
      { ...wiersz, data: "2026-11-20T10:00:00.000Z" },
      { ...wiersz, zauwazam: "" },
      { ...wiersz, status: "coś innego" },
    ]);
    expect(lista.map((k) => k.data)).toEqual(["2026-11-20", "2026-11-12"]);
  });

  it("nieznany obszar pokazuje jako „inne”, a nie odrzuca karteczki", () => {
    expect(parseTablica([{ ...wiersz, obszar: "Coś z ręki" }])[0].obszar).toBe("inne");
  });

  it("brak tablicy w odpowiedzi to pusta lista, nie błąd strony", () => {
    expect(parseTablica(undefined)).toEqual([]);
    expect(parseTablica("x" as unknown as unknown[])).toEqual([]);
  });
});
