import { test, expect } from "@playwright/test";

/**
 * Zmiana strony z przewiniętej pozycji musi od razu pokazać górę nowej strony.
 *
 * Next 16 przestał sam wyłączać `scroll-behavior: smooth` przy nawigacji
 * (trzeba mu to zgłosić atrybutem `data-scroll-behavior="smooth"` na <html>).
 * Bez tego nowa strona pojawiała się w starej pozycji przewinięcia i dopiero
 * płynnie „odjeżdżała” na górę — przez kilkaset milisekund widać było środek
 * albo stopkę obcej strony.
 *
 * Mierzymy pozycję w każdej klatce po kliknięciu linku w stopce: po zmianie
 * adresu nie może być ani jednej klatki „w połowie drogi”.
 */
test("nawigacja z dołu strony ląduje od razu na górze nowej strony", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("ssuew-consent", "rejected"));
  await page.goto("/pl/kontakt", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await page.waitForTimeout(300);

  await page.evaluate(() => {
    const w = window as unknown as { __samples: { path: string; y: number }[] };
    w.__samples = [];
    const start = performance.now();
    const tick = () => {
      w.__samples.push({ path: location.pathname, y: Math.round(window.scrollY) });
      if (performance.now() - start < 2500) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  await page.locator("footer a[href$='/nasze-projekty']").first().click();
  await page.waitForURL(/nasze-projekty/);
  await page.waitForTimeout(2600);

  const samples = await page.evaluate(
    () => (window as unknown as { __samples: { path: string; y: number }[] }).__samples,
  );
  const afterNav = samples.filter((s) => s.path.endsWith("/nasze-projekty"));
  expect(afterNav.length).toBeGreaterThan(0);
  // Pierwsza klatka nowej strony może jeszcze nieść starą pozycję (zanim
  // Next przewinie), ale żadna nie może być pomiędzy — to byłby płynny zjazd.
  const inBetween = afterNav.filter((s, i) => i > 0 && s.y > 0);
  expect(inBetween, `klatki w połowie drogi: ${JSON.stringify(afterNav.slice(0, 12))}`).toEqual([]);
});
