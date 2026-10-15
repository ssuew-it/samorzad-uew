/**
 * Czysta logika sesji działacza — bez importów z Next, żeby dało się ją
 * testować jednostkowo. Warstwa z ciasteczkami i przekierowaniami: auth.ts.
 *
 * Podpis: HMAC-SHA256 przez Web Crypto. Logowanie: Google OAuth z PKCE,
 * ograniczone do domeny Samorządu. Patrz: src/app/api/auth/*.
 */

export const SESSION_COOKIE = "ssuew_session";
export const STATE_COOKIE = "ssuew_oauth_state";
/** Osobne ciasteczko na code_verifier — żyje tyle co state i znika razem z nim. */
export const PKCE_COOKIE = "ssuew_oauth_pkce";
export const ALLOWED_DOMAIN = "samorzad.ue.wroc.pl";
export const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 h
/**
 * Krótszy sekret da się w praktyce zgadnąć offline z jednego ciasteczka,
 * a wtedy każdy podrobi sesję. Zalecane `openssl rand -base64 32` daje
 * 44 znaki, więc przechodzi z zapasem.
 */
export const MIN_SECRET_LENGTH = 32;
export const CALLBACK_PATH = "/api/auth/callback";

export interface Session {
  email: string;
  name: string;
  exp: number;
}

/** Sekret do podpisu albo null, gdy go brak lub jest za krótki. */
export function getAuthSecret(): string | null {
  const secret = process.env.AUTH_SECRET ?? "";
  return secret.length >= MIN_SECRET_LENGTH ? secret : null;
}

/**
 * Adres powrotu z Google.
 *
 * Na produkcji WYŁĄCZNIE z `AUTH_URL`: nagłówek Host da się podstawić, a adres
 * zbudowany z żądania mógłby wtedy skierować kod autoryzacji gdzie indziej.
 * Z adresu żądania korzystamy tylko lokalnie (`next dev`), dla wygody.
 * Zwraca null, gdy nie da się go bezpiecznie ustalić.
 */
export function resolveRedirectUri(requestOrigin?: string): string | null {
  const base = process.env.AUTH_URL?.trim();
  if (base) {
    try {
      const u = new URL(base);
      if (u.protocol !== "https:" && u.protocol !== "http:") return null;
      return `${u.origin}${CALLBACK_PATH}`;
    } catch {
      return null;
    }
  }
  if (process.env.NODE_ENV === "development" && requestOrigin) {
    return `${requestOrigin}${CALLBACK_PATH}`;
  }
  return null;
}

/**
 * Czy logowanie jest skonfigurowane. Bez kompletu kluczy, mocnego sekretu
 * i ustalonego adresu powrotu strona pokazuje „Wkrótce" zamiast przycisku,
 * który i tak skończyłby się błędem.
 */
export function isAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      getAuthSecret() &&
      (process.env.AUTH_URL?.trim() || process.env.NODE_ENV === "development"),
  );
}

export function b64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function b64urlDecode(s: string): Uint8Array {
  const norm = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(norm);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret) as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/**
 * Tworzy podpisany token sesji `payload.signature`. Rzuca bez sekretu —
 * wywołujemy go tylko po sprawdzeniu `isAuthConfigured()`, więc brak
 * sekretu tutaj to błąd w kodzie, nie stan do obsłużenia.
 */
export async function signSession(data: Omit<Session, "exp">): Promise<string> {
  const secret = getAuthSecret();
  if (!secret) throw new Error("AUTH_SECRET brak lub krótszy niż 32 znaki");
  const session: Session = { ...data, exp: Date.now() + SESSION_TTL_MS };
  const payload = b64url(new TextEncoder().encode(JSON.stringify(session)));
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload) as BufferSource);
  return `${payload}.${b64url(new Uint8Array(sig))}`;
}

/**
 * Weryfikuje token i zwraca sesję albo null. Nigdy nie rzuca: zły podpis,
 * wygasła sesja, brak konfiguracji czy śmieci w ciasteczku mają skończyć się
 * widokiem dla niezalogowanych, a nie błędem 500 na całej stronie.
 */
export async function verifyToken(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  const secret = getAuthSecret();
  if (!secret) return null;
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  try {
    const key = await hmacKey(secret);
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      b64urlDecode(sig) as BufferSource,
      new TextEncoder().encode(payload) as BufferSource,
    );
    if (!ok) return null;
    const session = JSON.parse(new TextDecoder().decode(b64urlDecode(payload))) as Partial<Session>;
    if (
      typeof session.email !== "string" ||
      typeof session.name !== "string" ||
      typeof session.exp !== "number" ||
      session.exp < Date.now()
    ) {
      return null;
    }
    return { email: session.email, name: session.name, exp: session.exp };
  } catch {
    return null;
  }
}

/** Losowy code_verifier PKCE (43 znaki base64url = 32 bajty entropii, RFC 7636). */
export function createCodeVerifier(): string {
  return b64url(crypto.getRandomValues(new Uint8Array(32)));
}

/** code_challenge metodą S256: base64url(SHA-256(verifier)). */
export async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier) as BufferSource);
  return b64url(new Uint8Array(digest));
}

export interface IdTokenClaims {
  email?: string;
  email_verified?: boolean | string;
  hd?: string;
  name?: string;
}

/** Odczytuje claims z id_token (bez weryfikacji podpisu — patrz callback). */
export function decodeIdTokenClaims(idToken: string): IdTokenClaims | null {
  const part = idToken.split(".")[1];
  if (!part) return null;
  try {
    const claims = JSON.parse(new TextDecoder().decode(b64urlDecode(part))) as unknown;
    return claims && typeof claims === "object" ? (claims as IdTokenClaims) : null;
  } catch {
    return null;
  }
}

/**
 * Czy konto należy do Samorządu.
 *
 * Trzy warunki naraz. Sam adres e-mail nie wystarcza: konto Google spoza
 * Workspace może mieć zweryfikowany adres w cudzej domenie. Claim `hd`
 * wystawia Google tylko kontom zarządzanym przez Workspace tej domeny,
 * więc to on przesądza o przynależności.
 */
export function isAllowedIdentity(claims: IdTokenClaims | null | undefined): boolean {
  if (!claims) return false;
  const email = typeof claims.email === "string" ? claims.email.toLowerCase() : "";
  const verified = claims.email_verified === true || claims.email_verified === "true";
  return verified && claims.hd === ALLOWED_DOMAIN && email.endsWith(`@${ALLOWED_DOMAIN}`);
}
