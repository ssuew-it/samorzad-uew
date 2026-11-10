# Strefa Działacza - rejestr zarządzeń, brama, karta Działacza Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strefa Działacza dostaje rejestr wszystkich zarządzeń (z arkusza „Treści strony”), nagłówek z bramą, kartę Działacza z czerwonym wylogowaniem, link do LEX-a Uczelni i nowe teksty.

**Architecture:** Czysta logika (parser zakładki, budowa rejestru ze stanami, filtrowanie) w `src/lib` z testami Vitest. Strona Strefy pobiera rejestr na serwerze dopiero po sprawdzeniu sesji i przekazuje go do klienckiego komponentu listy. Nagłówek i karta to komponenty prezentacyjne na tokenach serwisu.

**Tech Stack:** Next.js 16 (App Router, `[locale]`), next-intl, Tailwind v4, @phosphor-icons/react, Vitest, Playwright + @axe-core/playwright, sharp.

**Spec:** `docs/superpowers/specs/2026-11-08-strefa-dzialacza-design.md`

## Global Constraints

- Teksty strony: tylko „-”, nigdy „—” ani „–”; „Działacz/Działacze/Działaczy” zawsze wielką literą; pełne nazwy („Rada Uczelniana Samorządu Studentów”, „Uniwersytet Ekonomiczny we Wrocławiu”).
- Teksty PL dokładnie jak w sekcji „Teksty (zatwierdzone 8.11.2026)” specu; EN tłumaczy implementujący (tytuły zarządzeń zostają po polsku).
- Wewnętrzne zarządzenia nigdy w HTML/RSC dla niezalogowanego; nigdy na `/zarzadzenia-przewodniczacego`.
- WCAG 2.1 AA: kontrast ≥ 4,5:1 (tekst), fokus widoczny, `prefers-reduced-motion` wyłącza ruch; axe bez naruszeń.
- Ikony tylko z `@phosphor-icons/react`; bez shadcn/lucide/framer.
- Nowe przestrzenie tłumaczeń: po zmianie komunikatów `npm run i18n:namespaces`.
- Commity kończą się linią `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; nie dodawać `docs/mobile/findings.json`, `public/photos/hero/*`, `.impeccable/`, `PRODUCT.md`, `graphify-out/`.
- LEX Uczelni: `https://lbd.ue.wroc.pl/183-logowanie/?ReturnUrl=%2f`.

## Review Focus

1. Ten sam numer w dwóch wierszach (np. wklejony dwa razy) - drugi wiersz to błąd „numer … już jest w wierszu …”, rejestr pokazuje jeden wpis.
2. Odnośnik „Uchyla”/„Zmienia” zapisany inną wielkością liter albo ze spacjami (`01/zrz-sido/2026-2027 `) - dopasowuje się do zarządzenia; nieistniejący numer = błąd wiersza, bez zmiany stanu innych.
3. Zarządzenie wskazujące samo siebie w „Uchyla” - błąd wiersza, nie „uchylone”.
4. Wyszukiwanie bez polskich znaków („obieg dokumentow”, „zrz-sido”) znajduje „obiegu dokumentów” i `01/ZRZ-SIDO/…`.
5. Wejście z linkiem `#z-…` do zarządzenia uchylonego albo spoza 6 najnowszych - lista się rozwija, uchylone się włączają, wiersz jest przewinięty.

---

### Task 1: Rejestr zarządzeń - logika, parser zakładki, odczyt z arkusza

**Files:**
- Create: `src/lib/zarzadzenia-wewnetrzne.ts`, `src/lib/zarzadzenia-wewnetrzne.test.ts`
- Create: `src/lib/tresci/parse-zarzadzenia-wewnetrzne.ts`, `src/lib/tresci/parse-zarzadzenia-wewnetrzne.test.ts`
- Modify: `src/lib/tresci/index.ts` (TABS + `getRejestrZarzadzen`), `src/lib/tresci/arkusz.ts:7-8` (komentarz „dane i tak są publiczne” - dopisać, że zakładka „Zarządzenia wewnętrzne” nie jest publikowana na stronie, a PDF-y chroni udostępnianie domenie), `src/app/[locale]/strefa-dzialacza/tresci/page.tsx:42-44` (status nowej zakładki na liście)

**Interfaces:**
- Consumes: `Zarzadzenie` (`src/lib/zarzadzenia.ts`), `RowError` i `parseSheetDate` (`src/lib/tresci/parse-terminy.ts`), `csvRecords` (`src/lib/csv.ts`; klucze znormalizowane: `wydajacy`, `numer`, `data`, `tytul`, `link`, `uchyla`, `zmienia`), `getZarzadzeniaData`, `readTab`, `TabStatus`.
- Produces:
  ```ts
  // src/lib/zarzadzenia-wewnetrzne.ts (bez "server-only" - używa go też klient)
  export type GrupaWydajacego = "przewodniczacy" | "wiceprzewodniczacy" | "czlonek" | "zarzad";
  export interface ZarzadzenieWewn { line: number; number: string; date: string; title: string; issuer: string; group: GrupaWydajacego | null; href?: string; repeals: string[]; amends: string[] }
  export interface PozycjaRejestru { id: string; number: string; date: string; title: string; issuer: string; group: GrupaWydajacego | null; href?: string; repeals: string[]; amends: string[]; repealedBy: string[]; amendedBy: string[] }
  export function grupaWydajacego(issuer: string): GrupaWydajacego | null;
  export function kluczNumeru(n: string): string;      // bez spacji, wielkie litery
  export function idZarzadzenia(n: string): string;    // "01/ZRZ-SIDO/2026-2027" -> "z-01-zrz-sido-2026-2027"
  export function zbudujRejestr(wewn: ZarzadzenieWewn[], przewodniczacego: Zarzadzenie[]): { items: PozycjaRejestru[]; errors: RowError[] };
  // src/lib/tresci/parse-zarzadzenia-wewnetrzne.ts
  export function parseZarzadzeniaWewnetrzne(csv: string): { items: ZarzadzenieWewn[]; errors: RowError[] };
  // src/lib/tresci/index.ts
  TABS.zarzadzeniaWewnetrzne = "Zarządzenia wewnętrzne";
  export async function getRejestrZarzadzen(): Promise<{ items: PozycjaRejestru[]; status: TabStatus }>;
  ```
  W `PozycjaRejestru` pola `repeals`/`amends`/`repealedBy`/`amendedBy` trzymają numery w brzmieniu z wiersza docelowego (tak je pokazujemy i po nich linkujemy).

- [ ] **Step 1: Testy logiki** w `src/lib/zarzadzenia-wewnetrzne.test.ts`:
  - `grupaWydajacego`: „Przewodniczący” i „Przewodnicząca” → `przewodniczacy`; „Wiceprzewodniczący ds. Strategii i Działań Operacyjnych” i „Wiceprzewodnicząca ds. Projektów” → `wiceprzewodniczacy`; „Członek Zarządu ds. Filii w Jeleniej Górze” i „Członkini Zarządu ds. X” → `czlonek`; „Zarząd” → `zarzad`; „Komisja Rewizyjna” → `null`.
  - `idZarzadzenia("01/ZRZ-SIDO/2026-2027")` → `"z-01-zrz-sido-2026-2027"`; `kluczNumeru(" 01/zrz-sido/2026-2027 ")` → `"01/ZRZ-SIDO/2026-2027"`.
  - `zbudujRejestr`: Y (`02/ZRZ-SIDO/2026-2027`, `repeals: ["01/zrz-sido/2026-2027 "]`) → pozycja X ma `repealedBy: ["02/ZRZ-SIDO/2026-2027"]`, Y ma `repeals: ["01/ZRZ-SIDO/2026-2027"]`; to samo dla `amends`/`amendedBy`.
  - Nieistniejący numer w `repeals` → `errors` zawiera `{ line: <linia Y>, message }` z tym numerem, inne pozycje bez `repealedBy`.
  - Numer wskazujący sam siebie → błąd, `repealedBy` puste.
  - Duplikat numeru → drugi wiersz w `errors` (wiadomość z numerem pierwszej linii), w `items` jedna pozycja.
  - Zarządzenie Przewodniczącego (`number: "1/2026/2027"`) wchodzi z `issuer: "Przewodniczący"`, `group: "przewodniczacy"`, `title` z `title.pl`, `href` z `href`, i może być celem `repeals`.
  - Kolejność: data malejąco, przy tej samej dacie numer malejąco (`localeCompare` z `numeric: true`).

- [ ] **Step 2: Run** `npx vitest run src/lib/zarzadzenia-wewnetrzne.test.ts` - Expected: FAIL (brak modułu).

- [ ] **Step 3: Implementacja** `src/lib/zarzadzenia-wewnetrzne.ts` według Interfaces. Grupa: prefiks po `toLowerCase()` - „wiceprzewodnicz” przed „przewodnicz”, „członek zarządu”/„członkini zarządu”, dokładnie „zarząd”. Błędy po polsku i po ludzku, jak w `parse-zarzadzenia.ts` („w „Uchyla” jest numer 01/…, a takiego zarządzenia nie ma w arkuszu - popraw numer”).

- [ ] **Step 4: Run** test z kroku 2 - Expected: PASS.

- [ ] **Step 5: Testy parsera** w `parse-zarzadzenia-wewnetrzne.test.ts` (CSV z nagłówkiem `Wydający,Numer,Data,Tytuł,Link,Uchyla,Zmienia`):
  - poprawny wiersz → `ZarzadzenieWewn` z `line`, `group`, `repeals` rozbitymi po przecinku i obciętymi z pustych;
  - brak numeru / tytułu / zła data / brak „Wydający” → błąd, wiersz pominięty;
  - „Wydający” spoza grup → błąd, ale wiersz zostaje z `group: null`;
  - zły link (nie `https?://`) → błąd, wiersz bez `href` (zachowanie jak `parseZarzadzenia`).

- [ ] **Step 6: Run** `npx vitest run src/lib/tresci/parse-zarzadzenia-wewnetrzne.test.ts` - Expected: FAIL; potem implementacja `parseZarzadzeniaWewnetrzne` na `csvRecords` + `parseSheetDate`; Expected: PASS.

- [ ] **Step 7: Odczyt z arkusza** - w `src/lib/tresci/index.ts` dodać `TABS.zarzadzeniaWewnetrzne` i `getRejestrZarzadzen()`: `fromSheet(TABS.zarzadzeniaWewnetrzne, parseZarzadzeniaWewnetrzne, [])` (bez kopii z kodu) + `getZarzadzeniaData()`, potem `zbudujRejestr`; błędy odnośników dopisać do `status.errors`. Strona `/strefa-dzialacza/tresci` dokłada `status` z `getRejestrZarzadzen()` do listy zakładek (po „Zarządzenia”). Poprawić komentarz w `arkusz.ts`.

- [ ] **Step 8: Run** `npx tsc --noEmit -p . && npx vitest run` - Expected: wszystko PASS.

- [ ] **Step 9: Commit**
  ```bash
  git add src/lib/zarzadzenia-wewnetrzne.ts src/lib/zarzadzenia-wewnetrzne.test.ts src/lib/tresci/parse-zarzadzenia-wewnetrzne.ts src/lib/tresci/parse-zarzadzenia-wewnetrzne.test.ts src/lib/tresci/index.ts src/lib/tresci/arkusz.ts "src/app/[locale]/strefa-dzialacza/tresci/page.tsx"
  git commit -m "feat(strefa): rejestr zarządzeń - zakładka „Zarządzenia wewnętrzne”, stany uchyla/zmienia"
  ```

### Task 2: Widok rejestru - filtrowanie i cel z linku

**Files:**
- Create: `src/lib/rejestr-widok.ts`, `src/lib/rejestr-widok.test.ts`

**Interfaces:**
- Consumes: `PozycjaRejestru`, `GrupaWydajacego`, `idZarzadzenia` (Task 1).
- Produces:
  ```ts
  export const NA_START = 6;
  export interface FiltrRejestru { q: string; grupa: GrupaWydajacego | "wszyscy"; uchylone: boolean }
  export function filtrujRejestr(items: PozycjaRejestru[], f: FiltrRejestru): PozycjaRejestru[];
  export function celZHash(hash: string, items: PozycjaRejestru[]): PozycjaRejestru | null; // "#z-01-…" albo "z-01-…"
  ```

- [ ] **Step 1: Testy** w `rejestr-widok.test.ts`:
  - `uchylone: false` ukrywa pozycje z niepustym `repealedBy`, `true` je pokazuje;
  - `grupa: "czlonek"` zostawia tylko `group === "czlonek"`; `"wszyscy"` zostawia też `group: null`;
  - `q: "obieg dokumentow"` znajduje tytuł „W sprawie zasad obiegu dokumentów”; `q: "zrz-sido"` znajduje `01/ZRZ-SIDO/2026-2027`; `q: "  "` = brak filtra;
  - `celZHash("#z-01-zrz-sido-2026-2027", items)` → ta pozycja; `celZHash("", items)` i nieznany → `null`.
- [ ] **Step 2: Run** `npx vitest run src/lib/rejestr-widok.test.ts` - Expected: FAIL.
- [ ] **Step 3: Implementacja** - normalizacja wyszukiwania: `NFD`, usunięcie znaków łączących, `ł→l`, małe litery, spacje zwinięte; dopasowanie po numerze lub tytule (każde słowo frazy musi wystąpić).
- [ ] **Step 4: Run** - Expected: PASS.
- [ ] **Step 5: Commit** `git add src/lib/rejestr-widok.ts src/lib/rejestr-widok.test.ts && git commit -m "feat(strefa): filtrowanie rejestru zarządzeń i cel z linku"`

### Task 3: Sekcja ZARZĄDZENIA w Strefie (z LEX-em Uczelni)

**Files:**
- Create: `src/components/strefa/RejestrZarzadzen.tsx` (`"use client"`)
- Modify: `src/app/[locale]/strefa-dzialacza/page.tsx` (pobranie rejestru tylko gdy `access`), `src/components/pages/StrefaDzialaczaContent.tsx` (prop `rejestr: PozycjaRejestru[]`, sekcja pod kafelkami), `messages/pl.json` i `messages/en.json` (`strefaDzialacza.rejestr.*`), `src/i18n/client-namespaces.generated.ts` (przez `npm run i18n:namespaces`)
- Test: `tests/strefa-panel.spec.ts` (nowy)

**Interfaces:**
- Consumes: `getRejestrZarzadzen` (Task 1), `filtrujRejestr`, `celZHash`, `NA_START` (Task 2).
- Produces: `RejestrZarzadzen({ items }: { items: PozycjaRejestru[] })`; klucz `sessionStorage` `"ssuew-strefa-cel"` (zapisuje Task 4 przy logowaniu, czyta ten komponent).

Komunikaty `strefaDzialacza.rejestr` (PL dokładnie): `heading` „Zarządzenia”, `lex` „LEX Uczelni”, `search` „Szukaj po numerze lub tytule”, `issuer` „Wydający”, `groups` {`wszyscy` „Wszyscy”, `przewodniczacy` „Przewodniczący”, `wiceprzewodniczacy` „Wiceprzewodniczący”, `czlonek` „Członkowie Zarządu”, `zarzad` „Zarząd”}, `showRepealed` „Pokaż uchylone”, `repeals` „uchyla {nr}”, `amends` „zmienia {nr}”, `amendedBy` „zmienione zarządzeniem {nr}”, `repealedBy` „uchylone zarządzeniem {nr}”, `copyLink` „Kopiuj link”, `copied` „Skopiowano”, `showAll` „Pokaż wszystkie ({n})”, `collapse` „Zwiń”, `empty` „W arkuszu nie ma jeszcze żadnego zarządzenia.”, `noResults` „Nic nie pasuje do „{q}”.”

Zachowanie (spec, sekcja „Strona główna Strefy - układ”, pkt 4): nagłówek `h2` z tekstem „Zarządzenia” w `[font-variant-caps:all-small-caps]`; w tym samym wierszu link-pigułka z ikoną `Scales` → LEX, `target="_blank"`, nazwa dostępna `LEX Uczelni (otwiera się w nowej karcie)` (`common.newTab`); jedna linia narzędzi (pole wyszukiwania z etykietą, `select` „Wydający”, checkbox „Pokaż uchylone”); lista `ul`, wiersz `li id={item.id}`; tytuł jako link do PDF w nowej karcie, gdy `href`; etykiety stanu jako linki `#id` (klik włącza uchylone, gdy cel jest uchylony); `NA_START` wierszy + przycisk `aria-expanded`; „Kopiuj link” kopiuje `${location.origin}${location.pathname}#${id}`, potem „Skopiowano” przez 2 s (`aria-live="polite"`). Na starcie: cel z `location.hash` albo z `sessionStorage["ssuew-strefa-cel"]` (po odczycie usunąć) → rozwiń, włącz uchylone gdy trzeba, przewiń, wyróżnij wiersz (tło akcentu, bez animacji przy ograniczonym ruchu).

- [ ] **Step 1: Test e2e** `tests/strefa-panel.spec.ts` (sesja jak w `tests/signature-generator.spec.ts`: ciasteczko `ssuew_session` podpisane `TEST_AUTH_SECRET`, `reducedMotion: "reduce"`, zgoda `rejected`). Serwer testowy nie ma arkusza, więc lista jest pusta:
  ```ts
  test("po zalogowaniu: sekcja Zarządzenia z LEX-em i pustym stanem", async ({ page }) => {
    await page.goto("/pl/strefa-dzialacza");
    await expect(page.getByRole("heading", { level: 2, name: "Zarządzenia" })).toBeVisible();
    const lex = page.getByRole("link", { name: /LEX Uczelni/ });
    await expect(lex).toHaveAttribute("href", "https://lbd.ue.wroc.pl/183-logowanie/?ReturnUrl=%2f");
    await expect(lex).toHaveAttribute("target", "_blank");
    await expect(page.getByText("W arkuszu nie ma jeszcze żadnego zarządzenia.")).toBeVisible();
  });
  test("niezalogowany nie dostaje sekcji zarządzeń", async ({ browser }) => { /* nowy kontekst bez ciasteczka */
    // goto /pl/strefa-dzialacza → heading „Zarządzenia” count 0, a w page.content() brak „rejestr”-owych danych (np. tekstu „Kopiuj link”)
  });
  ```
- [ ] **Step 2: Run** `npx next build && npx playwright test tests/strefa-panel.spec.ts` - Expected: FAIL (brak sekcji).
- [ ] **Step 3: Implementacja** komponentu, przekazania danych w `page.tsx` (`const rejestr = access ? (await getRejestrZarzadzen()).items : []`), komunikatów PL/EN, `npm run i18n:namespaces`.
- [ ] **Step 4: Run** build + spec - Expected: PASS. Dodatkowo `npx vitest run` - PASS.
- [ ] **Step 5: Commit** `git add src/components/strefa/RejestrZarzadzen.tsx "src/app/[locale]/strefa-dzialacza/page.tsx" src/components/pages/StrefaDzialaczaContent.tsx messages/pl.json messages/en.json src/i18n/client-namespaces.generated.ts tests/strefa-panel.spec.ts && git commit -m "feat(strefa): sekcja Zarządzenia z wyszukiwarką, stanami i LEX-em Uczelni"`

### Task 4: Nagłówek z bramą, karta Działacza, NARZĘDZIA, nowe teksty

**Files:**
- Create: `src/components/strefa/StrefaHero.tsx`, `public/strefa/brama.webp`
- Modify: `src/app/[locale]/strefa-dzialacza/page.tsx` (StrefaHero zamiast PageHero), `src/components/pages/StrefaDzialaczaContent.tsx` (karta, wylogowanie, NARZĘDZIA, zapis celu przy logowaniu), `messages/pl.json`, `messages/en.json`, `tests/role-panel.spec.ts:43` (nowy tytuł), `tests/strefa-panel.spec.ts`

**Interfaces:**
- Consumes: `Access.roles: RoleGrant[]` (`role`, `until`), komunikaty `roles.*`, `PageHero`-owe `Breadcrumbs`.
- Produces: `StrefaHero({ eyebrow, title, lead, breadcrumbs, lit }: { eyebrow: string; title: string; lead: string; breadcrumbs: { label: string; href?: string }[]; lit: boolean })`.

Ustalenia: brama z `scripts/sig-src/brama.png` → `public/strefa/brama.webp` wysokości 460 px (2× wyświetlanej 230 px): `npx sharp`-em albo jednorazowo `node -e` z `sharp(...).resize({height:460}).webp({quality:82})`. Tło granatowe z siatką (jak makieta `strefa-v2.html`), tekst po lewej na przyciemnieniu, brama po prawej; `lit=false` → brama `opacity` ok. 0,55 bez poświaty; `lit=true` → poświata (radialny gradient za bramą) z łagodnym wejściem, brak ruchu przy `prefers-reduced-motion`. Poniżej `sm`: brama w prawym górnym rogu, ok. 120 px, `opacity` ok. 0,35, tekst na całą szerokość. `h1` = tytuł. Karta: avatar (`picture` albo inicjały), „Cześć, {name}!”, pigułki ról: `roles.<role>` + „do {data}” (`d.MM.yyyy`) albo „bez daty końca”; brak ról → jedna pigułka `roles.normal`. Wylogowanie: ten sam formularz POST, przycisk pełny czerwony (`bg-red-700`, biały tekst, hover ciemniejszy) z ikoną `SignOut`. Nagłówek narzędzi: tekst „Narzędzia”, `[font-variant-caps:all-small-caps]`, bez ikony. Przycisk logowania: `onClick` zapisuje `location.hash` (gdy niepusty) do `sessionStorage["ssuew-strefa-cel"]` w `try/catch`.

Teksty PL (`strefaDzialacza.*`) dokładnie wg specu: `heroEyebrow` „Strefa Działacza”, `heroTitle` i `panelTitle` „Wszystko do działania w jednym miejscu”, `heroLead` (pkt 3), `panelLead` (pkt 15), `cardBody` (pkt 5), `errorDomain` (pkt 8), `noAccessBody` (pkt 12), `toolsHeading` „Narzędzia”, nowe `roleUntil` „do {date}”, `roleNoEnd` „bez daty końca”, `metaDesc` (opis strony ze specu).

- [ ] **Step 1: Testy e2e** - dopisać do `tests/strefa-panel.spec.ts`:
  - niezalogowany: `h1` „Wszystko do działania w jednym miejscu”, tekst „Strefa jest dostępna tylko dla kont w domenie @samorzad.ue.wroc.pl.” widoczny, axe (`include("main")`) bez naruszeń;
  - zalogowany: „Cześć, Ala Kowalska!” (albo imię z sesji testowej), pigułka „Działacz”, `heading level 2 "Narzędzia"`, przycisk „Wyloguj się” widoczny, axe bez naruszeń (przed skanem: czekać aż `h1` ma `opacity: 1` i `document.getAnimations()` nic nie gra);
  - w `tests/role-panel.spec.ts:43` zmienić oczekiwany `h1` na „Wszystko do działania w jednym miejscu”.
- [ ] **Step 2: Run** build + `npx playwright test tests/strefa-panel.spec.ts tests/role-panel.spec.ts` - Expected: FAIL.
- [ ] **Step 3: Implementacja** StrefaHero, karta, komunikaty PL/EN, obraz bramy.
- [ ] **Step 4: Run** build + oba specy + `tests/account-menu.spec.ts` - Expected: PASS.
- [ ] **Step 5: Kontrola wzrokowa** - zrzuty `/pl/strefa-dzialacza` (zalogowany i nie) przy 360×800 i 1280×900, jasny i ciemny motyw; tekst nagłówka czytelny, brama nie zachodzi na tekst, brak poziomego przewijania.
- [ ] **Step 6: Commit** `git add src/components/strefa/StrefaHero.tsx public/strefa/brama.webp "src/app/[locale]/strefa-dzialacza/page.tsx" src/components/pages/StrefaDzialaczaContent.tsx messages/pl.json messages/en.json tests/strefa-panel.spec.ts tests/role-panel.spec.ts && git commit -m "feat(strefa): nagłówek z bramą, karta Działacza z rolami, czerwone wylogowanie, nowe teksty"`

### Task 5: Opisy narzędzi i instrukcja arkusza

**Files:**
- Modify: `src/lib/panel.ts` (opisy i ramka), `docs/JAK-EDYTOWAC.md` (sekcja „Zarządzenia wewnętrzne”)
- Test: `src/lib/panel.test.ts`

- [ ] **Step 1: Test** w `panel.test.ts`: kafelek „Generator stopki mailowej” ma `notice` zawierający `01/ZRZ-SIDO/2026-2027` i bez „…”; żaden `desc` ani `notice` nie zawiera „—” ani „–”.
- [ ] **Step 2: Run** `npx vitest run src/lib/panel.test.ts` - Expected: FAIL (ramka ma „…/2026”).
- [ ] **Step 3: Opisy** - `desc` wszystkich kafelków i `notice` dokładnie jak w specu (sekcja „Opisy kafelków”); usunąć komentarz „ZAŚLEPKA” przy ramce.
- [ ] **Step 4: Instrukcja** - w `docs/JAK-EDYTOWAC.md` sekcja „Zarządzenia wewnętrzne”: zakładka o dokładnej nazwie „Zarządzenia wewnętrzne”, kolumny (tabela ze specu), przykład wiersza (`Wiceprzewodniczący ds. Strategii i Działań Operacyjnych`, `01/ZRZ-SIDO/2026-2027`, data, tytuł, link), lista rozwijana „Wydający” (Dane → Weryfikacja danych → lista funkcji), „Chroń zakres” na zakładce, PDF na Dysku udostępniony tylko domenie `samorzad.ue.wroc.pl`, gdzie widać błędy (podgląd „Treści strony”).
- [ ] **Step 5: Run** `npx vitest run` - Expected: PASS.
- [ ] **Step 6: Commit** `git add src/lib/panel.ts src/lib/panel.test.ts docs/JAK-EDYTOWAC.md && git commit -m "feat(strefa): ludzkie opisy narzędzi, numer zarządzenia o stopce, instrukcja zakładki zarządzeń"`
