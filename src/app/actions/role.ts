"use server";

import { getAccess } from "@/lib/access";
import {
  RoleEditError,
  localPart,
  removePerson,
  setBlocked,
  setPersonRoles,
  toPeopleView,
  type AssignableRole,
  type PersonView as CorePersonView,
  type RolesStore,
} from "@/lib/roles-core";
import { canWriteRoles, readRolesStore, writeRolesStore } from "@/lib/roles-store";

// Plik "use server" może eksportować tylko funkcje asynchroniczne. Typ podajemy
// dalej jako ALIAS, nie `export type { PersonView }`: tę drugą formę
// przekształcenie akcji serwera w Turbopacku (Next 16.2) bierze za eksport
// wartości i moduł akcji pada przy starcie („PersonView is not defined” -
// sprawdzone na `next start`, testy jednostkowe tego nie łapią).
export type PersonView = CorePersonView;

export type RoleActionResult =
  | { ok: true; people: PersonView[] }
  | {
      ok: false;
      error: "forbidden" | "email" | "superadmin" | "role" | "date" | "read" | "write" | "notConfigured";
    };

type Failure = Extract<RoleActionResult, { ok: false }>;

/**
 * Wspólny przebieg każdej akcji panelu „Role i dostęp”.
 *
 * Uprawnienia sprawdzamy tu, a nie tylko na stronie: akcję serwera da się
 * wywołać zwykłym POST-em z pominięciem panelu. Kolejność ma znaczenie:
 * - najpierw superadmin, żeby obcy nie dowiedział się nawet, czy magazyn
 *   jest skonfigurowany;
 * - brak zmiennych do zapisu albo brak `EDGE_CONFIG` (odczyt dałby pusty
 *   magazyn) -> "notConfigured". Zapis pustego magazynu nadpisałby
 *   prawdziwą listę osób;
 * - po zapisie oddajemy widok z magazynu, który właśnie ZAPISALIŚMY. Ponowny
 *   odczyt z Edge Config pokazałby stan sprzed zmiany - zmiany rozchodzą się
 *   po serwerach z kilkusekundowym opóźnieniem.
 */
async function edit(mutate: (store: RolesStore) => RolesStore | Failure): Promise<RoleActionResult> {
  const access = await getAccess();
  if (!access?.isSuperadmin) return { ok: false, error: "forbidden" };
  if (!canWriteRoles()) return { ok: false, error: "notConfigured" };

  const read = await readRolesStore();
  if (!read.ok) return { ok: false, error: "read" };
  if (!read.configured) return { ok: false, error: "notConfigured" };

  let next: RolesStore;
  try {
    const result = mutate(read.store);
    if ("ok" in result) return result;
    next = result;
  } catch (e) {
    if (e instanceof RoleEditError) return { ok: false, error: e.code };
    throw e;
  }

  try {
    await writeRolesStore(next);
  } catch {
    // Panel ma powiedzieć wprost, że zmiana NIE weszła - bez udawania sukcesu.
    return { ok: false, error: "write" };
  }
  return { ok: true, people: toPeopleView(next) };
}

/** Argumenty przychodzą z sieci, nie tylko z naszego panelu - typy TS niczego
 *  tu nie gwarantują, więc adres sprawdzamy przed dotknięciem magazynu. */
function badEmail(email: unknown): Failure | null {
  return typeof email === "string" && localPart(email) ? null : { ok: false, error: "email" };
}

/** Ustawia pełny zestaw ról osoby (dodanie, zmiana daty, odebranie roli). */
export async function savePersonRoles(
  email: string,
  grants: Partial<Record<AssignableRole, string | null>>,
): Promise<RoleActionResult> {
  return edit((store) => {
    const invalid = badEmail(email);
    if (invalid) return invalid;
    if (!grants || typeof grants !== "object" || Array.isArray(grants)) return { ok: false, error: "role" };
    return setPersonRoles(store, email, grants);
  });
}

/** Blokuje albo odblokowuje adres (także taki, który nie ma żadnych ról). */
export async function setPersonBlocked(email: string, blocked: boolean): Promise<RoleActionResult> {
  return edit((store) => {
    const invalid = badEmail(email);
    if (invalid) return invalid;
    // `process.env`, bo w development nie da się też zablokować DEV_SUPERADMIN.
    return setBlocked(store, email, blocked === true, process.env);
  });
}

/** Usuwa osobę z listy razem z rolami i blokadą. */
export async function deletePerson(email: string): Promise<RoleActionResult> {
  return edit((store) => {
    const invalid = badEmail(email);
    if (invalid) return invalid;
    return removePerson(store, email);
  });
}
