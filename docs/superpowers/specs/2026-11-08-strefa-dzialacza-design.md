# Strefa Działacza - nowy wygląd, teksty i rejestr zarządzeń

Data: 2026-11-08. Ustalenia z Mikołajem w rozmowie (makiety: `.superpowers/brainstorm/4329-1794140240/content/strefa-v2.html`).

## Po co

1. **Zarządzenia giną w mailach.** Zarządzenia Przewodniczącego wiszą publicznie (wymóg Regulaminu), ale zarządzenia Wiceprzewodniczących, Członków Zarządu i Zarządu krążą jako KOMUNIKAT WEWNĘTRZNY z załącznikiem. Baza dokumentów w CRA istnieje, ale to podsystem, do którego mało kto zagląda. Potrzebne jest jedno przystępne, przejrzyste miejsce ze wszystkimi zarządzeniami - widoczne od razu po wejściu do Strefy, z jasnym stanem: obowiązuje, zmienione, uchylone.
2. **Strefa wygląda na pustą i nieprzemyślaną.** Ma być czuć, że to Strefa Działacza Samorządu - ale bez wywyższania się wobec osób spoza Samorządu (odrzucone: „Za kulisami Samorządu”).
3. **Teksty mają być ludzkie**, proste i zrozumiałe dla Działaczy, nie wyliczanka funkcji.

## Cele

- Rejestr wszystkich zarządzeń (Przewodniczący, Wiceprzewodniczący, Członkowie Zarządu, Zarząd) na stronie głównej Strefy, tylko dla zalogowanych.
- Stan każdego zarządzenia widoczny: uchyla / zmienia / zmienione przez / uchylone przez - z linkami między nimi.
- Każde zarządzenie ma stały link, który można wkleić w komunikat zamiast załącznika.
- Nowy nagłówek z bramą (grafika Higgsfield), karta Działacza z rolami, wyraźne wylogowanie.
- Ikona z linkiem do LEX-a Uczelni.
- Nowe teksty (lista niżej - zatwierdzone).

## Czego nie robimy

- Nowego systemu do wydawania zarządzeń. Zarządzenia wpisuje się do arkusza tak jak dziś zarządzenia Przewodniczącego.
- Podstrony z rejestrem - sekcja leży na stronie głównej Strefy.
- Publicznej publikacji wewnętrznych zarządzeń. Publiczna strona `/zarzadzenia-przewodniczacego` zostaje bez zmian.
- Okienek „Teraz w Samorządzie” (najbliższy termin, dyżur) - odrzucone.
- Numeracji paragrafami (§ 1, § 2) w Strefie - odrzucone.
- Rzędu skrótów na dole strony - odrzucone.
- Integracji z bazą dokumentów CRA.

## Czego nie wolno zepsuć (antycele)

- Wewnętrzne zarządzenie nie może trafić do publicznego HTML ani danych RSC dla niezalogowanego. Dane pobiera serwer dopiero po sprawdzeniu sesji (wzór: kafelki w `src/app/[locale]/strefa-dzialacza/page.tsx`).
- Wewnętrzne zarządzenie nie może pojawić się na publicznej stronie zarządzeń Przewodniczącego.
- Literówka w arkuszu nie może po cichu dać fałszywego stanu („uchylone”) - błędny odnośnik idzie do podglądu „Treści strony” jako błąd wiersza.
- WCAG 2.1 AA (twardy wymóg projektu): kontrast, fokus, czytniki, ograniczony ruch.

## Dane: zakładka „Zarządzenia wewnętrzne”

Nowa zakładka w tym samym pliku arkusza „Treści strony” (`TRESCI_SHEET_ID`), czytana tym samym mechanizmem (`readTab` w `src/lib/tresci/arkusz.ts`, gviz CSV). Mikołaj zgodził się na zakładkę w tym pliku („jak wolisz”). Jeśli edycję ma mieć tylko Zarząd - „Chroń zakres” na tej zakładce (instrukcja w `docs/JAK-EDYTOWAC.md`).

Kolumny (nagłówki jak w innych zakładkach - bez polskich znaków w kluczach po normalizacji `csvRecords`):

| Kolumna | Wymagana | Treść |
|---|---|---|
| Wydający | tak | Funkcja, nie nazwisko - np. „Wiceprzewodniczący ds. Strategii i Działań Operacyjnych”, „Zarząd”. W arkuszu lista rozwijana (instrukcja). |
| Numer | tak | Pełny numer jak na dokumencie, np. `01/ZRZ-SIDO/2026-2027`. Zawiera znacznik wydającego, więc jest unikalny w całym Samorządzie. |
| Data | tak | Jak w zakładce „Zarządzenia” (`parseSheetDate`). |
| Tytuł | tak | „W sprawie …”. |
| Link | nie | Pełny adres PDF (Dysk). Zły adres = zarządzenie bez przycisku pliku + błąd wiersza (jak w `parse-zarzadzenia.ts`). |
| Uchyla | nie | Pełne numery uchylanych zarządzeń, oddzielone przecinkiem. |
| Zmienia | nie | Pełne numery zmienianych zarządzeń, oddzielone przecinkiem. |

**Grupa wydającego** (do filtra) wynika z kolumny „Wydający”: zaczyna się od „Przewodnicząc” → Przewodniczący (gdy nie „Wiceprzewodnicząc”), „Wiceprzewodnicząc” → Wiceprzewodniczący, „Członek”/„Członkini” Zarządu → Członkowie Zarządu, „Zarząd” → Zarząd. Wartość spoza tych grup = błąd wiersza, wiersz pokazujemy bez grupy (widoczny tylko przy filtrze „Wszyscy”).

**Zarządzenia Przewodniczącego** w rejestrze Strefy: dokładane z istniejącej zakładki „Zarządzenia” (`getZarzadzeniaData`) z wydającym „Przewodniczący”. W tamtej zakładce nie ma kolumn Uchyla/Zmienia - zarządzenie wewnętrzne może jednak wskazywać numer Przewodniczącego w swoich kolumnach.

**Stan wyliczany**, nie wpisywany:
- zarządzenie X jest „uchylone zarządzeniem Y”, gdy Y ma X w „Uchyla”,
- „zmienione zarządzeniem Y” (może być kilka), gdy Y ma X w „Zmienia”,
- numer w „Uchyla”/„Zmienia”, którego nie ma w żadnej zakładce → błąd wiersza Y („nie ma zarządzenia o numerze …”), bez wpływu na inne wiersze,
- porównanie numerów odporne na spacje i wielkość liter.

**Podgląd „Treści strony”** (`/strefa-dzialacza/tresci`) pokazuje nową zakładkę jak pozostałe: źródło, liczba wierszy, błędy. Brak zakładki albo pusta = pusta lista w Strefie (bez kopii „z kodu” - to dane wewnętrzne).

## Strona główna Strefy - układ

Od góry, po zalogowaniu:

1. **Nagłówek z bramą** zamiast ogólnego `PageHero` na tej stronie. Granatowe tło z delikatną siatką, po prawej brama 3D z sygnetu Samorządu (Higgsfield - `scripts/sig-src/brama.png`; jeśli rozdzielczość nie wystarczy na szeroki nagłówek, nowy render w Higgsfieldzie: ta sama brama, przezroczyste tło, bez ludzi). Po lewej tekst na przyciemnieniu - musi być czytelny (AA). Na telefonie brama schodzi do prawego górnego rogu, mniejsza i przygaszona, tekst na całą szerokość. Przed zalogowaniem brama przygaszona, po zalogowaniu podświetlona (poświata). Ruch: łagodne wejście poświaty, wyłączone przy `prefers-reduced-motion`. Okruszki (breadcrumbs) zostają.
2. **Karta Działacza**: zdjęcie z Google (albo inicjały), „Cześć, {imię}!”, pigułki ról (`roles.*` z komunikatów) z datą ważności, przycisk **„Wyloguj się” pełny czerwony** z białym napisem i ikoną (kontrast ≥ 4,5:1 w obu motywach). Wylogowanie zostaje formularzem POST (jak dziś).
3. **NARZĘDZIA** (kapitaliki) - obecna siatka kafelków bez zmian w budowie, nowe opisy.
4. **ZARZĄDZENIA** (kapitaliki), a w tym samym wierszu pigułka **„LEX Uczelni”** z ikoną (phosphor, np. Scales) → `https://lbd.ue.wroc.pl/183-logowanie/?ReturnUrl=%2f`, nowa karta.
   - Jedna cienka linia narzędzi: wyszukiwarka (numer lub tytuł), wybór wydającego (Wszyscy / Przewodniczący / Wiceprzewodniczący / Członkowie Zarządu / Zarząd), przełącznik „Pokaż uchylone”.
   - Lista: numer (mono, akcent), tytuł, pod nim wydający małym drukiem, data; etykiety stanu. Uchylone domyślnie ukryte; po włączeniu - przygaszone i przekreślone tytuły. Klik w wiersz otwiera PDF w nowej karcie (gdy jest link). Etykiety „uchylone zarządzeniem …” itp. przewijają do wskazanego wiersza (i włączają uchylone, jeśli trzeba).
   - Kolejność: od najnowszego (data, potem numer).
   - 6 najnowszych, „Pokaż wszystkie ({n})” rozwija w miejscu, „Zwiń” zwija.
   - Przycisk „Kopiuj link” przy wierszu: kopiuje adres `https://samorzad.ue.wroc.pl/{locale}/strefa-dzialacza#z-{numer-jako-slug}`; po kliknięciu „Skopiowano”.
   - Wejście z takim linkiem: lista rozwija się, uchylone włączają się, jeśli trzeba, wiersz jest przewinięty i wyróżniony. Niezalogowany najpierw się loguje - przycisk logowania zapamiętuje `location.hash` w `sessionStorage`, panel po zalogowaniu go odczytuje (logowanie Google gubi `#`).
   - Pusto: „W arkuszu nie ma jeszcze żadnego zarządzenia.” Brak wyników: „Nic nie pasuje do „{fraza}”.”
5. Bez niczego więcej na dole.

Przed zalogowaniem: ten sam nagłówek z bramą (przygaszoną), karta logowania i karta naborów jak dziś - nowe teksty.

Styl: tokeny i komponenty serwisu (Archivo, JetBrains Mono, `--accent`), ikony phosphor, ruch CSS/motion jak w reszcie serwisu - płynnie, bez kreskówkowości. Jasny i ciemny motyw.

## Teksty (zatwierdzone 8.11.2026)

Zasady: „Działacz” zawsze wielką literą, tylko „-” (żadnych długich myślników), pełne nazwy (Rada Uczelniana Samorządu Studentów). Angielskie odpowiedniki tłumaczy builder (EN strona istnieje); tytuły zarządzeń zostają po polsku.

Przed zalogowaniem:
1. Nadtytuł: „Strefa Działacza”.
2. Tytuł: „Wszystko do działania w jednym miejscu”.
3. Wstęp: „Narzędzia i zarządzenia, z których Działacze Samorządu korzystają na co dzień - od rezerwacji sal po posiedzenia Rady Uczelnianej Samorządu Studentów. Wchodzisz kontem w domenie @samorzad.ue.wroc.pl.”
4. „Zaloguj się kontem Samorządu” (bez zmian).
5. „Strefa jest dostępna tylko dla kont w domenie @samorzad.ue.wroc.pl. Jeśli Google podsunie prywatny Gmail, wybierz „Użyj innego konta” i wpisz adres Samorządu.”
6. „Zaloguj przez Google” (bez zmian). 7. Logowanie wyłączone - bez zmian.
8. Błąd domeny: „To konto nie należy do domeny @samorzad.ue.wroc.pl. Wybierz w Google „Użyj innego konta” i zaloguj się adresem Samorządu.”
9-11. Błąd logowania, blokada, „Chcesz działać w Samorządzie?” - bez zmian.
12. „Sprawdź, do których Komisji Samorządu i zespołów Projektowych trwa teraz nabór.” 13. „Zobacz nabory” (bez zmian).

Po zalogowaniu:
14. Tytuł: „Wszystko do działania w jednym miejscu” (nadtytuł „Strefa Działacza”).
15. Wstęp: „Widzisz narzędzia, do których daje Ci dostęp Twoja rola, i wszystkie zarządzenia. Jeśli czegoś brakuje, napisz na kontakt@samorzad.ue.wroc.pl.”
16. „Cześć, {imię}!” 17. Role: „{rola}”, „do {data}” albo „bez daty końca”. 18. „Wyloguj się”. 19. „NARZĘDZIA”. 20. „Otwórz”, „Wkrótce” (bez zmian).

Opisy kafelków (`src/lib/panel.ts`):
- Treści strony: „Tu sprawdzisz, czy strona dobrze odczytała arkusz z terminami, zarządzeniami, składami i dyżurami. Zobaczysz, który wiersz jest błędny i co w nim poprawić, a po poprawce odświeżysz stronę jednym kliknięciem.”
- Role i dostęp: „Decydujesz, kto co widzi w Strefie: nadajesz role, ustawiasz, do kiedy obowiązują, a w razie potrzeby blokujesz dostęp. Role Zarządu i radnych same wygasają 31 maja, z końcem kadencji.”
- CRA: „Potrzebujesz sali na spotkanie albo sprzętu na wydarzenie? W CRA zarezerwujesz salę 110L, 101L lub 106L, wypożyczysz sprzęt i załatwisz inne sprawy administracyjne Samorządu.”
- Generator stopki mailowej: „Wpisz imię, funkcję i telefon, a generator ułoży stopkę mailową w barwach Samorządu. Wybierasz jedną z trzech wersji i wklejasz ją do Gmaila lub Outlooka.” Ramka: „Nowa stopka jest obowiązkowa - Zarządzenie Wiceprzewodniczącego ds. Strategii i Działań Operacyjnych nr 01/ZRZ-SIDO/2026-2027.”
- RadaStudentów24: „Wszystko, czego potrzeba na posiedzeniu Rady Uczelnianej Samorządu Studentów: porządek obrad, lista obecności i kworum, głosowania jawne i tajne, kolejka mówców, a na koniec protokół i uchwały.”
- AdminOS: „Codzienna praca Komisji Administracji w jednym miejscu: sprawy do załatwienia, zebrania z protokołami, zadania, kalendarz i archiwum dokumentów.”
- Project D.E.C.K: „Liczby Samorządu w jednym miejscu: jak idą rekrutacje, jak wypadamy rok do roku, ile osób zostaje z nami na dłużej i czego możemy się spodziewać. Logujesz się tu osobnym kontem.”

ZARZĄDZENIA:
- Nagłówek „ZARZĄDZENIA”, pigułka „LEX Uczelni” (nazwa dostępna z dopiskiem „otwiera się w nowej karcie”). Bez zdania pod nagłówkiem.
- „Szukaj po numerze lub tytule”; „Wydający”: „Wszyscy / Przewodniczący / Wiceprzewodniczący / Członkowie Zarządu / Zarząd”; „Pokaż uchylone”.
- „uchyla {nr}”, „zmienia {nr}”, „zmienione zarządzeniem {nr}”, „uchylone zarządzeniem {nr}”.
- „Kopiuj link” → „Skopiowano”; „Pokaż wszystkie ({n})” / „Zwiń”.
- Puste stany jak wyżej.

Opis strony (meta, strona nieindeksowana): „Strefa Działacza Samorządu Studentów Uniwersytetu Ekonomicznego we Wrocławiu: narzędzia i zarządzenia dla Działaczy, logowanie kontem @samorzad.ue.wroc.pl.”

## Dokumentacja dla Działaczy

`docs/JAK-EDYTOWAC.md`: nowa sekcja „Zarządzenia wewnętrzne” - kolumny, przykład wiersza z `01/ZRZ-SIDO/2026-2027`, jak ustawić listę rozwijaną „Wydający”, jak chronić zakładkę, PDF na Dysku udostępniony tylko domenie `samorzad.ue.wroc.pl`.

## Zostawione builderowi

- Podział na komponenty, nazwy plików, testy (TDD jak w reszcie projektu: parser + stan w Vitest, widok w Playwright z axe).
- Dokładny kształt ikony LEX, siatki tła, poświaty bramy.
- Czy filtr wydającego to `select` czy chipy - byle dostępne z klawiatury i na telefonie.
- Tłumaczenia EN.
