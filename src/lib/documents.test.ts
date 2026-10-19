import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { documents, type DocSlot } from "./documents";
import { formatActDate, formatBytes } from "./docMeta";

/**
 * Rejestry dokumentów pokazują rozmiar pliku i link do pobrania. Oba muszą
 * być prawdziwe: link do nieistniejącego pliku to 404 zamiast regulaminu, a
 * rozmiar „z pamięci" to dokładnie ten rodzaj zmyślonej liczby, którego strona
 * ma nie pokazywać.
 */

function lokalneSloty(): [string, DocSlot][] {
  const wynik: [string, DocSlot][] = [];
  const odwiedz = (sciezka: string, wartosc: unknown) => {
    if (!wartosc || typeof wartosc !== "object") return;
    const slot = wartosc as DocSlot;
    if (typeof slot.href === "string") {
      if (slot.href.startsWith("/")) wynik.push([sciezka, slot]);
      return;
    }
    for (const [klucz, dziecko] of Object.entries(wartosc)) odwiedz(`${sciezka}.${klucz}`, dziecko);
  };
  odwiedz("documents", documents);
  return wynik;
}

describe("documents - pliki lokalne", () => {
  const sloty = lokalneSloty();

  it("znajduje lokalne pliki (sanity check)", () => {
    expect(sloty.length).toBeGreaterThan(5);
  });

  for (const [nazwa, slot] of sloty) {
    it(`${nazwa}: plik istnieje${slot.bytes ? " i ma zapisany rozmiar" : ""}`, () => {
      const plik = join(process.cwd(), "public", slot.href!);
      expect(existsSync(plik)).toBe(true);
      if (slot.bytes !== undefined) expect(statSync(plik).size).toBe(slot.bytes);
    });
  }

  it("każdy regulamin w rejestrze ma rozmiar i liczbę stron", () => {
    for (const slot of Object.values(documents.regulacje)) {
      expect(slot.bytes).toBeGreaterThan(0);
      expect(slot.pages).toBeGreaterThan(0);
    }
  });
});

describe("docMeta", () => {
  it("formatuje rozmiar jak przeglądarka (1024)", () => {
    expect(formatBytes(1287716, "pl")).toBe("1,2 MB");
    expect(formatBytes(1287716, "en")).toBe("1.2 MB");
    expect(formatBytes(139160, "pl")).toBe("136 KB");
    expect(formatBytes(3157623, "pl")).toBe("3 MB");
  });

  it("formatuje datę uchwały bez przesunięcia strefy", () => {
    expect(formatActDate("2025-04-27", "pl")).toBe("27.04.2025");
    expect(formatActDate("2025-04-27", "en")).toBe("27 Apr 2025");
  });
});
