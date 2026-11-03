# Strefa Działacza: przycisk konta i role - design

> Data: 2026-11-03. Ustalone z Mikołajem w rozmowie. Zakres: widoczny stan
> zalogowania w nawigacji, dłuższa sesja, role przypisane do adresów e-mail
> i panel ról dla superadmina. Przypisanie kafelków do ról ustalimy osobno.

## Cel i dlaczego

Dziś po zalogowaniu nic w nawigacji nie mówi, że ktoś jest zalogowany, a sesja
wygasa po 8 godzinach. Panel pokazuje wszystkim te same kafelki. Strefa ma się
stać panelem z rolami: zalogowany działacz od razu widzi swój avatar w rogu,
nie musi się logować co dzień, a widzi tylko narzędzia przeznaczone dla jego
funkcji. Rolami zarządza jedno stałe konto (kontakt@), bo skład Samorządu
zmienia się co kadencję, a Komisja Administracji nawet kilka razy w roku.

## Co już jest (nie ruszamy zasady działania)

- Logowanie Google OAuth z PKCE tylko dla kont Workspace `samorzad.ue.wroc.pl`
  (`src/lib/auth-core.ts`, `src/app/api/auth/*`). Zostaje bez zmian.
- Sesja to podpisane HMAC ciasteczko `ssuew_session` z `{ email, name, exp }`.
- Kafelki panelu: `src/lib/panel.ts` (tylko serwer). Strona panelu:
  `src/app/[locale]/strefa-dzialacza/page.tsx`. Podstrony Strefy (`tresci`,
  `generator-stopki`) pilnuje `requireSession`.
- Przycisk „Strefa Działacza” w `src/components/Nav.tsx` (desktop: prawy róg,
  `xl:flex`; mobile: w rozwijanym menu).

## Zakres

### 1. Sesja: 14 dni od ostatniego wejścia

- Sesja wygasa 14 dni po ostatniej aktywności (sliding expiration). Każde
  wejście na stronę przez zalogowaną osobę przesuwa termin o 14 dni.
- Odświeżenie ciasteczka nie częściej niż raz na dobę (żeby nie podpisywać
  tokenu przy każdym żądaniu). Miejsce odświeżania wybiera wykonawca; naturalne
  jest endpoint z punktu 2, który nawigacja woła przy każdym wejściu.
- Sesja dodatkowo zapamiętuje `picture` (URL zdjęcia z claimu `picture`
  w id_token). Brak zdjęcia nie jest błędem.
- Stare ciasteczka (bez `picture`) mają dalej działać do wygaśnięcia.

### 2. Przycisk konta w nawigacji (wariant C)

**Desktop (prawy róg, w miejscu obecnego przycisku):** ta sama ramka co dziś
(`h-11`, `rounded-md`, `border-border-strong`), w środku: avatar 32 px z zieloną
kropką „zalogowany” w prawym dolnym rogu, napis „Strefa Działacza”, strzałka ▾.

**Mobile:** na pasku (obok przycisku menu) sam avatar z kropką; otwiera to samo
menu. Pozycja „Strefa Działacza” w rozwijanym menu mobilnym może zostać.

**Brak zdjęcia:** inicjały na granatowym gradiencie (`#2C4BFF` → granat).

**Menu po kliknięciu** (popover pod przyciskiem, dostępny z klawiatury,
zamykany Esc i kliknięciem obok, focus wraca na przycisk):
1. Avatar 44 px, imię i nazwisko, e-mail (JetBrains Mono).
2. „Twoje role”: chipy z nazwą roli i datą ważności, jeśli jest
   (np. „zarząd do 31.05.2027”). Rola „normal” jako jedyna też się pokazuje.
3. „Panel działacza” → `/strefa-dzialacza`.
4. „Role i dostęp” → panel ról (punkt 4). Tylko dla superadmina.
5. „Wyloguj się” (istniejący `/api/auth/logout`).

**Niezalogowany:** bez zmian, obecny przycisk „Strefa Działacza”.

**Ważne technicznie:** strony serwisu nie mogą przez to przestać być
statyczne. Layout NIE czyta ciasteczek. Nawigacja (komponent kliencki) pobiera
stan z małego endpointu typu `GET /api/auth/me` (`Cache-Control: no-store`),
który zwraca `{ name, email, picture, roles }` albo 401. Do czasu odpowiedzi
w rogu stoi przycisk o tych samych wymiarach (bez skoku układu); zmiana stanu
płynna, bez migania. Endpoint jest też miejscem odświeżania sesji (punkt 1).
Zdjęcie z `lh3.googleusercontent.com`: zwykły `<img>` z `referrerPolicy="no-referrer"`
albo `next/image` z dopisanym `remotePatterns` - do wyboru wykonawcy.

Wygląd i animacje według DESIGN.md i zasad projektu (płynnie, bez
kreskówkowości, CSS-first, `prefers-reduced-motion`). WCAG obowiązkowo.
Teksty PL i EN (parytet kluczy w `messages/*.json`).

### 3. Role

**Lista ról** (identyfikator → etykieta):

| id | etykieta | kto | wygasa |
|---|---|---|---|
| `superadmin` | Superadmin | tylko kontakt@samorzad.ue.wroc.pl | nigdy |
| `zarzad` | Zarząd | członkowie Zarządu | domyślnie 31 maja |
| `projekty` | Projekty | Wice ds. Projektów | domyślnie 31 maja |
| `russ` | RUSS | radni Rady Uczelnianej Samorządu Studentów | domyślnie 31 maja |
| `admi` | Komisja Administracji | członkowie Komisji | nie wygasa, usuwana ręcznie |
| `normal` | Działacz | każdy zalogowany bez innej roli | - |

- Listę ról trzymamy w kodzie jako jedno źródło (typ + etykiety PL/EN +
  domyślna ważność), żeby dodanie kolejnej roli było jednym wpisem.
- Jedna osoba może mieć kilka ról. Każde nadanie roli ma własną datę ważności
  (albo jej brak).
- „Domyślnie 31 maja” = najbliższy 31 maja po dniu nadania. Superadmin może
  datę zmienić albo usunąć. Rola ważna do końca tego dnia czasu
  Europe/Warsaw; potem przestaje działać sama, bez żadnej akcji.
- `normal` nie jest zapisywana: dostaje ją każdy zalogowany, który nie ma
  żadnej ważnej roli.
- **Superadmin jest zaszyty w kodzie** (stała z adresem kontakt@). Nie da się
  go odebrać w panelu ani nadać nikomu innemu. Panel nie pozwala nadać roli
  `superadmin`. kontakt@ to zwykłe konto Workspace z hasłem (potwierdzone),
  więc przechodzi obecne logowanie (`hd` + zweryfikowany adres).
- **Superadmin do testów lokalnych:** dodatkowy adres ze zmiennej środowiskowej
  (np. `DEV_SUPERADMIN`), honorowany wyłącznie przy `NODE_ENV=development`.
  Na produkcji ignorowany, nawet gdy ustawiony.
- **Role sprawdzane przy każdym żądaniu, nie zapisywane w ciasteczku.**
  Odebranie roli działa od razu, a nie po wygaśnięciu 14-dniowej sesji.
- Uprawnienia sprawdza serwer. Ukrycie kafelka to za mało: każda podstrona
  Strefy i każda akcja serwera sprawdza rolę (rozszerzenie `requireSession`
  o wymagane role). Superadmin przechodzi każde sprawdzenie.

**Blokada dostępu.** Dłuższa sesja nie jest ponownie sprawdzana w Google, więc
osoba usunięta z Workspace albo z Komisji mogłaby dalej wchodzić do Strefy
(z rolą `normal`). Dlatego superadmin może zablokować adres:
- Zablokowany adres przy następnym żądaniu traci sesję (traktowany jak
  niezalogowany, ciasteczko kasowane) i nie może się zalogować ponownie -
  callback logowania sprawdza blokadę i wraca z błędem (nowy kod błędu
  z komunikatem PL/EN w Strefie, np. „Twój dostęp został zablokowany.
  Napisz na kontakt@samorzad.ue.wroc.pl”).
- Sprawdzenie blokady idzie razem z odczytem ról (to samo źródło, ten sam
  moment), więc nic nie dokłada.
- Blokada jest ręczna i bezterminowa; superadmin może ją zdjąć. Zablokowanie
  osoby nie usuwa jej ról automatycznie (wybór wykonawcy, czy panel to
  proponuje).
- kontakt@ (i lokalny `DEV_SUPERADMIN`) nie da się zablokować.

**Magazyn:** Vercel Edge Config (strona nie ma bazy). Jeden klucz z listą
`{ email, roles: [{ role, until | null }], blocked?: boolean }` (dokładny
kształt do wyboru wykonawcy). Zablokować można też adres, który nie ma ról.
Token API do zapisu zakładamy na koncie Samorządu (administracja-ssuew),
nie na prywatnym, żeby edycja ról nie przestała działać po czyimś odejściu.
Wykonawca sprawdza limity odczytów/zapisów Edge Config dla planu projektu;
skala to kilkadziesiąt osób i kilka zmian w miesiącu. Gdy zapis się nie uda,
panel mówi to wprost i niczego nie udaje. Odczyt przez `@vercel/edge-config`
(zmienna `EDGE_CONFIG`), zapis przez Vercel REST API (token API i ID Edge
Config w zmiennych środowiskowych, tylko serwer). Bez skonfigurowanego Edge
Config strona działa dalej: kontakt@ jest superadminem, wszyscy inni mają
`normal`, a panel ról pokazuje komunikat, czego brakuje (wzorem
`isAuthConfigured`). Zmienne środowiskowe ustawiamy razem z Mikołajem.

### 4. Panel „Role i dostęp” (tylko superadmin)

Nowa podstrona Strefy, np. `/strefa-dzialacza/role`. Niezalogowany albo bez
uprawnień: przekierowanie do panelu. Adres i nazwa strony nie są tajne
(chroni je sprawdzenie na serwerze), tajna jest lista osób z rolami.

- Lista osób: e-mail, role jako chipy z datą ważności. Role wygasające w ciągu
  30 dni wyraźnie oznaczone. Role już wygasłe pokazane osobno albo wyszarzone,
  z możliwością przedłużenia lub usunięcia.
- Dodanie osoby: pole e-mail (tylko `@samorzad.ue.wroc.pl`, walidacja na
  serwerze), wybór jednej lub kilku ról, data ważności podpowiedziana z roli
  (31 maja dla zarząd/projekty/russ, pusta dla admi), do zmiany.
- Edycja: dodanie/odebranie roli, zmiana daty, usunięcie osoby.
- „Zablokuj dostęp” / „Odblokuj” przy osobie oraz możliwość zablokowania
  adresu wpisanego ręcznie. Zablokowane osoby wyraźnie oznaczone. Blokada
  wymaga potwierdzenia (to akcja z natychmiastowym skutkiem).
- Zmiany przez akcje serwera, każda sprawdza superadmina po stronie serwera.

### 5. Kafelki zależne od roli

- `PanelTile` dostaje pole `roles` (lista ról, które widzą kafelek). Brak pola
  = widzi każdy zalogowany. Superadmin widzi wszystko.
- Strona panelu filtruje kafelki na serwerze; niewidoczne kafelki nie trafiają
  ani do HTML, ani do danych RSC (jak dziś dla niezalogowanych).
- Na start wszystkie obecne kafelki zostają bez `roles` (widoczne dla
  wszystkich). Przypisanie kafelków do ról ustalimy w kolejnej rozmowie.

## Poza zakresem

- Przypisanie konkretnych kafelków i podstron do ról (następna rozmowa).
- Nowe narzędzia w panelu.
- Historia zmian ról (jeden superadmin, nie jest teraz potrzebna).
- Synchronizacja z grupami Google Workspace.
- Zmiana zasad logowania (domena, PKCE) - zostaje jak jest.

## Czego nie wolno

- Strona publiczna nie może stać się dynamiczna przez przycisk konta.
- Adresy narzędzi i przypisania osób do ról (oraz lista blokad) nie mogą
  trafić do publicznego JS. Nazwy ról i etykieta „Role i dostęp” mogą leżeć
  w `messages/*.json` - nie są tajne.
- Rola nie może działać dłużej, niż wynika z panelu (stąd odczyt przy każdym
  żądaniu).
- Teksty strony: tylko zwykły dywiz „-”, nigdy półpauza ani pauza.

## Decyzje Claude'a (do sprawdzenia)

- Projekty i RUSS wygasają 31 maja jak Zarząd (RUSS potwierdzone przez
  Mikołaja, projekty wynika z tego, że Wice ds. Projektów jest w Zarządzie).
- Oznaczenie ról wygasających w ciągu 30 dni.
- Edge Config jako magazyn.
- Endpoint `/api/auth/me` zamiast czytania ciasteczek w layoucie.
- Etykieta roli `normal` w interfejsie: „Działacz”.
- Lokalny superadmin ze zmiennej `DEV_SUPERADMIN`, tylko w trybie deweloperskim.
- Domyślna data „najbliższy 31 maja” bez wyjątków: kadencja startuje w lipcu,
  więc role nadaje się zwykle w lipcu, a datę zawsze można poprawić.
- Token Edge Config na koncie Samorządu.
- Blokada wymaga potwierdzenia i nie usuwa automatycznie ról.

## Do decyzji wykonawcy

Dokładne nazwy plików i tras, kształt endpointu, sposób odświeżania sesji
(o ile raz na dobę i bez psucia statyczności), szczegóły animacji popovera,
układ panelu ról w granicach DESIGN.md, testy jednostkowe logiki ról
(wygasanie, domyślna data, fallback bez Edge Config).
