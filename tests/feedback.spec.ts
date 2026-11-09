import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Serwer testowy ma OPINIE=1, ale Apps Script jest niedostępny (brak albo adres
// example.invalid w CI) - wysłanie kończy się komunikatem o błędzie.

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("ssuew-consent", "rejected"));
  await page.setViewportSize({ width: 1280, height: 900 });
});

test("bez ?opinia=teraz okienko nie wyskakuje od razu", async ({ page }) => {
  await page.goto("/pl/kontakt");
  await page.waitForTimeout(2000);
  await expect(page.getByRole("dialog", { name: "Jak oceniasz nową stronę Samorządu?" })).toHaveCount(0);
});

test("ocena: nie zabiera fokusu, po gwiazdce pytania, bez naruszeń dostępności", async ({ page }) => {
  await page.goto("/pl/kontakt?opinia=teraz");
  const okno = page.getByRole("dialog", { name: "Jak oceniasz nową stronę Samorządu?" });
  await expect(okno).toBeVisible();
  expect(await okno.evaluate((el) => el.contains(document.activeElement))).toBe(false);

  await okno.getByRole("radio", { name: "4 gwiazdki" }).check({ force: true });
  await expect(okno.getByText("Czy udało się znaleźć to, czego szukasz?")).toBeVisible();
  await expect(okno.getByLabel("Co możemy poprawić? (opcjonalnie)")).toBeVisible();

  const wynik = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
  expect(wynik.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
});

// Większość osób nie klika banera cookies - ocena nie może na niego czekać,
// ale nie może też go zasłaniać (oba siedzą na dole ekranu).
for (const [w, h] of [[1280, 800], [375, 740]] as const) {
  test(`bez decyzji o cookies okienko i tak się pokazuje, nad banerem (${w}px)`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/pl/kontakt?opinia=teraz");
    const baner = page.locator("[data-consent-banner]");
    await expect(baner).toBeVisible();
    const okno = page.getByRole("dialog", { name: "Jak oceniasz nową stronę Samorządu?" });
    await expect(okno).toBeVisible();
    const a = (await okno.boundingBox())!;
    const b = (await baner.boundingBox())!;
    expect(a.y + a.height).toBeLessThanOrEqual(b.y);
    await ctx.close();
  });
}

test("„Nie teraz” zamyka okienko na stałe", async ({ page }) => {
  await page.goto("/pl/kontakt?opinia=teraz");
  await page.getByRole("button", { name: "Nie teraz" }).click();
  await expect(page.getByRole("dialog", { name: "Jak oceniasz nową stronę Samorządu?" })).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("ssuew-opinia"))).not.toBeNull();

  await page.goto("/pl/kontakt?opinia=teraz");
  await page.waitForTimeout(1500);
  await expect(page.getByRole("dialog", { name: "Jak oceniasz nową stronę Samorządu?" })).toHaveCount(0);
});

test("nieudane wysłanie: uczciwy komunikat zamiast fałszywego „dziękujemy”", async ({ page }) => {
  await page.goto("/pl/kontakt?opinia=teraz");
  const okno = page.getByRole("dialog", { name: "Jak oceniasz nową stronę Samorządu?" });
  await okno.getByRole("radio", { name: "5 gwiazdek" }).check({ force: true });
  await okno.getByRole("button", { name: "Wyślij ocenę" }).click();
  await expect(okno.getByText(/Nie udało się wysłać oceny/)).toBeVisible();
});
