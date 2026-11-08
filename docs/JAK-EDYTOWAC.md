# Jak edytować treści strony

Ta instrukcja jest dla osób z Samorządu, które **nie programują**. Terminy roku akademickiego zmieniasz w arkuszu Google, a strona pokazuje zmianę po kilku sekundach. Nie musisz niczego instalować ani dotykać kodu.

Arkusz nazywa się **„Treści strony”** i leży na Dysku Samorządu. Jeśli go nie widzisz, poproś o dostęp osobę, która zarządza kontami `@samorzad.ue.wroc.pl`.

---

## Na co dzień: zmiana terminu

1. Otwórz arkusz „Treści strony”, zakładka **Terminy**.
2. Zmień wiersz albo dopisz nowy na dole. Opis kolumn jest niżej.
3. Gotowe. Po kilku sekundach przeładuj stronę `/kalendarz` i sprawdź.

Jeśli zmiana się nie pojawiła:

- w arkuszu kliknij menu **Strona Samorządu → Odśwież stronę teraz**,
- albo zaloguj się na stronie i wejdź w **Strefa Działacza → Treści strony**. Zobaczysz tam, czy strona widzi arkusz, i listę wierszy, których nie przyjęła, z powodem i numerem wiersza.

**Błędny wiersz nie psuje strony.** Strona go pomija, a resztę pokazuje normalnie. Gdy arkusz w ogóle nie działa, strona pokazuje ostatnią kopię zapisaną w kodzie. Strona nigdy nie będzie pusta.

---

## Zakładka „Terminy”

Jeden wiersz to jeden termin. Pierwszy wiersz (nagłówki) zostaw bez zmian.

| Kolumna | Co wpisać | Przykład |
| --- | --- | --- |
| **rodzaj** (wymagane) | jedno z: `zajęcia`, `sesja`, `poprawka`, `przerwa`, `dzień wolny`, `wniosek`, `uroczystość` | `sesja` |
| **tytuł** (wymagane) | nazwa po polsku | `Zimowa sesja egzaminacyjna` |
| tytuł EN | nazwa po angielsku; puste = strona angielska pokaże polską | `Winter exam session` |
| **od** (wymagane) | pierwszy dzień | `09.02.2027` albo `2027-02-09` |
| do | ostatni dzień (włącznie); puste = termin jednodniowy | `22.02.2027` |
| dla kogo | wypełnij tylko, gdy termin nie dotyczy wszystkich | `IV rok ZIiP` |
| dla kogo EN | to samo po angielsku | `Year 4, ZIiP` |
| źródło | skąd jest data (dokument) | `Harmonogram roku akademickiego 2027/2028 (BIP UEW)` |
| źródło EN | to samo po angielsku | `Academic year schedule 2027/2028 (UEW BIP)` |
| link źródła | pełny adres dokumentu | `https://www.bip.ue.wroc.pl/...` |
| link na stronie | podstrona, na której termin ma się pokazać jako przypomnienie (patrz niżej) | `/stypendia#fundusz` |
| id | zostaw puste przy nowym wierszu; strona nada je sama | |

Rzeczy, które warto wiedzieć:

- **Daty** wpisuj jako `09.02.2027` albo `2027-02-09`. Inne zapisy (np. `9 lutego`) strona odrzuci i pokaże błąd w Strefie Działacza.
- **Terminy minione nie przeszkadzają.** Strona pokazuje tylko to, co trwa albo nadchodzi. Stare wiersze możesz zostawić albo usunąć.
- **„dla kogo”** chowa termin za przełącznikiem „Pokaż też terminy wybranych kierunków i lat”. Dzięki temu większość studentów nie widzi podwójnych sesji.
- **Na pasku roku** widać zajęcia, sesje, poprawki, przerwy i dni wolne dla wszystkich. Wnioski i uroczystości są tylko na liście.

### Przypomnienia na podstronach („link na stronie”)

Gdy termin ma w kolumnie **link na stronie** adres podstrony, na tej podstronie pokazuje się ramka „najbliższy termin” z przyciskiem „Dodaj do kalendarza”. Strona sama wybiera najbliższy przyszły termin z tym adresem, więc na kolejny rok wystarczy dopisać nowy wiersz z tym samym linkiem.

Dziś żadna podstrona nie ma takiej ramki (ramka funduszu stypendialnego zniknęła razem z terminem na rok 2026/2027). Linki takie jak `/infopacki/zaliczenie-semestru` też możesz wpisywać: tytuł na liście w `/kalendarz` stanie się wtedy odnośnikiem do tej strony. Ramkę przypomnienia na nowej podstronie dokłada ktoś, kto zajmuje się kodem (jedna linijka, opis na końcu).

---

## Zakładka „Zamiany dni”

Dni, w które zajęcia idą według planu z innego dnia tygodnia (np. „w piątek 6 listopada zajęcia jak w poniedziałek”). Są w harmonogramie roku akademickiego, w dopisku na dole.

| Kolumna | Co wpisać | Przykład |
| --- | --- | --- |
| **data** | dzień zamiany | `06.11.2026` |
| **plan z dnia** | dzień tygodnia, którego plan obowiązuje | `poniedziałek` |
| tydzień | `T1` albo `T2`, jeśli harmonogram tak podaje; inaczej puste | `T1` |

---

## Zakładka „Zarządzenia”

Zarządzenia Przewodniczącego. Każdy wiersz to jedno zarządzenie. Pojawia się w rejestrze na `/zarzadzenia-przewodniczacego`, a trzy najnowsze także na karcie Przewodniczącego na `/zarzad`. Kolejność w arkuszu nie ma znaczenia: strona sama układa je od najnowszego.

| Kolumna | Co wpisać | Przykład |
| --- | --- | --- |
| **numer** | numer zarządzenia | `1/2026/2027` |
| **data** | dzień wydania | `01.10.2026` |
| **tytuł** | czego dotyczy, tak jak w zarządzeniu | `W sprawie powołania Komisji ds. Kontaktów Zewnętrznych` |
| tytuł EN | tytuł po angielsku; puste = angielska wersja pokaże polski | |
| link | pełny adres do PDF po polsku (plik na Dysku udostępniony „każdy z linkiem”) | `https://drive.google.com/…` |
| link EN | pełny adres do PDF po angielsku; na polskiej wersji strony pojawi się przy nim plakietka „EN”, a na angielskiej przycisk „Open” prowadzi tutaj | `https://drive.google.com/…` |

Nagłówki w pierwszym wierszu muszą brzmieć dokładnie: `numer`, `data`, `tytuł`, `tytuł EN`, `link`, `link EN`. Wiersz bez numeru, tytułu albo z błędną datą strona pominie, a Strefa Działacza → Treści strony powie, co poprawić.

---

## Zakładka „Zarządzenia wewnętrzne”

Zarządzenia Wiceprzewodniczących, Członków Zarządu i Zarządu. **Strona nie pokazuje ich publicznie**: widać je tylko w Strefie Działacza po zalogowaniu (sekcja „Zarządzenia”), razem z zarządzeniami Przewodniczącego z zakładki „Zarządzenia”. Zamiast wysyłać zarządzenie mailem jako załącznik, wpisz je tutaj, a w KOMUNIKACIE WEWNĘTRZNYM daj link - w Strefie przy każdym zarządzeniu jest przycisk „Kopiuj link”.

Nazwa zakładki musi brzmieć dokładnie **Zarządzenia wewnętrzne**. Kolejność wierszy nie ma znaczenia: Strefa sama układa je od najnowszego.

| Kolumna | Co wpisać | Przykład |
| --- | --- | --- |
| **wydający** | funkcja, nie nazwisko - zarządzenie zostaje, osoby się zmieniają | `Wiceprzewodniczący ds. Strategii i Działań Operacyjnych` |
| **numer** | pełny numer, tak jak na dokumencie | `01/ZRZ-SIDO/2026-2027` |
| **data** | dzień wydania | `05.11.2026` |
| **tytuł** | czego dotyczy, tak jak w zarządzeniu | `W sprawie obowiązkowej stopki mailowej` |
| link | pełny adres do PDF | `https://drive.google.com/…` |
| uchyla | pełne numery zarządzeń, które to uchyla, po przecinku | `01/ZRZ/2025-2026` |
| zmienia | pełne numery zarządzeń, które to zmienia, po przecinku | `01/ZRZ-PR/2026-2027` |

Nagłówki w pierwszym wierszu: `wydający`, `numer`, `data`, `tytuł`, `link`, `uchyla`, `zmienia`.

- **Stan liczy się sam.** Nie oznaczasz starego zarządzenia jako uchylonego - wystarczy, że nowe ma jego numer w kolumnie „uchyla”. Strefa pokaże stare jako przekreślone „uchylone zarządzeniem …”, a przy „zmienia” - etykietę „zmienione zarządzeniem …”. Można wskazywać też zarządzenia Przewodniczącego.
- **Literówka w numerze** w „uchyla” albo „zmienia” niczego nie oznaczy - Treści strony pokażą błąd w tym wierszu. To samo przy wpisaniu tego samego numeru dwa razy.
- **Lista rozwijana „wydający”** (żeby nie było literówek): zaznacz kolumnę → Dane → Weryfikacja danych → Dodaj regułę → Menu - lista elementów, i wpisz funkcje: `Przewodniczący`, `Wiceprzewodniczący ds. …` (każda funkcja osobno), `Członek Zarządu ds. …`, `Zarząd`. Strefa grupuje po początku nazwy: Wiceprzewodniczący/-a, Członek/Członkini Zarządu, Zarząd, Przewodniczący/-a.
- **Kto może edytować**: jeśli tylko Zarząd, kliknij prawym na zakładkę → Chroń arkusz → Ustaw uprawnienia i wybierz osoby.
- **Uwaga: sam arkusz nie jest tajny.** Arkusz „Treści strony” musi być udostępniony „każdy, kto ma link, może wyświetlać” (inaczej strona go nie przeczyta), więc każdy, kto dostanie link do arkusza, zobaczy też tę zakładkę: numery, tytuły i adresy PDF. Nie wpisuj w tytułach niczego, czego nie można by pokazać poza Samorządem, i nie przesyłaj linku do arkusza dalej.
- **PDF na Dysku** udostępnij **tylko domenie** `samorzad.ue.wroc.pl` (Udostępnij → Dostęp ogólny → Samorząd Studentów…), nie „każdy z linkiem”. Wtedy nawet przekazany dalej link nie otworzy się nikomu spoza Samorządu.

---

## Zakładka „Posiedzenia RUSS”

Posiedzenia Rady Uczelnianej Samorządu Studentów. Przyszłe pokazują się na `/rada-uczelniana-samorzadu-studentow` w „Terminach posiedzeń” i na pasku miesięcy. Po posiedzeniu dopisz w tym samym wierszu link do protokołu: wtedy posiedzenie przechodzi do „Uchwał i protokołów”.

| Kolumna | Co wpisać | Przykład |
| --- | --- | --- |
| **data** | dzień posiedzenia | `18.11.2026` |
| godzina | początek | `18:00` |
| miejsce | sala i budynek | `Sala 101, budynek Z` |
| miejsce EN | po angielsku; puste = jak po polsku | `Room 101, building Z` |
| rodzaj | `zwyczajne` albo `nadzwyczajne`; puste = zwyczajne | `nadzwyczajne` |
| protokół | pełny adres do PDF protokołu, dopisany po posiedzeniu | `https://drive.google.com/…` |

## Zakładka „Uchwały RUSS”

Uchwały Rady. Strona układa je od najnowszej, sześć widać od razu, resztę po kliknięciu „Pokaż wszystkie”. Kafelek na `/transparentnosc` prowadzi do tego rejestru.

| Kolumna | Co wpisać | Przykład |
| --- | --- | --- |
| **numer** | numer uchwały | `1/2026/2027` |
| **data** | dzień podjęcia | `21.10.2026` |
| **tytuł** | czego dotyczy | `W sprawie przyjęcia budżetu Samorządu` |
| tytuł EN | po angielsku; puste = jak po polsku | |
| link | pełny adres do PDF; puste = uchwała widoczna bez pliku | `https://drive.google.com/…` |

Regulamin Samorządu (§ 78 ust. 1) każe opublikować uchwały i protokoły w ciągu 14 dni od posiedzenia. Strona obiecuje to studentom, więc warto dopisywać je od razu.

## Zakładka „Rekrutacje”

Otwarte nabory na `/rekrutacja`: do Samorządu (górna część) i do zespołów projektów (ciemna część niżej). Nabór znika ze strony sam dzień po terminie, więc starych wierszy nie trzeba kasować.

| Kolumna | Co wpisać | Przykład |
| --- | --- | --- |
| **rodzaj** | `samorząd` albo `projekt` | `projekt` |
| **nazwa** | nazwa naboru | `Team TEDxUEW 2027` |
| nazwa EN | po angielsku; puste = jak po polsku | |
| projekt | przy naborach do projektów: `adapciak`, `dni`, `party`, `animalia`, `bal`, `juwenalia`, `mosty`, `test`, `tedx` albo `graduetion` - karta dostanie zdjęcie projektu | `tedx` |
| opis | jedno, dwa zdania: kogo szukacie | `Piony: harmonogram, promocja, kontakty zewnętrzne.` |
| opis EN | po angielsku; puste = jak po polsku | |
| termin | ostatni dzień zgłoszeń; puste = nabór bez terminu | `30.11.2026` |
| przewodnik | link do przewodnika z pytaniami aplikacyjnymi (PDF udostępniony „każdy z linkiem”); puste = bez przycisku przewodnika | `https://drive.google.com/…` |

Kandydaci aplikują mailem: przycisk „Wyślij aplikację” otwiera wiadomość na **aplikacje@samorzad.ue.wroc.pl** z nazwą naboru w temacie.

## Zakładka „Uchwały SKW”

Uchwały Studenckiej Komisji Wyborczej: kalendarze wyborcze, wyniki, komunikaty. Pokazują się na `/studencka-komisja-wyborcza` od najnowszej. Kolumny takie same jak w „Uchwałach RUSS”: **numer**, **data**, **tytuł**, tytuł EN, link.

Regulamin Samorządu (§ 40 ust. 1 pkt 1) wymaga podania kalendarza wyborów do publicznej wiadomości najpóźniej 14 dni przed ich rozpoczęciem: dopisz uchwałę z kalendarzem, gdy tylko Komisja ją podejmie.

## Zakładka „Dyżury”

Dyżury Dziekana i Prodziekanów ds. Studenckich na `/dziekan-i-prodziekani`. Godziny zmieniają się co semestr: gdy Dziekanat ogłosi nowe (strona `uew.pl/studenci/dziekanat`), popraw wiersze tutaj. Na podstawie tej zakładki strona pokazuje przy każdej osobie plakietkę „Dyżur dziś”, „Dyżur trwa” albo „Najbliższy dyżur: czwartek, 9:00”. Sala jest linkiem do mapy kampusu z zaznaczonym budynkiem.

| Kolumna | Co wpisać | Przykład |
| --- | --- | --- |
| **osoba** | `Dziekan` albo nazwisko: `Turowska`, `Wereńska`, `Bobowski` | `Turowska` |
| **dzień** | dzień tygodnia | `wtorek` |
| **od** | początek dyżuru | `9:00` |
| **do** | koniec dyżuru | `10:00` |
| budynek | litera z planu kampusu; `A`, `Z` i `L` mają link do mapy | `A` |
| sala | numer pokoju | `121` |
| teams | `tak`, jeśli można dołączyć przez MS Teams | `tak` |
| uwagi | jedno zdanie pod godzinami | `Termin spotkania uzgodnij e-mailem co najmniej dwa dni wcześniej.` |
| uwagi EN | po angielsku; puste = jak po polsku | |
| odwołane | daty odwołanych dyżurów, po przecinku. Tego dnia strona pokaże „Dzisiejszy dyżur odwołany” i następny termin | `10.11.2026, 17.11.2026` |

Dwa dyżury w tygodniu = dwa wiersze z tą samą osobą. Osoba bez żadnego wiersza dostaje napis „Godziny dyżuru podaje Dziekanat.” Gdy zmieni się skład albo przydział kierunków, potrzebna jest zmiana w kodzie (`src/lib/people.ts` i `messages`), bo arkusz trzyma tylko dyżury.

---

## Zakładka „Wydarzenia”

Wydarzenia Samorządu: lista „Nasze wydarzenia” na `/kalendarz`, odliczanie w pasku pod ścianą zdjęć i „Najbliższe wydarzenie” na stronie głównej. Strona pokazuje tylko nadchodzące, więc starych wierszy nie trzeba kasować. Każde wydarzenie trafia też do danych dla Google (wynik z datą i miejscem).

| Kolumna | Co wpisać | Przykład |
| --- | --- | --- |
| **nazwa** | nazwa wydarzenia | `Bal UEW` |
| nazwa EN | po angielsku; puste = jak po polsku | `UEW Ball` |
| **data** | dzień wydarzenia | `2027-01-24` albo `24.01.2027` |
| godzina | początek | `19:00` |
| miejsce | gdzie się odbywa | `Hala Stulecia` |
| link | strona wydarzenia, zaczyna się od `https://` | `https://www.facebook.com/events/…` |
| tag | krótka etykieta | `bal` |

Dopóki zakładka nie istnieje, strona czyta stary arkusz ze zmiennej `EVENTS_SHEET_CSV_URL`, a bez niego pokazuje odnośniki do Facebooka i Instagrama. Wydarzeń nigdy nie uzupełniamy przykładowymi datami.

---

## Raz w roku: nowy harmonogram

Uczelnia publikuje harmonogram roku akademickiego w BIP (zwykle w maju). Wtedy:

1. Otwórz PDF harmonogramu w BIP.
2. W zakładce **Terminy** dopisz nowe wiersze: semestry, sesje, poprawki, przerwy, dni rektorskie, inaugurację. W kolumnie „źródło” wpisz nazwę dokumentu, w „link źródła” adres strony w BIP.
3. W zakładce **Zamiany dni** dopisz dni z dopisku pod harmonogramem.
4. Dopisz terminy wniosków, które znasz, z „link na stronie”.
5. Sprawdź `/kalendarz` i **Strefa Działacza → Treści strony**.

Odliczanie do sesji na stronie głównej i nagłówek „Terminy roku 2027/2028” przestawią się same.

---

## Jednorazowe podpięcie arkusza (dla osoby technicznej albo admina)

Robi się to raz. Potem wszystko działa samo.

1. **Arkusz.** Na Dysku Samorządu utwórz arkusz „Treści strony”. Zaimportuj cztery pliki z `docs/szablony/`: `tresci-terminy.csv`, `tresci-zamiany-dni.csv`, `tresci-dyzury.csv` i `tresci-wydarzenia.csv` (Plik → Importuj → Prześlij → „Wstaw nowe arkusze”). Pozostałe zakładki dodaj ręcznie i w pierwszym wierszu wpisz nagłówki z tabel wyżej. Nazwy zakładek muszą brzmieć dokładnie tak (wielkie litery, polskie znaki, bez spacji na końcu):

   | Zakładka | Nagłówki w pierwszym wierszu |
   | --- | --- |
   | `Terminy` | z szablonu CSV |
   | `Zamiany dni` | z szablonu CSV |
   | `Zarządzenia` | `numer`, `data`, `tytuł`, `tytuł EN`, `link`, `link EN` |
   | `Posiedzenia RUSS` | `data`, `godzina`, `miejsce`, `miejsce EN`, `rodzaj`, `protokół` |
   | `Uchwały RUSS` | `numer`, `data`, `tytuł`, `tytuł EN`, `link` |
   | `Uchwały SKW` | `numer`, `data`, `tytuł`, `tytuł EN`, `link` |
   | `Rekrutacje` | `rodzaj`, `nazwa`, `nazwa EN`, `projekt`, `opis`, `opis EN`, `termin`, `przewodnik` |
   | `Dyżury` | z szablonu CSV (`tresci-dyzury.csv`) |
   | `Wydarzenia` | z szablonu CSV (`tresci-wydarzenia.csv`) |

2. **Udostępnienie.** Udostępnij → „Każdy, kto ma link” → **Wyświetlający**. Dane i tak są publiczne, bo trafiają na stronę. Edytować mogą tylko osoby dodane z imienia.
3. **ID arkusza** to fragment adresu między `/d/` a `/edit`.
4. **Vercel** → projekt `samorzad-uew` → Settings → Environment Variables:
   - `TRESCI_SHEET_ID` = ID arkusza,
   - `TRESCI_SECRET` = długi losowy ciąg (np. z menedżera haseł, co najmniej 32 znaki).
   Potem Deployments → najnowsze → Redeploy.
5. **Skrypt.** W arkuszu: Rozszerzenia → Apps Script. Wklej zawartość `docs/apps-script/Tresci.gs`, w `CONFIG` wpisz ten sam `SEKRET` co w Vercelu. Zapisz, wybierz funkcję `instaluj` i kliknij Uruchom. Google zapyta o uprawnienia: zgódź się (skrypt łączy się tylko ze stroną Samorządu).
6. **Sprawdzenie.** Zmień coś w arkuszu, przeładuj `/kalendarz`. W Strefie Działacza → Treści strony każda zakładka powinna mieć status „z arkusza”.

Gdy strona jest jeszcze zamknięta („w budowie”), odświeżanie i tak działa. Widzą to osoby z kluczem podglądu.

### Gdy zakładka się nie pokazuje

Zacznij od **Strefa Działacza → Treści strony**. Przy każdej zakładce jest status i powód:

- **„z kodu” + „nie ustawiono TRESCI_SHEET_ID”** - w Vercelu brakuje zmiennej albo po jej dodaniu nie było Redeploy.
- **„z kodu” + „nie ma ani jednego poprawnego wiersza”, a pod spodem błędy „zła data (puste)” przy każdym wierszu** - prawie zawsze literówka w nazwie zakładki. Gdy Google nie znajdzie zakładki o podanej nazwie, po cichu oddaje pierwszą zakładkę arkusza (Terminy), w której nie ma kolumny „data”. Porównaj nazwę znak po znaku z tabelą wyżej, także spację na końcu.
- **Błędy przy pojedynczych wierszach** - popraw wskazany wiersz. Data musi być jako `18.11.2026` albo `2026-11-18`; jeśli arkusz zamienia ją na `11/18/2026`, ustaw Plik → Ustawienia → Język: Polska.
- **Status „z arkusza”, a na stronie nic nie widać** - sprawdź, czy to zgodne z zasadą zakładki: posiedzenia RUSS pokazują się tylko przyszłe (minione dopiero z linkiem do protokołu), nabory znikają dzień po terminie.
- **Zmiany pojawiają się dopiero po godzinie** - skrypt w arkuszu nie trafia na stronę. W Apps Script → Wykonania sprawdź błąd. Najczęściej `SEKRET` w skrypcie różni się od `TRESCI_SECRET` w Vercelu albo `ADRES` wskazuje inną domenę. Po zmianie zmiennej w Vercelu zrób Redeploy.

---

## Dla osoby, która zajmuje się kodem

- Odczyt i walidacja: `src/lib/tresci/` (`arkusz.ts` pobiera zakładkę, `parse-terminy.ts` sprawdza wiersze, `index.ts` składa z wersją awaryjną).
- Wersja awaryjna (kopia danych w kodzie): `src/lib/terminy.ts`, a dla dyżurów `src/lib/dyzury.ts`. Po większej zmianie w arkuszu warto ją zaktualizować i przegenerować szablony: `node --experimental-strip-types scripts/szablon-tresci.mts`. Test w `parse-terminy.test.ts` pilnuje, żeby szablon i kod się zgadzały.
- Odświeżanie: `POST /api/tresci/odswiez` z `{ "secret": TRESCI_SECRET }` unieważnia tag `tresci`. Przycisk w Strefie Działacza robi to samo akcją serwera.
- Nowa ramka przypomnienia na podstronie: na stronie serwera pobierz `getTerminyData()` i wstaw `<TerminWidget terminy={terminyForHref(data.terminy, "/twoja-strona#sekcja")} />`, a potem dopisz ten link do tabeli wyżej.
- Oferta współpracy dla partnerów (PDF, PL i EN) powstaje skryptem `npm run build:oferta` (`scripts/build-oferta.mjs`) w `docs/oferta/`. Na razie jest UKRYTA na stronie. Publikacja: przenieś oba PDF-y do `public/dokumenty/`, wpisz ich rozmiar w `src/lib/partnership-contact.ts` → `partnershipOffer` i ustaw `published: true`. W ofercie nigdy nie podajemy cen.
