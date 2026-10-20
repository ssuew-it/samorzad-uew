import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * ZAMKNIĘCIE SERWISU.
 *
 * Serwis jest ZAMKNIĘTY DOMYŚLNIE. Otwiera go wyłącznie jawne ustawienie
 * zmiennej `SITE_LOCK` na `off`. Taki kierunek jest celowy: wdrożenie samo
 * z siebie zamyka stronę, bez żadnego kroku w panelu, więc nic nie zostanie
 * odsłonięte przez przeoczenie. Odblokowanie wymaga świadomej decyzji.
 *
 * PODGLĄD DLA ZESPOŁU. Jeśli ustawisz `SITE_LOCK_KEY`, wejście z parametrem
 * `?klucz=…` zapisuje ciasteczko i przepuszcza tę przeglądarkę dalej. To
 * wygodna furtka na czas prac, a NIE zabezpieczenie - klucz jedzie w adresie,
 * więc trafia do historii przeglądarki i logów. Nie chroń nim niczego, czego
 * nie można pokazać.
 */

const KLUCZ_CIASTECZKA = "ssuew-podglad";

/** Ścieżki, których next-intl nie obsługuje: API, zasoby Next, pliki z kropką. */
const POZA_TLUMACZENIAMI = /^\/(?:api|_next|_vercel)(?:\/|$)|\/[^/]+\.[^/]+$/;

/**
 * Jedyne zasoby przepuszczane mimo zamknięcia - znak na stronie „trwają prace".
 *
 * Alternatywą było wklejenie logotypu wprost w HTML, ale każdy plik waży 35 kB
 * i doliczałby się do KAŻDEJ zablokowanej odpowiedzi, której na dodatek nie
 * wolno trzymać w cache. Osobny plik przeglądarka pobiera raz.
 */
const ZNAK_DOZWOLONY = new Set([
  "/logo-light.svg",
  "/logo-dark.svg",
  // Bez tych dwóch karta przeglądarki ze stroną „trwają prace" nie miała ikony.
  "/favicon.ico",
  "/icon.svg",
]);

/**
 * Grafiki stopek mailowych - przepuszczane mimo zamknięcia.
 *
 * Stopka żyje w cudzych skrzynkach i pobiera obrazki z naszej domeny w chwili
 * OTWARCIA wiadomości. Dopóki /sig/ było blokowane, każda stopka wysłana przed
 * otwarciem serwisu pokazywała odbiorcy puste prostokąty zamiast logo i ikon.
 *
 * Wzorzec jest ścisły: tylko płaska nazwa pliku z jednym rozszerzeniem
 * graficznym. Zwykłe `startsWith("/sig/")` przepuściłoby też zakodowane
 * obejścia typu /sig/%2e%2e/pl - a to otworzyłoby zamkniętą stronę.
 */
const GRAFIKA_STOPKI = /^\/sig\/[a-z0-9_-]+\.(?:png|jpe?g|svg)$/i;

const intl = createMiddleware(routing);

/**
 * Wartości `SITE_LOCK`, które OTWIERAJĄ serwis.
 *
 * Kilka zapisów zamiast jednego, bo panel Vercela nie pozwala dodać zmiennej
 * bez wartości - trzeba coś wpisać, a różni ludzie zapisują „wyłączone" różnie.
 * Gdyby otwierało wyłącznie dosłowne `off`, wpisanie `false` albo `0` z myślą
 * o otwarciu zostawiłoby stronę zamkniętą i nikt by nie wiedział dlaczego.
 */
const WARTOSCI_OTWARTE = new Set(["off", "false", "0", "no", "nie", "open"]);

/**
 * Zamknięte, dopóki ktoś ŚWIADOMIE nie otworzy.
 *
 * Brak zmiennej, pusta wartość, literówka czy nieznany zapis - wszystko to
 * znaczy „zamknięte". Pomyłka może najwyżej zostawić stronę zamkniętą na
 * dłużej, nigdy odsłonić jej przed czasem.
 */
function czyZamkniete(): boolean {
  const wartosc = (process.env.SITE_LOCK ?? "").trim().toLowerCase();
  return !WARTOSCI_OTWARTE.has(wartosc);
}

/**
 * Strona „trwają prace".
 *
 * To NIE jest komunikat o awarii, tylko publiczna twarz Samorządu na czas
 * przenosin serwisu z dotychczasowej platformy. Mówi wprost, co się dzieje,
 * i zostawia dwie drogi kontaktu, żeby nikt ze sprawą nie utknął.
 *
 * Krój systemowy, nie firmowy: strona ma się pokazać natychmiast i bez
 * zależności od zewnętrznego serwera czcionek. Znak ładuje się osobnym
 * plikiem - patrz `ZNAK_DOZWOLONY`.
 */
function stronaZamkniecia(): string {
  return `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Nowa strona w budowie - Samorząd Studentów UEW</title>
<style>
  :root {
    color-scheme: light dark;
    --bg: #f6f8fc; --ink: #0b1322; --ink-2: #475467; --ink-3: #636d81;
    --accent: #2c4bff; --line: rgba(11,19,34,.12);
  }
  /* Stan domyslny PRZED zapytaniem medialnym. Gdy stal po nim, ta sama
     specyficznosc wygrywala kolejnoscia i w ciemnym motywie znikaly OBA
     warianty znaku - strona zostawala bez logotypu. */
  .znak-ciemny { display: none; }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0a0d14; --ink: #eef2f8; --ink-2: #9ba6b7; --ink-3: #7e889c;
      --accent: #6c84ff; --line: rgba(255,255,255,.14);
    }
    .znak-jasny { display: none; }
    .znak-ciemny { display: block; }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100svh;
    display: grid; place-items: center;
    padding: 32px 24px;
    background: var(--bg); color: var(--ink);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.65;
    -webkit-font-smoothing: antialiased;
  }
  main { max-width: 33rem; width: 100%; }
  /* display block, bo domyslnie obrazek jest liniowy i etykieta prac
     ladowala obok znaku, w tej samej linii, zamiast pod nim. */
  img { display: block; width: 236px; max-width: 68%; height: auto; }
  .tag {
    display: inline-block; margin: 30px 0 0;
    font-size: .6875rem; letter-spacing: .16em; text-transform: uppercase;
    color: var(--accent); font-weight: 600;
  }
  h1 {
    font-size: clamp(1.6rem, 5vw, 2.1rem); line-height: 1.15;
    letter-spacing: -.025em; margin: 10px 0 0; text-wrap: balance;
  }
  p { margin: 14px 0 0; color: var(--ink-2); }
  .stopka {
    margin-top: 30px; padding-top: 22px; border-top: 1px solid var(--line);
    display: flex; flex-wrap: wrap; gap: 8px 20px; align-items: baseline;
  }
  a { color: var(--accent); text-decoration-thickness: 1px; text-underline-offset: 3px; }
  a:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 3px; }
  .en { margin-top: 22px; font-size: .875rem; color: var(--ink-3); }
</style>
</head>
<body>
<main>
  <img class="znak-jasny" src="/logo-dark.svg" alt="Samorząd Studentów Uniwersytetu Ekonomicznego we Wrocławiu">
  <img class="znak-ciemny" src="/logo-light.svg" alt="Samorząd Studentów Uniwersytetu Ekonomicznego we Wrocławiu">

  <span class="tag">Trwają prace</span>
  <h1>Budujemy tu nową stronę</h1>
  <p>
    Serwis Samorządu przenosi się na nową platformę i przygotowujemy go od podstaw.
    Wrócimy pod tym adresem, gdy będzie gotowy.
  </p>
  <p>W międzyczasie jesteśmy dla Was dostępni jak zwykle.</p>

  <div class="stopka">
    <a href="mailto:kontakt@samorzad.ue.wroc.pl">kontakt@samorzad.ue.wroc.pl</a>
    <a href="https://www.facebook.com/samorzad.ue" rel="noopener">Facebook</a>
    <a href="https://www.instagram.com/samorzad.ue" rel="noopener">Instagram</a>
  </div>

  <p class="en" lang="en">
    We are rebuilding this website. It will be back at this address soon -
    in the meantime you can reach us by e-mail or on social media.
  </p>
</main>
</body>
</html>`;
}

export function proxy(request: NextRequest) {
  if (czyZamkniete()) {
    // Znak dla strony „trwają prace" - jedyny wyjątek od zamknięcia.
    const sciezka = request.nextUrl.pathname;
    if (ZNAK_DOZWOLONY.has(sciezka) || GRAFIKA_STOPKI.test(sciezka)) {
      return NextResponse.next();
    }

    // Sygnał z arkusza „Treści strony” po edycji. Nie zwraca żadnej treści
    // serwisu, wymaga sekretu (TRESCI_SECRET), a bez niego podgląd z kluczem
    // pokazywałby przez godzinę dane sprzed edycji.
    if (sciezka === "/api/tresci/odswiez" && request.method === "POST") {
      return NextResponse.next();
    }

    const klucz = process.env.SITE_LOCK_KEY;
    const podany = request.nextUrl.searchParams.get("klucz");
    const zCiasteczka = request.cookies.get(KLUCZ_CIASTECZKA)?.value;

    // Furtka podglądu - tylko gdy klucz w ogóle ustawiono.
    if (klucz && (podany === klucz || zCiasteczka === klucz)) {
      const odpowiedz = przepusc(request);
      if (podany === klucz) {
        odpowiedz.cookies.set(KLUCZ_CIASTECZKA, klucz, {
          httpOnly: true,
          sameSite: "lax",
          secure: true,
          path: "/",
          // 30 dni. Przy 12 godzinach zespół musiałby wchodzić z kluczem
          // codziennie od nowa przez cały okres prac.
          maxAge: 60 * 60 * 24 * 30,
        });
      }
      // Podgląd nie może trafić do żadnego cache po drodze ani do wyszukiwarek.
      odpowiedz.headers.set("Cache-Control", "no-store, must-revalidate");
      odpowiedz.headers.set("X-Robots-Tag", "noindex, nofollow");
      return odpowiedz;
    }

    // 503, a nie 200 z komunikatem: wyszukiwarki traktują to jako przerwę
    // techniczną i NIE podmieniają zaindeksowanej treści na tę stronę.
    return new NextResponse(stronaZamkniecia(), {
      status: 503,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        // Bez `no-store` blokada zostałaby w cache CDN-u i przeglądarek także
        // po odblokowaniu serwisu.
        "Cache-Control": "no-store, must-revalidate",
        "X-Robots-Tag": "noindex, nofollow",
        "Retry-After": "3600",
      },
    });
  }

  return przepusc(request);
}

/**
 * Zachowanie przy otwartym serwisie.
 *
 * Dopasowanie w `config` obejmuje teraz WSZYSTKO, żeby zamknięcie łapało też
 * API i zasoby. Gdy serwis jest otwarty, ścieżki spoza zakresu tłumaczeń muszą
 * więc przelecieć nietknięte - inaczej next-intl próbowałby dokleić prefiks
 * języka do `/api/...` i do plików statycznych.
 */
function przepusc(request: NextRequest): NextResponse {
  if (POZA_TLUMACZENIAMI.test(request.nextUrl.pathname)) {
    return NextResponse.next();
  }
  return intl(request) as NextResponse;
}

export const config = {
  // Wszystko. Przy zamkniętym serwisie nie może istnieć ścieżka, która go omija.
  matcher: "/:path*",
};
