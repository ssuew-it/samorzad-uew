/**
 * Sesja działacza po stronie serwera - ciasteczka i strażnik stron.
 * Czysta logika (podpis, PKCE, walidacja domeny) mieszka w auth-core.ts,
 * żeby dało się ją testować bez Next. Patrz: src/app/api/auth/*.
 */
import "server-only";
import { cookies } from "next/headers";
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

/** Bieżąca sesja (server component / route handler). Null zamiast wyjątku.
 *  Sama sesja nie mówi o roli/blokadzie - do tego służy access.ts. */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return verifyToken(store.get(SESSION_COOKIE)?.value);
}
