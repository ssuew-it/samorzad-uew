# Raport po poprawkach - audyt antislop nr 001

Data: 10.11.2026 · Zatwierdzone: wszystkie punkty 1-19 · Decyzje właściciela:
- **12 i 15:** siatka w tle i niebiesko-biały gradient zostają jako tożsamość strony;
- **13:** wersaliki zostają, ale z jednym rozstrzeleniem liter.

## Co zrobiono

| Nr | Stan | Co zmieniono | Dowód |
|---|---|---|---|
| 1 | Poprawione | Przyciski CTA na 8 infopackach mają `text-bg-base` zamiast `text-white`. W ciemnym motywie napis jest ciemny: 5,91:1, w jasnym 5,55:1. | `tests/antislop.spec.ts`: axe kontrast, ciemny motyw, 8 stron |
| 2 | Poprawione | `InitialsAvatar` w ciemnym motywie ma `#a9b8ff` (6,98:1). Monogramy na jasnych kafelkach Organizacji mają `#2c4bff` (5,46:1). | jw.: RUSS, FUE/PSRP, Organizacje |
| 3 | Poprawione | Przyczyną nie była mapa, tylko duży adres trasy z `white-space: nowrap`, który wystawał poza kolumnę. Teraz łamie się w zrównoważone wiersze (`text-wrap: balance`). | brak przewijania w bok przy 375, 768 i 1280 px |
| 4 | Poprawione | „Strona Dziekanatu”, „Strona Władz Uczelni” oraz linki w Pomocy psychologicznej mają co najmniej 24 px wysokości. Pola wyboru (Organizacje, Prawa studenta, Kalendarz) i linki do PDF w Regulacjach to **fałszywe alarmy**: celem jest cała etykieta (min. 44 px) albo cały wiersz. | test celów dotyku |
| 5 | Poprawione | `width`/`height` dla logotypów: pas na stronie głównej, Partnerzy (siatka, karta efektu, logo w hero, karta partnera strategicznego, zdjęcie). | test logotypów na stronie głównej |
| 6 | Poprawione | Pole asystenta i komentarz w okienku oceny wracają do wspólnego pierścienia fokusu. Okno wyszukiwania `/szukaj` dostało pierścień wokół całego pola. | przegląd kodu |
| 7 | Poprawione | Globalne `MotionConfig reducedMotion="user"` w `ThemeProvider`. | przegląd kodu - nie mierzone w przeglądarce |
| 8 | Poprawione | Nowe tytuły i wstępy 8 infopacków. Nadtytuły zastąpione zwykłym „Infopack · temat”. | wszystkie teksty niżej |
| 9 | Poprawione | Prawa studenta, Nasze projekty (wstęp, Bal), Życie studenckie oraz 8 kolejnych zdań w tym samym schemacie znalezionych przy poprawkach. | wszystkie teksty niżej |
| 10 | Poprawione | Iskierki zastąpione dymkiem rozmowy (`ChatCircleText`): asystent, odpowiedź w wyszukiwarce. KAFE dostało `Certificate` (odznaki i mikropoświadczenia), etykieta „Nowość…” jest bez ikony. | `grep Sparkle` = 0 |
| 11 | Poprawione | 7 linków wewnętrznych z ↗ zmienionych na → (strona główna, O nas, Prawa studenta, Rzecznik, stypendia). Usunięte dwie dekoracyjne ↗ na Partnerach. | test strzałek na stronie głównej |
| 12 | Zostaje (decyzja) | Powód zapisany w DESIGN.md: motyw „planu / księgi” w stylu technical-editorial. | DESIGN.md §2 |
| 13 | Poprawione | Jedno rozstrzelenie wersalików 0,08 em w 71 miejscach. Zostały tylko małe wartości 0,02-0,06 em przy zwykłych napisach. | DESIGN.md §2 |
| 14 | Poprawione | Kropka „dyżur trwa” pulsuje 3 razy przy pojawieniu się, potem stoi. | przegląd kodu |
| 15 | Zostaje (decyzja) | Gradient niebiesko-biały zapisany w DESIGN.md jako paleta Samorządu. W §10 usunięte nieaktualne „gradient orbs” (hero to ściana zdjęć). | DESIGN.md |
| 16 | Poprawione | „Poznaj nas” zamienione na „Kim jesteśmy” (hero) i „Jak działa Samorząd” (manifest). | - |
| 17 | Poprawione | „Zaufali nam” zamienione na „Wspierali nasze projekty” (strona główna, Partnerzy). | - |
| 18 | Poprawione | Wypełniacz „realnie / realny” usunięty w 6 miejscach. Został „Proponowany realny termin” w podaniach, bo tam słowo znaczy „wykonalny”. | - |
| 19 | Poprawione | Usunięte nieużywane `FinancialReport*`, `financial-reports.ts` z testem i danymi oraz niewyświetlane teksty strony głównej (m.in. „Budżet, decyzje…”). | `tsc` czysty |

## Zmienione teksty (PL)

**Infopacki - tytuł / wstęp / nadtytuł:**

- **Regulamin studiów**
  - Tytuł: „Regulamin, który odpowiada” → „Regulamin studiów w praktyce”.
  - Wstęp: „Wybierz swoją sytuację: pokażemy najważniejsze zasady i odeślemy do właściwego paragrafu oficjalnego dokumentu.”
  - Nagłówek nawigatora: „Wybierz swój problem”.
- **Dyplomowanie**
  - Tytuł: „Nie oddajesz pliku. Domykasz proces.” → „Od złożenia pracy do obrony”.
  - Wstęp: „Złożenie pracy w APD to jeden z kilku etapów. Pokazujemy, co dzieje się po nim, gdzie proces może się zatrzymać i jaki jest Twój następny krok aż do obrony.”
  - Nagłówek źródeł: „Skąd są te informacje”.
- **Życie studenckie**
  - Tytuł: „Nie dołączaj gdziekolwiek.” → „Znajdź swoje miejsce na Uczelni”.
  - Koniec wstępu: „Wskaż, co chcesz wynieść ze studiów, a podpowiemy, od czego zacząć.”
- **Biblioteka**
  - Tytuł: „Biblioteka bez błądzenia.” → „Jak korzystać z Biblioteki”.
  - Wstęp: „Książka jest w katalogu? Sprawdź, gdzie jej szukać, jak ją odebrać, kiedy użyć Książkomatu i jak dostać się do baz spoza kampusu.”
- **Sprawy studenckie**
  - Tytuł: „Twoja sprawa. Właściwa osoba.” → „Gdzie załatwić sprawę studencką”.
  - Wstęp: „Większość spraw zaczyna się w Dziekanacie. Wybierz, czego potrzebujesz, a pokażemy, do kogo się zwrócić, w jakiej kolejności i co przygotować.”
- **Zaliczenie semestru**
  - Tytuł bez zmian.
  - Wstęp: „Wskaż, co się wydarzyło: zobaczysz termin, następny krok i oficjalną podstawę, a także to, czy to już moment na podanie.”
- **USOS**
  - Tytuł: „USOS, który prowadzi” → „USOS krok po kroku”.
  - Wstęp: „Wybierz, co chcesz zrobić w USOS, a pokażemy właściwą zakładkę i kolejne kliknięcia.”
- **Podania**
  - Tytuł: „Podanie bez zgadywania” → „Jak złożyć podanie”.
  - Wstęp: „Wybierz, co chcesz załatwić. Pokażemy ścieżkę w USOS, termin, potrzebne dokumenty i wzór treści, zgodnie z Infopackiem „Wszystko o podaniach” i aktualnym Regulaminem studiów.”
- **Nadtytuły wszystkich 8:** „Infopack · Regulamin studiów”, „Infopack · Dyplomowanie”, „Infopack · Życie studenckie”, „Infopack · Biblioteka”, „Infopack · Sprawy studenckie”, „Infopack · Zaliczenie semestru”, „Infopack · USOS”, „Infopack · Podania”.

**Pozostałe:**

- **Prawa studenta:** „Poznaj prawa, które przysługują Ci na studiach, i sprawdź, gdzie szukać pomocy, gdy ktoś je łamie.”
- **Nasze projekty**
  - Wstęp: „Obóz przed pierwszym rokiem, wieczór na Balu, konferencja, po której zostajesz z nowym pomysłem, i biret wyrzucony w górę na koniec studiów. Takie chwile przygotowujemy przez cały rok.”
  - Bal: „Wspólnota to także wspólna zabawa.”
  - Dni Adaptacyjne: „Pokazujemy Ci Uczelnię od środka, zanim zaczną się zajęcia.”
- **Strona główna**
  - Projekty: „Studia to także ludzie i wydarzenia.”
  - Manifest: „…i wpływamy na to, jak studiuje się…” (bez „realnie”).
  - Przyciski: „Kim jesteśmy”, „Jak działa Samorząd”.
  - Pas logotypów: „Wspierali nasze projekty”.
- **Strefa studenta**
  - „Zacznij od swojej sytuacji. Pokażemy najkrótszą drogę i miejsce, w którym to sprawdzisz, nawet jeśli nie znasz nazwy regulaminu, biura ani formularza.”
  - USOS: „Znajdź konkretną czynność w USOS i poznaj najczęstsze pułapki.”
- **Zostały celowo, bo niosą informację albo pasują do tonu:**
  - Pomoc psychologiczna („Nie musisz od razu wiedzieć, jakiej pomocy szukasz.”),
  - „Kolor to sygnał, nie wyrok” (JSA),
  - „Książkomat służy do odbioru, nie do zwrotu.”

Wersje angielskie poprawione tak samo. W PL i EN nie ma ani jednego długiego myślnika.

## Bramka antislop (po poprawkach)

- **R-02 PASS:** 0 długich myślników w `messages/*.json` i napisach komponentów.
- **R-03 PASS:**
  - mapa kampusu bez przewijania w bok przy 375, 768 i 1280 px (test);
  - cele dotyku poprawione albo uzasadnione (etykiety ≥ 44 px).
- **R-17, R-18, R-36, R-38 PASS:**
  - liczby z regulaminów, logotypy prawdziwe;
  - nagłówek „Wspierali nasze projekty” jest zgodny z faktami;
  - martwe dane finansowe usunięte.
- **R-25, R-34 PASS:** axe bez naruszeń na 11 wcześniej błędnych stronach w ciemnym motywie i na wszystkich stronach w jasnym (pełny zestaw e2e).
- **R-32 PASS:** pierścień fokusu w polach asystenta, oceny i wyszukiwarki (przegląd kodu).
- **R-39:**
  - **PASS:** jeden h1 na stronę, brak nieskończonych animacji przy ograniczonym ruchu;
  - **NIE ZMIERZONE:** `MotionConfig` dodane, ale efekt w przeglądarce nie był mierzony.
- **R-40 PASS:** logotypy partnerów mają wymiary.
- **R-35:**
  - **CZĘŚCIOWO:** build przechodzi, 194 testy e2e i 453 testy jednostkowe zielone, brak błędów w konsoli na 40 stronach;
  - **nie zrobiono:** pełnego ręcznego przeklikania każdego elementu.
- **R-27 NIE SPRAWDZONO:** stany pusty / ładowanie / błąd nie były audytowane w każdym widoku danych.
- **Bramka celu:**
  - R-01, R-07: decyzja właściciela, powód zapisany w DESIGN.md;
  - R-04 PASS: iskierek nie ma;
  - R-06 PASS: jedno rozstrzelenie, powód w DESIGN.md;
  - R-08 PASS: ↗ tylko na zewnątrz;
  - R-13, R-19 PASS: puls ograniczony do 3 fal.
