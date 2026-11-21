import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import pl from "../../messages/pl.json";
import en from "../../messages/en.json";
import { ATUTY, POTRZEBY, PROJEKTY_PARTNERSKIE } from "./wspolpraca";
import { projectLogo } from "./photos";

type Msgs = typeof pl;
const root = join(__dirname, "../..");

describe("strona Współpraca: dane i teksty", () => {
  it("każde zdjęcie istnieje i ma opis alternatywny", () => {
    for (const { zdjecie } of [...ATUTY, ...PROJEKTY_PARTNERSKIE]) {
      const [projekt, plik] = zdjecie;
      expect(existsSync(join(root, `public/photos/projekty/${projekt}/${plik}.webp`)), `${projekt}/${plik}`).toBe(true);
      const alt = (pl.naszeProjekty.gallery as Record<string, Record<string, string>>)[projekt]?.[plik];
      expect(alt, `opis ${projekt}.${plik}`).toBeTruthy();
    }
  });

  it("każdy projekt ma logotyp i teksty w obu językach", () => {
    for (const { key } of PROJEKTY_PARTNERSKIE) {
      expect(projectLogo(key), key).toBeDefined();
      for (const m of [pl, en] as Msgs[]) {
        const item = (m.partnerzy.projekty.items as Record<string, { desc: string; forms: string[] }>)[key];
        expect(item?.desc, key).toBeTruthy();
        expect(item?.forms.length, key).toBeGreaterThan(0);
      }
    }
  });

  it("każdy atut ma teksty w obu językach", () => {
    for (const { key } of ATUTY) {
      for (const m of [pl, en] as Msgs[]) {
        const item = (m.partnerzy.atuty.items as Record<string, { short: string; title: string; desc: string }>)[key];
        expect(item?.short && item.title && item.desc, key).toBeTruthy();
      }
    }
  });

  it("każda potrzeba ma tyle propozycji, ile projektów, a projekty mają logotypy", () => {
    for (const { key, projekty } of POTRZEBY) {
      for (const m of [pl, en] as Msgs[]) {
        const need = (m.partnerzy.dopasowanie.needs as Record<string, { offers: unknown[] }>)[key];
        expect(need?.offers.length, key).toBe(projekty.length);
      }
      for (const p of projekty) if (p) expect(projectLogo(p), p).toBeDefined();
    }
  });

  it("w tekstach strony nie ma długich myślników", () => {
    expect(JSON.stringify(pl.partnerzy)).not.toMatch(/[—–]/);
    expect(JSON.stringify(en.partnerzy)).not.toMatch(/[—–]/);
  });
});
