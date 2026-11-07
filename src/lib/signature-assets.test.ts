import { describe, expect, it } from "vitest";
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

/**
 * Grafiki stopki to pliki w public/sig, a ich wymiary są wpisane na sztywno
 * w HTML (src/lib/signature.ts). Plik w innym rozmiarze = rozciągnięty obrazek
 * w cudzej skrzynce, więc wymiary pilnuje test, a nie pamięć.
 * Pliki powstają skryptami: node scripts/build-signature-assets.mjs (logo)
 * i python scripts/build-signature-gif.py (grafika: GIF i kadry nieruchome).
 */
const plik = (nazwa: string) => path.join(process.cwd(), "public", "sig", nazwa);

/** Kanał alfa piksela (x, y) - 255 = pełne krycie, 0 = przezroczystość. */
async function alfa(nazwa: string, x: number, y: number): Promise<number> {
  const { data, info } = await sharp(plik(nazwa)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return data[(y * info.width + x) * info.channels + 3]!;
}

describe("grafiki stopki - wymiary (2× rozmiar wyświetlany)", () => {
  it.each([
    ["logo-h.png", 384, 112],
    ["grafika.png", 400, 356],
    ["grafika-mala.png", 220, 356],
  ])("%s ma %i×%i", async (nazwa, w, h) => {
    const m = await sharp(plik(nazwa)).metadata();
    expect([m.width, m.height]).toEqual([w, h]);
  });
});

describe("animowana grafika (wersja codzienna)", () => {
  it("grafika.gif ma 400×356, kilka klatek i waży najwyżej 300 KB", async () => {
    const m = await sharp(plik("grafika.gif"), { animated: true }).metadata();
    expect([m.width, m.pageHeight]).toEqual([400, 356]);
    expect(m.pages).toBeGreaterThan(1);
    expect(fs.statSync(plik("grafika.gif")).size).toBeLessThanOrEqual(300 * 1024);
  });

  it("pierwsza klatka to pełny obraz - tylko ją pokaże Outlook na komputerze", async () => {
    // Prawa część kadru (panorama z hasłem) nie może być pusta ani przezroczysta.
    expect(await alfa("grafika.gif", 390, 178)).toBe(255);
    const { data, info } = await sharp(plik("grafika.gif")).raw().toBuffer({ resolveWithObject: true });
    const i = (178 * info.width + 300) * info.channels;
    expect(data[i]! + data[i + 1]! + data[i + 2]!).toBeGreaterThan(30);
  });
});

describe("grafiki stopki - przezroczystość", () => {
  it("logo ma białą podkładkę - w ciemnym motywie nie ginie", async () => {
    expect(await alfa("logo-h.png", 8, 8)).toBe(255);
  });

  it("grafika ma ścięty skosem lewy górny róg, a prawą część pełną", async () => {
    expect(await alfa("grafika.png", 10, 10)).toBe(0);
    expect(await alfa("grafika.png", 390, 178)).toBe(255);
  });
});
