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
}

export const panelTiles: PanelTile[] = [
  {
    name: "Treści strony",
    desc: "Terminy z arkusza Google: czy strona je widzi, błędy w wierszach, odświeżenie.",
    url: "",
    internal: "/strefa-dzialacza/tresci",
  },
  {
    name: "Generator stopki mailowej",
    desc: "Wypełnij dane i skopiuj gotową stopkę do Gmaila lub Outlooka.",
    url: "",
    internal: "/strefa-dzialacza/generator-stopki",
  },
  {
    name: "CRA",
    // Rezerwacje sal 16J, 28J, 9J i wypożyczenia sprzętu przeszły do CRA.
    desc: "System rezerwacji sal i sprzętu oraz wewnętrzne sprawy Samorządu.",
    url: "https://crmp-prototyp.vercel.app",
  },
  {
    name: "RadaStudentów24",
    desc: "Platforma Rady Studentów.",
    url: "https://rada-studentow-24.vercel.app",
  },
];
