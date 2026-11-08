/**
 * Dostęp do plan.ue.wroc.pl przez prawdziwą przeglądarkę.
 *
 * Od 11.2026 Cloudflare przed planem Uczelni odrzuca zwykłe zapytania także
 * z polskiego łącza („Cierpliwości…” z polem do zaznaczenia). Ten moduł
 * otwiera widoczne okno Chromium, czeka, aż człowiek przejdzie kontrolę,
 * a potem pobiera kolejne strony z wnętrza tej sesji (fetch w stronie -
 * ciasteczko Cloudflare jest już w przeglądarce).
 *
 *   const plan = await otworzPlan();
 *   const html = await plan.pobierz("l_pozycjaplanu1.php?se=60&gr=153/2");
 *   await plan.zamknij();
 */
import { chromium } from "playwright";

const BASE = "https://plan.ue.wroc.pl/";
const KONTROLA = /Just a moment|Cierpliwo/i;

export async function otworzPlan({ czekajMs = 180_000 } = {}) {
  const przegladarka = await chromium.launch({ headless: false });
  const strona = await przegladarka.newPage();
  await strona.goto(BASE + "index.php", { waitUntil: "domcontentloaded", timeout: 60_000 });
  const koniec = Date.now() + czekajMs;
  while (KONTROLA.test(await strona.title())) {
    if (Date.now() > koniec) {
      await przegladarka.close();
      throw new Error("Kontrola Cloudflare nie została zaliczona w wyznaczonym czasie.");
    }
    await strona.waitForTimeout(1500);
  }
  console.log("Kontrola zaliczona - pobieram.");

  /** Strona planu jako tekst (plan.ue.wroc.pl koduje w windows-1250). */
  async function pobierz(sciezka) {
    const html = await strona.evaluate(async (url) => {
      const r = await fetch(url, { credentials: "include" });
      const buf = await r.arrayBuffer();
      return { status: r.status, text: new TextDecoder("windows-1250").decode(buf) };
    }, BASE + sciezka);
    if (html.status !== 200 || KONTROLA.test(html.text)) {
      throw new Error(`plan.ue.wroc.pl ${html.status} ${sciezka}`);
    }
    // Grzecznie: najwyżej jedno zapytanie na sekundę.
    await strona.waitForTimeout(1100);
    return html.text;
  }

  return { pobierz, zamknij: () => przegladarka.close() };
}
