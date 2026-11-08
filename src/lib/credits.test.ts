import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { AUTHOR } from "./credits";
import { GET as humans } from "../app/humans.txt/route";

/**
 * Podpis twórcy serwisu. Test celowo pilnuje WSZYSTKICH miejsc naraz: zmiana,
 * która usunie podpis z któregokolwiek z nich, nie przejdzie CI bez świadomej
 * edycji tego testu (i śladu w historii gita).
 */
const zrodlo = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

describe("podpis twórcy serwisu", () => {
  it("autor to Mikołaj Radliński", () => {
    expect(AUTHOR.name).toBe("Mikołaj Radliński");
  });

  it("/humans.txt wymienia autora", async () => {
    const tekst = await humans().text();
    expect(tekst).toContain(AUTHOR.name);
  });

  it("metadane i dane strukturalne strony biorą autora z credits.ts", () => {
    const layout = zrodlo("src/app/[locale]/layout.tsx");
    expect(layout).toMatch(/authors:\s*\[\{\s*name:\s*AUTHOR\.name/);
    expect(layout).toMatch(/creator:\s*AUTHOR\.name/);
    expect(layout).toMatch(/creator:\s*\{\s*"@type":\s*"Person",\s*name:\s*AUTHOR\.name/);
  });

  it("stopka strony pokazuje podpis autora", () => {
    expect(zrodlo("src/components/Footer.tsx")).toContain("AUTHOR.name");
  });
});
