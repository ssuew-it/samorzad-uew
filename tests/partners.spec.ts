import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("ssuew-consent", "rejected"));
});

for (const locale of ["pl", "en"]) {
  test(`partners ${locale}: topic changes preserve user edits and route to Zuzanna`, async ({ page }) => {
    await page.goto(`/${locale}/partnerzy`);
    const choices = page.locator("#dopasowanie label");
    const proceed = page.locator('#dopasowanie a[href="#kontakt-partnerzy"]').first();
    const message = page.locator('textarea[name="message"]');
    await proceed.click();
    const first = await message.inputValue();
    expect(first.length).toBeGreaterThan(0);
    await choices.nth(1).click();
    await proceed.click();
    await expect(message).not.toHaveValue(first);
    await message.fill("My own partnership proposal.");
    await choices.nth(2).click();
    await proceed.click();
    await expect(message).toHaveValue("My own partnership proposal.");
    // Tylko treść strony: wspólna stopka celowo podaje ogólny kontakt@.
    for (const link of await page.locator('main a[href^="mailto:"]').all()) {
      await expect(link).toHaveAttribute("href", /^mailto:zuzanna\.bak@samorzad\.ue\.wroc\.pl(?:\?|$)/);
    }
    const questions = page.locator("#pytania-partnerzy summary");
    await questions.first().focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#pytania-partnerzy details[open]")).toHaveCount(1);
    await expect(page.locator("#pytania-partnerzy details[open]")).toContainText("Zuzanna Bąk");
    for (const width of [320, 375, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}

test("koło atutów: najechanie i strzałki zmieniają panel, bez naruszeń dostępności", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/pl/partnerzy");
  const atuty = page.locator("#atuty");
  const tabs = atuty.getByRole("tab");
  await expect(tabs).toHaveCount(5);
  await expect(atuty.getByRole("tabpanel")).toContainText("Dotarcie do potencjalnych pracowników i stażystów");

  await tabs.nth(3).hover();
  await expect(tabs.nth(3)).toHaveAttribute("aria-selected", "true");
  await expect(atuty.getByRole("tabpanel")).toContainText("Ekspozycja na ok. 9600 studentów");

  await tabs.nth(3).focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(4)).toBeFocused();
  await expect(atuty.getByRole("tabpanel")).toContainText("Obecność marki na różnorodnych wydarzeniach");

  const wynik = await new AxeBuilder({ page }).include("#atuty").include("#projekty").include("#dopasowanie").analyze();
  expect(wynik.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
});

test("projekty: wybór projektu pokazuje formy zaangażowania i wpisuje temat do formularza", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/pl/partnerzy");
  const projekty = page.locator("#projekty");
  await projekty.getByRole("tab", { name: "TEDxUEW" }).click();
  const panel = projekty.getByRole("tabpanel");
  await expect(panel).toContainText("Możliwe formy zaangażowania");
  await expect(panel.getByRole("heading", { name: "TEDxUEW" })).toBeVisible();
  await panel.getByRole("link", { name: "Porozmawiajmy o tym projekcie" }).click();
  await expect(page.locator('textarea[name="message"]')).toHaveValue(/TEDxUEW/);
  await expect(page.getByText("Wybrany temat rozmowy")).toBeVisible();
});

test("kontakt: osoba od współpracy i deklaracja czasu odpowiedzi", async ({ page }) => {
  await page.goto("/pl/partnerzy");
  const kontakt = page.locator("#kontakt-partnerzy");
  await expect(kontakt.getByRole("img", { name: "Zuzanna Bąk" })).toBeVisible();
  await expect(kontakt.getByText("Odpowiadamy w ciągu 48 godzin w dni robocze.")).toBeVisible();
});
