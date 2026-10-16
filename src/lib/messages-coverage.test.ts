import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import pl from "../../messages/pl.json";
import en from "../../messages/en.json";

/**
 * Każda przestrzeń tłumaczeń użyta w kodzie musi istnieć w obu językach.
 *
 * Powód: w sierpniu przy sprzątaniu strony głównej wyleciała przestrzeń
 * `econ`, a pasek kursów walut został. next-intl nie przerywa wtedy budowania,
 * tylko wypisuje błąd w konsoli i pokazuje surowy klucz — więc strona główna
 * przez dwa miesiące wyświetlała „econ.label" i nikt tego nie złapał.
 */

function plikiZrodlowe(dir: string): string[] {
  return readdirSync(dir).flatMap((nazwa) => {
    const sciezka = join(dir, nazwa);
    if (statSync(sciezka).isDirectory()) return plikiZrodlowe(sciezka);
    return /\.(tsx?|mts)$/.test(nazwa) && !/\.test\./.test(nazwa) ? [sciezka] : [];
  });
}

/** Literalne przestrzenie z useTranslations("x") i getTranslations(…"x"…). */
function uzytePrzestrzenie(): Map<string, string> {
  const wynik = new Map<string, string>();
  const wzorce = [
    /useTranslations\(\s*["']([\w.]+)["']\s*\)/g,
    /getTranslations\(\s*["']([\w.]+)["']\s*\)/g,
    /getTranslations\(\s*\{[^}]*namespace:\s*["']([\w.]+)["'][^}]*\}\s*\)/g,
  ];
  for (const plik of plikiZrodlowe(join(process.cwd(), "src"))) {
    const kod = readFileSync(plik, "utf8");
    for (const wzorzec of wzorce) {
      for (const m of kod.matchAll(wzorzec)) if (!wynik.has(m[1])) wynik.set(m[1], plik);
    }
  }
  return wynik;
}

function istnieje(slownik: unknown, sciezka: string): boolean {
  let wezel: unknown = slownik;
  for (const czesc of sciezka.split(".")) {
    if (typeof wezel !== "object" || wezel === null || !(czesc in wezel)) return false;
    wezel = (wezel as Record<string, unknown>)[czesc];
  }
  return typeof wezel === "object" && wezel !== null;
}

describe("tłumaczenia", () => {
  const przestrzenie = uzytePrzestrzenie();

  it("znajduje przestrzenie w kodzie (sanity check skanera)", () => {
    expect(przestrzenie.size).toBeGreaterThan(20);
  });

  for (const [jezyk, slownik] of [["pl", pl], ["en", en]] as const) {
    it(`każda przestrzeń użyta w kodzie istnieje w ${jezyk}.json`, () => {
      const brakujace = [...przestrzenie]
        .filter(([ns]) => !istnieje(slownik, ns))
        .map(([ns, plik]) => `${ns} (${plik.replace(process.cwd(), "")})`);
      expect(brakujace).toEqual([]);
    });
  }
});
