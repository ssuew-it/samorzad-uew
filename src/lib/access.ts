/**
 * Dostęp do Strefy Działacza - sesja (auth.ts) + rola z magazynu
 * (roles-store.ts), sprawdzane na nowo przy każdym żądaniu (bez tego
 * zablokowanie kogoś czy odebranie roli czekałoby na wygaśnięcie ciasteczka
 * sesji, czyli do 14 dni). Czysta logika decyzyjna (`getAccessFor`) jest
 * testowalna bez Next; `getAccess`/`requireAccess` dokładają cookies()
 * i redirect().
 */
import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "./auth";
import { canSee, resolveAccess, type RoleGrant, type RoleId } from "./roles-core";
import type { Session } from "./auth-core";
import { readRolesStore, type StoreRead } from "./roles-store";

export interface Access {
  session: Session;
  isSuperadmin: boolean;
  roles: RoleGrant[];
}

/**
 * Rozstrzyga dostęp bez dotykania Next - testowalna czysto.
 *
 * Bez sesji: null (niezalogowany). Magazyn nieczytelny (`read.ok === false`,
 * np. padł Edge Config albo zły token): superadmin i tak wchodzi (żeby nie
 * zablokować się samemu przy awarii), reszta dostaje null - bezpieczniej
 * odmówić dostępu niż przepuścić kogoś bez sprawdzonej roli. Zablokowany
 * (`b: true` w magazynie) -> "blocked", niezależnie od ewentualnych ról.
 */
export function getAccessFor(session: Session | null, read: StoreRead, now: Date): Access | null | "blocked" {
  if (!session) return null;
  if (!read.ok) {
    const resolved = resolveAccess(session.email, { v: 1, people: {} }, now, process.env);
    if (!resolved.isSuperadmin) return null;
    return { session, isSuperadmin: true, roles: resolved.roles };
  }
  const resolved = resolveAccess(session.email, read.store, now, process.env);
  if (resolved.blocked) return "blocked";
  return { session, isSuperadmin: resolved.isSuperadmin, roles: resolved.roles };
}

/** Dostęp dla bieżącego żądania (server component / route handler). Null
 *  zamiast wyjątku - także dla zablokowanych, żeby wołający nie musiał
 *  rozróżniać "niezalogowany" od "zablokowany" tam, gdzie to nieistotne. */
export async function getAccess(): Promise<Access | null> {
  const [session, read] = await Promise.all([getSession(), readRolesStore()]);
  const result = getAccessFor(session, read, new Date());
  return result === "blocked" ? null : result;
}

/**
 * Strażnik stron Strefy Działacza. Bez dostępu albo bez wymaganej roli
 * odsyła do Strefy, gdzie stoi przycisk logowania - pusty ekran z komunikatem
 * tylko myli (ten sam wzorzec co dawny `requireSession`).
 */
export async function requireAccess(locale: string, roles?: readonly RoleId[]): Promise<Access> {
  const access = await getAccess();
  // Język z segmentu trasy trafia do adresu - tylko znane wartości.
  const target = `/${locale === "en" ? "en" : "pl"}/strefa-dzialacza`;
  if (!access || !canSee(roles, access)) redirect(target);
  return access;
}
