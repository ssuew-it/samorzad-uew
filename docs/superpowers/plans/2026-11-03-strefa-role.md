# Strefa Działacza: przycisk konta i role - plan wdrożenia

> **Dla wykonawcy:** WYMAGANY SUB-SKILL: `superpowers:subagent-driven-development`
> (zalecany) albo `superpowers:executing-plans`. Kroki mają pola wyboru (`- [ ]`).

**Cel:** Zalogowany działacz widzi w nawigacji swój avatar (wariant C), sesja
trwa 14 dni od ostatniego wejścia, a Strefa pokazuje narzędzia według ról
nadawanych przez superadmina (kontakt@) w panelu „Role i dostęp”, z blokadą
dostępu.

**Architektura:** Czysta logika ról i sesji w modułach bez Next
(`roles-core.ts`, `auth-core.ts`), testowana vitestem. Cienka warstwa
serwerowa: magazyn ról w Vercel Edge Config (odczyt SDK, zapis REST),
`access.ts` łączy sesję z rolami przy KAŻDYM żądaniu. Nawigacja pyta
`GET /api/auth/me` po stronie klienta, więc publiczne strony zostają statyczne.

**Stos:** Next.js 16.2 · React 19 · TypeScript · next-intl · motion/react ·
@phosphor-icons/react · Vercel Edge Config (nowa zależność) · vitest · playwright

**Specyfikacja:** `docs/superpowers/specs/2026-11-03-strefa-role-design.md`
(czytaj razem z planem).

## Ograniczenia globalne

- AGENTS.md: to NIE jest Next znany z treningu. Przed kodem route handlerów,
  akcji serwera i `cookies()` przeczytaj odpowiedni plik w
  `node_modules/next/dist/docs/`.
- Teksty strony: tylko zwykły dywiz „-”, nigdy „–” ani „—”.
- Każdy nowy tekst w `messages/pl.json` i `messages/en.json` (parytet pilnuje
  `src/lib/messages-coverage.test.ts`).
- WCAG obowiązkowo: klawiatura, focus widoczny, `prefers-reduced-motion`,
  kontrast, cele dotyku 44 px.
- Animacje płynne, nie kreskówkowe, CSS-first albo motion/react; bez shadcn,
  lucide, framer-motion. Ikony: phosphor. Tokeny z DESIGN.md / klas Tailwind
  używanych w `Nav.tsx` (`border-border-strong`, `bg-bg-elevated`,
  `text-ink-primary`, `text-accent`…).
- Layout i publiczne strony NIE czytają ciasteczek (statyczność).
- Przypisania osób do ról, blokady i adresy narzędzi nie trafiają do
  publicznego JS ani do `messages/*.json`.
- Superadmin: `kontakt@samorzad.ue.wroc.pl`, zaszyty w kodzie.
- Domena kont: `samorzad.ue.wroc.pl` (`ALLOWED_DOMAIN` z `auth-core.ts`).
- Sesja: 14 dni od ostatniej aktywności, odświeżenie ciasteczka najwyżej raz
  na 24 h.
- Role wygasają do końca dnia `until` w strefie `Europe/Warsaw`.
- Komentarze w kodzie po polsku, w stylu istniejących plików (wyjaśniają
  DLACZEGO).

## Review Focus

1. **Stare ciasteczka po wdrożeniu** (8-godzinne, bez `iat` i `picture`) - mają
   dalej działać i zostać odświeżone do nowego formatu, nie wylogować
   wszystkich. Test w Task 2.
2. **Adres wpisany w panelu z wielkimi literami, spacjami albo bez domeny**
   („ Jan.Kowalski@Samorzad.UE.wroc.pl ”, „jan.kowalski”) - ma trafić do tej
   samej osoby; adres spoza domeny odrzucony. Test w Task 1.
3. **Granica dnia wygaśnięcia** - 31 maja 23:30 czasu polskiego rola jeszcze
   działa, 1 czerwca 00:01 już nie (choć w UTC to wciąż 31 maja). Test w Task 1.
4. **Brak albo awaria Edge Config** - kontakt@ nadal wchodzi jako superadmin;
   przy błędzie odczytu pozostali NIE dostają dostępu (blokada mogłaby zniknąć),
   ale ich ciasteczko nie jest kasowane. Test w Task 3.
5. **Próba zablokowania / edycji kontakt@ albo wywołanie akcji panelu przez
   osobę bez superadmina** - odrzucone na serwerze. Testy w Task 1 i Task 7.

---

## Struktura plików

| Plik | Odpowiedzialność |
|---|---|
| `src/lib/roles-core.ts` (nowy) | Definicje ról, format magazynu, wygasanie, rozstrzyganie dostępu, edycja magazynu. Bez importów z Next. |
| `src/lib/roles-core.test.ts` (nowy) | Testy powyższego. |
| `src/lib/auth-core.ts` | Sesja 14 dni, `iat`, `picture`, `shouldRefresh`. |
| `src/lib/roles-store.ts` (nowy, `server-only`) | Odczyt/zapis Edge Config. |
| `src/lib/access.ts` (nowy, `server-only`) | `getAccess`, `requireAccess`, `getAccessFor`. |
| `src/lib/auth.ts` | `requireSession` zastąpione przez `requireAccess` (usuń, gdy nieużywane). |
| `src/app/api/auth/me/route.ts` (nowy) | Stan konta dla nawigacji + odświeżanie sesji. |
| `src/app/api/auth/callback/route.ts` | `picture`, 14 dni, odrzucenie zablokowanych. |
| `src/components/AccountMenu.tsx` (nowy) | Przycisk wariant C + menu (desktop i mobile). |
| `src/components/Nav.tsx` | Podpięcie `AccountMenu`. |
| `src/lib/panel.ts`, `strefa-dzialacza/page.tsx`, `StrefaDzialaczaContent.tsx` | Kafelki wg ról, komunikat blokady. |
| `src/app/[locale]/strefa-dzialacza/role/page.tsx` (nowy) | Panel „Role i dostęp”. |
| `src/components/strefa/RolePanel.tsx` (nowy) | UI panelu (klient). |
| `src/app/actions/role.ts` (nowy) | Akcje serwera panelu. |
| `messages/pl.json`, `messages/en.json` | Przestrzenie `account`, `roles`, `rolePanel`, klucz `strefaDzialacza.errorBlocked`. |
| `.env.example`, `docs/ENV.md` | Nowe zmienne. |
| `tests/account-menu.spec.ts` (nowy) | Playwright: przycisk z podstawionym `/api/auth/me`. |

---

### Task 1: Logika ról (czysta)

**Files:**
- Create: `src/lib/roles-core.ts`
- Test: `src/lib/roles-core.test.ts`

**Interfaces:**
- Consumes: `ALLOWED_DOMAIN` z `./auth-core`.
- Produces (dokładnie te nazwy):
  ```ts
  export type RoleId = "superadmin" | "zarzad" | "projekty" | "russ" | "admi" | "normal";
  export type AssignableRole = "zarzad" | "projekty" | "russ" | "admi";
  export const ASSIGNABLE_ROLES: readonly AssignableRole[]; // w tej kolejności
  export const SUPERADMIN_EMAIL = "kontakt@samorzad.ue.wroc.pl";
  /** Domyślna ważność: "may31" = najbliższy 31 maja, null = bez daty. */
  export const ROLE_DEFAULT_EXPIRY: Record<AssignableRole, "may31" | null>;
  // zarzad/projekty/russ -> "may31", admi -> null

  /** Wpis magazynu. Klucz `people` = część adresu przed @ (domena stała,
   *  oszczędza miejsce - Edge Config ma limit rozmiaru). */
  export interface StoredPerson { r: Partial<Record<AssignableRole, string | null>>; b?: true }
  export interface RolesStore { v: 1; people: Record<string, StoredPerson> }
  export interface RoleGrant { role: RoleId; until: string | null } // until: "YYYY-MM-DD"
  export interface ResolvedAccess { blocked: boolean; isSuperadmin: boolean; roles: RoleGrant[] }

  export function emptyStore(): RolesStore;
  export function parseRolesStore(raw: unknown): RolesStore;
  export function localPart(input: string): string | null;
  export function warsawToday(now: Date): string;
  export function isGrantActive(until: string | null, now: Date): boolean;
  export function defaultUntil(role: AssignableRole, now: Date): string | null;
  export function daysLeft(until: string, now: Date): number;
  export function superadminEmails(env: { NODE_ENV?: string; DEV_SUPERADMIN?: string }): string[];
  export function resolveAccess(email: string, store: RolesStore, now: Date, env: { NODE_ENV?: string; DEV_SUPERADMIN?: string }): ResolvedAccess;
  export function canSee(required: readonly RoleId[] | undefined, access: Pick<ResolvedAccess, "isSuperadmin" | "roles">): boolean;
  // Edycja - zwracają NOWY magazyn, nie mutują; rzucają RoleEditError przy złym wejściu.
  export class RoleEditError extends Error { code: "email" | "superadmin" | "role" | "date" }
  export function setPersonRoles(store: RolesStore, email: string, grants: Partial<Record<AssignableRole, string | null>>): RolesStore;
  export function setBlocked(store: RolesStore, email: string, blocked: boolean, env: { NODE_ENV?: string; DEV_SUPERADMIN?: string }): RolesStore;
  export function removePerson(store: RolesStore, email: string): RolesStore;
  ```

Zasady, których test nie wyczerpuje:
- `parseRolesStore`: śmieci → `emptyStore()`; nieznane role i daty niepasujące
  do `^\d{4}-\d{2}-\d{2}$` (albo nie-null) pomijane; klucze `people`
  normalizowane przez `localPart`; nigdy nie rzuca.
- `localPart`: trim + lowercase; przyjmuje pełny adres w domenie albo samą
  część lokalną; pusty, z innej domeny albo ze znakami spoza `[a-z0-9._+-]`
  → `null`.
- `warsawToday`: `Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Warsaw" })`.
- `isGrantActive`: `null` → true; inaczej `warsawToday(now) <= until`
  (porównanie napisów ISO).
- `defaultUntil` dla "may31": jeśli dziś (Warszawa) < `RRRR-05-31` → ten rok,
  inaczej rok następny.
- `resolveAccess`: superadmin (lista z `superadminEmails`) → `blocked:false`,
  role `[{superadmin,null}, ...aktywne zapisane]`. Zablokowany → `blocked:true,
  roles:[]`. Bez aktywnych ról → `[{normal,null}]`. Kolejność ról jak
  w `ASSIGNABLE_ROLES`.
- `superadminEmails`: zawsze `SUPERADMIN_EMAIL`; `DEV_SUPERADMIN` (po
  `localPart`, w domenie) dokładany TYLKO gdy `NODE_ENV === "development"`.
- `setPersonRoles`: pusty `grants` i brak blokady → osoba usuwana z magazynu;
  adres superadmina → `RoleEditError("superadmin")`; zła data → `"date"`.
- `setBlocked(…, false)` na osobie bez ról → usunięta z magazynu.

- [ ] **Step 1: Napisz testy**

```ts
import { describe, expect, it } from "vitest";
import * as R from "./roles-core";

const d = (iso: string) => new Date(iso);
const prod = { NODE_ENV: "production" };
const store = (people: R.RolesStore["people"]): R.RolesStore => ({ v: 1, people });

describe("localPart", () => {
  it("normalizuje adres i samą część lokalną", () => {
    expect(R.localPart(" Jan.Kowalski@Samorzad.UE.wroc.pl ")).toBe("jan.kowalski");
    expect(R.localPart("jan.kowalski")).toBe("jan.kowalski");
  });
  it("odrzuca obce domeny i śmieci", () => {
    for (const x of ["jan@gmail.com", "", "  ", "a b", "jan@samorzad.ue.wroc.pl.evil.com"])
      expect(R.localPart(x)).toBeNull();
  });
});

describe("wygasanie", () => {
  it("rola działa do końca 31 maja czasu polskiego", () => {
    expect(R.isGrantActive("2027-05-31", d("2027-05-31T21:30:00Z"))).toBe(true); // 23:30 PL
    expect(R.isGrantActive("2027-05-31", d("2027-05-31T22:01:00Z"))).toBe(false); // 00:01 PL 1.06
    expect(R.isGrantActive(null, d("2099-01-01T00:00:00Z"))).toBe(true);
  });
  it("domyślna data to najbliższy 31 maja", () => {
    expect(R.defaultUntil("zarzad", d("2026-11-03T12:00:00Z"))).toBe("2027-05-31");
    expect(R.defaultUntil("russ", d("2027-03-10T12:00:00Z"))).toBe("2027-05-31");
    expect(R.defaultUntil("projekty", d("2027-05-31T10:00:00Z"))).toBe("2028-05-31");
    expect(R.defaultUntil("zarzad", d("2027-06-01T10:00:00Z"))).toBe("2028-05-31");
    expect(R.defaultUntil("admi", d("2026-11-03T12:00:00Z"))).toBeNull();
  });
  it("daysLeft liczy dni kalendarzowe w Warszawie", () => {
    expect(R.daysLeft("2027-05-31", d("2027-05-01T10:00:00Z"))).toBe(30);
  });
});

describe("resolveAccess", () => {
  const now = d("2026-11-03T12:00:00Z");
  it("kontakt@ jest superadminem nawet bez magazynu i nie da się go zablokować", () => {
    const a = R.resolveAccess("kontakt@samorzad.ue.wroc.pl", store({ kontakt: { r: {}, b: true } }), now, prod);
    expect(a).toEqual({ blocked: false, isSuperadmin: true, roles: [{ role: "superadmin", until: null }] });
  });
  it("bez ról = normal, wygasła rola się nie liczy", () => {
    const s = store({ ala: { r: { zarzad: "2026-05-31" } } });
    expect(R.resolveAccess("ala@samorzad.ue.wroc.pl", s, now, prod).roles).toEqual([{ role: "normal", until: null }]);
  });
  it("kilka ról w stałej kolejności", () => {
    const s = store({ ala: { r: { admi: null, zarzad: "2027-05-31" } } });
    expect(R.resolveAccess("Ala@samorzad.ue.wroc.pl", s, now, prod).roles).toEqual([
      { role: "zarzad", until: "2027-05-31" },
      { role: "admi", until: null },
    ]);
  });
  it("zablokowany traci wszystko", () => {
    const s = store({ ala: { r: { admi: null }, b: true } });
    expect(R.resolveAccess("ala@samorzad.ue.wroc.pl", s, now, prod)).toEqual({ blocked: true, isSuperadmin: false, roles: [] });
  });
  it("DEV_SUPERADMIN działa tylko w development", () => {
    const env = { DEV_SUPERADMIN: "test@samorzad.ue.wroc.pl" };
    expect(R.resolveAccess("test@samorzad.ue.wroc.pl", R.emptyStore(), now, { ...env, NODE_ENV: "development" }).isSuperadmin).toBe(true);
    expect(R.resolveAccess("test@samorzad.ue.wroc.pl", R.emptyStore(), now, { ...env, NODE_ENV: "production" }).isSuperadmin).toBe(false);
  });
});

describe("canSee", () => {
  const zarzad = { isSuperadmin: false, roles: [{ role: "zarzad" as const, until: null }] };
  it("brak wymagań = każdy, superadmin = wszystko, inaczej część wspólna", () => {
    expect(R.canSee(undefined, zarzad)).toBe(true);
    expect(R.canSee(["admi"], zarzad)).toBe(false);
    expect(R.canSee(["admi", "zarzad"], zarzad)).toBe(true);
    expect(R.canSee(["superadmin"], { isSuperadmin: true, roles: [] })).toBe(true);
  });
});

describe("parseRolesStore", () => {
  it("odfiltrowuje śmieci i nie rzuca", () => {
    expect(R.parseRolesStore(null)).toEqual(R.emptyStore());
    expect(R.parseRolesStore({ v: 1, people: { "Ala": { r: { zarzad: "31.05.2027", hacker: null, admi: null } } } }))
      .toEqual(store({ ala: { r: { admi: null } } }));
  });
});

describe("edycja magazynu", () => {
  it("nadaje, zmienia i usuwa pustą osobę", () => {
    let s = R.setPersonRoles(R.emptyStore(), "Jan@samorzad.ue.wroc.pl", { zarzad: "2027-05-31" });
    expect(s.people.jan).toEqual({ r: { zarzad: "2027-05-31" } });
    s = R.setPersonRoles(s, "jan", {});
    expect(s.people.jan).toBeUndefined();
  });
  it("blokuje osobę bez ról, a odblokowanie ją usuwa", () => {
    let s = R.setBlocked(R.emptyStore(), "obcy@samorzad.ue.wroc.pl", true, prod);
    expect(s.people.obcy).toEqual({ r: {}, b: true });
    s = R.setBlocked(s, "obcy", false, prod);
    expect(s.people.obcy).toBeUndefined();
  });
  it("odrzuca superadmina, obcą domenę i złą datę", () => {
    expect(() => R.setBlocked(R.emptyStore(), "kontakt@samorzad.ue.wroc.pl", true, prod)).toThrow(R.RoleEditError);
    expect(() => R.setPersonRoles(R.emptyStore(), "kontakt", { admi: null })).toThrow(R.RoleEditError);
    expect(() => R.setPersonRoles(R.emptyStore(), "x@gmail.com", { admi: null })).toThrow(R.RoleEditError);
    expect(() => R.setPersonRoles(R.emptyStore(), "jan", { zarzad: "jutro" })).toThrow(R.RoleEditError);
  });
  it("nie mutuje wejścia", () => {
    const s = R.emptyStore();
    R.setPersonRoles(s, "jan", { admi: null });
    expect(s).toEqual(R.emptyStore());
  });
});
```

- [ ] **Step 2: Uruchom - ma paść**

Run: `npx vitest run src/lib/roles-core.test.ts`
Expected: FAIL (brak modułu `./roles-core`).

- [ ] **Step 3: Zaimplementuj `src/lib/roles-core.ts`** według Interfaces i zasad wyżej.

- [ ] **Step 4: Uruchom - ma przejść**

Run: `npx vitest run src/lib/roles-core.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/roles-core.ts src/lib/roles-core.test.ts
git commit -m "feat(strefa): logika ról - wygasanie, superadmin, blokada, edycja magazynu"
```

---

### Task 2: Sesja 14 dni ze zdjęciem i odświeżaniem

**Files:**
- Modify: `src/lib/auth-core.ts` (`SESSION_TTL_MS`, `Session`, `signSession`, `verifyToken`, `IdTokenClaims`)
- Modify: `src/app/api/auth/callback/route.ts:85-91` (picture, `maxAge`)
- Test: `src/lib/auth-core.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;
  export const SESSION_MAX_AGE_S = 60 * 60 * 24 * 14; // maxAge ciasteczka
  export const SESSION_REFRESH_MS = 1000 * 60 * 60 * 24;
  export interface Session { email: string; name: string; picture?: string; iat: number; exp: number }
  export function signSession(data: { email: string; name: string; picture?: string }): Promise<string>;
  // ustawia iat = now, exp = now + SESSION_TTL_MS
  export function shouldRefresh(session: Session, now: number): boolean; // now - iat >= SESSION_REFRESH_MS
  export function safePicture(url: unknown): string | undefined;
  // tylko https:// na hoście kończącym się na ".googleusercontent.com", inaczej undefined
  ```
  `IdTokenClaims` dostaje `picture?: string`.
- `verifyToken`: token bez `iat` (stary format) jest ważny, dostaje
  `iat = exp - 8 h` (czyli `shouldRefresh` → true). `picture` przepuszczane
  przez `safePicture`.

- [ ] **Step 1: Dopisz testy** (i popraw istniejący „odrzuca wygasłą sesję”:
  przesunięcie 9 h → 15 dni)

```ts
import { SESSION_REFRESH_MS, safePicture, shouldRefresh } from "./auth-core";

describe("sesja 14 dni", () => {
  it("żyje 13 dni, umiera po 15", async () => {
    vi.useFakeTimers();
    const token = await signSession({ email: "a@samorzad.ue.wroc.pl", name: "Ala" });
    vi.advanceTimersByTime(1000 * 60 * 60 * 24 * 13);
    expect(await verifyToken(token)).not.toBeNull();
    vi.advanceTimersByTime(1000 * 60 * 60 * 24 * 2);
    expect(await verifyToken(token)).toBeNull();
  });
  it("odświeżenie dopiero po dobie", async () => {
    const s = (await verifyToken(await signSession({ email: "a@samorzad.ue.wroc.pl", name: "Ala" })))!;
    expect(shouldRefresh(s, s.iat + SESSION_REFRESH_MS - 1)).toBe(false);
    expect(shouldRefresh(s, s.iat + SESSION_REFRESH_MS)).toBe(true);
  });
  it("stary token bez iat i picture działa i od razu prosi o odświeżenie", async () => {
    // podpisz ręcznie payload {email,name,exp} tym samym sekretem (HMAC jak w signSession)
    const s = await verifyToken(await podpiszStary({ email: "a@samorzad.ue.wroc.pl", name: "Ala", exp: Date.now() + 3600_000 }));
    expect(s?.picture).toBeUndefined();
    expect(shouldRefresh(s!, Date.now())).toBe(true);
  });
  it("zdjęcie tylko z googleusercontent po https", () => {
    expect(safePicture("https://lh3.googleusercontent.com/a/xyz=s96-c")).toBe("https://lh3.googleusercontent.com/a/xyz=s96-c");
    for (const x of ["http://lh3.googleusercontent.com/a", "https://evil.com/a.png", "javascript:alert(1)", 42, undefined])
      expect(safePicture(x)).toBeUndefined();
  });
});
```
(`podpiszStary` to pomocnik w pliku testu: HMAC-SHA256 przez `crypto.subtle`
na `b64url(JSON)`, dokładnie jak `signSession` przed zmianą.)

- [ ] **Step 2: Uruchom - ma paść**

Run: `npx vitest run src/lib/auth-core.test.ts`
Expected: FAIL (brak `shouldRefresh`, `safePicture`; sesja żyje 8 h).

- [ ] **Step 3: Zaimplementuj zmiany w `auth-core.ts`; w callbacku** przekaż
  `picture: safePicture(claims.picture)` do `signSession` i ustaw
  `maxAge: SESSION_MAX_AGE_S`.

- [ ] **Step 4: Uruchom testy i typy**

Run: `npx vitest run src/lib/auth-core.test.ts && npx tsc --noEmit`
Expected: PASS, brak błędów typów.

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth-core.ts src/lib/auth-core.test.ts src/app/api/auth/callback/route.ts
git commit -m "feat(strefa): sesja 14 dni od ostatniej wizyty, zdjęcie z Google w sesji"
```

---

### Task 3: Magazyn ról i dostęp na serwerze

**Files:**
- Create: `src/lib/roles-store.ts`, `src/lib/access.ts`, `src/lib/access.test.ts`
- Modify: `src/lib/auth.ts` (usuń `requireSession`, gdy po Tasku 6 nic go nie używa; tu już można przepiąć)
- Modify: `src/app/api/auth/callback/route.ts` (blokada)
- Modify: `src/app/actions/tresci.ts`, `strefa-dzialacza/tresci/page.tsx`, `strefa-dzialacza/generator-stopki/page.tsx` (`requireAccess` / `getAccess` zamiast `requireSession` / `getSession`)
- Modify: `package.json` (zależność SDK)
- Modify: `.env.example`, `docs/ENV.md`

**Interfaces:**
- Consumes: Task 1 (`RolesStore`, `parseRolesStore`, `resolveAccess`, `canSee`, `emptyStore`, `RoleId`), Task 2 (`Session`, `verifyToken`, `SESSION_COOKIE`).
- Produces:
  ```ts
  // roles-store.ts (import "server-only")
  export const ROLES_KEY = "role";
  export type StoreRead = { ok: true; store: RolesStore; configured: boolean } | { ok: false };
  export function readRolesStore(): Promise<StoreRead>;
  // brak EDGE_CONFIG -> { ok:true, store: emptyStore(), configured:false }; wyjątek SDK -> { ok:false }
  export function canWriteRoles(): boolean; // EDGE_CONFIG_ID && VERCEL_API_TOKEN
  export function writeRolesStore(store: RolesStore): Promise<void>; // rzuca przy !res.ok

  // access.ts (import "server-only")
  export interface Access { session: Session; isSuperadmin: boolean; roles: RoleGrant[] }
  export function getAccessFor(session: Session | null, read: StoreRead, now: Date): Access | null | "blocked";
  // czysta (testowalna): null sesja -> null; read.ok=false -> superadmin dostaje Access, reszta null;
  // zablokowany -> "blocked"; inaczej Access
  export function getAccess(): Promise<Access | null>; // cookies() + readRolesStore() + getAccessFor; "blocked" -> null
  export function requireAccess(locale: string, roles?: readonly RoleId[]): Promise<Access>;
  // brak dostępu albo !canSee(roles) -> redirect(`/${pl|en}/strefa-dzialacza`)
  ```
- Odczyt: SDK Vercela dla Edge Config. Produkt nazywa się teraz „Global
  Config”; sprawdź na npm, który pakiet jest bieżący (`@vercel/edge-config`
  albo `@vercel/global-config`), i użyj jego `get(ROLES_KEY)` ze zmienną
  `EDGE_CONFIG` (connection string). Wynik przez `parseRolesStore`. Odczyt
  nie może być cache'owany między żądaniami (strony Strefy i tak są dynamiczne
  przez `cookies()`; sprawdź w `node_modules/next/dist/docs/`, czy `fetch` SDK
  nie wpada w cache danych).
- Zapis: `PATCH https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`
  (+ `?teamId=${VERCEL_TEAM_ID}`, gdy ustawione), nagłówek
  `Authorization: Bearer ${VERCEL_API_TOKEN}`, body
  `{ items: [{ operation: "upsert", key: "role", value: store }] }`.
- Callback: po `isAllowedIdentity` czyta magazyn; `getAccessFor(...)` ===
  `"blocked"` → `back("blocked")`; `read.ok === false` i nie superadmin →
  `back("auth")`. Ciasteczka nie ustawia w obu przypadkach.
- Nowe zmienne w `.env.example` i `docs/ENV.md` (z opisem po polsku jak
  istniejące): `EDGE_CONFIG`, `EDGE_CONFIG_ID`, `VERCEL_API_TOKEN` (token na
  koncie Samorządu, zakres tylko ten projekt/zespół), `VERCEL_TEAM_ID`
  (opcjonalnie), `DEV_SUPERADMIN` (tylko lokalnie).

- [ ] **Step 1: Napisz testy `getAccessFor`** (`src/lib/access.test.ts`;
  `vi.mock("server-only", () => ({}))` oraz `vi.mock("next/headers")`,
  `vi.mock("next/navigation")`, bo testujemy tylko czystą funkcję)

```ts
const now = new Date("2026-11-03T12:00:00Z");
const ses = (email: string) => ({ email, name: "X", iat: now.getTime(), exp: now.getTime() + 1e9 });
const ok = (people = {}) => ({ ok: true as const, configured: true, store: { v: 1 as const, people } });

it("brak sesji -> null", () => expect(getAccessFor(null, ok(), now)).toBeNull());
it("awaria magazynu: superadmin wchodzi, reszta nie", () => {
  expect(getAccessFor(ses("kontakt@samorzad.ue.wroc.pl"), { ok: false }, now)).toMatchObject({ isSuperadmin: true });
  expect(getAccessFor(ses("ala@samorzad.ue.wroc.pl"), { ok: false }, now)).toBeNull();
});
it("brak konfiguracji: wszyscy normal", () => {
  const a = getAccessFor(ses("ala@samorzad.ue.wroc.pl"), { ok: true, configured: false, store: { v: 1, people: {} } }, now);
  expect(a && a !== "blocked" && a.roles).toEqual([{ role: "normal", until: null }]);
});
it("zablokowany -> blocked", () =>
  expect(getAccessFor(ses("ala@samorzad.ue.wroc.pl"), ok({ ala: { r: {}, b: true } }), now)).toBe("blocked"));
```

Plus test `writeRolesStore` z `vi.stubGlobal("fetch", …)` w
`src/lib/roles-store.test.ts`: sprawdza URL (z `teamId`), metodę `PATCH`,
nagłówek Bearer i body `{ items: [{ operation: "upsert", key: "role", value }] }`;
odpowiedź 403 → rzuca.

- [ ] **Step 2: Uruchom - ma paść**

Run: `npx vitest run src/lib/access.test.ts src/lib/roles-store.test.ts`
Expected: FAIL (brak modułów).

- [ ] **Step 3: Doinstaluj SDK i zaimplementuj** `roles-store.ts`, `access.ts`,
  zmiany w callbacku, przepięcie `tresci` (akcja: `getAccess()`; brak → return)
  i stron `tresci` / `generator-stopki` na `requireAccess(locale)`; zmienne w
  `.env.example` i `docs/ENV.md`.

- [ ] **Step 4: Testy, typy, lint**

Run: `npx vitest run && npx tsc --noEmit && npm run lint`
Expected: wszystko PASS.

- [ ] **Step 5: Commit**

```bash
git add -A src/lib src/app package.json package-lock.json .env.example docs/ENV.md
git commit -m "feat(strefa): role z Edge Config sprawdzane przy każdym żądaniu, blokada przy logowaniu"
```

---

### Task 4: Endpoint `GET /api/auth/me`

**Files:**
- Create: `src/app/api/auth/me/route.ts`
- Test: `src/app/api/auth/me/route.test.ts` (dopisz `src/app/**/*.test.ts` do
  `include` w `vitest.config.ts`, jeśli wzorzec go nie łapie - obecny łapie
  `src/**/*.test.ts`, więc powinno działać)

**Interfaces:**
- Consumes: `verifyToken`, `shouldRefresh`, `signSession`, `SESSION_COOKIE`,
  `SESSION_MAX_AGE_S` (Task 2); `readRolesStore` (Task 3), `getAccessFor` (Task 3).
- Produces (kontrakt dla Task 5):
  ```ts
  export type MeResponse = {
    name: string; email: string; picture?: string;
    isSuperadmin: boolean;
    roles: { role: RoleId; until: string | null }[];
  };
  ```
  Eksportuj typ z `src/lib/access.ts` (nie z pliku trasy), żeby komponent
  kliencki mógł zrobić `import type`.
- Zachowanie (`export const runtime = "nodejs"`, zawsze
  `Cache-Control: no-store`):
  - brak/zła sesja → 401 `{}`;
  - `"blocked"` → 401 i `cookies.delete(SESSION_COOKIE)`;
  - `null` przez awarię magazynu (sesja ważna) → 503 `{}`, ciasteczko zostaje;
  - inaczej 200 `MeResponse`; gdy `shouldRefresh` → nowy token z tymi samymi
    `email/name/picture` i `maxAge: SESSION_MAX_AGE_S`, `httpOnly`, `secure`
    przy https, `sameSite: "lax"`, `path: "/"` (jak w callbacku).
  - Trasa czyta `req.cookies` (NextRequest), nie `cookies()` - łatwiej testować.

- [ ] **Step 1: Napisz testy** (`vi.mock("@/lib/roles-store")` zwracające
  sterowany `StoreRead`; `vi.mock("server-only", () => ({}))`; token przez
  prawdziwe `signSession` z `AUTH_SECRET` jak w `auth-core.test.ts`)

```ts
it("bez ciasteczka 401 i no-store", async () => {
  const res = await GET(new NextRequest("http://localhost/api/auth/me"));
  expect(res.status).toBe(401);
  expect(res.headers.get("cache-control")).toContain("no-store");
});
it("zalogowany dostaje role, bez odświeżenia w pierwszej dobie", async () => {
  const res = await GET(req(await signSession({ email: "ala@samorzad.ue.wroc.pl", name: "Ala" })));
  expect(await res.json()).toMatchObject({ name: "Ala", isSuperadmin: false, roles: [{ role: "normal", until: null }] });
  expect(res.cookies.get("ssuew_session")).toBeUndefined();
});
it("po dobie odświeża ciasteczko na 14 dni", async () => { /* fake timers +25 h */
  // expect(res.cookies.get("ssuew_session")?.maxAge).toBe(60 * 60 * 24 * 14)
});
it("zablokowany: 401 i skasowane ciasteczko", async () => { /* store z b:true; cookie value "" */ });
it("awaria magazynu: 503, ciasteczko zostaje", async () => { /* readRolesStore -> {ok:false} */ });
```

- [ ] **Step 2: Uruchom - ma paść**

Run: `npx vitest run src/app/api/auth/me/route.test.ts`
Expected: FAIL (brak trasy).

- [ ] **Step 3: Zaimplementuj trasę.** Dopisz w `src/proxy.ts` nic - trasa
  jest pod `/api`, więc przy zamkniętym serwisie przechodzi tylko z kluczem
  podglądu, tak jak reszta (to poprawne).

- [ ] **Step 4: Uruchom - ma przejść**

Run: `npx vitest run src/app/api/auth/me/route.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/auth/me src/lib/access.ts
git commit -m "feat(strefa): /api/auth/me - stan konta dla nawigacji i przedłużanie sesji"
```

---

### Task 5: Przycisk konta w nawigacji (wariant C)

**Files:**
- Create: `src/components/AccountMenu.tsx`
- Modify: `src/components/Nav.tsx:298-303` (desktop) i pasek mobilny obok przycisku menu (`:305`)
- Modify: `messages/pl.json`, `messages/en.json` (przestrzenie `account`, `roles`)
- Create: `tests/account-menu.spec.ts`

**Interfaces:**
- Consumes: `import type { MeResponse } from "@/lib/access"` (tylko typ!),
  `GET /api/auth/me` (Task 4), `POST /api/auth/logout?locale=…` (istnieje).
- Produces: `export function AccountMenu({ variant }: { variant: "desktop" | "mobile" })`.
  Oba warianty dzielą jeden stan; najprościej: hook `useAccount()` w tym samym
  pliku z modułowym cache'em obietnicy, żeby dwa egzemplarze nie pytały
  `/api/auth/me` dwa razy.

Zachowanie:
- Niezalogowany (401): desktop - dokładnie obecny `Link` z tekstem
  `nav.login` („Zaloguj się” / „Log in”, te same klasy co dziś
  w `Nav.tsx:300`); mobile - nic (link zostaje w rozwijanym menu).
- Zalogowany, desktop: ramka jak dziś (`h-11 rounded-md border
  border-border-strong`), w środku avatar 32 px z zieloną kropką (8 px,
  obwódka w kolorze tła) w prawym dolnym rogu, tekst `account.strefa`
  („Strefa Działacza” / „Members area”), `CaretDown`.
  Mobile: sam avatar z kropką w przycisku 44×44, `xl:hidden`, przed przyciskiem
  menu.
- Avatar: `<img referrerPolicy="no-referrer" alt="">` (nazwa dostępna jest na
  przycisku), `onError` → inicjały (pierwsze litery dwóch pierwszych słów
  `name`) na gradiencie `#2C4BFF` → granat.
- Nazwa dostępna przycisku: `account.buttonLabel` = „Konto: {name}, zalogowano”.
- Menu: wzorzec disclosure (`aria-expanded`, `aria-controls`), nie ARIA menu.
  Zawartość jak w specu, sekcja 2 (avatar 44 px, imię, e-mail mono, „Twoje
  role” z chipami `roles.<id>` + „do {date}” w formacie `dd.MM.yyyy`, linki
  „Panel działacza”, „Role i dostęp” tylko gdy `isSuperadmin`, „Wyloguj się”
  jako formularz POST jak w `StrefaDzialaczaContent.tsx:36`).
- Esc i klik poza menu zamykają; po Esc focus wraca na przycisk; zmiana trasy
  zamyka menu.
- Animacja: opacity + scale 0.97 → 1, `transform-origin` prawy górny róg,
  ok. 160 ms ease-out; przy reduced motion samo opacity.
- Bez skoku układu: ostatni znany stan (`{name, picture}`) w `localStorage`
  pod kluczem `ssuew-konto` (try/catch); render od razu z podpowiedzi, potem
  potwierdzenie z `/api/auth/me`. 401 czyści podpowiedź; 503 i błąd sieci
  zostawiają bieżący stan. Wysłanie formularza wylogowania czyści podpowiedź.
- Teksty (`account` PL / EN): `strefa` „Strefa Działacza” / „Members area”;
  `buttonLabel` „Konto: {name}, zalogowano” /
  „Account: {name}, signed in”; `yourRoles` „Twoje role” / „Your roles”;
  `until` „do {date}” / „until {date}”; `panel` „Panel działacza” / „Member
  panel”; `rolesAccess` „Role i dostęp” / „Roles and access”; `logout`
  „Wyloguj się” / „Sign out”. `roles` PL: Superadmin, Zarząd, Projekty, RUSS,
  Komisja Administracji, Działacz; EN: Superadmin, Board, Projects, RUSS,
  Administration Committee, Member.

- [ ] **Step 1: Napisz test Playwright** (`tests/account-menu.spec.ts`;
  `page.route("**/api/auth/me", …)` podstawia odpowiedź, zgoda jak w
  `navigation.spec.ts`)

```ts
const me = { name: "Ala Kowalska", email: "ala@samorzad.ue.wroc.pl", isSuperadmin: true,
  roles: [{ role: "superadmin", until: null }, { role: "zarzad", until: "2027-05-31" }] };

test("niezalogowany widzi zwykły przycisk", async ({ page }) => {
  await page.route("**/api/auth/me", (r) => r.fulfill({ status: 401, body: "{}" }));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/pl");
  await expect(page.getByRole("navigation", { name: /./ }).first().getByRole("link", { name: "Zaloguj się", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Konto:/ })).toHaveCount(0);
});

test("zalogowany: przycisk konta, menu z rolami, Esc zamyka", async ({ page }) => {
  await page.route("**/api/auth/me", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(me) }));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/pl");
  const btn = page.getByRole("button", { name: /Konto: Ala Kowalska/ });
  await btn.click();
  await expect(btn).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("do 31.05.2027")).toBeVisible();
  await expect(page.getByRole("link", { name: "Role i dostęp" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(btn).toHaveAttribute("aria-expanded", "false");
  await expect(btn).toBeFocused();
});

test("mobile 375 px: avatar na pasku, bez poziomego przewijania", async ({ page }) => { /* jak wyżej, viewport 375 */ });
```

- [ ] **Step 2: Build i uruchomienie testu - ma paść**

Run: `npm run build && npx playwright test tests/account-menu.spec.ts`
Expected: FAIL (brak przycisku konta).

- [ ] **Step 3: Zaimplementuj `AccountMenu`, podepnij w `Nav.tsx`, dodaj teksty.**

- [ ] **Step 4: Build, test, a11y, parytet tekstów**

Run: `npm run build && npx playwright test tests/account-menu.spec.ts tests/navigation.spec.ts tests/a11y.spec.ts && npx vitest run src/lib/messages-coverage.test.ts`
Expected: PASS. Dodatkowo zrzut ekranu obu motywów (jasny/ciemny) na 1440
i 375 px - porównaj z wariantem C z rozmowy (ramka bez zmian, avatar z kropką).

- [ ] **Step 5: Commit**

```bash
git add src/components/AccountMenu.tsx src/components/Nav.tsx messages tests/account-menu.spec.ts
git commit -m "feat(nav): przycisk konta z avatarem Google i menu z rolami (wariant C)"
```

---

### Task 6: Kafelki według ról i komunikat blokady

**Files:**
- Modify: `src/lib/panel.ts` (pole `roles`, nowy kafelek „Role i dostęp”)
- Modify: `src/app/[locale]/strefa-dzialacza/page.tsx`
- Modify: `src/components/pages/StrefaDzialaczaContent.tsx:119-127`
- Modify: `messages/pl.json`, `messages/en.json` (`strefaDzialacza.errorBlocked`, opis kafelka nie - opisy kafelków są w `panel.ts`)
- Modify: `src/lib/auth.ts` (usuń `requireSession`/`getSession`, jeśli nic ich nie używa)

**Interfaces:**
- Consumes: `getAccess`, `canSee`, `RoleId`.
- Produces: `PanelTile.roles?: RoleId[]` (brak = każdy zalogowany).
- Strona: `const access = await getAccess()`; `user` = `access ? { name } : null`;
  `tiles = access ? panelTiles.filter(t => canSee(t.roles, access)) : []`.
- Kafelek: `{ name: "Role i dostęp", desc: "Kto ma jakie role w Strefie, daty ważności i blokady dostępu.", url: "", internal: "/strefa-dzialacza/role", roles: ["superadmin"] }`.
  Pozostałe kafelki bez `roles` (przypisanie ustalimy osobno).
- `error === "blocked"` → `t("errorBlocked")`: PL „Twój dostęp do Strefy
  został zablokowany. Jeśli to pomyłka, napisz na
  kontakt@samorzad.ue.wroc.pl.” EN „Your access to the Members' Area has been
  blocked. If this is a mistake, write to kontakt@samorzad.ue.wroc.pl.”

- [ ] **Step 1: Napisz test spójności kafelków** (sam filtr to `canSee`,
  przetestowany w Task 1): `src/lib/panel.test.ts` z
  `vi.mock("server-only", () => ({}))`:

```ts
it("kafelek Role i dostęp widzi tylko superadmin", () => {
  const tile = panelTiles.find((t) => t.internal === "/strefa-dzialacza/role")!;
  expect(canSee(tile.roles, { isSuperadmin: false, roles: [{ role: "zarzad", until: null }] })).toBe(false);
  expect(canSee(tile.roles, { isSuperadmin: true, roles: [] })).toBe(true);
});
it("każda rola w kafelkach istnieje", () => {
  const znane = new Set(["superadmin", ...ASSIGNABLE_ROLES, "normal"]);
  for (const t of panelTiles) for (const r of t.roles ?? []) expect(znane.has(r)).toBe(true);
});
```

- [ ] **Step 2: Uruchom - ma paść**

Run: `npx vitest run src/lib/panel.test.ts`
Expected: FAIL (brak kafelka).

- [ ] **Step 3: Zaimplementuj** zmiany w `panel.ts`, stronie, komponencie i tekstach.

- [ ] **Step 4: Testy, typy, lint**

Run: `npx vitest run && npx tsc --noEmit && npm run lint`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/panel.ts src/lib/panel.test.ts src/lib/auth.ts src/app/[locale]/strefa-dzialacza/page.tsx src/components/pages/StrefaDzialaczaContent.tsx messages
git commit -m "feat(strefa): kafelki według ról i komunikat o zablokowanym dostępie"
```

---

### Task 7: Panel „Role i dostęp”

**Files:**
- Create: `src/app/actions/role.ts`, `src/app/actions/role.test.ts`
- Create: `src/app/[locale]/strefa-dzialacza/role/page.tsx`
- Create: `src/components/strefa/RolePanel.tsx`
- Modify: `messages/pl.json`, `messages/en.json` (przestrzeń `rolePanel`)

**Interfaces:**
- Consumes: `getAccess`, `requireAccess` (Task 3); `readRolesStore`,
  `writeRolesStore`, `canWriteRoles` (Task 3); `setPersonRoles`, `setBlocked`,
  `removePerson`, `RoleEditError`, `defaultUntil`, `daysLeft`,
  `isGrantActive`, `ASSIGNABLE_ROLES`, `ROLE_DEFAULT_EXPIRY` (Task 1).
- Produces:
  ```ts
  // role.ts ("use server")
  export type RoleActionResult =
    | { ok: true; people: PersonView[] }
    | { ok: false; error: "forbidden" | "email" | "superadmin" | "role" | "date" | "read" | "write" | "notConfigured" };
  export interface PersonView { email: string; blocked: boolean; grants: { role: AssignableRole; until: string | null }[] }
  export function savePersonRoles(email: string, grants: Partial<Record<AssignableRole, string | null>>): Promise<RoleActionResult>;
  export function setPersonBlocked(email: string, blocked: boolean): Promise<RoleActionResult>;
  export function deletePerson(email: string): Promise<RoleActionResult>;
  // Każda: getAccess() -> !isSuperadmin => "forbidden"; !canWriteRoles() => "notConfigured";
  // readRolesStore() -> !ok => "read"; edycja (RoleEditError.code -> error);
  // writeRolesStore() wyjątek => "write"; sukces => people z ZAPISANEGO magazynu
  // (nie czytamy ponownie: Edge Config propaguje zmiany z kilkusekundowym opóźnieniem).
  export function toPeopleView(store: RolesStore): PersonView[]; // e-mail = localPart + "@samorzad.ue.wroc.pl", sort alfabetyczny
  ```
  `PersonView` i `toPeopleView` trzymaj w `roles-core.ts` (czyste), a w
  `role.ts` tylko je reeksportuj typem, bo plik `"use server"` może
  eksportować wyłącznie funkcje asynchroniczne.
- Strona: `requireAccess(locale, ["superadmin"])`, czyta magazyn, przekazuje
  `people`, `canWrite`, `today = warsawToday(new Date())` do `RolePanel`.
  `robots: noindex`, `PageHero` + okruszki jak na stronie Strefy.
- `RolePanel` (klient):
  - Lista osób: e-mail (mono), chipy ról z „do dd.MM.yyyy”; chip roli
    wygasającej w ≤ 30 dni ma oznaczenie „wygasa za {n} dni”; rola już
    wygasła - wyszarzona z napisem „wygasła”; osoba zablokowana - wyraźna
    etykieta „Zablokowany dostęp”.
  - Edycja osoby (rozwijana w miejscu): przy każdej z 4 ról checkbox + pole
    daty (`<input type="date">`), dla nowo zaznaczonej roli podpowiedź
    `defaultUntil`, przycisk „Bez daty”; „Zapisz”, „Usuń osobę”.
  - „Dodaj osobę”: pole adresu (przyjmuje pełny adres albo samą część przed
    @, pokazuje sufiks domeny), te same pola ról.
  - „Zablokuj dostęp” / „Odblokuj” przy osobie + „Zablokuj adres” dla osoby
    spoza listy. Blokada wymaga potwierdzenia (`<dialog>` z opisem skutku:
    „Ta osoba zostanie wylogowana przy następnym kliknięciu i nie zaloguje się
    ponownie, dopóki jej nie odblokujesz.”).
  - `canWrite === false` → komunikat, których zmiennych brakuje, kontrolki
    wyłączone.
  - Błędy akcji jako `role="alert"` z tekstem `rolePanel.errors.<kod>`;
    sukces jako `role="status"`.
  - Komunikaty i etykiety PL + EN w `rolePanel` (konkretne brzmienie wybiera
    wykonawca, ton jak reszta Strefy, tylko dywiz „-”).

- [ ] **Step 1: Testy akcji** (`role.test.ts`; mocki `@/lib/access`
  (`getAccess`), `@/lib/roles-store`, `server-only`)

```ts
it("bez superadmina: forbidden i brak zapisu", async () => {
  getAccess.mockResolvedValue({ isSuperadmin: false, roles: [{ role: "zarzad", until: null }], session });
  expect(await savePersonRoles("jan", { admi: null })).toEqual({ ok: false, error: "forbidden" });
  expect(writeRolesStore).not.toHaveBeenCalled();
});
it("superadmin nadaje rolę - zapis i widok z zapisanego magazynu", async () => {
  asSuperadmin();
  const r = await savePersonRoles("Jan@samorzad.ue.wroc.pl", { zarzad: "2027-05-31" });
  expect(writeRolesStore).toHaveBeenCalledWith({ v: 1, people: { jan: { r: { zarzad: "2027-05-31" } } } });
  expect(r).toEqual({ ok: true, people: [{ email: "jan@samorzad.ue.wroc.pl", blocked: false, grants: [{ role: "zarzad", until: "2027-05-31" }] }] });
});
it("blokada kontakt@ odrzucona", async () => {
  asSuperadmin();
  expect(await setPersonBlocked("kontakt@samorzad.ue.wroc.pl", true)).toEqual({ ok: false, error: "superadmin" });
});
it("awaria zapisu zwraca write", async () => {
  asSuperadmin(); writeRolesStore.mockRejectedValue(new Error("403"));
  expect(await deletePerson("jan")).toEqual({ ok: false, error: "write" });
});
it("bez konfiguracji: notConfigured", async () => { asSuperadmin(); canWriteRoles.mockReturnValue(false); /* … */ });
```

- [ ] **Step 2: Uruchom - ma paść**

Run: `npx vitest run src/app/actions/role.test.ts`
Expected: FAIL (brak modułu).

- [ ] **Step 3: Zaimplementuj** `toPeopleView` w `roles-core.ts` (z testem
  sortowania w `roles-core.test.ts`), akcje, stronę, `RolePanel`, teksty.

- [ ] **Step 4: Testy i ręczna weryfikacja**

Run: `npx vitest run && npx tsc --noEmit && npm run lint && npm run build`
Expected: PASS.
Ręcznie (`npm run dev`, `DEV_SUPERADMIN` ustawiony na własne konto, Edge
Config podpięty): dodaj osobę z rolą zarząd (podpowiada 31.05.2027), zmień
datę, zablokuj w drugiej przeglądarce zalogowaną osobę i sprawdź, że po
kliknięciu traci Strefę, a ponowne logowanie kończy się komunikatem
o blokadzie; odblokuj. Klawiatura: cały panel obsługiwalny bez myszy,
`<dialog>` łapie i oddaje focus.

- [ ] **Step 5: Commit**

```bash
git add src/app/actions/role.ts src/app/actions/role.test.ts "src/app/[locale]/strefa-dzialacza/role" src/components/strefa/RolePanel.tsx src/lib/roles-core.ts src/lib/roles-core.test.ts messages
git commit -m "feat(strefa): panel Role i dostęp dla superadmina z datami ważności i blokadą"
```

---

### Task 8: Uruchomienie na Vercelu (razem z Mikołajem)

Nie da się tego zrobić bez właściciela konta - wykonawca przygotowuje kroki
i przechodzi je z Mikołajem.

- [ ] **Step 1:** W projekcie Vercela utwórz magazyn Edge Config (Global
  Config) i połącz go z projektem - Vercel sam doda `EDGE_CONFIG`. Dodaj item
  `role` z wartością `{"v":1,"people":{}}`.
- [ ] **Step 2:** Na koncie Samorządu (administracja-ssuew) utwórz token API
  o najwęższym zakresie (zespół projektu) i dodaj `VERCEL_API_TOKEN`,
  `EDGE_CONFIG_ID` (oraz `VERCEL_TEAM_ID`, jeśli projekt jest w zespole) do
  zmiennych Production i Preview. Sprawdź w panelu limity Edge Config dla
  planu projektu (rozmiar magazynu, liczba zapisów) i zapisz je w
  `docs/ENV.md`.
- [ ] **Step 3:** Wdróż, zaloguj się kontem kontakt@, otwórz „Role i dostęp”,
  dodaj jedną osobę testową, sprawdź jej widok i blokadę.
- [ ] **Step 4:** Commit dokumentacji z limitami.

```bash
git add docs/ENV.md
git commit -m "docs: limity Edge Config i konfiguracja ról w Strefie"
```
