import { type NextRequest, NextResponse } from "next/server";
import {
  STATE_COOKIE,
  PKCE_COOKIE,
  ALLOWED_DOMAIN,
  isAuthConfigured,
  createCodeVerifier,
  pkceChallenge,
  resolveRedirectUri,
} from "@/lib/auth-core";

export const runtime = "nodejs";

/** Start logowania - przekierowanie do zgody Google (ograniczone do domeny). */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const locale = url.searchParams.get("locale") === "en" ? "en" : "pl";
  const redirectUri = resolveRedirectUri(url.origin);

  if (!isAuthConfigured() || !redirectUri) {
    return NextResponse.redirect(new URL(`/${locale}/strefa-dzialacza`, url.origin));
  }

  const state = `${crypto.randomUUID()}.${locale}`;
  // PKCE: nawet przechwycony kod (logi, historia, złośliwe rozszerzenie)
  // jest bezużyteczny bez verifiera, który nigdy nie opuszcza serwera.
  const verifier = createCodeVerifier();
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    hd: ALLOWED_DOMAIN, // podpowiedź domeny (UI Google); twarda walidacja w callbacku
    state,
    code_challenge: await pkceChallenge(verifier),
    code_challenge_method: "S256",
    prompt: "select_account",
  });

  const res = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
  const shortLived = {
    httpOnly: true,
    secure: url.protocol === "https:",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600,
  };
  res.cookies.set(STATE_COOKIE, state, shortLived);
  res.cookies.set(PKCE_COOKIE, verifier, shortLived);
  return res;
}
