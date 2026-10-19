import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ALLOWED_DOMAIN,
  b64url,
  createCodeVerifier,
  decodeIdTokenClaims,
  isAllowedIdentity,
  isAuthConfigured,
  pkceChallenge,
  resolveRedirectUri,
  signSession,
  verifyToken,
} from "./auth-core";

const MOCNY = "x".repeat(32);

beforeEach(() => {
  vi.stubEnv("AUTH_SECRET", MOCNY);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("sesja - podpis i weryfikacja", () => {
  it("podpisany token wraca jako ta sama sesja", async () => {
    const token = await signSession({ email: "a@samorzad.ue.wroc.pl", name: "Ala" });
    const s = await verifyToken(token);
    expect(s?.email).toBe("a@samorzad.ue.wroc.pl");
    expect(s?.name).toBe("Ala");
  });

  it("odrzuca zmieniony payload i zmieniony podpis", async () => {
    const token = await signSession({ email: "a@samorzad.ue.wroc.pl", name: "Ala" });
    const [payload, sig] = token.split(".");
    const obcy = b64url(
      new TextEncoder().encode(JSON.stringify({ email: "x@gmail.com", name: "X", exp: Date.now() + 1e6 })),
    );
    expect(await verifyToken(`${obcy}.${sig}`)).toBeNull();
    expect(await verifyToken(`${payload}.${sig.slice(0, -2)}AA`)).toBeNull();
  });

  it("odrzuca token podpisany innym sekretem", async () => {
    const token = await signSession({ email: "a@samorzad.ue.wroc.pl", name: "Ala" });
    vi.stubEnv("AUTH_SECRET", "y".repeat(40));
    expect(await verifyToken(token)).toBeNull();
  });

  it("odrzuca wygasłą sesję", async () => {
    vi.useFakeTimers();
    const token = await signSession({ email: "a@samorzad.ue.wroc.pl", name: "Ala" });
    vi.advanceTimersByTime(1000 * 60 * 60 * 9);
    expect(await verifyToken(token)).toBeNull();
  });

  it("zwraca null zamiast rzucać przy śmieciach w ciasteczku", async () => {
    for (const t of [undefined, "", "bez-kropki", "a.b", "!!!.@@@", "."]) {
      await expect(verifyToken(t)).resolves.toBeNull();
    }
  });

  it("bez sekretu albo z za krótkim: null, nie wyjątek (stare ciasteczko nie daje 500)", async () => {
    const token = await signSession({ email: "a@samorzad.ue.wroc.pl", name: "Ala" });
    vi.stubEnv("AUTH_SECRET", "");
    await expect(verifyToken(token)).resolves.toBeNull();
    vi.stubEnv("AUTH_SECRET", "x".repeat(31));
    await expect(verifyToken(token)).resolves.toBeNull();
    delete process.env.AUTH_SECRET;
    await expect(verifyToken(token)).resolves.toBeNull();
  });

  it("podpisywanie bez mocnego sekretu rzuca (nie wolno wydać sesji)", async () => {
    vi.stubEnv("AUTH_SECRET", "krotki");
    await expect(signSession({ email: "a@samorzad.ue.wroc.pl", name: "Ala" })).rejects.toThrow();
  });
});

describe("isAuthConfigured", () => {
  beforeEach(() => {
    vi.stubEnv("GOOGLE_CLIENT_ID", "id");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "secret");
    vi.stubEnv("AUTH_URL", "https://samorzad.ue.wroc.pl");
  });

  it("komplet zmiennych = skonfigurowane", () => {
    expect(isAuthConfigured()).toBe(true);
  });

  it("sekret krótszy niż 32 znaki = nieskonfigurowane", () => {
    vi.stubEnv("AUTH_SECRET", "x".repeat(31));
    expect(isAuthConfigured()).toBe(false);
  });

  it("bez AUTH_URL poza trybem dev = nieskonfigurowane", () => {
    vi.stubEnv("AUTH_URL", "");
    vi.stubEnv("NODE_ENV", "production");
    expect(isAuthConfigured()).toBe(false);
    vi.stubEnv("NODE_ENV", "development");
    expect(isAuthConfigured()).toBe(true);
  });
});

describe("resolveRedirectUri", () => {
  it("z AUTH_URL bierze sam origin i ignoruje Host żądania", () => {
    vi.stubEnv("AUTH_URL", "https://samorzad.ue.wroc.pl/cokolwiek/");
    expect(resolveRedirectUri("https://zly-host.example")).toBe(
      "https://samorzad.ue.wroc.pl/api/auth/callback",
    );
  });

  it("bez AUTH_URL: origin żądania tylko w dev", () => {
    vi.stubEnv("AUTH_URL", "");
    vi.stubEnv("NODE_ENV", "production");
    expect(resolveRedirectUri("https://zly-host.example")).toBeNull();
    vi.stubEnv("NODE_ENV", "development");
    expect(resolveRedirectUri("http://localhost:3000")).toBe("http://localhost:3000/api/auth/callback");
  });

  it("nieprawidłowy AUTH_URL = null", () => {
    vi.stubEnv("AUTH_URL", "nie-adres");
    expect(resolveRedirectUri("http://localhost:3000")).toBeNull();
    vi.stubEnv("AUTH_URL", "javascript:alert(1)");
    expect(resolveRedirectUri("http://localhost:3000")).toBeNull();
  });
});

describe("PKCE (S256)", () => {
  it("wektor z RFC 7636, dodatek B", async () => {
    expect(await pkceChallenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk")).toBe(
      "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    );
  });

  it("verifier ma 43 znaki base64url i jest losowy", () => {
    const a = createCodeVerifier();
    const b = createCodeVerifier();
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(a).not.toBe(b);
  });
});

describe("isAllowedIdentity - domena Samorządu", () => {
  const ok = {
    email: `jan.kowalski@${ALLOWED_DOMAIN}`,
    email_verified: true,
    hd: ALLOWED_DOMAIN,
    name: "Jan",
  };

  it("przepuszcza zweryfikowane konto Workspace Samorządu", () => {
    expect(isAllowedIdentity(ok)).toBe(true);
    expect(isAllowedIdentity({ ...ok, email: ok.email.toUpperCase() })).toBe(true);
    expect(isAllowedIdentity({ ...ok, email_verified: "true" })).toBe(true);
  });

  it("odrzuca brak claimu hd (np. konto Google na cudzy adres)", () => {
    expect(isAllowedIdentity({ ...ok, hd: undefined })).toBe(false);
  });

  it("odrzuca inną domenę Workspace i prywatny Gmail", () => {
    expect(isAllowedIdentity({ ...ok, hd: "ue.wroc.pl" })).toBe(false);
    expect(isAllowedIdentity({ email: "jan@gmail.com", email_verified: true })).toBe(false);
  });

  it("odrzuca niezweryfikowany adres", () => {
    expect(isAllowedIdentity({ ...ok, email_verified: false })).toBe(false);
    expect(isAllowedIdentity({ ...ok, email_verified: undefined })).toBe(false);
  });

  it("odrzuca adres spoza domeny mimo poprawnego hd i podszywanie sufiksem", () => {
    expect(isAllowedIdentity({ ...ok, email: "jan@gmail.com" })).toBe(false);
    expect(isAllowedIdentity({ ...ok, email: `jan@evil${ALLOWED_DOMAIN}` })).toBe(false);
    expect(isAllowedIdentity({ ...ok, email: `jan@${ALLOWED_DOMAIN}.evil.com` })).toBe(false);
  });

  it("odrzuca brak claims", () => {
    expect(isAllowedIdentity(null)).toBe(false);
    expect(isAllowedIdentity(undefined)).toBe(false);
  });
});

describe("decodeIdTokenClaims", () => {
  it("czyta payload JWT w base64url (także z polskimi znakami)", () => {
    const payload = b64url(new TextEncoder().encode(JSON.stringify({ name: "Łucja Żak", hd: ALLOWED_DOMAIN })));
    expect(decodeIdTokenClaims(`h.${payload}.s`)).toEqual({ name: "Łucja Żak", hd: ALLOWED_DOMAIN });
  });

  it("zwraca null przy uszkodzonym tokenie", () => {
    expect(decodeIdTokenClaims("bez-kropek")).toBeNull();
    expect(decodeIdTokenClaims("h.!!!.s")).toBeNull();
    expect(decodeIdTokenClaims(`h.${b64url(new TextEncoder().encode("null"))}.s`)).toBeNull();
  });
});
