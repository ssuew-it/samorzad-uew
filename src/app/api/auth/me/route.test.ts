import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SESSION_COOKIE } from "@/lib/auth-core";
import type { StoreRead } from "@/lib/roles-store";

// Testujemy trasę jak w access.test.ts: "server-only" stubowane, magazyn ról
// mockowany sterowanym wynikiem, żeby test nie dotykał Edge Config ani Next.
vi.mock("server-only", () => ({}));

let storeRead: StoreRead = { ok: true, configured: true, store: { v: 1, people: {} } };
vi.mock("@/lib/roles-store", () => ({
  readRolesStore: vi.fn(async () => storeRead),
}));

const { GET } = await import("./route");
const { signSession } = await import("@/lib/auth-core");

const MOCNY = "x".repeat(32);

function req(token?: string): NextRequest {
  const r = new NextRequest("http://localhost/api/auth/me");
  if (token) r.cookies.set(SESSION_COOKIE, token);
  return r;
}

beforeEach(() => {
  vi.stubEnv("AUTH_SECRET", MOCNY);
  storeRead = { ok: true, configured: true, store: { v: 1, people: {} } };
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("GET /api/auth/me", () => {
  it("bez ciasteczka 204 (bez błędu w konsoli gościa), no-store, pusta treść", async () => {
    const res = await GET(req());
    expect(res.status).toBe(204);
    expect(res.headers.get("cache-control")).toContain("no-store");
    expect(await res.text()).toBe("");
    expect(res.cookies.get(SESSION_COOKIE)).toBeUndefined();
  });

  it("zły albo wygasły token: 401 i no-store", async () => {
    const res = await GET(req("smieci.podpis"));
    expect(res.status).toBe(401);
    expect(res.headers.get("cache-control")).toContain("no-store");
  });

  it("zalogowany dostaje role, bez odświeżenia w pierwszej dobie", async () => {
    const res = await GET(req(await signSession({ email: "ala@samorzad.ue.wroc.pl", name: "Ala" })));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toContain("no-store");
    expect(await res.json()).toMatchObject({
      name: "Ala",
      email: "ala@samorzad.ue.wroc.pl",
      isSuperadmin: false,
      roles: [{ role: "normal", until: null }],
    });
    expect(res.cookies.get(SESSION_COOKIE)).toBeUndefined();
  });

  it("po dobie odświeża ciasteczko na 14 dni", async () => {
    vi.useFakeTimers();
    const token = await signSession({ email: "ala@samorzad.ue.wroc.pl", name: "Ala" });
    vi.advanceTimersByTime(1000 * 60 * 60 * 25);
    const res = await GET(req(token));
    expect(res.status).toBe(200);
    const cookie = res.cookies.get(SESSION_COOKIE);
    expect(cookie?.maxAge).toBe(60 * 60 * 24 * 14);
    expect(cookie?.value).not.toBe(token);
  });

  it("zablokowany: 401 i skasowane ciasteczko", async () => {
    storeRead = { ok: true, configured: true, store: { v: 1, people: { ala: { r: {}, b: true } } } };
    const res = await GET(req(await signSession({ email: "ala@samorzad.ue.wroc.pl", name: "Ala" })));
    expect(res.status).toBe(401);
    expect(res.cookies.get(SESSION_COOKIE)?.value).toBe("");
  });

  it("awaria magazynu: 503, ciasteczko zostaje", async () => {
    storeRead = { ok: false };
    const token = await signSession({ email: "ala@samorzad.ue.wroc.pl", name: "Ala" });
    const res = await GET(req(token));
    expect(res.status).toBe(503);
    expect(res.headers.get("cache-control")).toContain("no-store");
    expect(res.cookies.get(SESSION_COOKIE)).toBeUndefined();
  });
});
