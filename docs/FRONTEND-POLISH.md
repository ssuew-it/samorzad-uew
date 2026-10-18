# Dopracowanie front-endu: wspólna praca nad każdą podstroną

Data: 18.10.2026. Status: propozycja do rozmowy, nie zatwierdzony redesign.
Podstawa: [PRODUCT.md](../PRODUCT.md). Plan rozwija [GAMEPLAN.md](GAMEPLAN.md).

## Kierunek

Pewna, studencka, precyzyjna strona. Student ma szybko znaleźć odpowiedź,
zobaczyć źródło i wiedzieć, co zrobić dalej. Inspiracje Apple wykorzystujemy
w hierarchii, jakości obrazów, reakcji kontrolek i ciągłości przejść.
Natężenie ruchu i kolejność prac ustalamy z właścicielem projektu.

Zachowujemy niebiesko-białą identyfikację, prawdziwe zdjęcia i zaakceptowane
wcześniej rozwiązania, w tym ścianę zdjęć na stronie głównej. Zmianę kierunku
pokazujemy najpierw jako konkretną propozycję. Strony pomocy, praw i stypendiów
muszą szczególnie ułatwiać czytanie i działanie w stresie.

## Research GitHub

Przejrzano opisy repozytoriów i dostępne przykłady 18.10.2026. Poniższe
zastosowania są propozycjami dla naszego projektu. Nie przeprowadzono audytu
całego kodu tych repozytoriów i nie dodano nowych zależności.

| Repozytorium | Co zawiera | Zastosowanie u nas |
|---|---|---|
| [adrianhajdin/iphone](https://github.com/adrianhajdin/iphone) | Edukacyjne odtworzenie strony iPhone 15 Pro z GSAP i Three.js, prezentacja modeli i karuzela wideo | Narracja zdjęciami na Naszych projektach, prezentacja tomu Wydawnictwa. To projekt społecznościowy, nie kod Apple; oceniamy wzorce, nie przenosimy gotowego szablonu. |
| [ibelick/motion-primitives](https://github.com/ibelick/motion-primitives) | Komponenty animowane oparte na Motion i Tailwind; projekt oznaczony jako beta | Wybrane przejścia zakładek, rozwijanie treści, zachowanie ciągłości między stanami. Każdy wzorzec sprawdzamy pod kątem dostępności i telefonu. |
| [emilkowalski/sonner](https://github.com/emilkowalski/sonner) | Komponent powiadomień toast dla React | Potwierdzenie skopiowania stopki lub cytowania. Wyniki i błędy formularzy nadal pozostają widoczne przy formularzu. |
| [emilkowalski/vaul](https://github.com/emilkowalski/vaul) | Komponent wysuwanego panelu dla React | Referencja zachowania paneli na telefonie, np. filtrów organizacji. Ewentualne użycie poprzedza sprawdzenie utrzymania, klawiatury i Safari. |
| [dip/cmdk](https://github.com/dip/cmdk) | Menu poleceń i combobox dla React; dawny adres pacocoursey/cmdk przekierowuje tutaj | Wyszukiwarka: grupowanie wyników, obsługa klawiatury i przewidywalny wybór. Najpierw porównanie z istniejącym SearchCommand. |
| [mui/base-ui](https://github.com/mui/base-ui) | Niewystylizowane komponenty interaktywne z naciskiem na dostępność | Możliwa podstawa menu, dialogów i selektorów, jeśli własne komponenty wymagają wymiany. |
| [adobe/react-spectrum](https://github.com/adobe/react-spectrum) | React Aria: niewystylizowane komponenty i hooki; także system Spectrum | Alternatywa dla Base UI, szczególnie dla pól, wyboru dat i interakcji klawiaturą. Nie planujemy instalowania dwóch systemów kontrolek jednocześnie. |
| [motiondivision/motion](https://github.com/motiondivision/motion) | Biblioteka animacji React i JavaScript | Już używana. Najpierw porządkujemy jej obecne zastosowania i tokeny z src/lib/motion.ts. |

Przed adaptacją konkretnego fragmentu sprawdzamy jego kod, licencję,
wymagane zależności i zgodność z używanym React/Next. Samo wskazanie repo
nie oznacza rekomendacji instalacji całego pakietu.

## Sposób wspólnej pracy

1. Wybieramy jedną podstronę i zadanie użytkownika, które ma obsłużyć.
2. Pokazuję obecny widok na telefonie i desktopie oraz maksymalnie trzy konkretne uwagi.
3. Przy istotnej decyzji pokazuję dwa warianty i pytam o preferencję, np. kadrowanie zdjęć, układ informacji albo zachowanie rozwijanej treści. Podaję swoją rekomendację.
4. Wdrażam wybrany kierunek. Drobne korekty odstępów, fokusu i zachowania kontrolek robię samodzielnie w ramach uzgodnionego kierunku.
5. Pokazuję wynik i różnice, zbieram uwagi, sprawdzam najważniejszą ścieżkę.
6. Zapisujemy decyzję i status podstrony. Przechodzimy do następnej po domknięciu uwag.

Nie pytamy o 42 strony naraz. Stany: do przeglądu → propozycja → uzgodnione
→ wdrożone → sprawdzone → zaakceptowane. Poprzednie poprawki pozostają
wykonane; status poniżej dotyczy nowej rundy dopracowania.

## Proponowana kolejność

1. Wspólna nawigacja, wyszukiwanie, typografia, przyciski, formularze, stopka i zasady ruchu; następnie główna jako pierwszy pilot.
2. Najczęstsze zadania: Strefa studenta, stypendia, prawa, Rzecznik, pomoc, Kontakt.
3. Informacje i narzędzia: Infopacki, mapa, kalendarz, organizacje.
4. Prezentacja dorobku: projekty, działalność, Wydawnictwo, rekrutacja, partnerstwa.
5. Ludzie, dokumenty, transparentność i Strefa działacza.

## Rejestr wszystkich tras

Każda pozycja jest obecnie **do przeglądu w tej rundzie**. Cele są hipotezami
do potwierdzenia na aktualnym widoku, a nie listą stwierdzonych usterek.

| Trasa | Główny cel dopracowania |
|---|---|
| `/` | Hierarchia pierwszego ekranu, kadry ściany zdjęć, wyszukiwanie i droga do sprawy studenta. |
| `/dla-studenta` | Czytelny wybór ścieżki i konsekwentna hierarchia skrótów. |
| `/stypendia` | Rozpoznanie rodzaju wsparcia, dokumenty i kolejny krok; kalkulator jako pomoc. |
| `/prawa-studenta` | Wybór problemu i przejście do właściwej informacji lub kontaktu. |
| `/prawo-dla-studenta` | Rozróżnienie źródeł i proste otwieranie dokumentów. |
| `/rzecznik-praw-studenta` | Zrozumiały zakres pomocy, spokojny formularz i jasny rezultat zgłoszenia. |
| `/pomoc-psychologiczna` | Widoczna ścieżka kontaktu, spokojne tempo i czytelność informacji. |
| `/kontakt` | Właściwa skrzynka, dane kontaktowe i bezproblemowe wysłanie formularza. |
| `/szukaj` | Trafne wyniki, grupowanie, brak wyników, czytelne odróżnienie odpowiedzi asystenta. |
| `/infopacki` | Szybki wybór poradnika według zadania. |
| `/infopacki/regulamin-studiow` | Spis treści i odnajdywanie konkretnej zasady. |
| `/infopacki/podania` | Kolejność przygotowania i składania dokumentów. |
| `/infopacki/usos` | Przewodnik po zadaniu, czytelne kroki i odnośniki. |
| `/infopacki/zaliczenie-semestru` | Sytuacja studenta, możliwe działania, terminy i źródła. |
| `/infopacki/sprawy-studenckie` | Właściwa procedura bez długiego szukania w tekście. |
| `/infopacki/biblioteka` | Najważniejsze usługi i jasne przejścia do systemów biblioteki. |
| `/infopacki/zycie-studenckie` | Autentyczne zdjęcia i praktyczne wskazówki. |
| `/infopacki/dyplomowanie` | Czytelny proces i rozróżnienie aktualnych oraz archiwalnych terminów. |
| `/mapa-kampusu` | Wyszukanie miejsca i obsługa mapy na telefonie; alternatywa tekstowa. |
| `/kalendarz` | Znalezienie wydarzenia i uczciwy, przydatny stan bez wydarzeń. |
| `/organizacje-studenckie` | Sprawne filtrowanie, wyniki i bezpośredni kontakt. |
| `/nasze-projekty` | Narracja zdjęciami z zachowaniem swobodnego przewijania. |
| `/nasza-dzialalnosc` | Konkretne działania i czytelne przejścia do ich szczegółów. |
| `/wydawnictwo` | Prezentacja tomu, wygodne czytanie, pobranie PDF i cytowanie. |
| `/rekrutacja` | Dla kogo, jak dołączyć i co się stanie po zgłoszeniu. |
| `/partnerzy` | Ocena uproszczonej ściany logo i ścieżki do formularza. |
| `/wspolpracuj-z-nami` | Konkretne formy współpracy i jasny kontakt; spójność z Partnerami. |
| `/struktura-samorzadu` | Zrozumienie odpowiedzialności i drogi do właściwej osoby. |
| `/zarzad` | Rola, osoba, kontakt; portrety i dobry stan bez zdjęć. |
| `/filia-jelenia-gora` | Lokalny kontakt i odrębna, czytelna informacja o filii. |
| `/rada-uczelniana-samorzadu-studentow` | Skład, posiedzenia i dokumenty w czytelnych grupach. |
| `/studencka-komisja-wyborcza` | Informacje wyborcze, status procesu i dokumenty. |
| `/wladze-rektorskie` | Rozpoznanie funkcji i właściwego kontaktu. |
| `/dziekan-i-prodziekani` | Powiązanie rodzaju sprawy z osobą lub jednostką. |
| `/fue-i-psrp` | Wyjaśnienie roli organizacji i znaczenia dla studenta. |
| `/regulacje-wewnetrzne` | Czytelny rejestr i informacje o dokumentach. |
| `/zarzadzenia-przewodniczacego` | Rozróżnienie kadencji i odnalezienie zarządzenia. |
| `/transparentnosc` | Czytelne dane, dokumenty i status brakujących informacji. |
| `/prywatnosc` | Czytanie długiej treści i łatwe odnalezienie zagadnienia. |
| `/deklaracja-dostepnosci` | Czytelna deklaracja i prosta ścieżka zgłoszenia problemu. |
| `/strefa-dzialacza` | Logowanie, stany błędów i grupowanie narzędzi. |
| `/strefa-dzialacza/generator-stopki` | Wprowadzanie danych, podgląd i wiarygodne potwierdzenie kopiowania. |

Dodatkowe powierzchnie: menu, dialog wyszukiwania, asystent, banner zgody,
404, ekran zamknięcia serwisu, błędy ładowania. Kalkulator średniej jest
sprawdzany jako funkcja w miejscu osadzenia, nie jako osobna trasa.

## Warunek ukończenia podstrony

- Pierwszy ekran wyjaśnia cel i pokazuje najważniejsze działanie.
- Hierarchia, długości wierszy, zdjęcia i odstępy zostały obejrzane na telefonie i desktopie.
- Sprawdzone PL/EN, jasny/ciemny motyw, klawiatura i ograniczenie ruchu.
- Widoki 320, 375, 768 i 1440 px; brak zasłoniętych kontrolek i poziomego przewijania strony.
- Działają właściwe dla strony stany: pusto, ładowanie, błąd i sukces.
- Ruch nie opóźnia zadania; treść pozostaje dostępna przy wolnym ładowaniu skryptów.
- Porównujemy koszt nowych efektów i obrazów z pomiarem przed zmianą.
- Testy adekwatne do zmian, build i lint; odbiór wizualny właściciela projektu.

## Decyzje oczekujące

- Uzgodniono całościowy kierunek inspirowany wartościami designu Apple.
- Rozpoczęto pierwszy pilot: główna i nawigacja.
- Przy pilocie głównej: jak mocno eksponować ścianę zdjęć wobec wyszukiwania? Zachowanie ściany jest punktem wyjścia.

## Pilot 1: główna i nawigacja (18.10.2026)

Uzgodniony kierunek: całościowa jakość inspirowana Apple, obejmująca
czytelność, wizualną spójność, materiały i zachowanie interfejsu. Wdrażamy
małymi krokami; odbiór wizualny pozostaje częścią wspólnej pracy.

Pierwsza iteracja zachowuje równowagę tekstu i ściany zdjęć. Zakres:
odstęp tytułu od stałego nagłówka, interlinia i odstępy liter, czytelniejszy
tekst na telefonie, większe pole dotykowe wyszukiwarki, krótsze wejście hero
bez opóźniania wyszukiwania, logo widoczne bez JS, domykanie menu po zmianie
na desktop i dostęp do przycisku zamknięcia z klawiatury.

Status: wdrożenie lokalne sprawdzone, do oceny właściciela. Build i 187 testów
jednostkowych przeszły. W zestawie 75 testów przeglądarkowych 74 przeszły;
po poprawieniu selektora zoptymalizowanego obrazu logo wszystkie 6 testów
pilota przeszło ponownie. Obejrzano podglądy mobilne i desktopowe oraz ciemny
motyw. Pozostałe
podstrony nie są objęte tą iteracją. Decyzja o większej ekspozycji zdjęć
pozostaje otwarta.

## Pilot 2: uproszczenie pierwszego ekranu

Na prośbę właściciela usunięto pole wyszukiwania i przycisk „Szukaj” z hero.
Wyszukiwanie w nawigacji pozostaje dostępne. Ikona i temperatura są wyśrodkowane
względem opisu pogody. Usunięto dekoracyjną siatkę i poświaty, zwiększono odstęp
przed głównymi działaniami oraz dodano wyraźny fokus i subtelny ruch strzałki
linku „Poznaj nas” (tylko dla myszy, z obsługą ograniczonego ruchu).

Sprawdzono widoki 320, 375, 768 i 1440 px: brak poziomego przewijania,
usunięte pole wyszukiwania i wyśrodkowana pogoda. Lint zmienionych komponentów
przeszedł bez błędów. Właściciel zaakceptował obecny zakres i zlecił commit
oraz push. Dalsze zmiany układu wstrzymane; potencjalny następny etap to
hierarchia sekcji poniżej hero i skróty do spraw studenta.
