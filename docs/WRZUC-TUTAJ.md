# Wrzuć tutaj

Twoja skrzynka na klucze, identyfikatory i fakty, na które czeka kod.
**Zasada: wpisujesz wartość obok `→` i dajesz znać.** Ja przenoszę ją w odpowiednie
miejsce w kodzie, weryfikuję i wypycham.

Nie edytuj plików w `src/` — jeśli wpiszesz coś tutaj, nic się nie zepsuje.

Legenda: 🔴 blokuje działającą funkcję · 🟡 poprawia jakość · ⚪️ na przyszłość

---

## 🔴 Formularze — Google Apps Script (zamiast Formspree)

Trzy formularze (Kontakt, Rzecznik, Partnerzy) wysyłają teraz przez skrypt na
**Waszym koncie Google**. Zgłoszenie zapisuje się w arkuszu i przychodzi mailem.
Dane nie wychodzą poza konto Google Uczelni — to główny powód zmiany, obok
limitu 50 zgłoszeń miesięcznie w darmowym Formspree.

Dopóki nie ma zmiennych, formularze mówią wprost, że nie są uruchomione, i
podają adres e-mail — **nie udają, że wysyłają**.

### Krok po kroku

1. Na koncie Samorządu utwórz **nowy arkusz Google** (np. „Formularze — strona").
2. W arkuszu: **Rozszerzenia → Apps Script**.
3. Skasuj zawartość `Code.gs` i wklej całą treść pliku
   **`docs/apps-script/Code.gs`** z tego repozytorium.
4. Na górze skryptu, w `CONFIG`:
   - w `SEKRET` wpisz długi losowy ciąg (np. z `openssl rand -hex 32`);
   - sprawdź adresy w `ADRESACI` — zgłoszenia do Rzecznika idą na osobną
     skrzynkę i tak ma zostać.
5. **Wdróż → Nowe wdrożenie → typ: Aplikacja internetowa**:
   - *Wykonaj jako*: **ja** (konto Samorządu);
   - *Kto ma dostęp*: **Wszyscy** — to konieczne, żeby strona mogła wysłać
     zgłoszenie; bezpieczeństwa pilnuje sekret, nie ukrycie adresu.
6. Skopiuj adres wdrożenia — kończy się na **`/exec`**.
7. Przy pierwszym uruchomieniu Google poprosi o zgodę na wysyłkę maili —
   zaakceptuj.

### Co wklejasz do Vercela

Vercel → projekt → **Settings → Environment Variables** (Production i Preview):

| Zmienna | Wartość | Wklej |
|---|---|---|
| `APPS_SCRIPT_URL` | adres wdrożenia kończący się na `/exec` | → |
| `APPS_SCRIPT_SECRET` | **dokładnie ten sam** ciąg co `CONFIG.SEKRET` | → |

> Uwaga: w projekcie Dni Adaptacyjnych te dwie wartości są w `.env.example`
> zamienione miejscami (w `APPS_SCRIPT_URL` stoi identyfikator, a w
> `APPS_SCRIPT_SECRET` adres). Przy przepisywaniu łatwo to powielić — u nas
> `URL` to adres, `SECRET` to losowy ciąg.

Po wpisaniu obu zmiennych formularze ruszają same, bez zmian w kodzie.

### Czego już NIE trzeba

Umowa powierzenia z Formspree jest nieaktualna — nie korzystamy z tej usługi.
Podstawą pozostaje umowa, którą Uczelnia ma z Google dla Workspace.

---

## 🔴 Asystent AI "Zapytaj Samorząd" - klucz Gemini albo Anthropic

Serwerowa część asystenta (`/api/asystent`) jest gotowa i odpowiada wyłącznie na
podstawie treści strony. Dopóki brakuje klucza, trasa zwraca uczciwy komunikat
„niedostępne" zamiast udawać, że działa. Wystarczy JEDEN z dwóch kluczy.

**Klatka wiedzy.** Asystent nie korzysta z wiedzy spoza serwisu. Claude cytuje
fragmenty stron natywnie. Gemini zwraca odpowiedź razem z dosłownymi cytatami,
a serwer sprawdza je przed wysłaniem: cytat, którego nie ma na stronie, albo
liczba, data, e-mail czy link spoza zacytowanych stron = odpowiedź odrzucona
i komunikat „tej informacji nie ma w serwisie” z linkiem do kontaktu.

### Wariant A - Gemini (na start)

**Tylko płatny plan.** Warunki Gemini API: *„You may use only Paid Services when
making API Clients available to users in the European Economic Area”* - darmowy
limit nie może obsługiwać strony dla studentów w Polsce. Płatny plan oznacza też,
że Google nie używa pytań do ulepszania swoich produktów.

1. [aistudio.google.com](https://aistudio.google.com) → **Get API key** →
   utwórz klucz w projekcie Google Cloud.
2. W tym projekcie włącz rozliczenia (**Billing**), najlepiej z budżetem
   i alertem (np. 50 zł/mc).
3. Vercel → **Settings → Environment Variables** → `GEMINI_API_KEY`
   (Production, ewentualnie Preview).

**Koszt:** ok. 25-30 tys. tokenów na pytanie (cały serwis jako kontekst),
przy gemini-3.8-flash ok. 2 centów (ok. 8 groszy); powtarzany początek
zapytania Google cache'uje automatycznie, więc zwykle mniej.

### Wariant B - Claude (docelowo)

1. [console.anthropic.com](https://console.anthropic.com) → **API Keys** →
   **Create Key** (klucz zaczyna się od `sk-ant-...`).
2. Vercel → `ANTHROPIC_API_KEY`, a przy obu kluczach dodatkowo
   `ASSISTANT_PROVIDER=anthropic` (bez tego wygrywa Gemini).

**Koszt:** korpus jest cache'owany po stronie Anthropic, typowe pytanie
ok. **8 groszy**, przy tysiącu pytań miesięcznie ok. **80 zł/mc**.

| Zmienna | Wklej wartość |
|---|---|
| `GEMINI_API_KEY` albo `ANTHROPIC_API_KEY` | → |
| `ASSISTANT_PROVIDER` (opcjonalnie: `gemini` / `anthropic`) | → |

**Po zmianie dostawcy popraw Politykę prywatności** (sekcje 3c, 4 i 5
w `messages/pl.json` i `messages/en.json`): wymienia dostawcę modelu z nazwy.
Do lokalnego developmentu klucz trafia do `.env.local` (jest w `.gitignore`).

---

## 🔴 Ocena strony (okienko „Jak oceniasz nową stronę?”) - włączenie

Okienko jest gotowe w kodzie, ale WYŁĄCZONE, dopóki nie wykonasz dwóch kroków
w tej kolejności (odwrotna kolejność wysłałaby oceny mailem na kontakt@):

1. **Apps Script:** otwórz arkusz formularzy → Rozszerzenia → Apps Script,
   wklej aktualny `docs/apps-script/Code.gs` (doszła obsługa „opinia” - zakładka
   „Opinie”, bez maili) → Wdróż → Zarządzaj wdrożeniami → edytuj istniejące
   wdrożenie → Wersja: Nowa wersja → Wdróż. Adres wdrożenia się nie zmienia.
2. **Vercel:** Settings → Environment Variables → dodaj `OPINIE` = `1`
   (Production) → Redeploy. Okienko pojawia się po minucie na stronie, raz na
   użytkownika. Podgląd od razu: dowolna strona z `?opinia=teraz` w adresie.

Oceny trafiają do zakładki „Opinie” (data, gwiazdki, czy udało się znaleźć,
komentarz, strona, język). Wyłączenie: usuń `OPINIE` i zrób Redeploy.

---

## 🔴 Karteczki Kaizen (Strefa Działacza) - włączenie

Strona z karteczkami (`/strefa-dzialacza/kaizen`) i kafelek w panelu są
gotowe. Żeby karteczki docierały do Zarządu, a tablica się wypełniała:

1. **Apps Script:** otwórz arkusz formularzy → Rozszerzenia → Apps Script,
   wklej aktualny `docs/apps-script/Code.gs` (doszła obsługa „kaizen” i
   „kaizen-tablica”) → Wdróż → Zarządzaj wdrożeniami → edytuj istniejące
   wdrożenie → Wersja: Nowa wersja → Wdróż. Adres się nie zmienia, w Vercelu
   nic nie trzeba ustawiać.
2. **Powiadomienia:** na górze skryptu w `CONFIG.KAIZEN_ADRESACI` wpisz
   skrzynkę Zarządu (kilka adresów po przecinku). Domyślnie stoi
   kontakt@samorzad.ue.wroc.pl; pusty napis wyłącza maile.
3. **Test:** w edytorze uruchom funkcję `testKaizen`. Powstanie zakładka
   „Kaizen” z jednym wierszem testowym (usuń go potem) i przyjdzie mail
   „[Kaizen] Nowa karteczka”.

Karteczki trafiają do PRYWATNEGO arkusza formularzy, nie do „Treści strony”
(tamten jest jawny dla każdego z linkiem). Do arkusza nie trafia autor -
tylko data, obszar i treść. Jak Zarząd z nimi pracuje: `docs/JAK-EDYTOWAC.md`,
sekcja „Karteczki Kaizen”.

---

## 🟡 Fakty do potwierdzenia

Rzeczy, które są już na stronie, ale opierają się na niepewnym źródle.

| Co | Stan obecny | Twoja odpowiedź |
|---|---|---|
| Liczba projektów rocznie (chip w hero) | „9 projektów rocznie" — nigdy nie potwierdzone | → |
| Liczba studentów | ok. 9 000 — oparte na jawnych danych, **do potwierdzenia**, patrz niżej | → |
| Rok założenia Samorządu | 1987 (podane przez Ciebie) | ✅ |

### Liczba studentów — dlaczego to pilne

Na stronie głównej ta liczba stoi w hero i w sekcji „O nas", czyli w miejscu,
które administracja uczelni zobaczy jako pierwsze. Tymczasem **dowody publiczne
mówią co innego niż nasza deklaracja**:

| Źródło | Liczba | Rok |
|---|---|---|
| Wikipedia (infobox, bez przypisu) | 8 941 | grudzień 2023 |
| Wikipedia (sekcja „Pracownicy i studenci") | 12 271 | 2015/2016 |
| Wcześniej podane przez Samorząd (wycofane) | 10 000+ | — |
| **Obecnie na stronie** | **ok. 9 000** | — |

Trend jest wyraźnie **spadkowy** (niż demograficzny), więc „10 000+" było
zawyżone. Strona podaje teraz **ok. 9 000** — najbliżej jawnych danych i bez
znaku „+", bo liczba raczej maleje niż rośnie. Uczelnia zna swoją prawdziwą
liczbę studentów; rozbieżność w górę kosztuje wiarygodność.

**Co zrobić:** poproś Dział Nauczania albo Biuro Rektora o aktualną liczbę
studentów na rok 2026/2027 (najlepiej z datą). Wtedy wpiszemy fakt z podaniem
stanu na dzień — zgodnie z zasadą „każda liczba ma źródło i datę".

| Co | Odpowiedź |
|---|---|
| Aktualna liczba studentów + data, na kiedy | → |

---

## 🟡 Infopacki „żywe dokumenty" — sprawdzenie numerów paragrafów

Podstrony infopacków (regulamin studiów, podania, USOS, zaliczenie semestru)
odsyłają do **konkretnych paragrafów** Uczelnianego Regulaminu Studiów, np.
„§ 18 · str. 16", z linkiem otwierającym PDF na danej stronie.

**Co zweryfikowałem maszynowo:** źródło jest prawdziwe — uchwała Senatu
R.0000.21.2025 z 27 marca 2025, obowiązuje od roku 2025/2026, opublikowana w
BIP UEW. PDF się pobiera, ma 33 strony, a wszystkie numery stron użyte w
linkach mieszczą się w tym zakresie. Treść opisów jest ostrożna — nie wymyśla
liczb ani terminów, mówi „regulamin określa…", zamiast podawać konkret.

**Czego NIE dało się sprawdzić:** czy dany paragraf faktycznie dotyczy
opisanego tematu. PDF używa własnego kodowania czcionki i znak `§` nie daje się
z niego wyciągnąć programowo.

**Prośba:** otwórz PDF i sprawdź wyrywkowo 2–3 pozycje (np. czy § 18 to
rzeczywiście nieobecności, a § 39–40 warunek i powtarzanie semestru). Jeśli
któryś numer nie pasuje — napisz który, poprawię.

| Sprawdzone? | Twoja odpowiedź |
|---|---|
| Numery paragrafów zgodne z regulaminem | → |

---

## ⚪️ Treści i pliki

Osobna, szczegółowa lista jest w [MATERIALY.md](MATERIALY.md) — zdjęcia, dokumenty
PDF, składy osobowe, logotypy partnerów. Poniżej tylko te pozycje, które
odblokowują konkretną funkcję.

| Co | Co odblokuje | Gdzie wrzucić |
|---|---|---|
| Portrety Zarządu (4:5) | Zdjęcia zamiast inicjałów na `/zarzad` | `public/photos/zarzad/01.jpg …` |
| Portrety RUSS (4:5) | To samo na stronie RUSS | `public/photos/russ/01.jpg …` |
| Zdjęcia z wydarzeń | Prawdziwe kadry zamiast stockowych w „Życie studenckie" i „Projekty" | `public/photos/zycie/`, `public/photos/projekty/` |
| Regulaminy i statut (PDF) | Zdejmuje plakietki „Wkrótce"; **warunek konieczny dla asystenta AI** cytującego paragrafy | `public/dokumenty/` |
| ID filmu z YouTube | Sekcja wideo w hubie Stypendiów (dziś ukryta) | `src/lib/videos.ts` — albo wpisz tutaj → |

---

## 🟡 Wydawnictwo UEW — Debiuty Studenckie

Strona `/wydawnictwo` działa, ale **ściana grzbietów pokazuje trzy publikacje-atrapy**
(oznaczone w kodzie jako `PLACEHOLDER — DO WERYFIKACJI`). Wyglądają wiarygodnie,
więc trzeba je podmienić, zanim ktoś weźmie je za prawdziwe.

**Publikacje** — dla każdej: tytuł, autorzy, rok, koło naukowe, ISBN, link do
pełnego tekstu, krótki abstrakt. Wpisz poniżej albo prześlij listę, ja przeniosę
do `src/lib/publications.ts`.

→

**Szczegóły proceduralne z Wydawnictwa** — świadomie ich nie wymyśliłem, bo
uczelniane serwery blokowały pobieranie, a zmyślony termin albo procedura byłyby
gorsze niż ich brak. Potrzebuję:

| Co | Odpowiedź |
|---|---|
| Termin/terminy zgłaszania tekstów | → |
| Jak dokładnie wygląda zgłoszenie (formularz? mail? przez opiekuna koła?) | → |
| Osoba lub adres kontaktowy w Wydawnictwie | → |
| Wymogi formalne (objętość, format, przypisy) | → |
| Czy publikacja jest bezpłatna dla studenta | → |

Potwierdzone i już użyte na stronie: seria wydawana przez Wydawnictwo UEW
(działa od 1955, ponad 100 tytułów rocznie), autorami są studenci **I i II roku**,
adresat to **koła naukowe**, licencja **CC BY-SA 4.0**.

---

## Jak to działa po Twojej stronie

1. Wpisujesz wartość obok `→` w tabelce (albo wrzucasz plik we wskazane miejsce).
2. Piszesz mi jednym zdaniem, co doszło.
3. Ja przenoszę to do kodu, sprawdzam build i testy, wypycham na produkcję.

Jeśli czegoś nie wiesz albo nie masz — napisz „nie mam". To też jest odpowiedź:
wtedy albo zostawiam stan uczciwy (jak inicjały zamiast zdjęć), albo proponuję
rozwiązanie zastępcze.
