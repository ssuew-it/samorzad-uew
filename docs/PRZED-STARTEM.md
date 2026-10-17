# Przed startem

Aktualizacja: 17.10.2026. Ta lista opisuje warunki otwarcia serwisu.
Plan dalszego rozwoju jest w [GAMEPLAN.md](GAMEPLAN.md), konfiguracja integracji
w [ENV.md](ENV.md). Testy automatyczne nie zastępują odbioru na żywo ani
ręcznej weryfikacji dostępności.

## Warunki otwarcia

- [x] Potwierdzić domenę główną `samorzad.ue.wroc.pl` (potwierdzone przez właściciela projektu, 17.10.2026).
- [ ] Sprawdzić certyfikat `www.samorzad.ue.wroc.pl` oraz przekierowanie na domenę główną.
- [ ] Uzgodnić z IT usunięcie lub przekierowanie starego `wp.samorzad.ue.wroc.pl`.
- [ ] Ustawić `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET` (minimum 32 znaki) i `AUTH_URL=https://samorzad.ue.wroc.pl`. W Google skonfigurować klienta Internal i callback `/api/auth/callback`.
- [ ] Sprawdzić pełne logowanie i wylogowanie, również przy zamkniętej stronie z kluczem podglądu; potwierdzić odrzucenie kont spoza domeny.
- [ ] Ustawić `APPS_SCRIPT_URL` i `APPS_SCRIPT_SECRET`, wdrożyć konfigurację i sprawdzić formularze Kontakt, Rzecznik oraz Partnerzy. Potwierdzić zapis w arkuszu i dostarczenie do właściwego adresata.
- [ ] Zweryfikować aktualność terminów, składów i dokumentów na rok 2026/2027. Daty dyplomowania 2025/2026 są oznaczone jako archiwalne; aktualne terminy wymagają potwierdzenia w Dziekanacie.
- [ ] Potwierdzić adresatów i zasady dostępu do zgłoszeń oraz treść polityki prywatności.
- [ ] Skopiować lokalne archiwum Wix na Dysk Samorządu przed wyłączeniem starego konta.

## Odbiór techniczny

- [ ] Testy jednostkowe, sprawdzenie typów, świeży build, Playwright i lint.
- [ ] Na telefonie: otwieranie menu, przejście do kontaktu, formularze, brak poziomego przewijania.
- [ ] PL i EN, jasny i ciemny motyw, klawiatura, powiększenie i ograniczenie ruchu.
- [ ] Ręczny przegląd z czytnikiem ekranu. Celem jest WCAG 2.2 AA; samo przejście axe nie jest potwierdzeniem pełnej zgodności.
- [ ] Zapasowy kontakt e-mail jest dostępny przy awarii formularza.

## Otwarcie i sprawdzenie produkcji

- [ ] Ustawić `SITE_LOCK=off` na Vercelu i wykonać redeploy.
- [ ] Sprawdzić stronę główną, Partnerów, Kontakt, Rzecznika, Strefę działacza i stare adresy z przekierowaniami.
- [ ] Sprawdzić `/sitemap.xml`, kanoniczne adresy i zgłosić mapę w Google Search Console.
- [ ] Sprawdzić zgodę na analitykę i działanie przełącznika języka.

## Materiały do uzupełnienia po otwarciu

Zdjęcia członków, dodatkowe kadry projektów i brakujące dokumenty mają
własną listę w [MATERIALY.md](MATERIALY.md). Logotypy partnerów i katalog
organizacji są już w kodzie; wymagają przeglądu aktualności, nie tworzenia
od początku. Kalendarz wydarzeń wymaga `EVENTS_SHEET_CSV_URL`.
