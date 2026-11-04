import type { MetadataRoute } from "next";
import { searchIndex } from "@/lib/searchIndex";
import { routing } from "@/i18n/routing";
import { languageAlternates, pageUrl } from "@/lib/og";

// Hub/landing pages deserve higher priority than leaf detail pages.
const HIGH_PRIORITY = new Set<string>([
  "/",
  "/dla-studenta",
  "/stypendia",
  "/o-nas",
  "/partnerzy",
  "/kontakt",
  "/transparentnosc",
  "/rekrutacja",
]);

// Strony z `robots: noindex` - w wyszukiwarce ⌘K są, w sitemapie nie mogą być,
// bo Search Console zgłasza wtedy sprzeczne sygnały („przesłany, ale noindex”).
const NOINDEX_PREFIXES = ["/strefa-dzialacza", "/szukaj"];

export default function sitemap(): MetadataRoute.Sitemap {
  // Fragment-only entries (e.g. "/stypendia#kalkulator") point at a section of an
  // already-listed page - they're useful for search, but noise in a sitemap.
  //
  // Bez `lastModified`: data budowania zmieniała się przy każdym wdrożeniu dla
  // wszystkich adresów naraz, a Google ignoruje lastmod, który nie odpowiada
  // rzeczywistym zmianom treści.
  return searchIndex
    .filter((entry) => !entry.href.includes("#"))
    .filter((entry) => !NOINDEX_PREFIXES.some((p) => entry.href.startsWith(p)))
    .flatMap((entry) =>
      routing.locales.map((locale) => ({
        url: pageUrl(locale, entry.href),
        changeFrequency: entry.href === "/" ? ("weekly" as const) : ("monthly" as const),
        priority: entry.href === "/" ? 1 : HIGH_PRIORITY.has(entry.href) ? 0.9 : 0.7,
        alternates: { languages: languageAlternates(entry.href) },
      })),
    );
}
