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
- albo zaloguj się na stronie i wejdź w **Strefa działacza → Treści strony**. Zobaczysz tam, czy strona widzi arkusz, i listę wierszy, których nie przyjęła, z powodem i numerem wiersza.

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

- **Daty** wpisuj jako `09.02.2027` albo `2027-02-09`. Inne zapisy (np. `9 lutego`) strona odrzuci i pokaże błąd w Strefie działacza.
- **Terminy minione nie przeszkadzają.** Strona pokazuje tylko to, co trwa albo nadchodzi. Stare wiersze możesz zostawić albo usunąć.
- **„dla kogo”** chowa termin za przełącznikiem „Pokaż też terminy wybranych kierunków i lat”. Dzięki temu większość studentów nie widzi podwójnych sesji.
- **Na pasku roku** widać zajęcia, sesje, poprawki, przerwy i dni wolne dla wszystkich. Wnioski i uroczystości są tylko na liście.

### Przypomnienia na podstronach („link na stronie”)

Gdy termin ma w kolumnie **link na stronie** adres podstrony, na tej podstronie pokazuje się ramka „najbliższy termin” z przyciskiem „Dodaj do kalendarza”. Strona sama wybiera najbliższy przyszły termin z tym adresem, więc na kolejny rok wystarczy dopisać nowy wiersz z tym samym linkiem.

Gdzie to dziś działa:

| Link | Gdzie się pokazuje |
| --- | --- |
| `/stypendia#fundusz` | Stypendia, sekcja Własnego Funduszu Stypendialnego |

Linki takie jak `/infopacki/zaliczenie-semestru` też możesz wpisywać: tytuł na liście w `/kalendarz` stanie się wtedy odnośnikiem do tej strony. Ramkę przypomnienia na nowej podstronie dokłada ktoś, kto zajmuje się kodem (jedna linijka, opis na końcu).

---

## Zakładka „Zamiany dni”

Dni, w które zajęcia idą według planu z innego dnia tygodnia (np. „w piątek 6 listopada zajęcia jak w poniedziałek”). Są w harmonogramie roku akademickiego, w dopisku na dole.

| Kolumna | Co wpisać | Przykład |
| --- | --- | --- |
| **data** | dzień zamiany | `06.11.2026` |
| **plan z dnia** | dzień tygodnia, którego plan obowiązuje | `poniedziałek` |
| tydzień | `T1` albo `T2`, jeśli harmonogram tak podaje; inaczej puste | `T1` |

---

## Raz w roku: nowy harmonogram

Uczelnia publikuje harmonogram roku akademickiego w BIP (zwykle w maju). Wtedy:

1. Otwórz PDF harmonogramu w BIP.
2. W zakładce **Terminy** dopisz nowe wiersze: semestry, sesje, poprawki, przerwy, dni rektorskie, inaugurację. W kolumnie „źródło” wpisz nazwę dokumentu, w „link źródła” adres strony w BIP.
3. W zakładce **Zamiany dni** dopisz dni z dopisku pod harmonogramem.
4. Dopisz terminy wniosków, które znasz (np. Własny Fundusz Stypendialny: wnioski do 30 listopada), z „link na stronie”.
5. Sprawdź `/kalendarz` i **Strefa działacza → Treści strony**.

Odliczanie do sesji na stronie głównej i nagłówek „Terminy roku 2027/2028” przestawią się same.

---

## Jednorazowe podpięcie arkusza (dla osoby technicznej albo admina)

Robi się to raz. Potem wszystko działa samo.

1. **Arkusz.** Na Dysku Samorządu utwórz arkusz „Treści strony”. Zaimportuj dwa pliki z `docs/szablony/`: `tresci-terminy.csv` i `tresci-zamiany-dni.csv` (Plik → Importuj → Prześlij → „Wstaw nowe arkusze”). Nazwij zakładki dokładnie **Terminy** i **Zamiany dni**.
2. **Udostępnienie.** Udostępnij → „Każdy, kto ma link” → **Wyświetlający**. Dane i tak są publiczne, bo trafiają na stronę. Edytować mogą tylko osoby dodane z imienia.
3. **ID arkusza** to fragment adresu między `/d/` a `/edit`.
4. **Vercel** → projekt `samorzad-uew` → Settings → Environment Variables:
   - `TRESCI_SHEET_ID` = ID arkusza,
   - `TRESCI_SECRET` = długi losowy ciąg (np. z menedżera haseł, co najmniej 32 znaki).
   Potem Deployments → najnowsze → Redeploy.
5. **Skrypt.** W arkuszu: Rozszerzenia → Apps Script. Wklej zawartość `docs/apps-script/Tresci.gs`, w `CONFIG` wpisz ten sam `SEKRET` co w Vercelu. Zapisz, wybierz funkcję `instaluj` i kliknij Uruchom. Google zapyta o uprawnienia: zgódź się (skrypt łączy się tylko ze stroną Samorządu).
6. **Sprawdzenie.** Zmień coś w arkuszu, przeładuj `/kalendarz`. W Strefie działacza → Treści strony obie zakładki powinny mieć status „z arkusza”.

Gdy strona jest jeszcze zamknięta („w budowie”), odświeżanie i tak działa. Widzą to osoby z kluczem podglądu.

---

## Dla osoby, która zajmuje się kodem

- Odczyt i walidacja: `src/lib/tresci/` (`arkusz.ts` pobiera zakładkę, `parse-terminy.ts` sprawdza wiersze, `index.ts` składa z wersją awaryjną).
- Wersja awaryjna (kopia danych w kodzie): `src/lib/terminy.ts`. Po większej zmianie w arkuszu warto ją zaktualizować i przegenerować szablony: `node --experimental-strip-types scripts/szablon-tresci.mts`. Test w `parse-terminy.test.ts` pilnuje, żeby szablon i kod się zgadzały.
- Odświeżanie: `POST /api/tresci/odswiez` z `{ "secret": TRESCI_SECRET }` unieważnia tag `tresci`. Przycisk w Strefie działacza robi to samo akcją serwera.
- Nowa ramka przypomnienia na podstronie: na stronie serwera pobierz `getTerminyData()` i wstaw `<TerminWidget terminy={terminyForHref(data.terminy, "/twoja-strona#sekcja")} />`, a potem dopisz ten link do tabeli wyżej.
