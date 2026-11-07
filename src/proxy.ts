import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Proxy (dawniej middleware) - tylko przekierowanie na wersję językową.
 *
 * DLACZEGO TAK WĄSKO
 * Na Vercelu proxy to funkcja Node uruchamiana PRZED cache. Do 7.11.2026
 * obejmowało wszystko, bo pilnowało blokady serwisu (SITE_LOCK, strona
 * „trwają prace”). Każda odsłona odpalała je kilkanaście razy: strona, każdy
 * plik JS i CSS, zdjęcia, a nawet ikony stopek mailowych pobierane przez
 * Gmaila - i to ono zjadało większość limitu Fluid Active CPU (planu Hobby).
 *
 * Serwis jest otwarty, więc blokadę usunięto. Gdyby trzeba go było kiedyś
 * zamknąć, służą do tego narzędzia Vercela (ochrona wdrożenia hasłem albo
 * reguła w Firewallu) - nie kosztują CPU przy każdym żądaniu.
 *
 * Strony mają zawsze prefiks /pl albo /en (localePrefix: "always") i leżą
 * gotowe w CDN. Proxy jest potrzebne tylko dla adresów BEZ języka: „/”
 * i starych linków (np. /kontakt), które trzeba przekierować pod /pl/....
 */
export const proxy = createMiddleware(routing);

export const config = {
  // Wszystko poza: /pl i /en (z podstronami), API, zasobami Next/Vercela
  // i plikami z kropką w nazwie (zdjęcia, ikony, /sftp-config.json od botów).
  // Pilnuje tego src/proxy.test.ts.
  matcher: "/((?!api|_next|_vercel|(?:pl|en)(?:/|$)|.*\\..*).*)",
};
