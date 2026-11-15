import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { sierotkiWTekstach } from "@/lib/typografia";

/**
 * Polskie teksty z twardymi spacjami po jednoliterowych słowach (src/lib/typografia.ts).
 * Liczone raz na proces, nie przy każdym żądaniu - to kilka tysięcy napisów.
 */
let polskie: Promise<Record<string, unknown>> | null = null;
const wczytaj = async (locale: string) => (await import(`../../messages/${locale}.json`)).default;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  if (locale === "pl") {
    polskie ??= wczytaj("pl").then((m) => sierotkiWTekstach(m));
    return { locale, messages: await polskie };
  }
  return { locale, messages: await wczytaj(locale) };
});
