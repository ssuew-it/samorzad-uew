# Gameplan: od „trwają prace” do otwarcia

Stan na 15.10.2026. Plan wykonawczy na najbliższe 4 tygodnie. Uzupełnia
[ROADMAP.md](ROADMAP.md) (kierunek długoterminowy) i [DESIGN.md](../DESIGN.md)
(źródło prawdy o wyglądzie i ruchu).

Każde zadanie ma **właściciela**: 🤖 = robimy w kodzie (Claude + subagenci),
👤 = potrzebna osoba z Samorządu (dane, decyzja, dostęp). Rozmiar: S (godziny),
M (dzień–dwa), L (kilka dni).

---

## Decyzje Zarządu (15.10.2026)

| Sprawa | Decyzja |
|---|---|
| Otwarcie strony | **18.10.2026 albo 19.10 rano** |
| „Ty” czy „Wy” | „Ty” (rozstrzygnięte domyślnie, bo tak napisana była większość tekstów; łatwe do odwrócenia) |
| Partnerzy | pokazujemy wszystkich z dotychczasowej listy, jako „Zaufali nam” |
| Rezerwacje sal i sprzętu | obsługuje je **CRA**, nie budujemy osobnego systemu |
| Miernik progu na Stypendiach | budujemy |
| CRA i RadaStudentów24 | linki w Strefie Działacza, widoczne wyłącznie po zalogowaniu |

## Przegląd i poprawki 17.10.2026

- Formularz partnerów: zgodne pola osoby kontaktowej i organizacji; nazwa organizacji trafia do tematu w obecnym Apps Script. Wspólny formularz zachowuje dane po awarii połączenia i pozwala ponowić wysyłkę.
- Partnerzy: jedna ściana logotypów, osobne wyróżnienie BNY, bez ogólnych modali. Kolejność: partnerzy, korzyści, kontakt; szczegóły oferty pozostają na „Współpracuj z nami”.
- Nawigacja na mniejszych ekranach: język i motyw w rozwijanym menu. Testy obejmują dostępność przycisku oraz przejście do Kontaktu przy 320, 375, 768 i 1024 px.
- Diagnostyka mobile zapisuje raport, a błędy pomiaru i poziome przewijanie kończą się niepowodzeniem testów.
- Daty dyplomowania 2025/2026 oznaczone jako archiwalne w PL i EN. Terminy 2026/2027 nadal wymagają potwierdzenia w Dziekanacie.
- Aktualna lista warunków otwarcia: [PRZED-STARTEM.md](PRZED-STARTEM.md). Instrukcja formularzy w [ENV.md](ENV.md) opisuje Apps Script, nie Formspree.

Odbiór rzeczywistego dostarczenia zgłoszeń, logowania Google i domen pozostaje do wykonania na produkcji.

---

## Zasady, których pilnujemy w każdym torze

1. **Dusza strony.** Ruch i widżety tylko wtedy, gdy wynikają z funkcji
   podstrony. Jeśli efekt działałby tak samo na innej stronie, to ozdobnik:
   wycinamy. Żadnych „kreskówkowych” przejść.
2. **WCAG 2.2 AA** to warunek wejścia, nie poprawka na koniec. Każdy ruch
   ma wariant `prefers-reduced-motion`.
3. **Prawdziwe dane albo uczciwe „wkrótce”.** Zero stockowych zdjęć udających
   nasze wydarzenia, zero linków, które obiecują co innego, niż otwierają.
4. **Bez długich myślników** w tekstach widocznych dla studentów.
5. **Każdy commit przechodzi:** testy jednostkowe, Playwright, build,
   lint na końcu.

---

## Co już zrobione w tym cyklu (14–15.10)

- Przekierowania wszystkich 44 starych adresów z Wixa i starych linków do PDF-ów.
- 7 dokumentów odzyskanych z Wixa i podpiętych (regulaminy, ordynacja, księga znaku…).
- Blokada strony przepuszcza grafiki stopek i favicon (z testem na obejścia).
- Zdjęcia wszystkich 9 projektów na „Naszych projektach” (z archiwum Wix).
- Liczby ujednolicone: 10 000+ studentów i 6 komisji wszędzie (wcześniej 9 000 / 10 000 / 11 000 i 12).
- **Archiwum starej strony:** `archiwum-wix/tresc/*.md` (treść 44 stron),
  `archiwum-wix/tresc/index.json` (zdjęcia, linki), zdjęcia w `archiwum-wix/zdjecia/`
  (cały folder poza repo, bo zawiera prywatne telefony i maile członków; ok. 100 MB). Skrypt: `scripts/archiwum-wix.mjs`.
  👤 **Skopiujcie folder `archiwum-wix/` na Dysk Samorządu** — Wix
  zniknie razem z kontem.

---

## Tor 0 — Blokery otwarcia (do 18.10)

Bez tego nie otwieramy strony, niezależnie od reszty.

| # | Zadanie | Kto | Rozmiar |
|---|---|---|---|
| 0.1 | Vercel → Domains: dodać `www.samorzad.ue.wroc.pl` z przekierowaniem na domenę główną (teraz zły certyfikat) | 👤 | S |
| 0.2 | IT UEW: usunąć lub przekierować `wp.samorzad.ue.wroc.pl` (WordPress z 2018, bez HTTPS, stare wtyczki) | 👤 | S |
| 0.3 | ✅ Utwardzenie logowania (Tor 1, A2–A5) | 🤖 | M |
| 0.4 | Klient OAuth w Google Cloud (typ **Internal**, adres powrotu `https://samorzad.ue.wroc.pl/api/auth/callback`) + zmienne na Vercelu: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET` (≥32 znaki, `openssl rand -base64 32`), `AUTH_URL=https://samorzad.ue.wroc.pl`, `NEXT_PUBLIC_SIG_BASE`. **Bez `AUTH_URL` logowanie się nie pokaże** | 👤 | S |
| 0.5 | Tor 2, krok 2.1 (fakty i zaślepki) — strona nie może kłamać w dniu otwarcia | 🤖 | S |
| 0.6 | ✅ Data otwarcia: 18.10 albo 19.10 rano. W dniu otwarcia: `SITE_LOCK=off` na Vercelu + redeploy, potem przegląd na żywo (strona główna, logowanie, formularz kontaktu, mapa strony w Google Search Console) | 👤 | S |

---

## Tor 1 — Strefa Działacza

Działa generator stopki. Kafelki CRA (`crmp-prototyp.vercel.app`) i
RadaStudentów24 (`rada-studentow-24.vercel.app`) dostają linki widoczne tylko
po zalogowaniu. Rezerwacje sal 16J, 28J, 9J i sprzętu (dawniej Wix Bookings
przez `sale@samorzad.ue.wroc.pl`) obsługuje CRA.

### Faza A — bezpieczne logowanie (tydzień 1) 🤖

| # | Zadanie | Pliki | Gotowe, gdy |
|---|---|---|---|
| ✅ A2 | Sprawdzanie `hd` w callbacku, PKCE, `redirect_uri` z `AUTH_URL` | `src/app/api/auth/{login,callback}/route.ts`, `src/lib/auth.ts` | konto spoza domeny i prywatny Gmail dostają `?error=domain` |
| ✅ A3 | `verifyToken` bez sekretu zwraca `null` (dziś: błąd 500 przy starym ciasteczku); helper `requireSession()` | `src/lib/auth.ts`, strony Strefy | żadna strona/akcja nie pomija sprawdzenia sesji |
| ✅ A4 | Adresy kafelków nie trafiają do publicznego JS (dziś `panelTiles` jest w kodzie klienta) | `strefa-dzialacza/page.tsx`, `StrefaDzialaczaContent.tsx` | `grep` w `.next/static` nie znajduje URL-i kafelków |
| ✅ A5 | Wylogowanie przez POST | `api/auth/logout/route.ts` | GET zwraca 405 |
| A6 | Test pełnego logowania przy zamkniętej stronie (z kluczem podglądu) | — | logowanie działa przez blokadę |

### Faza B — szybkie zyski z Google Workspace (tydzień 2) 👤 + 🤖

- 👤 Dysk współdzielony „Strefa Działacza” (tylko domena): Wzory pism,
  Identyfikacja, Protokoły RUSS, Projekty.
- 👤 Formularze Google (tylko domena): zwrot kosztów, zgłoszenie projektu.
- 🤖 Kafelki w grupach (Sale i sprzęt / Dokumenty / Posiedzenia / Finanse /
  Narzędzia), pole `group` w `src/lib/panel.ts`.
- 🤖 Publiczny brand kit (logo SVG/PNG jasne i ciemne + księga znaku).

### Faza C — rezerwacje: ✅ poza tym planem

Rezerwacje sal i sprzętu obsługuje CRA (decyzja z 15.10). Strefa Działacza
tylko do niego prowadzi.

### Faza D — później

Kalendarz posiedzeń RUSS z feedu ICS → automatycznie na stronie RUSS;
strona „Pierwsze kroki” dla nowych członków; role (Zarząd/RUSS) z Grup Google.
Baza danych dopiero, gdy pojawi się wymaganie, którego Kalendarz/Arkusze nie
udźwigną.

---

## Tor 2 — Copy (tydzień 1–2) 🤖, decyzje 👤

| # | Zadanie | Rozmiar |
|---|---|---|
| 2.1 | **Fakty i zaślepki:** „Przewodnicząca” w SKW → forma neutralna do czasu ogłoszenia składu; status „Dane w przygotowaniu” na Transparentności; puste stany Kalendarza i Organizacji z konkretnym następnym krokiem („napisz, dodamy Twoją organizację”) | S |
| 2.2 | **Myślniki:** 197 długich myślników w PL (184 w EN). Przegląd zdanie po zdaniu: kropka, dwukropek albo przecinek — nie zamiana mechaniczna | M |
| 2.3 | ✅ „Ty”: 6 tekstów z „Wy” przepisanych, DESIGN.md zaktualizowany | S |
| 2.4 | 15 przepisanych tekstów o największym wpływie (lista w raporcie audytu copy: hero Kontaktu, Rzecznika, Naszych projektów, Współpracy…) | M |
| 2.5 | Opisy z archiwum Wix tam, gdzie są lepsze lub pełniejsze (misja „Działamy, wspieramy, inspirujemy”, opisy Mostów i Testu Wiedzy) | S |
| 2.6 | DESIGN.md: ✅ adres; zostały stare kroje pisma w opisie | S |

---

## Tor 3 — Zdjęcia i materiały (ciągły, głównie 👤 Promocja)

Szczegółowa lista dla Promocji: [MATERIALY.md](MATERIALY.md).

| # | Co | Kto | Uwagi |
|---|---|---|---|
| 3.1 | Portrety Zarządu (7) i RUSS (15), kadr 4:5 | 👤 | dziś inicjały; slot gotowy (`USE_LOCAL.zarzad/russ`) |
| 3.2 | UE Party w większej rozdzielczości (jest 1167 px) | 👤 | |
| 3.3 | Drugi kadr (detal) do każdego projektu | 👤 | slot: `detail-01.webp` w `src/lib/photos.ts` |
| 3.4 | ✅ Partnerzy: 20 logotypów z archiwum na ścianie „Zaufali nam”, BNY jako partner strategiczny. 👤 Do uzupełnienia: brakujące adresy stron (iStudies, Fundacja Rozwoju UEW, Phinance, Mad Unicorns, Slice of Heaven, Burn, Starbucks) | 👤 | |
| 3.5 | Szerokie kadry do sekcji „Życie studenckie” (2 × 3:2) | 👤 | slot `USE_LOCAL.zycie` |
| 3.6 | Linki: folder zarządzeń **bieżącej** kadencji, uchwały SKW, sprawozdania, regulamin finansowania, pisma Dziekana | 👤 | `src/lib/documents.ts` (podpięcie = 1 linijka) |
| 3.7 | Dostępność budynku L (wejście, winda, parking) do deklaracji dostępności | 👤 | |

---

## Tor 4 — Animacje i podstrony (tydzień 2–4) 🤖

Diagnoza audytu: 6 stron flagowych jest świetnych (strona główna, Wydawnictwo,
Pomoc psychologiczna, Transparentność, USOS, Kalkulator). Pozostałe ~20 jedzie
na jednej formule „siatka kart z fade-in”, a `ScrollReveal` jest dziś pusty
(wyłączony po błędzie widoczności przy SSR). Wspólne elementy, które miały
spajać język ruchu (`Impulse`, tokeny z `src/lib/motion.ts`, `SectionRail`),
używa mniejszość plików.

| # | Zadanie | Rozmiar |
|---|---|---|
| 4.1 | **Fundament:** jeden prymityw `RevealGrid`/`RevealCard` (tokeny `EASE`/`DURATION`, wbudowany reduced-motion), zastępuje 30 ręcznie wpisanych krzywych w 22 plikach | M |
| 4.9 | ✅ Płynność (16.10): wejście hero, przejścia stron z rozmyciem, ciche ujawnianie przy przewijaniu (CSS), menu rozwijane od przycisku, koniec „przeładowania” strony głównej. ✅ Nasze projekty jako opowieść przewijaniem (rok studenta w 4 rozdziałach) | M |
| 4.2 | **Strony prawne dostają szkielet z §:** `SectionRail` (spis treści z podświetlaniem) na Regulaminie studiów, Podaniach, Zaliczeniu semestru, Prywatności, Deklaracji | M |
| 4.3 | ✅ **Rejestry dokumentów rozróżnione:** Prawo / Regulacje / Zarządzenia / RUSS wyglądają dziś identycznie. Każdy dostaje własny układ zgodny z funkcją (np. Regulacje = lista z datą uchwały i rozmiarem PDF) | M |
| 4.4 | ✅ **Nowa podstrona Filii w Jeleniej Górze** z gotowej treści archiwum (obszary działania, kontakt do Szymona Woźniaka); przekierowanie starego adresu na nią zamiast na Zarząd | M |
| 4.5 | ✅ Kontakt, Infopacki, Kalendarz, Mapa kampusu — z płaskich na „z duszą”: np. Mapa z własnymi pinezkami i trybem ciemnym, Kalendarz kierujący do social mediów zamiast na stronę główną | M |
| 4.6 | ✅ Stypendia: miernik progu stypendium socjalnego (dane 2025/26 z ZR 123/2025, zał. 4: próg 1 908,90 zł) — gotowy, w sekcji „Socjalne” | M |
| 4.7 | ✅ Partnerzy: prawdziwa ściana logo, logotypy na białym tle w obu motywach, okienko partnera pokazuje znak | S |
| 4.8 | Palety „konsolowe” (granat na USOS/Transparentności/Projektach) jako udokumentowane tokeny zamiast surowych kolorów — i sprawdzenie ich kontrastu | M |

---

## Harmonogram

| Tydzień | 🤖 Kod | 👤 Samorząd |
|---|---|---|
| **Do 18.10 (otwarcie)** | Tor 1 A2–A6, miernik progu (4.6), 2.1, test otwarcia | 0.1, 0.2, 0.4, kopia archiwum na Dysk, `SITE_LOCK=off` |
| **Tydzień po otwarciu** (do 25.10) | 2.2, 2.4, 4.1, 4.4 (Filia) | Tor 1 B (Dysk, formularze), linki 3.6 |
| **Do 1.11** | 4.2, 4.3, 4.5, 2.5 | zdjęcia 3.1–3.3 |
| **Do 8.11** | 4.8, pełny audyt WCAG z czytnikiem ekranu | — |

Po otwarciu strona żyje i jest dopracowywana na bieżąco: każda poprawka
przechodzi te same testy i wchodzi na produkcję po zielonym CI.

---

## Jak wykonujemy (dla agentów)

- Każde zadanie 🤖 = osobna gałąź i commit; większe (4.1, 4.4, C2) przez
  cykl spec → plan → implementacja z przeglądem.
- **Równolegle bez konfliktów:** Tor 1 (pliki auth/Strefy), Tor 2 (głównie
  `messages/*.json`) i Tor 4 (komponenty stron) dotykają różnych plików.
  Uwaga na 2.x vs 4.x tam, gdzie zmiana układu wymaga nowych kluczy tłumaczeń —
  wtedy najpierw 4.x, potem copy.
- Przed commitem: `npx vitest run`, `npm run build`, Playwright (port 3000
  wolny, świeży build), `npm run lint` na końcu.
- Źródło treści do migracji: `archiwum-wix/tresc/` (lokalnie, poza repo). Stare pliki z Wixa:
  `https://static.wixstatic.com/ugd/<plik>.pdf`.

## Otwarte sprawy dla Zarządu

0. **Przed otwarciem — treści z roku 2025/2026.** Trwa rok 2026/2027, a kilka miejsc podaje dane z poprzedniego roku: terminy w przewodniku po dyplomowaniu („Aktualna granica dla roku 2025/2026”), regulamin studiów 2025/2026, kadencja RUSS 2025/2026. Potrzebne aktualne terminy i dokumenty (Dziekanaty / BIP), albo decyzja, by oznaczyć je jako zeszłoroczne. Miernik progu stypendialnego już to robi sam (progi 2026/2027 nie są jeszcze w BIP, stan na 16.10.2026).

1. Adresy stron partnerów bez linku (lista w 3.4).
2. Linki z 3.6: folder zarządzeń bieżącej kadencji, uchwały SKW, sprawozdania, regulamin finansowania, pisma Dziekana.
3. Portrety Zarządu i RUSS (3.1).
