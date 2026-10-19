/**
 * Sesja działacza po stronie serwera - ciasteczka i strażnik stron.
 * Czysta logika (podpis, PKCE, walidacja domeny) mieszka w auth-core.ts,
 * żeby dało się ją testować bez Next. Patrz: src/app/api/auth/*.
 */
import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifyToken, type Session } from "./auth-core";

export {
  SESSION_COOKIE,
  STATE_COOKIE,
  PKCE_COOKIE,
  ALLOWED_DOMAIN,
  isAuthConfigured,
  signSession,
  verifyToken,
  type Session,
} from "./auth-core";

/** Bieżąca sesja (server component / route handler). Null zamiast wyjątku. */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return verifyToken(store.get(SESSION_COOKIE)?.value);
}

/**
 * Strażnik stron dostępnych tylko po zalogowaniu. Bez sesji odsyła do
 * Strefy, gdzie stoi przycisk logowania - pusty ekran z komunikatem tylko myli.
 */
export async function requireSession(locale: string): Promise<Session> {
  const session = await getSession();
  // Język z segmentu trasy trafia do adresu - tylko znane wartości.
  if (!session) redirect(`/${locale === "en" ? "en" : "pl"}/strefa-dzialacza`);
  return session;
}
