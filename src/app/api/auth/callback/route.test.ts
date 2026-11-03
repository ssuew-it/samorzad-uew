import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PKCE_COOKIE, SESSION_COOKIE, STATE_COOKIE, b64url, verifyToken } from "@/lib/auth-core";
import type { StoreRead } from "@/lib/roles-store";

// Callback testujemy bez Google i bez Edge Config: wymianę kodu na tokeny
// podstawiamy w `fetch`, magazyn ról - sterowanym wynikiem. Sprawdzamy gałęzie
// dodane razem z rolami: blokadę i awarię magazynu przy samym logowaniu.
vi.mock("server-only", () => ({}));

let storeRead: StoreRead = { ok: true, configured: true, store: { v: 1, people: {} } };
vi.mock("@/lib/roles-store", () => ({
  readRolesStore: vi.fn(async () => storeRead),
}));

const { GET } = await import("./route");

const STATE = "losowy-state.pl";
const VERIFIER = "weryfikator-pkce";

/** id_token jak od Google: nagłówek.claims.podpis (podpisu callback nie sprawdza). */
function idToken(claims: Record<string, unknown>): string {
  const enc = (o: unknown) => b64url(new TextEncoder().encode(JSON.stringify(o)));
  return `${enc({ alg: "RS256" })}.${enc(claims)}.podpis`;
}

function claimsFor(email: string) {
  return {
    email,
    email_verified: true,
    hd: "samorzad.ue.wroc.pl",
    name: "Ala Kowalska",
    picture: "https://lh3.googleusercontent.com/a/ala=s96-c",
  };
}

/** Google odpowiada na wymianę kodu tokenem z podanymi claimami. */
function googleReturns(claims: Record<string, unknown>) {
  const fetchMock = vi.fn(async () =>
    new Response(JSON.stringify({ id_token: idToken(claims) }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

/** Powrót z Google z kodem i state; ciasteczka state/PKCE jak po /login. */
function callbackReq(): NextRequest {
  const r = new NextRequest(`https://samorzad.ue.wroc.pl/api/auth/callback?code=kod&state=${STATE}`);
  r.cookies.set(STATE_COOKIE, STATE);
  r.cookies.set(PKCE_COOKIE, VERIFIER);
  return r;
}

function errorOf(res: Response): string | null {
  return new URL(res.headers.get("location")!).searchParams.get("error");
}

beforeEach(() => {
  vi.stubEnv("AUTH_SECRET", "x".repeat(32));
  vi.stubEnv("GOOGLE_CLIENT_ID", "id-klienta");
  vi.stubEnv("GOOGLE_CLIENT_SECRET", "sekret-klienta");
  vi.stubEnv("AUTH_URL", "https://samorzad.ue.wroc.pl");
  vi.stubEnv("NODE_ENV", "production");
  storeRead = { ok: true, configured: true, store: { v: 1, people: {} } };
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("GET /api/auth/callback", () => {
  it("zwykły działacz przy czytelnym magazynie dostaje sesję na 14 dni", async () => {
    const fetchMock = googleReturns(claimsFor("ala@samorzad.ue.wroc.pl"));
    const res = await GET(callbackReq());

    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/pl/strefa-dzialacza");
    expect(errorOf(res)).toBeNull();
    // Wymiana kodu idzie z verifierem PKCE z ciasteczka.
    const body = String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body);
    expect(new URLSearchParams(body).get("code_verifier")).toBe(VERIFIER);

    const cookie = res.cookies.get(SESSION_COOKIE);
    expect(cookie?.value).toBeTruthy();
    expect(cookie?.maxAge).toBe(60 * 60 * 24 * 14);
    expect(cookie?.httpOnly).toBe(true);
    const session = await verifyToken(cookie!.value);
    expect(session).toMatchObject({
      email: "ala@samorzad.ue.wroc.pl",
      name: "Ala Kowalska",
      picture: "https://lh3.googleusercontent.com/a/ala=s96-c",
    });
  });

  it("zablokowany adres: ?error=blocked i BEZ ciasteczka sesji", async () => {
    storeRead = { ok: true, configured: true, store: { v: 1, people: { ala: { r: { admi: null }, b: true } } } };
    googleReturns(claimsFor("ala@samorzad.ue.wroc.pl"));
    const res = await GET(callbackReq());
    expect(errorOf(res)).toBe("blocked");
    expect(res.cookies.get(SESSION_COOKIE)).toBeUndefined();
  });

  it("awaria magazynu dla zwykłego działacza: ?error=auth i BEZ ciasteczka sesji", async () => {
    storeRead = { ok: false };
    googleReturns(claimsFor("ala@samorzad.ue.wroc.pl"));
    const res = await GET(callbackReq());
    expect(errorOf(res)).toBe("auth");
    expect(res.cookies.get(SESSION_COOKIE)).toBeUndefined();
  });

  it("kontakt@ loguje się mimo awarii magazynu (sesja na 14 dni)", async () => {
    storeRead = { ok: false };
    googleReturns(claimsFor("kontakt@samorzad.ue.wroc.pl"));
    const res = await GET(callbackReq());
    expect(errorOf(res)).toBeNull();
    const cookie = res.cookies.get(SESSION_COOKIE);
    expect(cookie?.value).toBeTruthy();
    expect(cookie?.maxAge).toBe(60 * 60 * 24 * 14);
    expect((await verifyToken(cookie!.value))?.email).toBe("kontakt@samorzad.ue.wroc.pl");
  });

  it("kontakt@ nie da się zablokować wpisem w magazynie", async () => {
    storeRead = { ok: true, configured: true, store: { v: 1, people: { kontakt: { r: {}, b: true } } } };
    googleReturns(claimsFor("kontakt@samorzad.ue.wroc.pl"));
    const res = await GET(callbackReq());
    expect(errorOf(res)).toBeNull();
    expect(res.cookies.get(SESSION_COOKIE)?.value).toBeTruthy();
  });

  it("state niezgodny z ciasteczkiem: ?error=auth bez pytania Google i magazynu", async () => {
    const fetchMock = googleReturns(claimsFor("ala@samorzad.ue.wroc.pl"));
    const r = new NextRequest("https://samorzad.ue.wroc.pl/api/auth/callback?code=kod&state=inny.pl");
    r.cookies.set(STATE_COOKIE, STATE);
    r.cookies.set(PKCE_COOKIE, VERIFIER);
    const res = await GET(r);
    expect(errorOf(res)).toBe("auth");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(res.cookies.get(SESSION_COOKIE)).toBeUndefined();
  });
});
