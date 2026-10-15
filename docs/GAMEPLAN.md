# Gameplan: od „trwają prace” do otwarcia

Stan na 15.10.2026. Plan wykonawczy na najbliższe 4 tygodnie. Uzupełnia
[ROADMAP.md](ROADMAP.md) (kierunek długoterminowy) i [DESIGN.md](../DESIGN.md)
(źródło prawdy o wyglądzie i ruchu).

Każde zadanie ma **właściciela**: 🤖 = robimy w kodzie (Claude + subagenci),
👤 = potrzebna osoba z Samorządu (dane, decyzja, dostęp). Rozmiar: S (godziny),
M (dzień–dwa), L (kilka dni).

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

## Tor 0 — Blokery otwarcia (tydzień 1)

Bez tego nie otwieramy strony, niezależnie od reszty.

| # | Zadanie | Kto | Rozmiar |
|---|---|---|---|
| 0.1 | Vercel → Domains: dodać `www.samorzad.ue.wroc.pl` z przekierowaniem na domenę główną (teraz zły certyfikat) | 👤 | S |
| 0.2 | IT UEW: usunąć lub przekierować `wp.samorzad.ue.wroc.pl` (WordPress z 2018, bez HTTPS, stare wtyczki) | 👤 | S |
| 0.3 | Utwardzenie logowania (patrz Tor 1, kroki A2–A5) przed włączeniem kluczy | 🤖 | M |
| 0.4 | Klient OAuth w Google Cloud (typ **Internal**) + zmienne na Vercelu: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET` (≥32 znaki), `AUTH_URL`, `NEXT_PUBLIC_SIG_BASE` | 👤 | S |
| 0.5 | Tor 2, krok 2.1 (fakty i zaślepki) — strona nie może kłamać w dniu otwarcia | 🤖 | S |
| 0.6 | **Decyzja o dacie otwarcia** (`SITE_LOCK=off`). Strona zwraca 503 od ~10.09; każdy tydzień to dalsze wypadanie z Google | 👤 | — |

---

## Tor 1 — Strefa Działacza

Dziś: działa generator stopki; kafelki CRA i RadaStudentów24 są puste;
logowanie nie jest włączone na produkcji. Stara strona miała **rezerwację sal
16J, 28J, 9J i wypożyczenie sprzętu** (obsługiwane przez `sale@samorzad.ue.wroc.pl`)
— tego jeszcze nie zastąpiliśmy.

### Faza A — bezpieczne logowanie (tydzień 1) 🤖

| # | Zadanie | Pliki | Gotowe, gdy |
|---|---|---|---|
| A2 | Sprawdzanie `hd` w callbacku, PKCE, `redirect_uri` z `AUTH_URL` | `src/app/api/auth/{login,callback}/route.ts`, `src/lib/auth.ts` | konto spoza domeny i prywatny Gmail dostają `?error=domain` |
| A3 | `verifyToken` bez sekretu zwraca `null` (dziś: błąd 500 przy starym ciasteczku); helper `requireSession()` | `src/lib/auth.ts`, strony Strefy | żadna strona/akcja nie pomija sprawdzenia sesji |
| A4 | Adresy kafelków nie trafiają do publicznego JS (dziś `panelTiles` jest w kodzie klienta) | `strefa-dzialacza/page.tsx`, `StrefaDzialaczaContent.tsx` | `grep` w `.next/static` nie znajduje URL-i kafelków |
| A5 | Wylogowanie przez POST | `api/auth/logout/route.ts` | GET zwraca 405 |
| A6 | Test pełnego logowania przy zamkniętej stronie (z kluczem podglądu) | — | logowanie działa przez blokadę |

### Faza B — szybkie zyski z Google Workspace (tydzień 2) 👤 + 🤖

- 👤 Dysk współdzielony „Strefa Działacza” (tylko domena): Wzory pism,
  Identyfikacja, Protokoły RUSS, Projekty.
- 👤 Formularze Google (tylko domena): zwrot kosztów, zgłoszenie projektu.
- 👤 Linki do CRA i RadaStudentów24 albo decyzja o usunięciu kafelków.
- 🤖 Kafelki w grupach (Sale i sprzęt / Dokumenty / Posiedzenia / Finanse /
  Narzędzia), pole `group` w `src/lib/panel.ts`.
- 🤖 Publiczny brand kit (logo SVG/PNG jasne i ciemne + księga znaku).

### Faza C — rezerwacje sal i sprzętu (tydzień 2–3)

- **C1, bez kodu (👤, S):** w konsoli Google Workspace utworzyć zasoby: sale
  16J, 28J, 9J + sprzęt. Rezerwacja przez „Dodaj salę” w Kalendarzu,
  konflikty odrzucane automatycznie. Kafelek „Rezerwacja sal” + krótka
  instrukcja. **To samo w sobie zastępuje Wix Bookings.**
- **C2, rezerwacja na stronie (🤖, M–L, opcjonalnie):** tygodniowa siatka
  dostępności i formularz w Strefie (Calendar API przez konto serwisowe).
  Wymaga zgody superadministratora Workspace na delegację domenową.
  Decyzja po C1.

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
| 2.3 | **Forma zwracania się:** DESIGN.md każe „Wy”, a strona w 38 miejscach mówi „Ty”, w 5 „Wy”. 👤 decyzja: proponuję „Ty” (bliżej, prościej) i poprawkę DESIGN.md | S |
| 2.4 | 15 przepisanych tekstów o największym wpływie (lista w raporcie audytu copy: hero Kontaktu, Rzecznika, Naszych projektów, Współpracy…) | M |
| 2.5 | Opisy z archiwum Wix tam, gdzie są lepsze lub pełniejsze (misja „Działamy, wspieramy, inspirujemy”, opisy Mostów i Testu Wiedzy) | S |
| 2.6 | DESIGN.md: stary adres (Kamienna 43) i stare kroje pisma — aktualizacja, żeby nikt ich nie skopiował | S |

---

## Tor 3 — Zdjęcia i materiały (ciągły, głównie 👤 Promocja)

Szczegółowa lista dla Promocji: [MATERIALY.md](MATERIALY.md).

| # | Co | Kto | Uwagi |
|---|---|---|---|
| 3.1 | Portrety Zarządu (7) i RUSS (15), kadr 4:5 | 👤 | dziś inicjały; slot gotowy (`USE_LOCAL.zarzad/russ`) |
| 3.2 | UE Party w większej rozdzielczości (jest 1167 px) | 👤 | |
| 3.3 | Drugi kadr (detal) do każdego projektu | 👤 | slot: `detail-01.webp` w `src/lib/photos.ts` |
| 3.4 | **Partnerzy:** w archiwum jest ~20 logotypów („Zaufali nam”: PwC, mBank, BNP Paribas, BNY, Techland, Raben, UPS, Pyszne.pl, Bielenda, UPM…). 👤 decyzja: które współprace są aktualne i czy możemy pokazać je jako „zaufali nam”. Dziś strona pokazuje 6 pustych miejsc „Twoja marka” | 👤 → 🤖 | |
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
| 4.2 | **Strony prawne dostają szkielet z §:** `SectionRail` (spis treści z podświetlaniem) na Regulaminie studiów, Podaniach, Zaliczeniu semestru, Prywatności, Deklaracji | M |
| 4.3 | **Rejestry dokumentów rozróżnione:** Prawo / Regulacje / Zarządzenia / RUSS wyglądają dziś identycznie. Każdy dostaje własny układ zgodny z funkcją (np. Regulacje = lista z datą uchwały i rozmiarem PDF) | M |
| 4.4 | **Nowa podstrona Filii w Jeleniej Górze** z gotowej treści archiwum (obszary działania, kontakt do Szymona Woźniaka); przekierowanie starego adresu na nią zamiast na Zarząd | M |
| 4.5 | Kontakt, Infopacki, Kalendarz, Mapa kampusu — z płaskich na „z duszą”: np. Mapa z własnymi pinezkami i trybem ciemnym, Kalendarz kierujący do social mediów zamiast na stronę główną | M |
| 4.6 | Stypendia: DESIGN.md obiecuje „miernik progu, który wypełnia student” — 👤 decyzja: budujemy (M) czy zmieniamy brief | M |
| 4.7 | Partnerzy: uczciwy pusty stan albo prawdziwa ściana logo (po decyzji 3.4) | S |
| 4.8 | Palety „konsolowe” (granat na USOS/Transparentności/Projektach) jako udokumentowane tokeny zamiast surowych kolorów — i sprawdzenie ich kontrastu | M |

---

## Harmonogram

| Tydzień | 🤖 Kod | 👤 Samorząd |
|---|---|---|
| **1** (do 22.10) | Tor 1 A2–A6, Tor 2.1, 4.1 | 0.1, 0.2, 0.4, decyzje 2.3 i 3.4, kopia archiwum na Dysk |
| **2** (do 29.10) | 2.2, 2.4, 4.2, 4.4, Tor 1 B (kod) | Tor 1 B i C1 (Workspace), linki 3.6 |
| **3** (do 5.11) | 4.3, 4.5, 4.7, 2.5 | zdjęcia 3.1–3.3, decyzja C2 i 4.6 |
| **4** (do 12.11) | 4.6/4.8, ewentualnie C2, pełny audyt WCAG, test otwarcia | **otwarcie strony** |

Otwarcie nie musi czekać na tydzień 4: po Torze 0 strona jest gotowa do
otwarcia, a reszta to dopracowanie na żywo.

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

## Decyzje potrzebne od Zarządu (zbiorczo)

1. Data otwarcia strony (0.6).
2. „Ty” czy „Wy” (2.3).
3. Które logotypy partnerów są aktualne i do pokazania (3.4).
4. Rezerwacje: wystarczy Kalendarz Google (C1) czy chcemy formularz na stronie (C2)?
5. Miernik progu na Stypendiach: budujemy czy odpuszczamy (4.6).
6. CRA i RadaStudentów24: linki czy usuwamy kafelki.
