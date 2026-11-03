import { describe, expect, it, vi } from "vitest";
import { getAccessFor } from "./access";

// Testujemy tylko czystą funkcję `getAccessFor` - resztę modułu (cookies(),
// redirect(), odczyt magazynu) stubujemy, żeby test nie dotykał Next ani sieci.
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

const now = new Date("2026-11-03T12:00:00Z");
const ses = (email: string) => ({ email, name: "X", iat: now.getTime(), exp: now.getTime() + 1e9 });
const ok = (people = {}) => ({ ok: true as const, configured: true, store: { v: 1 as const, people } });

describe("getAccessFor", () => {
  it("brak sesji -> null", () => {
    expect(getAccessFor(null, ok(), now)).toBeNull();
  });

  it("awaria magazynu: superadmin wchodzi, reszta nie", () => {
    expect(getAccessFor(ses("kontakt@samorzad.ue.wroc.pl"), { ok: false }, now)).toMatchObject({
      isSuperadmin: true,
    });
    expect(getAccessFor(ses("ala@samorzad.ue.wroc.pl"), { ok: false }, now)).toBeNull();
  });

  it("brak konfiguracji: wszyscy normal", () => {
    const a = getAccessFor(ses("ala@samorzad.ue.wroc.pl"), { ok: true, configured: false, store: { v: 1, people: {} } }, now);
    expect(a && a !== "blocked" && a.roles).toEqual([{ role: "normal", until: null }]);
  });

  it("zablokowany -> blocked", () => {
    expect(getAccessFor(ses("ala@samorzad.ue.wroc.pl"), ok({ ala: { r: {}, b: true } }), now)).toBe("blocked");
  });
});
