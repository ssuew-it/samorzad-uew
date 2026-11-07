import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

/**
 * Grafiki stopek pobiera pośrednik Gmaila (i inne poczty) przy otwieraniu
 * wiadomości. Domyślny nagłówek plików z public/ to `max-age=0,
 * must-revalidate` - wtedy pośrednik dopytuje nasz serwer za każdym razem.
 */
describe("next.config - nagłówki grafik stopek", () => {
  it("/sig/* ma cache na dobę z odświeżaniem w tle", async () => {
    const reguly = (await nextConfig.headers!()) ?? [];
    const sig = reguly.find((r) => r.source === "/sig/:plik");
    expect(sig).toBeDefined();
    const cc = sig!.headers.find((h) => h.key === "Cache-Control")?.value ?? "";
    expect(cc).toContain("public");
    expect(cc).toContain("max-age=86400");
    expect(cc).toContain("stale-while-revalidate");
  });
});
