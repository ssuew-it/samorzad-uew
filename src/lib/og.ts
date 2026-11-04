import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

export const SITE_URL = "https://samorzad.ue.wroc.pl";

const SITE_NAME: Record<string, string> = {
  pl: "Samorząd Studentów Uniwersytetu Ekonomicznego we Wrocławiu",
  en: "Student Government of Wrocław University of Economics and Business",
};

const OG_LOCALE: Record<string, string> = { pl: "pl_PL", en: "en_US" };

/** Pełny adres strony w danym języku; `path` to ścieżka bez prefiksu języka ("/" dla głównej). */
export function pageUrl(locale: string, path: string): string {
  return `${SITE_URL}/${locale}${path === "/" ? "" : path}`;
}

/**
 * Wersje językowe strony. `x-default` wskazuje adres bez prefiksu - tak samo
 * jak nagłówek `Link` z proxy next-intl, który przekierowuje go według języka
 * przeglądarki. Sitemapa korzysta z tej samej funkcji, żeby wszystkie trzy
 * źródła hreflang mówiły to samo.
 */
export function languageAlternates(path: string): Record<string, string> {
  const suffix = path === "/" ? "" : path;
  return {
    ...Object.fromEntries(routing.locales.map((l) => [l, pageUrl(l, path)])),
    "x-default": `${SITE_URL}${suffix || "/"}`,
  };
}

/**
 * Metadane SEO i udostępniania jednej strony: canonical, hreflang, pełny
 * Open Graph i brandowany obraz z `/api/og`.
 *
 * Obiekt `openGraph` strony ZASTĘPUJE ten z layoutu (Next nie scala go
 * głęboko), dlatego url, typ, język i nazwa serwisu muszą być tu, a nie
 * tylko w `[locale]/layout.tsx` - inaczej podstrony traciły og:url i og:locale.
 *
 * Użycie: `return { title, description, ...ogMeta(t("metaTitle"), t("ogLabel"), { locale, path: "/kontakt" }) }`.
 */
export function ogMeta(
  title: string,
  eyebrow: string,
  page: { locale: string; path: string },
): Metadata {
  const { locale, path } = page;
  const url = `/api/og?title=${encodeURIComponent(title)}&eyebrow=${encodeURIComponent(eyebrow)}`;
  const images = [{ url, width: 1200, height: 630, alt: title }];
  return {
    alternates: {
      canonical: pageUrl(locale, path),
      languages: languageAlternates(path),
    },
    openGraph: {
      type: "website",
      url: pageUrl(locale, path),
      siteName: SITE_NAME[locale] ?? SITE_NAME[routing.defaultLocale],
      locale: OG_LOCALE[locale] ?? OG_LOCALE[routing.defaultLocale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      images,
    },
    twitter: { card: "summary_large_image", images },
  };
}
