import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  async redirects() {
    const map: Record<string, string> = {
      "stypendia-rektora": "rektora",
      "stypendia-socjalne": "socjalne",
      "stypendia-dla-niepelnosprawnych": "niepelnosprawni",
      "zapomoga": "zapomoga",
      "wsparcie-materialne-i-swiadczenia": "wsparcie",
      "kalkulator-sredniej": "kalkulator",
    };
    const out: Awaited<ReturnType<NonNullable<NextConfig["redirects"]>>> = [];
    for (const [from, hash] of Object.entries(map)) {
      out.push({ source: `/:locale/${from}`, destination: `/:locale/stypendia#${hash}`, permanent: true });
      out.push({ source: `/${from}`, destination: `/stypendia#${hash}`, permanent: true });
    }
    out.push({ source: "/:locale/przewodniczacy-i-wiceprzewodniczacy", destination: "/:locale/zarzad", permanent: true });
    out.push({ source: "/przewodniczacy-i-wiceprzewodniczacy", destination: "/zarzad", permanent: true });

    /*
     * Adresy ze starego serwisu na Wixie, które po przenosinach domeny dawały 404.
     *
     * Lista nie jest zgadywana: to ścieżki, które Google nadal trzyma w indeksie
     * (sprawdzone 14.10.2026 zapytaniem site:samorzad.ue.wroc.pl) albo które
     * stoją w audycie migracji. Każda została przetestowana na zbudowanej stronie
     * przed dopisaniem tutaj.
     *
     * Wix nadawał adresy z polskimi znakami. Przeglądarka wysyła je zakodowane
     * (ą → %C4%85), a dokumentacja Next nie mówi, w której postaci je dopasowuje —
     * dlatego każda taka ścieżka występuje w obu postaciach.
     */
    const zWixa: [string, string][] = [
      // Polska nazwa → ta sama strona pod adresem bez znaków diakrytycznych.
      ["/współpracuj-z-nami", "/wspolpracuj-z-nami"],
      // Filia w Jeleniej Górze ma własną podstronę (od 10.2026; wcześniej oba
      // adresy kierowały na Zarząd, bo innego miejsca o Filii nie było).
      ["/samorząd-studentów-w-jeleniej-górze", "/filia-jelenia-gora"],
      // Automatyczna nazwa, którą Wix nadał skopiowanej stronie Filii.
      ["/kopia-zarząd-1", "/filia-jelenia-gora"],
      // Stare komisje i strona dla organizacji (sprzed Wixa, nadal w indeksie).
      ["/dla-organizacji", "/organizacje-studenckie"],
      // Pozycje z menu Wixa (zebrane z zapisów w Wayback Machine, 14.10.2026).
      ["/rada-uczelniana-samorządu-studentów", "/rada-uczelniana-samorzadu-studentow"],
      ["/wsparciematerialneiświadczenia", "/stypendia#wsparcie"],
      ["/wybory", "/studencka-komisja-wyborcza"],
      ["/formularz", "/kontakt"],
      ["/śledź-nas", "/kontakt"],
      // FAQ dotyczyło spraw studenckich, a te zebrane są w Strefie Studenta.
      ["/najczesciej-zadawane-pytania-faq", "/dla-studenta"],
      // Strona logotypu odsyłała do księgi znaku, która stoi w Regulacjach.
      ["/logotyp", "/regulacje-wewnetrzne"],
      // Automatyczne nazwy kopii stron, które Wix wystawił w menu.
      ["/kopia-prezydium", "/zarzad"],
      ["/kopia-prezydium-1", "/zarzad"],
      ["/kopia-współprace", "/partnerzy"],
      ["/kopia-współprace-1", "/partnerzy"],
    ];
    for (const [from, to] of zWixa) {
      const zakodowany = encodeURI(from);
      for (const src of new Set([from, zakodowany])) {
        out.push({ source: src, destination: to, permanent: true });
        out.push({ source: `/:locale${src}`, destination: `/:locale${to}`, permanent: true });
      }
    }

    // Stare adresy plików z Wixa, które krążą w mailach i postach. Pliki
    // odzyskaliśmy i trzymamy u siebie (src/lib/documents.ts).
    const plikiZWixa: Record<string, string> = {
      "3dec01_e2f5e6255f3a4e02b3486fce9345da3d": "regulamin-samorzadu-studenckiego",
      "3dec01_8e95b203e91e47d1b2a5be489ab3136c": "regulamin-rady-organizacji-studenckich",
      "3dec01_f29102abac934f8fbb771a0e0033b71b": "regulamin-organizacyjny-russ",
      "3dec01_ce9e1526865444b9a8b2890406b4887e": "regulamin-rad-mieszkancow-ds",
      "3dec01_e1abe35d67a44e9aacecbe501da0d5a1": "ordynacja-wyborcza",
      "3dec01_746b01182be140039f8a0930403c0df3": "system-identyfikacji-wizualnej",
      "239ae5_448d3e36638a4832bdbd95a2ed414c9a": "regulamin-organizacyjny-uew-2024",
    };
    for (const [wix, nasz] of Object.entries(plikiZWixa)) {
      out.push({ source: `/_files/ugd/${wix}.pdf`, destination: `/dokumenty/${nasz}.pdf`, permanent: true });
    }

    // Wpisy z bloga Wixa. Nowa strona nie ma bloga, a pojedynczych wpisów nie
    // da się przypisać do konkretnych podstron, więc wszystkie trafiają do
    // „Naszej działalności" — tam, gdzie opisujemy, czym się zajmujemy.
    out.push({ source: "/post/:slug*", destination: "/nasza-dzialalnosc", permanent: true });
    out.push({ source: "/blog", destination: "/nasza-dzialalnosc", permanent: true });
    out.push({ source: "/komisje/:slug*", destination: "/struktura-samorzadu", permanent: true });

    return out;
  },
  images: {
    // Logo to nasze zaufane SVG (public/logo-*.svg). next/image wymaga tej flagi,
    // by serwować SVG; sandbox + CSP wyłączają skrypty/osadzanie dla bezpieczeństwa.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
