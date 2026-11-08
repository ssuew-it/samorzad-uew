/**
 * Kafelki panelu działacza (po zalogowaniu na /strefa-dzialacza).
 * Każdy kafelek = link do narzędzia Samorządu. Edytuj listę tutaj.
 * Pusty `url` (i brak `internal`) = kafelek „Wkrótce" (nieklikalny).
 *
 * TYLKO SERWER. Adresy narzędzi wewnętrznych nie mogą trafić do publicznego
 * JS - strona czyta tę listę dopiero po sprawdzeniu sesji i przekazuje ją
 * komponentowi w propsach. `server-only` zatrzyma build, gdyby ktoś
 * zaimportował ją w komponencie klienckim.
 */
import "server-only";
import type { RoleId } from "./roles-core";

export interface PanelTile {
  /** Nazwa narzędzia (np. „CRA", „RadaStudentów24"). */
  name: string;
  desc?: string;
  /** Adres narzędzia. Pusty = „Wkrótce". */
  url: string;
  /**
   * Trasa WEWNĄTRZ serwisu (bez prefiksu języka) - np. "/strefa-dzialacza/…".
   * Renderuje się lokalizowanym Linkiem, więc bez przeładowania strony
   * i bez otwierania nowej karty, w odróżnieniu od narzędzi zewnętrznych.
   */
  internal?: string;
  /** Wymagane role (jedna z nich wystarczy); brak = widzi każdy zalogowany. */
  roles?: RoleId[];
  /** Ikona aplikacji z /public (kwadrat; zaokrąglenie nadaje kafelek).
   *  Brak = monogram z pierwszej litery nazwy. */
  icon?: string;
  /** Wyróżniony komunikat na kafelku (np. nowy obowiązek). */
  notice?: string;
  /** Tło pola z logo na górze kafelka - w kolorze samej ikony, żeby logo
   *  i pole czytały się jako jedna plansza. Brak = granat jak monogram. */
  tint?: string;
}

/**
 * Kto widzi „Treści strony”. Wspólna stała, bo tę samą listę sprawdza
 * strona /strefa-dzialacza/tresci i akcja odświeżania - ukrycie samego
 * kafelka nie zamyka drogi pod bezpośrednim adresem.
 */
export const TRESCI_ROLES: RoleId[] = ["zarzad", "projekty"];

export const panelTiles: PanelTile[] = [
  {
    name: "Treści strony",
    desc: "Tu sprawdzisz, czy strona dobrze odczytała arkusz z terminami, zarządzeniami, składami i dyżurami. Zobaczysz, który wiersz jest błędny i co w nim poprawić, a po poprawce odświeżysz stronę jednym kliknięciem.",
    url: "",
    internal: "/strefa-dzialacza/tresci",
    roles: TRESCI_ROLES,
    icon: "/strefa/tresci.svg",
    tint: "linear-gradient(135deg, #4A66FF, #1B2DB3)",
  },
  {
    name: "Role i dostęp",
    desc: "Decydujesz, kto co widzi w Strefie: nadajesz role, ustawiasz, do kiedy obowiązują, a w razie potrzeby blokujesz dostęp. Role Zarządu i radnych same wygasają 31 maja, z końcem kadencji.",
    url: "",
    internal: "/strefa-dzialacza/role",
    roles: ["superadmin"],
    icon: "/strefa/role.svg",
    tint: "linear-gradient(135deg, #16204A, #070B1C)",
  },
  {
    name: "CRA",
    // Rezerwacje sal 110L, 101L, 106L i wypożyczenia sprzętu przeszły do CRA.
    desc: "Potrzebujesz sali na spotkanie albo sprzętu na wydarzenie? W CRA zarezerwujesz salę 110L, 101L lub 106L, wypożyczysz sprzęt i załatwisz inne sprawy administracyjne Samorządu.",
    url: "https://cra-system.vercel.app/",
    icon: "/strefa/cra.png",
    // #0b1322 = tło samej ikony CRA (zmierzone z pliku).
    tint: "#0b1322",
  },
  {
    name: "Generator stopki mailowej",
    desc: "Wpisz imię, funkcję i telefon, a generator ułoży stopkę mailową w barwach Samorządu. Wybierasz jedną z trzech wersji i wklejasz ją do Gmaila lub Outlooka.",
    url: "",
    internal: "/strefa-dzialacza/generator-stopki",
    icon: "/strefa/stopka.svg",
    tint: "linear-gradient(135deg, #2C4BFF, #5B2DD9)",
    notice:
      "Nowa stopka jest obowiązkowa - Zarządzenie Wiceprzewodniczącego ds. Strategii i Działań Operacyjnych nr 01/ZRZ-SIDO/2026-2027.",
  },
  {
    name: "RadaStudentów24",
    desc: "Wszystko, czego potrzeba na posiedzeniu Rady Uczelnianej Samorządu Studentów: porządek obrad, lista obecności i kworum, głosowania jawne i tajne, kolejka mówców, a na koniec protokół i uchwały.",
    url: "https://rada-studentow-24.vercel.app",
    roles: ["russ", "przewodniczacy"],
    icon: "/strefa/rada-studentow-24.png",
    // Gradient zmierzony z rogów ikony RadaStudentów24.
    tint: "linear-gradient(135deg, #919af9, #4f49d8)",
  },
  {
    name: "AdminOS",
    desc: "Codzienna praca Komisji Administracji w jednym miejscu: sprawy do załatwienia, zebrania z protokołami, zadania, kalendarz i archiwum dokumentów.",
    // Ikona dojdzie, gdy narzędzie dostanie logo - do tego czasu monogram.
    url: "https://admin-os-lake.vercel.app/",
    roles: ["admi"],
  },
  {
    // Dawniej „SSUEW Analytics” - od 11.2026 Project D.E.C.K.
    name: "Project D.E.C.K",
    desc: "Liczby Samorządu w jednym miejscu: jak idą rekrutacje, jak wypadamy rok do roku, ile osób zostaje z nami na dłużej i czego możemy się spodziewać. Logujesz się tu osobnym kontem.",
    url: "https://ssuew-analytics.vercel.app/login",
    roles: ["zarzad", "przewodniczacy"],
    // Logo D.E.C.K na jasnym tle ikony (ciemne kształty zlewały się z ciemną
    // planszą), plansza w grafitach logo.
    icon: "/strefa/deck.png",
    tint: "linear-gradient(135deg, #2b3242, #0b0e14)",
  },
];
