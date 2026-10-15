import { type NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  STATE_COOKIE,
  PKCE_COOKIE,
  isAuthConfigured,
  signSession,
  decodeIdTokenClaims,
  isAllowedIdentity,
  resolveRedirectUri,
  type IdTokenClaims,
} from "@/lib/auth-core";

export const runtime = "nodejs";

/** Powrót z Google — wymiana kodu (z PKCE), walidacja domeny, ustawienie sesji. */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const stateCookie = req.cookies.get(STATE_COOKIE)?.value;
  const verifier = req.cookies.get(PKCE_COOKIE)?.value;
  const locale = state?.split(".")[1] === "en" ? "en" : "pl";
  const redirectUri = resolveRedirectUri(url.origin);

  const back = (error?: string) => {
    const u = new URL(`/${locale}/strefa-dzialacza`, url.origin);
    if (error) u.searchParams.set("error", error);
    const res = NextResponse.redirect(u);
    res.cookies.delete(STATE_COOKIE);
    res.cookies.delete(PKCE_COOKIE);
    return res;
  };

  // CSRF: state z query musi zgadzać się ze state z ciasteczka.
  if (
    !code ||
    !state ||
    !stateCookie ||
    state !== stateCookie ||
    !verifier ||
    !redirectUri ||
    !isAuthConfigured()
  ) {
    return back("auth");
  }

  let claims: IdTokenClaims | null = null;
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        // Musi być identyczny z tym z /login — Google porównuje je dosłownie.
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        code_verifier: verifier,
      }),
    });
    if (!tokenRes.ok) throw new Error("token exchange failed");
    const tokens = (await tokenRes.json()) as { id_token?: string };
    if (!tokens.id_token) throw new Error("no id_token");

    // id_token przyszedł bezpośrednio od Google przez TLS (poufny klient) →
    // ufamy zawartości bez ponownej weryfikacji podpisu.
    claims = decodeIdTokenClaims(tokens.id_token);
    if (!claims) throw new Error("bad id_token");
  } catch {
    return back("auth");
  }

  // Domena sprawdzana podwójnie: claim `hd` (konto Workspace Samorządu)
  // i zweryfikowany adres w tej domenie. Szczegóły w isAllowedIdentity.
  if (!isAllowedIdentity(claims)) {
    return back("domain");
  }

  const email = claims.email!.toLowerCase();
  const name = claims.name || email;
  const token = await signSession({ email, name });
  const res = back();
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: url.protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
