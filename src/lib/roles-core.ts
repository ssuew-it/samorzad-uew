/**
 * Czysta logika ról Strefy Działacza - bez importów z Next, żeby dało się ją
 * testować jednostkowo. Magazyn trzymany w Vercel Edge Config (ma limit
 * rozmiaru), stąd skrócone klucze (`r`, `b`) i e-mail jako sama część lokalna
 * (domena jest zawsze ta sama). Warstwa z Edge Config i endpointem: inne pliki.
 */

import { ALLOWED_DOMAIN } from "./auth-core";

export type RoleId = "superadmin" | "zarzad" | "projekty" | "russ" | "admi" | "normal";
export type AssignableRole = "zarzad" | "projekty" | "russ" | "admi";

/** Kolejność decyduje o kolejności wyświetlania ról w `resolveAccess`. */
export const ASSIGNABLE_ROLES: readonly AssignableRole[] = ["zarzad", "projekty", "russ", "admi"];

export const SUPERADMIN_EMAIL = "kontakt@samorzad.ue.wroc.pl";

/** Domyślna ważność: "may31" = najbliższy 31 maja, null = bez daty. */
export const ROLE_DEFAULT_EXPIRY: Record<AssignableRole, "may31" | null> = {
  zarzad: "may31",
  projekty: "may31",
  russ: "may31",
  admi: null,
};

/** Wpis magazynu. Klucz `people` = część adresu przed @ (domena stała,
 *  oszczędza miejsce - Edge Config ma limit rozmiaru). */
export interface StoredPerson {
  r: Partial<Record<AssignableRole, string | null>>;
  b?: true;
}
export interface RolesStore {
  v: 1;
  people: Record<string, StoredPerson>;
}
export interface RoleGrant {
  role: RoleId;
  until: string | null;
} // until: "YYYY-MM-DD"
export interface ResolvedAccess {
  blocked: boolean;
  isSuperadmin: boolean;
  roles: RoleGrant[];
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Prawdziwa data "YYYY-MM-DD" z rozsądnego zakresu lat. Sam wzorzec
 * przepuszczał "2027-02-30" czy "9999-99-99": rola z taką datą nigdy by nie
 * wygasła albo wygasła w nieoczekiwanym dniu, a `daysLeft` dawał NaN.
 * Dlatego data musi przejść w obie strony przez Date.UTC bez zmiany.
 */
export function isValidDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  if (y < 2000 || y > 2100) return false;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** Nazwy, które w zwykłym obiekcie JS istnieją „same z siebie” (z prototypu).
 *  Jako klucz magazynu `__proto__` podmieniłby prototyp, a `constructor`
 *  zwróciłby funkcję zamiast osoby - odczyt ról rzucałby wtedy wyjątkiem. */
function isPrototypeKey(name: string): boolean {
  return name === "prototype" || name in Object.prototype;
}

/** Wpis osoby, ale tylko WŁASNY - nigdy odziedziczony z prototypu. */
function ownPerson(store: RolesStore, local: string): StoredPerson | undefined {
  return Object.hasOwn(store.people, local) ? store.people[local] : undefined;
}

export function emptyStore(): RolesStore {
  return { v: 1, people: {} };
}

/** Normalizuje adres (trim + lowercase); przyjmuje pełny adres w domenie albo
 *  samą część lokalną. Pusty, z innej domeny, ze znakami spoza
 *  `[a-z0-9._+-]` albo równy nazwie z prototypu obiektu (`__proto__`,
 *  `constructor`...) -> null. */
export function localPart(input: string): string | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;
  const domainSuffix = `@${ALLOWED_DOMAIN}`.toLowerCase();
  let local: string;
  if (trimmed.includes("@")) {
    if (!trimmed.endsWith(domainSuffix)) return null;
    local = trimmed.slice(0, -domainSuffix.length);
  } else {
    local = trimmed;
  }
  if (!local || !/^[a-z0-9._+-]+$/.test(local)) return null;
  if (isPrototypeKey(local)) return null;
  return local;
}

/** Dzisiejsza data w Warszawie jako "YYYY-MM-DD". */
export function warsawToday(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Warsaw" }).format(now);
}

/** null = bez daty (zawsze aktywna); inaczej aktywna do końca dnia `until` w Warszawie. */
export function isGrantActive(until: string | null, now: Date): boolean {
  if (until === null) return true;
  return warsawToday(now) <= until;
}

/** Najbliższy 31 maja licząc od dzisiejszej daty w Warszawie. */
export function defaultUntil(role: AssignableRole, now: Date): string | null {
  if (ROLE_DEFAULT_EXPIRY[role] !== "may31") return null;
  const today = warsawToday(now);
  const year = Number(today.slice(0, 4));
  const may31ThisYear = `${year}-05-31`;
  return today < may31ThisYear ? may31ThisYear : `${year + 1}-05-31`;
}

/** Liczba dni kalendarzowych (Warszawa) do `until` włącznie. */
export function daysLeft(until: string, now: Date): number {
  const today = warsawToday(now);
  const todayMs = Date.parse(`${today}T00:00:00Z`);
  const untilMs = Date.parse(`${until}T00:00:00Z`);
  return Math.round((untilMs - todayMs) / (1000 * 60 * 60 * 24));
}

/** Zawsze `SUPERADMIN_EMAIL`; `DEV_SUPERADMIN` dokładany tylko w development. */
export function superadminEmails(env: { NODE_ENV?: string; DEV_SUPERADMIN?: string }): string[] {
  const emails = [SUPERADMIN_EMAIL];
  if (env.NODE_ENV === "development" && env.DEV_SUPERADMIN) {
    const local = localPart(env.DEV_SUPERADMIN);
    if (local) emails.push(`${local}@${ALLOWED_DOMAIN}`);
  }
  return emails;
}

/** Śmieci -> `emptyStore()`; nieznane role i nieprawdziwe daty (albo nie-null)
 *  pomijane; klucze normalizowane przez `localPart`; nigdy nie rzuca. */
export function parseRolesStore(raw: unknown): RolesStore {
  const out = emptyStore();
  if (!raw || typeof raw !== "object") return out;
  const obj = raw as Record<string, unknown>;
  if (obj.v !== 1 || !obj.people || typeof obj.people !== "object") return out;
  for (const [key, value] of Object.entries(obj.people as Record<string, unknown>)) {
    const local = localPart(key);
    if (!local || !value || typeof value !== "object") continue;
    const entry = value as Record<string, unknown>;
    const r: Partial<Record<AssignableRole, string | null>> = {};
    if (entry.r && typeof entry.r === "object") {
      for (const [role, until] of Object.entries(entry.r as Record<string, unknown>)) {
        if (!ASSIGNABLE_ROLES.includes(role as AssignableRole)) continue;
        if (until === null) {
          r[role as AssignableRole] = null;
        } else if (typeof until === "string" && isValidDate(until)) {
          r[role as AssignableRole] = until;
        }
      }
    }
    const person: StoredPerson = { r };
    if (entry.b === true) person.b = true;
    out.people[local] = person;
  }
  return out;
}

/** Rozstrzyga dostęp konta: superadmin, blokada, aktywne role w kolejności
 *  `ASSIGNABLE_ROLES`, albo "normal" gdy brak aktywnych ról. */
export function resolveAccess(
  email: string,
  store: RolesStore,
  now: Date,
  env: { NODE_ENV?: string; DEV_SUPERADMIN?: string },
): ResolvedAccess {
  const local = localPart(email);
  if (local && superadminEmails(env).some((e) => localPart(e) === local)) {
    return { blocked: false, isSuperadmin: true, roles: [{ role: "superadmin", until: null }] };
  }
  const person = local ? ownPerson(store, local) : undefined;
  if (person?.b) {
    return { blocked: true, isSuperadmin: false, roles: [] };
  }
  const roles: RoleGrant[] = [];
  if (person) {
    for (const role of ASSIGNABLE_ROLES) {
      const until = person.r[role];
      if (until === undefined) continue;
      if (isGrantActive(until, now)) roles.push({ role, until });
    }
  }
  if (roles.length === 0) roles.push({ role: "normal", until: null });
  return { blocked: false, isSuperadmin: false, roles };
}

/** Brak wymagań = widzi każdy; superadmin widzi wszystko; inaczej część wspólna. */
export function canSee(
  required: readonly RoleId[] | undefined,
  access: Pick<ResolvedAccess, "isSuperadmin" | "roles">,
): boolean {
  if (!required || required.length === 0) return true;
  if (access.isSuperadmin) return true;
  const have = new Set(access.roles.map((g) => g.role));
  return required.some((r) => have.has(r));
}

/** Błąd edycji magazynu ról. */
export class RoleEditError extends Error {
  code: "email" | "superadmin" | "role" | "date";
  constructor(code: "email" | "superadmin" | "role" | "date", message: string) {
    super(message);
    this.code = code;
    this.name = "RoleEditError";
  }
}

/** Sprawdza adres: w domenie i nie superadmin. Zwraca `localPart` albo rzuca. */
function requireEditableLocal(email: string): string {
  const local = localPart(email);
  if (!local) throw new RoleEditError("email", "Adres poza domeną Samorządu albo nieprawidłowy");
  if (local === localPart(SUPERADMIN_EMAIL)) {
    throw new RoleEditError("superadmin", "Nie można edytować konta superadmina");
  }
  return local;
}

/** Kopia magazynu bez edycji wejścia - edycje zwracają nowy obiekt. */
function cloneStore(store: RolesStore): RolesStore {
  const people: Record<string, StoredPerson> = {};
  for (const [key, value] of Object.entries(store.people)) {
    people[key] = { r: { ...value.r }, ...(value.b ? { b: true } : {}) };
  }
  return { v: 1, people };
}

/**
 * Ustawia role osoby (zastępuje cały zestaw `r`, zachowuje blokadę). Pusty
 * `grants` i brak blokady -> osoba usuwana z magazynu. Rzuca `RoleEditError`
 * przy złym adresie, superadminie albo dacie, która nie jest prawdziwą datą
 * kalendarzową (patrz `isValidDate`) ani nullem.
 */
export function setPersonRoles(
  store: RolesStore,
  email: string,
  grants: Partial<Record<AssignableRole, string | null>>,
): RolesStore {
  const local = requireEditableLocal(email);
  const next = cloneStore(store);
  const r: Partial<Record<AssignableRole, string | null>> = {};
  for (const [role, until] of Object.entries(grants)) {
    if (!ASSIGNABLE_ROLES.includes(role as AssignableRole)) {
      throw new RoleEditError("role", `Nieznana rola: ${role}`);
    }
    if (until !== null && (typeof until !== "string" || !isValidDate(until))) {
      throw new RoleEditError("date", `Nieprawidłowa data: ${String(until)}`);
    }
    r[role as AssignableRole] = until;
  }
  const existing = ownPerson(next, local);
  const blocked = existing?.b === true;
  if (Object.keys(r).length === 0 && !blocked) {
    delete next.people[local];
  } else {
    next.people[local] = { r, ...(blocked ? { b: true } : {}) };
  }
  return next;
}

/**
 * Blokuje/odblokowuje osobę. Odblokowanie osoby bez ról usuwa ją z magazynu.
 * Rzuca `RoleEditError` dla złego adresu albo superadmina - także lokalnego
 * `DEV_SUPERADMIN` w development: zablokowanie konta, którym właśnie
 * testujesz panel, odcięłoby cię od niego (`resolveAccess` i tak puściłby
 * superadmina, ale wpis blokady wisiałby w magazynie bez sensu).
 */
export function setBlocked(
  store: RolesStore,
  email: string,
  blocked: boolean,
  env: { NODE_ENV?: string; DEV_SUPERADMIN?: string },
): RolesStore {
  const local = requireEditableLocal(email);
  if (superadminEmails(env).some((e) => localPart(e) === local)) {
    throw new RoleEditError("superadmin", "Nie można zablokować konta superadmina");
  }
  const next = cloneStore(store);
  const existing = ownPerson(next, local);
  const r = existing ? { ...existing.r } : {};
  if (!blocked && Object.keys(r).length === 0) {
    delete next.people[local];
  } else {
    next.people[local] = { r, ...(blocked ? { b: true } : {}) };
  }
  return next;
}

/**
 * Usuwa osobę z magazynu (jeśli jej tam nie ma, zwraca równoważną kopię).
 * Rzuca `RoleEditError` dla złego adresu albo superadmina - tak jak pozostałe
 * edycje, żeby panel nie zgłaszał „usunięto” przy koncie, którego nie da się
 * ruszyć.
 */
export function removePerson(store: RolesStore, email: string): RolesStore {
  const local = requireEditableLocal(email);
  const next = cloneStore(store);
  delete next.people[local];
  return next;
}

/** Osoba w panelu „Role i dostęp” - pełny adres zamiast skróconego klucza
 *  magazynu, role w kolejności `ASSIGNABLE_ROLES`. */
export interface PersonView {
  email: string;
  blocked: boolean;
  grants: { role: AssignableRole; until: string | null }[];
}

/** Magazyn -> lista dla panelu, alfabetycznie po adresie (stała kolejność,
 *  żeby wiersz nie skakał po zapisie). */
export function toPeopleView(store: RolesStore): PersonView[] {
  return Object.entries(store.people)
    .map(([local, person]) => ({
      email: `${local}@${ALLOWED_DOMAIN}`,
      blocked: person.b === true,
      grants: ASSIGNABLE_ROLES.filter((role) => person.r[role] !== undefined).map((role) => ({
        role,
        until: person.r[role] ?? null,
      })),
    }))
    .sort((a, b) => (a.email < b.email ? -1 : a.email > b.email ? 1 : 0));
}
