# Zmienne środowiskowe i integracje

Strona działa **bez żadnych kluczy** — wszystkie integracje mają bezpieczny
fallback. Dodanie klucza po prostu „ożywia" daną funkcję. Klucze wklejasz w
**Vercel → Settings → Environment Variables** (Production + Preview), potem
**Redeploy**. Lokalnie: skopiuj `.env.example` → `.env.local` i uzupełnij.

> ⚠️ Nigdy nie commituj prawdziwych kluczy. `.env.local` jest w `.gitignore`.
> Do repo trafia tylko `.env.example` (puste wartości).

---

## 1. Formularze kontaktowe: Google Apps Script

Formularze Kontakt, Rzecznik i Partnerzy korzystają z akcji serwerowej
`src/app/actions/formularze.ts`. Wymagają `APPS_SCRIPT_URL` (adres wdrożenia
z końcówką `/exec`) i `APPS_SCRIPT_SECRET` (taki sam jak w skrypcie Google).
Sekret pozostaje na serwerze. Nie używamy Formspree ani `src/lib/forms.ts`.

Instrukcja wdrożenia i adresaci: [WRZUC-TUTAJ.md](WRZUC-TUTAJ.md), sekcja
„Formularze”. Kod backendu: [apps-script/Code.gs](apps-script/Code.gs).
Po ustawieniu zmiennych wykonaj redeploy. Bez konfiguracji formularz pokazuje
adres e-mail i blokuje wysyłkę.

W formularzu partnerów osoba kontaktowa trafia do pola `name`, a organizacja
do `subject`, które obecny skrypt zapisuje w arkuszu i mailu. Nie wymaga to
ponownego wdrażania skryptu Google. Przed otwarciem sprawdź każdy z trzech
formularzy: komunikat sukcesu, zapis w arkuszu i właściwą skrzynkę odbiorczą.

---

## 2. Kalendarz wydarzeń (Google Sheets jako CMS)

**Bez zmiennej lub przy błędzie:** API zwraca pustą listę. Nie publikujemy
fikcyjnych wydarzeń zastępczych.

**Konfiguracja (działacze edytują arkusz, strona sama się odświeża co 10 min):**
1. Utwórz arkusz Google z nagłówkami w pierwszym wierszu:
   `nazwa | data | tag`  (data w formacie `RRRR-MM-DD`, np. `2026-10-15`).
2. **Plik → Udostępnij → Opublikuj w internecie** → wybierz **cały dokument**
   i format **CSV** → **Opublikuj** → skopiuj wygenerowany link.
3. W Vercel dodaj zmienną:
   - `EVENTS_SHEET_CSV_URL` = (skopiowany link CSV)
4. **Redeploy**. Wydarzenia z arkusza pojawią się na stronie głównej.

Akceptowane nazwy kolumn (dowolna kolejność): nazwa/`name`/`wydarzenie`/`tytuł`,
data/`date`, tag/`kategoria`/`typ`.

---

## 3. Strefa działacza - logowanie przez Google

**Bez tych ustawień** strona `/strefa-dzialacza` pokazuje komunikat, że logowanie
jest chwilowo wyłączone, a przycisk „Zaloguj przez Google” wraca do tej samej
strony. Po konfiguracji osoby z kontem `@samorzad.ue.wroc.pl` logują się i widzą
panel z narzędziami (lista kafelków: `src/lib/panel.ts`).

Całość robi się raz, zalogowanym na konto administratora Google Workspace
Samorządu (domena `samorzad.ue.wroc.pl`). Nazwy przycisków podaję tak, jak
wyglądają w polskiej wersji konsoli Google; w angielskiej są w nawiasach.

**Krok 1. Projekt w Google Cloud**
1. Wejdź na <https://console.cloud.google.com>.
2. U góry kliknij listę projektów → **Nowy projekt** (*New project*). Nazwa np.
   „Strona Samorządu”, organizacja: `samorzad.ue.wroc.pl`. Kliknij **Utwórz**.

**Krok 2. Ekran zgody (to, co działacz zobaczy przy logowaniu)**
1. Menu po lewej → **Interfejsy API i usługi** (*APIs & Services*) → **Ekran
   zgody OAuth** (*OAuth consent screen*). W nowszej konsoli to **Platforma
   uwierzytelniania Google** (*Google Auth Platform*).
2. Typ użytkowników: **Wewnętrzny** (*Internal*). Dzięki temu zalogować się
   mogą tylko konta z domeny Samorządu i Google nie wymaga weryfikacji aplikacji.
3. Nazwa aplikacji: „Strefa działacza - Samorząd Studentów”. Adres e-mail
   pomocy i kontaktowy: np. `kontakt@samorzad.ue.wroc.pl`. Zapisz.
4. Zakresy (*Scopes*) zostaw domyślne - strona prosi tylko o adres e-mail,
   imię i nazwisko (`openid`, `email`, `profile`).

**Krok 3. Klient OAuth (klucze dla strony)**
1. **Interfejsy API i usługi** → **Dane logowania** (*Credentials*) →
   **Utwórz dane logowania** (*Create credentials*) → **Identyfikator klienta
   OAuth** (*OAuth client ID*). W nowszej konsoli: **Klienci** (*Clients*) →
   **Utwórz klienta**.
2. Typ aplikacji: **Aplikacja internetowa** (*Web application*). Nazwa np.
   „samorzad.ue.wroc.pl”.
3. W polu **Autoryzowane identyfikatory URI przekierowania** (*Authorized
   redirect URIs*) dodaj dokładnie ten adres:
   `https://samorzad.ue.wroc.pl/api/auth/callback`
   (opcjonalnie do testów lokalnych: `http://localhost:3000/api/auth/callback`).
   Pole „Autoryzowane źródła JavaScript” zostaw puste.
4. Kliknij **Utwórz**. Pojawi się okno z **Identyfikatorem klienta** (*Client
   ID*, kończy się na `.apps.googleusercontent.com`) i **Tajnym kluczem
   klienta** (*Client secret*). Skopiuj oba albo pobierz plik JSON. Tajnego
   klucza nie wysyłaj mailem ani na czacie.

**Krok 4. Zmienne w Vercelu**
Vercel → projekt `samorzad-uew` → **Settings** → **Environment Variables**.
Dodaj cztery zmienne, środowisko **Production**, typ **Sensitive**:

| Zmienna | Wartość |
| --- | --- |
| `GOOGLE_CLIENT_ID` | identyfikator klienta z kroku 3 |
| `GOOGLE_CLIENT_SECRET` | tajny klucz klienta z kroku 3 |
| `AUTH_SECRET` | długi losowy ciąg, co najmniej 32 znaki (np. wynik `openssl rand -base64 32`). Krótszy jest ignorowany i logowanie zostaje wyłączone. |
| `AUTH_URL` | `https://samorzad.ue.wroc.pl` - sam adres, bez ukośnika i ścieżki |

Adres powrotu z Google to zawsze `AUTH_URL` + `/api/auth/callback`, więc musi
się zgadzać z adresem wpisanym w kroku 3. Bez `AUTH_URL` logowanie na produkcji
jest celowo wyłączone (adresu z nagłówka żądania dałoby się podstawić).
Podglądy Vercela (*Preview*) mają inny adres, więc logowanie działa tylko na
produkcji i lokalnie.

**Krok 5. Wdrożenie i test**
1. Vercel → **Deployments** → najnowsze wdrożenie → **⋯** → **Redeploy**.
   Bez tego nowe zmienne nie zadziałają.
2. Wejdź na `https://samorzad.ue.wroc.pl/pl/strefa-dzialacza` → **Zaloguj przez
   Google** → wybierz konto `@samorzad.ue.wroc.pl`.
3. Jeśli wracasz z komunikatem „Logowanie się nie powiodło”, najczęstsze
   przyczyny to: adres przekierowania w kroku 3 różni się od `AUTH_URL`
   (np. `www.` albo ukośnik na końcu) albo nie było Redeploy po dodaniu zmiennych.
   Komunikat o koncie spoza domeny oznacza, że wybrano prywatnego Gmaila.

Dostęp jest twardo ograniczony w kodzie do domeny `@samorzad.ue.wroc.pl`
(`ALLOWED_DOMAIN` w `src/lib/auth-core.ts`): wymagany jest claim `hd` tej
domeny (konto Workspace Samorządu) i zweryfikowany adres `@samorzad.ue.wroc.pl`.
Konta spoza domeny, w tym prywatne Gmaile, są odrzucane. Logowanie używa PKCE.

---

## 4. Strefa działacza - role i blokada dostępu

Logowanie (sekcja 3) tylko potwierdza, że konto jest z domeny Samorządu.
O tym, co dana osoba widzi w Strefie, decyduje osobny magazyn ról w **Vercel
Edge Config** - sprawdzany na nowo przy każdym żądaniu, nie tylko raz przy
logowaniu, więc zablokowanie kogoś albo zmiana roli działa od razu, bez
czekania na wygaśnięcie ciasteczka sesji (do 14 dni).

**Bez poniższych zmiennych** każde zalogowane konto ma rolę „normal” (poza
superadminem - `kontakt@samorzad.ue.wroc.pl`, zaszytym na stałe w kodzie,
patrz `SUPERADMIN_EMAIL` w `src/lib/roles-core.ts`).

**Konfiguracja:**
1. Vercel → projekt `samorzad-uew` → **Storage** → **Create** → **Edge
   Config**. Nazwa np. „role”.
2. Zakładka **Connect to Project** → podepnij do `samorzad-uew` (środowisko
   Production i Preview) - to automatycznie doda zmienną `EDGE_CONFIG`.
3. Zakładka magazynu → skopiuj jego **ID** (zaczyna się od `ecfg_`) → dodaj
   jako zmienną `EDGE_CONFIG_ID`.
4. **Account Settings** → **Tokens** → **Create Token**. Zakres ograniczony
   do zespołu/projektu Samorządu (nie token osobisty na szerokim koncie) →
   skopiuj → dodaj jako `VERCEL_API_TOKEN` (typ **Sensitive**).
5. Jeśli projekt leży na koncie zespołowym - dodaj też `VERCEL_TEAM_ID` (ID
   zespołu, widoczne w adresie panelu albo w Ustawieniach zespołu).
6. **Redeploy**.

`EDGE_CONFIG` wystarcza do **odczytu** ról (SDK `@vercel/edge-config`).
`EDGE_CONFIG_ID` + `VERCEL_API_TOKEN` (+ opcjonalnie `VERCEL_TEAM_ID`) są
potrzebne do **zapisu** - edycji ról z panelu administracji w Strefie.

Lokalnie (`npm run dev`) magazyn w Edge Config zwykle nie jest podpięty - do
testowania ról własnego konta służy `DEV_SUPERADMIN`: adres e-mail (sama
część przed `@`, w domenie Samorządu), który dostaje uprawnienia superadmina
bez wpisu w magazynie. Działa **tylko** gdy `NODE_ENV=development` - na
produkcji jest ignorowany, więc nie da się go przez przypadek tam zostawić.

---

## Podsumowanie zmiennych

| Zmienna | Wymagana? | Co robi |
|---|---|---|
| `APPS_SCRIPT_URL` | dla formularzy | adres wdrożenia Apps Script `/exec` |
| `APPS_SCRIPT_SECRET` | dla formularzy | sekret zgodny z konfiguracją skryptu Google |
| `EVENTS_SHEET_CSV_URL` | nie | podpina kalendarz wydarzeń z Google Sheets |
| `TRESCI_SHEET_ID` | nie | ID arkusza „Treści strony” (terminy roku); bez niego strona używa kopii z kodu. Instrukcja: `docs/JAK-EDYTOWAC.md` |
| `TRESCI_SECRET` | z `TRESCI_SHEET_ID` | sekret odświeżania, ten sam co w `docs/apps-script/Tresci.gs` (min. 32 znaki) |
| `GOOGLE_CLIENT_ID` | nie | logowanie do Strefy działacza (OAuth Google) |
| `GOOGLE_CLIENT_SECRET` | nie | j.w. — sekret aplikacji OAuth |
| `AUTH_SECRET` | nie | podpis ciasteczka sesji działacza (min. 32 znaki) |
| `AUTH_URL` | nie | adres serwisu do powrotu z Google, np. `https://samorzad.ue.wroc.pl`; na produkcji bez niego logowanie jest wyłączone |
| `EDGE_CONFIG` | nie | connection string magazynu ról (Vercel Edge Config) - odczyt; bez niego każdy ma rolę „normal” |
| `EDGE_CONFIG_ID` | dla zapisu ról | ID magazynu ról (`ecfg_...`) |
| `VERCEL_API_TOKEN` | dla zapisu ról | token API Vercela (zakres: zespół/projekt Samorządu) |
| `VERCEL_TEAM_ID` | nie | ID zespołu Vercel, gdy projekt jest na koncie zespołowym |
| `DEV_SUPERADMIN` | nie | TYLKO lokalnie - adres e-mail z uprawnieniami superadmina bez wpisu w magazynie |

Wszystkie pełnią rolę „opcjonalnego ulepszenia" — strona jest w pełni używalna
bez nich, więc możesz dodawać je stopniowo.
