import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { config, proxy } from "./proxy";

/**
 * Proxy (next-intl) działa TYLKO na adresach bez prefiksu języka.
 *
 * Na Vercelu proxy to funkcja Node uruchamiana przed cache - przy matcherze
 * „wszystko” każda odsłona odpalała ją kilkanaście razy (strona, każdy plik
 * JS/CSS, zdjęcia, grafiki stopek) i zjadała limit Fluid Active CPU.
 * Strony mają zawsze prefiks /pl albo /en i są gotowe w CDN - proxy jest
 * potrzebne tylko, żeby „/” i stare linki bez języka trafiły pod właściwy.
 */

const trafia = (url: string) => unstable_doesMiddlewareMatch({ config, url });

describe("zakres proxy (matcher)", () => {
  it("adresy bez języka przechodzą przez proxy - dostaną przekierowanie", () => {
    for (const p of ["/", "/kontakt", "/o-nas", "/stypendia"]) {
      expect(trafia(p), p).toBe(true);
    }
  });

  it("strony z językiem, pliki i API omijają proxy - zero wywołań funkcji", () => {
    for (const p of [
      "/pl",
      "/en",
      "/pl/kontakt",
      "/en/o-nas",
      "/_next/static/chunks/main.js",
      "/_next/image?url=%2Fphotos%2Fa.jpg&w=640&q=75",
      "/_vercel/insights/script.js",
      "/api/pogoda",
      "/sig/ic_web.png",
      "/logo-dark.svg",
      "/favicon.ico",
      "/sftp-config.json",
      "/photos/hero/a.webp",
    ]) {
      expect(trafia(p), p).toBe(false);
    }
  });

  it("adres zaczynający się jak język, ale nim niebędący, nadal trafia do proxy", () => {
    // „/plan-zajec” czy „/english” to nie prefiks /pl ani /en.
    for (const p of ["/plan-zajec", "/english"]) {
      expect(trafia(p), p).toBe(true);
    }
  });
});

describe("proxy - przekierowanie na język", () => {
  it("„/” prowadzi na stronę polską (domyślny język)", () => {
    const r = proxy(new NextRequest("https://samorzad.ue.wroc.pl/"));
    expect([307, 308]).toContain(r.status);
    expect(r.headers.get("location")).toMatch(/\/pl$/);
  });

  it("stary link bez języka trafia pod /pl", () => {
    const r = proxy(new NextRequest("https://samorzad.ue.wroc.pl/kontakt"));
    expect(r.headers.get("location")).toMatch(/\/pl\/kontakt$/);
  });
});
