import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { config, proxy } from "./proxy";

/**
 * Blokada serwisu - testy na samą funkcję, bez serwera.
 *
 * Zestaw Playwrighta uruchamia stronę z SITE_LOCK=off, więc blokady nie widzi
 * wcale. Tymczasem to tu siedzi jedyna reguła, której błąd otworzyłby zamkniętą
 * stronę: wyjątek dla grafik stopek. Stąd osobne testy, przede wszystkim na
 * próby obejścia.
 */

const zapytaj = (sciezka: string) => proxy(new NextRequest(`https://samorzad.ue.wroc.pl${sciezka}`));

describe("zamknięty serwis", () => {
  const poprzednie = process.env.SITE_LOCK;
  beforeEach(() => {
    delete process.env.SITE_LOCK;
  });
  afterEach(() => {
    if (poprzednie === undefined) delete process.env.SITE_LOCK;
    else process.env.SITE_LOCK = poprzednie;
  });

  it("zamyka stronę, gdy SITE_LOCK nie ustawiono", () => {
    expect(zapytaj("/pl").status).toBe(503);
    expect(zapytaj("/api/pogoda").status).toBe(503);
  });

  it("przepuszcza grafiki stopek, logo i ikonę", () => {
    for (const p of ["/sig/logo.png", "/sig/banner.jpg", "/sig/grafika.gif", "/favicon.ico", "/icon.svg", "/logo-dark.svg"]) {
      expect(zapytaj(p).status, p).not.toBe(503);
    }
  });

  it("nie da się obejść blokady przez katalog grafik stopek", () => {
    for (const p of [
      "/sig/%2e%2e/pl",
      "/sig/..%2fpl",
      "/sig/%2E%2E/api/pogoda",
      "/sig/sub/logo.png",
      "/sig/logo.png.html",
      "/sig/logo.png%2f..%2f..%2fpl",
    ]) {
      expect(zapytaj(p).status, p).toBe(503);
    }
  });

  it("strona zamknięcia nie trafia do cache ani do wyszukiwarek", () => {
    const r = zapytaj("/pl");
    expect(r.headers.get("cache-control")).toContain("no-store");
    expect(r.headers.get("x-robots-tag")).toContain("noindex");
  });

  it("otwiera stronę dla zapisów, które zwykle znaczą „wyłączone”", () => {
    for (const v of ["off", "OFF", " off ", "false", "0", "nie"]) {
      process.env.SITE_LOCK = v;
      expect(zapytaj("/pl").status, v).not.toBe(503);
    }
  });

  it("literówka zostawia stronę zamkniętą, a nie otwartą", () => {
    for (const v of ["on", "ofF?", "wylaczone", "true", ""]) {
      process.env.SITE_LOCK = v;
      expect(zapytaj("/pl").status, JSON.stringify(v)).toBe(503);
    }
  });
});

describe("zakres proxy (matcher)", () => {
  const trafia = (url: string) => unstable_doesMiddlewareMatch({ config, url });

  it("grafiki stopek omijają proxy - bez wywołania funkcji przy każdym otwarciu maila", () => {
    // Pośrednik Gmaila pobiera je co jakiś czas od nowa; każde wywołanie proxy
    // to zimny start funkcji (ikona „mieliła się” sekundami) i zużyte CPU.
    for (const p of ["/sig/ic_web.png", "/sig/grafika.gif", "/sig/logo-h.png", "/sig/banner.jpg", "/sig/grafika-mala.png"]) {
      expect(trafia(p), p).toBe(false);
    }
  });

  it("strony, API i każda nietypowa ścieżka w /sig nadal przechodzą przez proxy (blokada bez dziur)", () => {
    for (const p of [
      "/pl",
      "/en/kontakt",
      "/api/pogoda",
      "/sig/%2e%2e/pl",
      "/sig/..%2fpl",
      "/sig/sub/logo.png",
      "/sig/logo.png.html",
      "/sig/logo.png%2f..%2f..%2fpl",
      "/sig/",
      // Kropka w wzorcu musi być dosłowna, nie „dowolny znak”.
      "/sig/logoxpng",
    ]) {
      expect(trafia(p), p).toBe(true);
    }
  });
});
