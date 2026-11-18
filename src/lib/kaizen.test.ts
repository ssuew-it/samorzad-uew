import { describe, expect, it } from "vitest";
import { OBSZARY, parseTablica, walidujKarteczke, parseKarteczkiZarzadu, walidujOdpowiedz, MAX_ODPOWIEDZ, STATUS_W_ARKUSZU, skryptObslugujeOdpowiedzi } from "./kaizen";

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

describe("parseKarteczkiZarzadu", () => {
  const wiersz = {
    id: "3f2c9a1e-7b4d-4c1a-9e2f-0a1b2c3d4e5f",
    data: "2026-11-17",
    obszar: "komunikacja",
    zauwazam: "Ogłoszenia giną na grupie.",
    proponuje: "Przypinać podsumowanie w piątki.",
    status: "",
    odpowiedz: "",
    pokaz: "NIE",
  };

  it("oddaje też karteczki nieomówione i ukryte - Zarząd widzi wszystko", () => {
    const [k] = parseKarteczkiZarzadu([wiersz]);
    expect(k).toEqual({ ...wiersz, status: null, pokaz: false });
    expect(parseKarteczkiZarzadu([{ ...wiersz, status: "wdrożone", pokaz: "TAK" }])[0]).toMatchObject({ status: "wdrozone", pokaz: true });
  });

  it("pomija wiersze bez id albo bez treści i sortuje od najnowszych", () => {
    const lista = parseKarteczkiZarzadu([
      wiersz,
      { ...wiersz, id: "b".repeat(36), data: "2026-11-18" },
      { ...wiersz, id: "" },
      { ...wiersz, id: "c".repeat(36), zauwazam: "" },
    ]);
    expect(lista.map((k) => k.data)).toEqual(["2026-11-18", "2026-11-17"]);
  });
});

describe("walidujOdpowiedz", () => {
  const id = "3f2c9a1e-7b4d-4c1a-9e2f-0a1b2c3d4e5f";

  it("przyjmuje status, odpowiedź i zgodę na tablicę", () => {
    expect(walidujOdpowiedz({ id, status: "wdrozone", odpowiedz: "  Od grudnia.  ", pokaz: "on" })).toEqual({
      ok: true,
      odpowiedz: { id, status: "wdrozone", odpowiedz: "Od grudnia.", pokaz: true },
    });
  });

  it("pusty status = karteczka wraca do nieomówionych i nie może stać na tablicy", () => {
    expect(walidujOdpowiedz({ id, status: "", odpowiedz: "", pokaz: null })).toEqual({
      ok: true,
      odpowiedz: { id, status: null, odpowiedz: "", pokaz: false },
    });
    expect(walidujOdpowiedz({ id, status: "", odpowiedz: "", pokaz: "on" })).toEqual({ ok: false });
  });

  it("odrzuca nieznany status, złe id i za długą odpowiedź", () => {
    expect(walidujOdpowiedz({ id, status: "zrobione", odpowiedz: "", pokaz: null })).toEqual({ ok: false });
    expect(walidujOdpowiedz({ id: "1; DROP", status: "omawiane", odpowiedz: "", pokaz: null })).toEqual({ ok: false });
    expect(walidujOdpowiedz({ id, status: "omawiane", odpowiedz: "x".repeat(MAX_ODPOWIEDZ + 1), pokaz: null })).toEqual({ ok: false });
  });

  it("status idzie do arkusza słowem z listy rozwijanej", () => {
    expect(STATUS_W_ARKUSZU).toEqual({ omawiane: "omawiane", wdrozone: "wdrożone", odrzucone: "nie wdrażamy" });
  });
});

describe("skryptObslugujeOdpowiedzi", () => {
  it("dopiero skrypt z wersją 2 przyjmuje odpowiedzi - stary potraktowałby je jak formularz kontaktowy", () => {
    expect(skryptObslugujeOdpowiedzi({ ok: true, karteczki: [], wersja: 2 })).toBe(true);
    expect(skryptObslugujeOdpowiedzi({ ok: true, karteczki: [] })).toBe(false);
    expect(skryptObslugujeOdpowiedzi(null)).toBe(false);
  });
});
