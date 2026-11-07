import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("/api/og - cache obrazów udostępnień", () => {
  it("odpowiedź trzyma CDN - obrazek rysuje się raz, nie przy każdym pobraniu", () => {
    // Bez tego każde pobranie podglądu linku (Facebook, LinkedIn, Slack, Google)
    // od nowa rysowało PNG w funkcji - jedna z większych pozycji Fluid Active CPU.
    const r = GET(new Request("https://samorzad.ue.wroc.pl/api/og?title=Kontakt&eyebrow=Samorz%C4%85d"));
    const cc = r.headers.get("cache-control") ?? "";
    expect(cc).toContain("public");
    expect(cc).toMatch(/s-maxage=\d{6,}/);
  });
});
