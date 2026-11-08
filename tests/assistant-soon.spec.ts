import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Serwer testowy nie ma klucza AI (ANTHROPIC_API_KEY / GEMINI_API_KEY), więc
// dymek asystenta pokazuje zaślepkę „Asystent jest w drodze”.

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("ssuew-consent", "rejected"));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/pl/kontakt");
});

test("bez klucza AI dymek pokazuje zaślepkę zamiast pola na pytanie", async ({ page }) => {
  await page.getByRole("button", { name: /Zapytaj Samorząd/ }).click();
  const panel = page.getByRole("dialog", { name: "Zapytaj Samorząd" });
  await expect(panel.getByText("Asystent jest w drodze")).toBeVisible();
  await expect(panel.getByRole("textbox")).toHaveCount(0);
  await expect(panel.getByRole("link", { name: "Napisz do nas" })).toHaveAttribute("href", "/pl/kontakt");
  // Przy ograniczonym ruchu przeglądarka bierze nieruchomy kadr zamiast GIF-a.
  await expect.poll(() => panel.locator("img").evaluate((e) => (e as HTMLImageElement).currentSrc)).toContain("/asystent/w-drodze.png");

  const wynik = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
  expect(wynik.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
});

test("„Przeszukaj stronę” otwiera wyszukiwarkę", async ({ page }) => {
  await page.getByRole("button", { name: /Zapytaj Samorząd/ }).click();
  await page.getByRole("button", { name: "Przeszukaj stronę" }).click();
  await expect(page.getByRole("dialog", { name: /Szukaj|Wyszuk/ })).toBeVisible();
});
