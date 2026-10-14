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
      // Filia w Jeleniej Górze nie ma na nowej stronie własnej podstrony.
      // Najbliżej jest Zarząd, w którym stoi osoba odpowiedzialna za Filię.
      ["/samorząd-studentów-w-jeleniej-górze", "/zarzad"],
      // Automatyczna nazwa, którą Wix nadał skopiowanej stronie Filii.
      ["/kopia-zarząd-1", "/zarzad"],
      // Stare komisje i strona dla organizacji (sprzed Wixa, nadal w indeksie).
      ["/dla-organizacji", "/organizacje-studenckie"],
    ];
    for (const [from, to] of zWixa) {
      const zakodowany = encodeURI(from);
      for (const src of new Set([from, zakodowany])) {
        out.push({ source: src, destination: to, permanent: true });
        out.push({ source: `/:locale${src}`, destination: `/:locale${to}`, permanent: true });
      }
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
