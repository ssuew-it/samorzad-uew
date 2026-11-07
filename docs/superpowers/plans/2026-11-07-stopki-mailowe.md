# Stopki mailowe: nowa karta - plan wdrożenia

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generator w Strefie Działacza daje nową stopkę-kartę (pasek ikon | dane nad logo | grafika) w dwóch wersjach: codziennej z animowaną grafiką i lżejszej do masówek z Huntera.

**Architecture:** `src/lib/signature.ts` zostaje jedynym źródłem HTML stopki (tabele + style w atrybutach). `buildSignature` dostaje drugi argument `variant`. Kolumny dane/grafika to dwie tabele `align="left"` w jednej komórce karty: obok siebie, gdy jest miejsce, jedna pod drugą na telefonie, bez media queries. Grafiki powstają skryptami (sharp dla PNG, PIL dla GIF) i leżą w `public/sig/`.

**Tech Stack:** Next.js 16, TypeScript, vitest, sharp (z node_modules), Python 3 + Pillow 12 (tylko do GIF-a), Playwright (kontrola podglądów).

**Spec:** `docs/superpowers/specs/2026-11-07-stopki-mailowe-design.md`

## Global Constraints

- Kolor logo, ikon i linków: `#1477b5`. W stopce nie ma `#2C4BFF`.
- Logo: pozioma wersja w całości (znak + napis), 44 px wysokości, tylko proporcjonalne skalowanie.
- Font w każdej komórce z tekstem: `font-family:Arial,Helvetica,sans-serif;mso-line-height-rule:exactly;` (stała `FONT`).
- Obrazki tylko z `${BASE}/sig/...` (`NEXT_PUBLIC_SIG_BASE`, domyślnie `https://samorzad.ue.wroc.pl`), z `width`/`height` w atrybutach, nigdy `data:`.
- Bez `<div`, `class=`, `display:flex`, `background-image`. `border-radius` dozwolony tylko na ramce karty i paska (Outlook pokaże proste rogi).
- Każdy tekst od użytkownika przez `esc()`. Linki do stron zawsze `https://` + adres bez protokołu.
- Teksty interfejsu w `messages/pl.json` i `messages/en.json` (namespace `generatorStopki`). Tylko zwykły „-”, nigdy „—” ani „–”.
- Alt logo: „Samorząd Studentów Uniwersytetu Ekonomicznego we Wrocławiu”. Ta pełna nazwa jest też w wersji tekstowej.
- Grafika: hasło „Działamy · Wspieramy · Inspirujemy” zawsze w całości, nigdy przecięte paskami. Z Higgsfielda żadnych wygenerowanych ludzi ani zmyślonych wydarzeń, obiekty na przezroczystym tle.
- GIF wersji codziennej do 300 KB, pierwsza klatka to samodzielna, gotowa kompozycja (Outlook desktop pokazuje tylko ją).

## Review Focus

1. Bardzo długie stanowisko (ok. 70 znaków) - łamie się w kolumnie danych, karta nie rośnie wszerz (Task 3: kontrola Playwright z długą funkcją).
2. Ekran 360 px - grafika spada pod dane, brak poziomego przewijania (Task 3: `scrollWidth <= 360` w podglądzie „telefon”).
3. Pusty e-mail i pusty telefon - nie zostaje ikona koperty ani pusty wiersz, a gdy nie ma żadnej ikony, nie zostaje pusta ramka paska (Task 2: testy).
4. Pole „Strona” z `javascript:` lub cudzysłowem - link zawsze `https://…`, atrybut nie pęka (Task 2: test).
5. Ciemny motyw - logo czytelne, bo ma białą podkładkę w pliku (Task 1: wymiar i nieprzezroczysty narożnik pliku; Task 3: zrzut trybów ciemnych).

---

### Task 1: Grafiki stopki (wersja tymczasowa)

**Files:**
- Create: `scripts/build-signature-assets.mjs`
- Create (wynik skryptu): `public/sig/logo-h.png`, `public/sig/grafika.png`, `public/sig/grafika-mala.png`
- Test: `src/lib/signature-assets.test.ts`

**Interfaces:**
- Produces: pliki o wymiarach (2× rozmiar wyświetlany): `logo-h.png` 384×112 (wyświetlany 192×56), `grafika.png` 400×270 (200×135), `grafika-mala.png` 240×162 (120×81).

- [ ] **Step 1: Napisz test** `signature-assets.test.ts`: dla każdego pliku `sharp(path).metadata()` zwraca dokładne wymiary jak wyżej; `logo-h.png` ma nieprzezroczysty lewy górny narożnik po wcięciu 8 px (piksel (8,8) alpha = 255) - biała podkładka na ciemny motyw; `grafika.png` ma przezroczysty piksel (10, 10) (ścięty skosem lewy górny róg) i nieprzezroczysty piksel (390, 135).
- [ ] **Step 2: Uruchom** `npx vitest run src/lib/signature-assets.test.ts` - Expected: FAIL (brak plików).
- [ ] **Step 3: Napisz skrypt** `build-signature-assets.mjs` (sharp):
  - logo: `public/logo-dark.svg` przemalowane na `#1477b5` (podmiana fill jak w makiecie `logo-poziome-niebieskie.svg`), wyrenderowane na 88 px wysokości, wyśrodkowane na białym zaokrąglonym prostokącie 384×112, promień 16 px;
  - grafika: `public/sig/banner.jpg` przycięta „cover” z zakotwiczeniem prawy-dół (hasło musi zostać całe), skalowana do 400×270 i 240×162, maska SVG: lewy brzeg ścięty po skosie (polygon 22% 0, 100% 0, 100% 100%, 0 100%), zaokrąglone rogi (promień 20 / 12 px), białe paski 115° tylko w lewych 46% szerokości, wygaszane ku prawej (jak `.p1 i` w `logo-rozmiar-v2.html`).
  Skrypt nadpisuje pliki i wypisuje wymiary oraz wagę każdego.
- [ ] **Step 4: Uruchom** `node scripts/build-signature-assets.mjs`, potem test - Expected: PASS. Obejrzyj pliki (Read) - hasło całe, paski tylko z lewej.
- [ ] **Step 5: Commit** `feat(stopki): grafiki nowej stopki - logo poziome #1477b5, kadry grafiki`.

### Task 2: Nowy HTML stopki w dwóch wersjach

**Files:**
- Modify: `src/lib/signature.ts` (całe `buildSignature`, `buildSignaturePlain`, `SignatureData`, `SIGNATURE_DEFAULTS`; `previewDocument` i `signatureDocument` bez zmian)
- Modify: `src/lib/signature.test.ts` (przepisany)

**Interfaces:**
- Consumes: pliki i wymiary z Task 1.
- Produces:
  ```ts
  export type SignatureVariant = "daily" | "bulk";
  export interface SignatureData { name: string; title: string; phone: string; email: string; web: string; instagram?: string; facebook?: string; linkedin?: string; }
  export function buildSignature(d: SignatureData, variant: SignatureVariant): string;
  export function buildSignaturePlain(d: SignatureData): string;
  export const SIGNATURE_DEFAULTS: { web; instagram; facebook; linkedin }; // bez org i socialLabel
  export const SIGNATURE_GRAPHIC: Record<SignatureVariant, { file: string; width: number; height: number }>;
  // daily: grafika.png 200×135 (Task 5 zmieni na grafika.gif), bulk: grafika-mala.png 120×81
  ```

Układ HTML (decyzja planu, wymiary wyświetlane):
- Karta: tabela `width="100%"` ze `style="max-width:540px;border:1px solid #dfe3ee;border-radius:14px;"`, komórka z paddingiem 14 px. Dla Outlooka desktop owinięcie w `<!--[if mso]><table width="540"><tr><td><![endif]-->…<!--[if mso]></td></tr></table><![endif]-->`.
- W komórce dwie tabele `align="left"`: **dane** `width="296"` i **grafika** `width="200"` (bulk: `120`) z lewym odstępem 16 px.
- Tabela danych: komórka paska ikon `width="34"` (ramka `1px solid #dfe3ee`, promień 9 px, ikony 20×20, odstęp 9 px, kolejność: strona, Instagram, Facebook, LinkedIn, e-mail), odstęp 12 px, kolumna tekstu: imię i nazwisko 17 px bold `#0f1220`; stanowisko 12 px `#4b5163`; odstęp 8 px; e-mail (link `#1477b5`, bez podkreślenia) i „tel. …” (link `tel:`) 12 px; kreska 1 px `#dfe3ee` z odstępem 12 px nad i pod; `logo-h.png` 192×56.
- **bulk**: pasek tylko strona + pierwszy włączony profil w kolejności LinkedIn → Facebook → Instagram; bez ikony e-mail; grafika `grafika-mala.png` 120×81 bez linku.
- Brak e-maila: brak ikony koperty i wiersza adresu. Brak telefonu: brak wiersza. Brak jakiejkolwiek ikony: brak komórki paska i jej odstępu.
- Wersja tekstowa (obie wersje): imię i nazwisko, stanowisko, „Samorząd Studentów Uniwersytetu Ekonomicznego we Wrocławiu”, pusty wiersz, „tel. …”, e-mail, strona - puste pomijane.

- [ ] **Step 1: Przepisz testy** w `signature.test.ts` (zostaw istniejące testy escapowania, telefonu, `https://https://` i czcionki w komórkach, dopasowane do nowej sygnatury z `"daily"`). Nowe:
  - `daily` zawiera `sig/logo-h.png" width="192" height="56"`, `sig/grafika.png" width="200" height="135"`, pięć ikon przy pełnych danych; nie zawiera `logo-bg.png`, `banner.jpg`, `#2C4BFF`, `§`;
  - `bulk` zawiera `grafika-mala.png" width="120" height="81"`, `ic_web.png` i `ic_linkedin.png`, nie zawiera `ic_instagram.png`, `ic_facebook.png`, `ic_mail.png`; przy `linkedin: undefined` i włączonym Facebooku zawiera `ic_facebook.png`;
  - kolejność w HTML: indeks nazwiska < indeks e-maila < indeks `logo-h.png` (dane nad logo);
  - `email: ""` → brak `ic_mail.png` i `mailto:`; `phone: ""` → brak `tel:`;
  - brak strony i wszystkich profili, `email: ""` → brak `ic_` w HTML i brak komórki `width="34"`;
  - `web: 'javascript:alert(1)"x'` → `href="https://javascript:alert(1)&quot;x"` i brak `href="javascript:`;
  - logo ma alt z pełną nazwą Samorządu; wszystkie ikony mają niepusty alt;
  - oba warianty: brak `<div`, `class=`, `display:flex`, `background-image`, `data:image`;
  - `buildSignaturePlain` daje dokładnie: `["Alicja Rózik", "Członkini Zarządu ds. Promocji", "Samorząd Studentów Uniwersytetu Ekonomicznego we Wrocławiu", "", "tel. 500 600 700", "alicja.rozik@samorzad.ue.wroc.pl", "samorzad.ue.wroc.pl"]`.
- [ ] **Step 2: Uruchom** `npx vitest run src/lib/signature.test.ts` - Expected: FAIL.
- [ ] **Step 3: Zaimplementuj** zgodnie z układem wyżej; zaktualizuj komentarz „UKŁAD” w pliku (przebudowa 11.2026 #2: karta, dwie wersje, dlaczego `align="left"` i owinięcie MSO).
- [ ] **Step 4: Uruchom** testy pliku, potem `npx tsc --noEmit` - Expected: testy PASS; tsc pokaże błędy tylko w `GeneratorStopki.tsx` (naprawia Task 3).
- [ ] **Step 5: Commit** (razem z Task 3, bo bez niego build nie przechodzi - commit dopiero po Task 3).

### Task 3: Generator - przełącznik wersji, nowe pola, podgląd

**Files:**
- Modify: `src/components/strefa/GeneratorStopki.tsx`
- Modify: `src/components/strefa/SignaturePreviews.tsx` (bez zmian w API: dostaje gotowy `html`)
- Modify: `src/app/[locale]/strefa-dzialacza/generator-stopki/page.tsx` (etykiety)
- Modify: `messages/pl.json`, `messages/en.json` (`generatorStopki`)

**Interfaces:**
- Consumes: `buildSignature(d, variant)`, `buildSignaturePlain(d)`, `SignatureVariant`, `SIGNATURE_DEFAULTS` z Task 2.

Zmiany:
- Usuń pola i etykiety: `fieldOrg`, `fieldSocialLabel`, `showBanner` (klucze w obu `messages` też).
- Nad podglądem przełącznik wersji (dwa przyciski `role="radio"` w `role="radiogroup"`, `aria-checked`, klawiatura strzałkami): „Codzienna” / „Do masówek (Hunter)”. Podgląd, „Kopiuj stopkę” i „Pobierz .html” działają na wybranej wersji (`stopka.html` / `stopka-masowki.html`).
- Pod przełącznikiem przy „Do masówek” krótka wskazówka. Nowe klucze:
  - `variantLabel`: PL „Wersja stopki” / EN „Signature version”
  - `variantDaily`: „Codzienna” / „Everyday”
  - `variantBulk`: „Do masówek (Hunter)” / „For bulk sends (Hunter)”
  - `variantBulkHint`: PL „Lżejsza wersja do wysyłek z Huntera: mniej obrazków i linków, więc mniejsze ryzyko spamu. Hunter bierze podpis z Gmaila - na czas kampanii ustaw tę wersję jako domyślny podpis.” / EN „A lighter version for Hunter campaigns: fewer images and links, so a lower spam risk. Hunter takes your signature from Gmail - set this version as your default signature for the campaign.”

- [ ] **Step 1: Wprowadź zmiany**, potem `npm run i18n:namespaces` (konwencja projektu) i `npx tsc --noEmit` - Expected: brak błędów.
- [ ] **Step 2: Kontrola Playwright** (skrypt w scratchpadzie, serwer `SITE_LOCK=off`, zalogowanie podmienione jak w teście nawigacji: przechwycenie `/api/auth/me` nie wystarczy dla strony chronionej `requireSession` - zamiast tego wyrenderuj `previewDocument(buildSignature(dane, v), "phone")` w Playwright z danymi: długa funkcja „Wiceprzewodniczący ds. Strategii i Działań Operacyjnych oraz Współpracy Zewnętrznej”, wszystkie profile). Dla obu wersji przy szerokości 360: `document.documentElement.scrollWidth <= 360`; przy 600: grafika obok danych (top grafiki ≈ top danych). Zrzuty czterech trybów obu wersji do scratchpada i obejrzyj (logo czytelne w obu trybach ciemnych).
- [ ] **Step 3: Pełne testy** `npx vitest run`, `npx eslint` na zmienionych plikach - Expected: PASS.
- [ ] **Step 4: Commit** (Task 2 + 3) `feat(stopki): nowa karta stopki - dane nad logo, pasek ikon, wersja do masówek`.

### Task 4: Wdrożenie i test w prawdziwych pocztach (checkpoint z Mikołajem)

- [ ] **Step 1:** `git push`, poczekaj na wdrożenie produkcji (grafiki muszą być pod `https://samorzad.ue.wroc.pl/sig/...`, inaczej poczty pokażą puste obrazki). Sprawdź `curl -I` dla `logo-h.png`, `grafika.png`, `grafika-mala.png` - Expected: 200, `image/png`.
- [ ] **Step 2:** Poproś Mikołaja o wklejenie obu wersji (Gmail web, Outlook w przeglądarce) i wysłanie maila do siebie: Gmail web i telefon, Outlook w przeglądarce, Apple Mail, poczta uczelniana (Outlook). Zbierz zrzuty/uwagi. Poprawki → powrót do Task 2/3, nowy commit.

### Task 5: Grafika z Higgsfielda i animacja (checkpoint z Mikołajem)

**Wymaga połączenia z Higgsfieldem** (w sesji 7.11 MCP niedostępne - poprosić Mikołaja o podłączenie). ffmpeg nie jest zainstalowany - GIF składa Pillow.

**Files:**
- Create: `scripts/build-signature-gif.py`
- Create (wynik): `public/sig/grafika.gif` 400×270, `public/sig/grafika.png` (nowa nieruchoma), `public/sig/grafika-mala.png` (nowa)
- Modify: `src/lib/signature.ts` (`SIGNATURE_GRAPHIC.daily.file = "grafika.gif"`), `src/lib/signature.test.ts`, `src/lib/signature-assets.test.ts` (GIF: wymiary 400×270, liczba klatek > 1, waga ≤ 300 KB)

- [ ] **Step 1: Panorama.** Szukaj prawdziwej panoramy UEW na wolnej licencji (Wikimedia Commons: CC0/PD, albo zdjęcia Uczelni/Samorządu). Zapisz źródło i licencję w nagłówku skryptu. Brak takiej → obecna panorama, wyostrzona i powiększona w Higgsfieldzie (upscale).
- [ ] **Step 2: Obiekt 3D.** Higgsfield: szklano-metaliczna brama z sygnetu (`public/sygnet.svg` jako referencja), zawsze z usuniętym tłem (przezroczysty PNG). Bez ludzi.
- [ ] **Step 3: Kompozycja i GIF** w `build-signature-gif.py`: ok. 2 s, odtwarzany raz, kolejno paski odsłaniają panoramę, brama wyrasta, hasło na końcu. Pierwsza klatka jest samodzielną, gotową kompozycją (panorama + hasło), ostatnia - pełna z bramą; ta sama maska ściętego brzegu i rogów co w Task 1. Ta sama ostatnia klatka zapisana jako `grafika.png` i pomniejszona do `grafika-mala.png`. Paleta z ditheringiem, waga ≤ 300 KB.
- [ ] **Step 4: Pokaż Mikołajowi** GIF i obie nieruchome wersje (ekran towarzysza w przeglądarce albo Artifact). Poprawki aż do akceptacji („dobarwianie”).
- [ ] **Step 5: Podmień** `SIGNATURE_GRAPHIC.daily` na `grafika.gif`, zaktualizuj testy, `npx vitest run` - Expected: PASS. Commit `feat(stopki): animowana grafika z Higgsfielda`, push, sprawdź `curl -I .../sig/grafika.gif` (200, `image/gif`).
