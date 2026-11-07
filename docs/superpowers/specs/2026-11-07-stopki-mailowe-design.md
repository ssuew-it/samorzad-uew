# Stopki mailowe: nowa karta z animowaną grafiką - design

> Data: 2026-11-07. Ustalone z Mikołajem w rozmowie, z makietami w przeglądarce
> (`.superpowers/brainstorm/90-1794063777/content/`, ostatnia zatwierdzona:
> `uklad-dane-nad-logo.html`, opcja 1). Zakres: nowy wygląd stopki, dwie wersje
> (codzienna i do masówek), nowa grafika z Higgsfielda, przebudowa generatora
> w Strefie Działacza.

## Cel i dlaczego

Obecna stopka (i starsze, ręcznie robione stopki członków) to blok niebieskiego
tekstu: stanowisko łamie się na kilka linii, logo wisi obok bez związku,
całość „nie daje się pokazać ludziom”. Stopka ma sprawić, że odbiorca -
student, któremu odpisujemy, albo partner z masówki - zapamięta Samorząd,
nawet jeśli zapomni treść maila. Wzór: karty z customesignature.com (pionowy
pasek ikon, dane w środku, grafika po prawej, ruch przy otwarciu maila).
Mikołaj chce czegoś „szalonego i innowacyjnego”, ale działającego we
wszystkich pocztach: Outlook (desktop i web), Gmail (web, Android, iOS),
Apple Mail, Zenbox (poczta Uczelni) i przy masowych wysyłkach z Huntera.

## Co już jest

- `src/lib/signature.ts` - jedyne źródło HTML stopki: `buildSignature`,
  `buildSignaturePlain`, `signatureDocument`, `previewDocument` z trybami
  `light | darkPartial | darkInvert | phone`, `SIGNATURE_DEFAULTS`. Testy:
  `src/lib/signature.test.ts`. Zasady z komentarzy w tym pliku zostają
  (tabele, style w atrybutach, czcionka w każdej komórce, obrazki linkowane
  z produkcji przez `NEXT_PUBLIC_SIG_BASE`, nigdy base64, escapowanie danych).
- `src/components/strefa/GeneratorStopki.tsx` + `SignaturePreviews.tsx` -
  formularz, kopiowanie do schowka (text/html + text/plain), pobranie pliku,
  podgląd w czterech trybach.
- Grafiki w `public/sig/`: `ic_web|instagram|facebook|linkedin|mail|phone.png`
  (64×64, niebieskie koło #1477b5), `banner.jpg` (444×300, panorama miasta
  z hasłem „Działamy · Wspieramy · Inspirujemy”), `logo.png`, `logo-bg.png`,
  `logo.svg` (pionowe). Pozioma wersja logo: `public/logo-dark.svg`.
- Księga znaku: `public/dokumenty/system-identyfikacji-wizualnej.pdf`.

## Zasady z księgi znaku (twarde)

- Logo w całości: znak i napis są nierozłączne (wyjątek tylko decyzją
  Przewodniczącego i Członka Zarządu ds. Wizerunku i Promocji). Nie robimy
  stopki z samym sygnetem zamiast logo.
- Kolor podstawowy logo: niebieski **#1477b5** (dopuszczalne też biały
  i czarny). W stopce #1477b5 jest kolorem logo, ikon i linków. #2C4BFF
  (akcent strony) w stopce nie występuje.
- Tylko proporcjonalne skalowanie logo.

## Wygląd (zatwierdzony)

Karta ok. 600 px szerokości, w ramce z zaokrąglonymi rogami (Outlook desktop
pokaże rogi proste - to dopuszczalne). Trzy kolumny:

1. **Pasek ikon po lewej** - pionowy, w cienkiej ramce: strona, Instagram,
   Facebook, LinkedIn, e-mail. Ikony z `public/sig/`, każda jest linkiem.
2. **Środek, od góry:** imię i nazwisko (pogrubione, ok. 17 px), stanowisko
   (12 px), e-mail (link w #1477b5) i telefon, **cienka pozioma kreska**,
   pod nią **pozioma wersja logo w #1477b5, 44 px wysokości**, jako PNG
   w podwójnej rozdzielczości (88 px pliku). Bez znaku § i bez innych
   ozdobników przy nazwisku.
3. **Grafika po prawej** - ok. 200×135 px, lewy brzeg ścięty po skosie.
   Hasło „Działamy · Wspieramy · Inspirujemy” zawsze w całości i nigdy nie
   przecięte paskami.

Czcionka: Arial/Helvetica wszędzie (fonty z sieci nie działają w pocztach).
Tekst alternatywny logo: „Samorząd Studentów Uniwersytetu Ekonomicznego we
Wrocławiu” - pełna nazwa jest też w wersji tekstowej (text/plain).

## Dwie wersje z jednego formularza

Generator tworzy obie naraz, z tych samych danych; użytkownik kopiuje tę,
której potrzebuje (osobne przyciski i osobny podgląd).

- **Codzienna** - pełna karta jak wyżej, grafika animowana (GIF).
- **Do masówek (Hunter)** - ten sam układ i dane, ale: grafika nieruchoma
  i mniejsza, mniej ikon, kilka linków (strona, e-mail, jeden profil
  społecznościowy). Powód: Hunter przy koncie Google Workspace pobiera podpis
  z Gmaila, a maile idą przez naszą skrzynkę - w zimnych wysyłkach każdy
  obrazek, ciężki GIF i nadmiar linków podnosi ryzyko spamu. Generator
  wyjaśnia krótko, żeby na czas kampanii ustawić tę wersję jako podpis
  domyślny w Gmailu.

Obie wersje: obrazki tylko z produkcji (samorzad.ue.wroc.pl), z wymiarami
w atrybutach i tekstem alternatywnym. Przy zablokowanych obrazkach odbiorca
nadal widzi imię i nazwisko, stanowisko, kontakt i (przez alt) nazwę
Samorządu.

## Grafika i animacja (Higgsfield)

- Mikołaj zaakceptował kierunek: „zobaczmy, co wyjdzie, jak coś, będziemy
  dobarwiać”. Wynik pokazujemy mu przed wpięciem do generatora.
- Pomysł: trójwymiarowy, szklano-metaliczny obiekt bramy z sygnetu
  Samorządu (brama nawiązuje do historycznej bramy kampusu od ul.
  Komandorskiej) z Higgsfielda, **zawsze na przezroczystym tle**, złożony
  na panoramie miasta z obecnej grafiki. Animacja ok. 2 s, odtwarzana raz:
  paski po skosie odsłaniają miasto, brama wyrasta, na końcu hasło. Potem
  obraz stoi.
- Zakazy (stała zasada projektu): żadnych wygenerowanych ludzi ani
  zmyślonych wydarzeń.
- **Ostatnia klatka = pełna, gotowa grafika.** Outlook desktop pokazuje
  tylko pierwszą klatkę GIF-a, więc pierwsza klatka też musi być pełnym
  obrazem (np. pierwsza = ostatnia, animacja w środku, albo inny sposób, byle
  Outlook nie pokazał pustego/niedokończonego kadru).
- Waga GIF-a w wersji codziennej: do ok. 300 KB. Plik w podwójnej
  rozdzielczości względem wyświetlanego rozmiaru.
- Obecny `banner.jpg` ma tylko 444×300 - nowa grafika powstaje od nowa,
  ostrzej. **Źródło panoramy (decyzja Mikołaja):** obecna panorama wyostrzona
  i powiększona w Higgsfieldzie albo ładniejsza prawdziwa panorama UEW
  znaleziona w sieci i dopracowana w Higgsfieldzie. *Warunek projektanta:*
  zdjęcie z sieci tylko na licencji, która pozwala na takie użycie (Wikimedia
  Commons CC0 / domena publiczna, albo zdjęcia Uczelni lub Samorządu) -
  stopka rozchodzi się w tysiącach maili, więc zdjęcie „z Google” bez
  licencji odpada. Bez takiego zdjęcia zostaje wyostrzona obecna panorama.

## Wymagania techniczne

- Działa w: Outlook desktop (Word), Outlook.com/web, Gmail web, Gmail
  Android i iOS, Apple Mail (macOS, iOS), Zenbox. Nic nie może się rozjechać
  w żadnym z nich - rogi i animacja mogą być uproszczone, układ i dane nie.
- Telefon (ok. 360 px): bez poziomego przewijania; grafika może spaść pod
  dane albo zniknąć. Sposób zostawiamy wykonawcy (uwaga: Gmail wycina
  `<style>` z wklejonych podpisów, więc media queries nie są niezawodne).
- Ciemny motyw: stopka czytelna w trybach `darkPartial` i `darkInvert`
  (Gmail, Apple Mail, Outlook.com). Niebieskie logo na przezroczystym tle
  na ciemnym tle ma słaby kontrast - rozwiązanie wybiera wykonawca (np.
  jasne tło pod logo jak w obecnym `logo-bg.png`).
- Wersja tekstowa (text/plain) dla obu wersji, jak dziś.
- Puste pola (np. brak telefonu) nie zostawiają pustych wierszy ani ikon.
- Podgląd w generatorze pokazuje obie wersje we wszystkich czterech trybach.
- WCAG: kontrast tekstu w stopce co najmniej 4,5:1 na białym tle; alt na
  każdym obrazku (ikony: nazwa serwisu).
- Teksty w interfejsie generatora po polsku i angielsku (messages), tylko
  zwykły „-”, nigdy długie myślniki.

## Poza zakresem

- Angielska wersja samej stopki (z angielskim logo) - *decyzja projektanta:
  nie teraz*, łatwo dołożyć później, bo logo EN już istnieje.
- Centralna podmiana banerów kampanii (pomysł C z rozmowy) - nie wybrany.
- Zdjęcie twarzy w stopce - Mikołaj wybrał grafikę z hasłem zamiast portretu.

## Decyzje projektanta (do sprawdzenia przez Mikołaja)

- **Pole „org” znika z formularza i ze stopki.** Nazwę Samorządu niesie logo
  (i jego alt), a pełna nazwa trafia do wersji tekstowej. Kto działa w innym
  organie (rada wydziałowa, komisja, Rada Mieszkańców), wpisuje to
  w stanowisku, np. „Członek Komisji Rewizyjnej”. Etykieta „/samorzad.ue”
  też znika - zastępuje ją pasek ikon. Przełączniki pojedynczych profili
  zostają.
- **Ikona poczty w pasku** to `mailto:` na adres osoby (ten sam co w tekście).
  Wersja do masówek nie ma tej ikony - adres jest w tekście.
- **Kolejność prac:** najpierw nowa karta, obie wersje i generator
  z tymczasową nieruchomą grafiką (obecny `banner.jpg` w nowym kadrze),
  potem grafika i animacja z Higgsfielda jako osobny krok, po akceptacji
  Mikołaja.
- **Testy w prawdziwych pocztach** bez płatnych usług (Litmus itp.): wysyłka
  próbnych maili na konta, które mamy, a Mikołaj ogląda je na swoich
  urządzeniach. Podgląd w generatorze to tylko przybliżenie. Zakres
  (decyzja Mikołaja): Gmail (web i telefon), Outlook w przeglądarce, Apple
  Mail oraz uczelniana poczta studencka Mikołaja (Outlook). Outlook na
  komputerze i Zenbox - bez osobnych testów; dla nich trzymamy się zasad
  z `signature.ts` (tabele, pierwsza klatka GIF-a jako pełny obraz).

## Decyzje zostawione wykonawcy

- Dokładne wymiary i odstępy, o ile zostaje układ i rozmiary podane wyżej.
- Sposób złożenia animacji (np. wideo z Higgsfielda → klatki → GIF w PIL/ffmpeg)
  i liczba klatek, w granicach wagi i zasady pierwszej/ostatniej klatki.
- Wygląd wersji do masówek (o ile: nieruchoma, mniejsza grafika, mniej ikon
  i linków, ten sam charakter).
- Jak w praktyce zachowuje się stopka na telefonie i w ciemnym motywie,
  w granicach wymagań wyżej.
