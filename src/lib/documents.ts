/**
 * Manifest dokumentów do pobrania.
 *
 * JAK ODBLOKOWAĆ POBIERANIE: wrzuć plik do `public/dokumenty/...` i wpisz jego
 * ścieżkę w `href` (np. "/dokumenty/regulamin-samorzadu.pdf"). Możesz też podać
 * pełny link do naszego folderu (Drive itp.). Gdy `href` jest ustawione,
 * plakietka „Wkrótce" automatycznie zmienia się w działające pobieranie/link.
 * Pusty `href` = „Wkrótce" (lub przycisk ukryty, zależnie od miejsca).
 *
 * W komentarzach zachowane STARE adresy z Wixa — to źródło do migracji plików
 * (pobierz stamtąd, wrzuć do public/dokumenty/, wstaw lokalną ścieżkę w href).
 */

import { studyRegulationSource } from "./living-documents";

export interface DocSlot {
  href?: string;
  /** true = link zewnętrzny (target=_blank); pomiń dla plików w public/. */
  external?: boolean;
  /**
   * Rozmiar pliku w bajtach — tylko dla plików w public/. Test
   * documents.test.ts porównuje go z plikiem na dysku, więc po podmianie PDF-a
   * nie da się zapomnieć o aktualizacji (a strona nie pokaże fałszywej liczby).
   */
  bytes?: number;
  /** Liczba stron PDF-a (policzona z pliku, nie z pamięci). */
  pages?: number;
  /** Numer uchwały RUSS, którą akt przyjęto lub zmieniono, np. "45/2024-25". */
  resolution?: string;
  /** Data tej uchwały (RRRR-MM-DD). */
  adopted?: string;
}

// Stare PDF-y z Wixa nadal leżą pod https://static.wixstatic.com/ugd/<plik>.pdf
// (sprawdzone 14.10.2026), ale znikną razem z kontem na Wixie — dlatego te,
// które już odzyskaliśmy, trzymamy u siebie w public/dokumenty/.

export const documents = {
  // Regulacje wewnętrzne (RegulacjeContent). Pliki odzyskane z Wixa, w wersji
  // obowiązującej w chwili przenosin (Regulamin Samorządu: uchwała RUSS
  // 45/2024-25 z 27.04.2025 r., z załącznikami 1 i 2).
  //
  // Uchwały i daty przepisane z pierwszych stron PDF-ów (16.10.2026). Hierarchię
  // (który akt jest załącznikiem, który regulaminem organu) układa
  // RegulacjeContent; tu są tylko fakty o plikach.
  regulacje: {
    // Na pierwszej stronie: uchwała zmieniająca, a za nią tekst jednolity.
    government: {
      href: "/dokumenty/regulamin-samorzadu-studenckiego.pdf",
      bytes: 1287716,
      pages: 46,
      resolution: "45/2024-25",
      adopted: "2025-04-27",
    },
    // Uchwała „w sprawie aktualizacji zapisów" regulaminu z 4.06.2019.
    ros: {
      href: "/dokumenty/regulamin-rady-organizacji-studenckich.pdf",
      bytes: 261901,
      pages: 10,
      resolution: "25/2019-20",
      adopted: "2020-01-14",
    },
    // Załącznik nr 1 do Regulaminu Samorządu, przyjęty tą samą uchwałą.
    russ: {
      href: "/dokumenty/regulamin-organizacyjny-russ.pdf",
      bytes: 139160,
      pages: 6,
      resolution: "45/2024-25",
      adopted: "2025-04-27",
    },
    // Uchwała RUSS bez numeru na stronie tytułowej — pokazujemy samą datę.
    residents: {
      href: "/dokumenty/regulamin-rad-mieszkancow-ds.pdf",
      bytes: 324510,
      pages: 8,
      adopted: "2020-01-02",
    },
    // Załącznik nr 2 do Regulaminu Samorządu, przyjęty tą samą uchwałą.
    electoral: {
      href: "/dokumenty/ordynacja-wyborcza.pdf",
      bytes: 255740,
      pages: 16,
      resolution: "45/2024-25",
      adopted: "2025-04-27",
    },
    // Księga znaku — nie jest aktem prawnym, nie ma uchwały.
    visual: { href: "/dokumenty/system-identyfikacji-wizualnej.pdf", bytes: 881057, pages: 10 },
  } as Record<string, DocSlot>,

  // Prawo dla studenta (PrawoContent) — karty źródeł. „act" to publiczny ISAP, nie tu.
  // Linki te same, które stały na starej stronie. Akty Uczelni prowadzimy do BIP,
  // bo tam jest zawsze wersja obowiązująca.
  prawo: {
    statute: {
      href: "https://bip.ue.wroc.pl/download/attachment/2024/statut-uniwersytetu-ekonomicznego-we-wroclawiu-tekst-ujednolicony-na-dzien-18052023-r.pdf",
      external: true,
    },
    // Strona regulaminu w BIP (ta sama, z której korzysta infopack „Regulamin
    // studiów"). Stara strona dawała kopię na Dysku Google:
    // https://drive.google.com/file/d/1OY0ajTikrR9zQTz9-Gvq9iFB_q5faGnH/view
    // — ale kopia się nie aktualizuje, a BIP zawsze pokazuje wersję obowiązującą.
    studyReg: { href: studyRegulationSource.landingPage, external: true },
    orders: { href: "https://bip.ue.wroc.pl/523/2025.html", external: true },
    // Stara strona dawała tu ten sam link co przy zarządzeniach Rektora, czyli
    // najpewniej pomyłkę. Bez właściwego źródła zostaje „Wkrótce".
    deanLetters: {} as DocSlot,
    // Plik leżał na cudzym koncie Wixa (nie Samorządu), więc trzymamy kopię.
    orgReg: { href: "/dokumenty/regulamin-organizacyjny-uew-2024.pdf", bytes: 3157623, pages: 163 },
  } as Record<string, DocSlot>,

  // Zarządzenia Przewodniczącego — folder bieżącej kadencji (ZarzadzeniaContent).
  // Celowo puste: stara strona linkowała folder „ZARZĄDZENIA PRZEWODNICZĄCEJ
  // SSUEW 24/25", czyli POPRZEDNIEJ kadencji, a strona zapowiada komplet
  // aktualnych. Archiwum 24/25, gdyby się przydało:
  // https://drive.google.com/drive/folders/1hFYmHP0En_l1Pr4iHK1cl7Mm11FecD-G
  zarzadzenia: {} as DocSlot,

  // Standalone — przyciski pojawią się ponownie, gdy ustawisz href.
  // old: https://samorzad.ue.wroc.pl/stypendia
  stypendiaAll: {} as DocSlot,
  // Mapa ze starej strony — obraz na Dysku Google.
  mapa: { href: "https://drive.google.com/file/d/193c82OIugMuJErt9NnhgCzeB3nNolq66/view", external: true },
  // old: https://samorzad.ue.wroc.pl/rada-uczelniana-samorzadu-studentow
  russResolutions: {} as DocSlot,
  // old: https://samorzad.ue.wroc.pl/studencka-komisja-wyborcza
  skwResolutions: {} as DocSlot,

  // — Hub transparentności (/transparentnosc) — nowe kategorie dokumentów.
  sprawozdania: {} as DocSlot, // sprawozdania z działalności
  finansowanie: {} as DocSlot, // regulamin finansowania działalności studenckiej
  // Księga identyfikacji wizualnej — ten sam plik co w Regulacjach.
  ksiega: { href: "/dokumenty/system-identyfikacji-wizualnej.pdf" },
};
