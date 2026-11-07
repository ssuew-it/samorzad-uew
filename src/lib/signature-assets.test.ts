import { describe, expect, it } from "vitest";
import sharp from "sharp";
import path from "node:path";

/**
 * Grafiki stopki to pliki w public/sig, a ich wymiary są wpisane na sztywno
 * w HTML (src/lib/signature.ts). Plik w innym rozmiarze = rozciągnięty obrazek
 * w cudzej skrzynce, więc wymiary pilnuje test, a nie pamięć.
 * Pliki powstają skryptem: node scripts/build-signature-assets.mjs
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
    ["grafika.png", 400, 270],
    ["grafika-mala.png", 240, 162],
  ])("%s ma %i×%i", async (nazwa, w, h) => {
    const m = await sharp(plik(nazwa)).metadata();
    expect([m.width, m.height]).toEqual([w, h]);
  });
});

describe("grafiki stopki - przezroczystość", () => {
  it("logo ma białą podkładkę - w ciemnym motywie nie ginie", async () => {
    expect(await alfa("logo-h.png", 8, 8)).toBe(255);
  });

  it("grafika ma ścięty skosem lewy górny róg, a prawą część pełną", async () => {
    expect(await alfa("grafika.png", 10, 10)).toBe(0);
    expect(await alfa("grafika.png", 390, 135)).toBe(255);
  });
});
