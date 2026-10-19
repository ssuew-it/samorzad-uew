import { test, expect } from "@playwright/test";

for (const locale of ["pl", "en"]) {
  test(`partners ${locale}: topic changes preserve user edits and route to Zuzanna`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => localStorage.setItem("ssuew-consent", "rejected"));
    await page.goto(`/${locale}/partnerzy`);
    const choices = page.locator('#wspolpraca input[type="radio"]');
    const proceed = page.locator('#wspolpraca a[href="#kontakt-partnerzy"]');
    const message = page.locator('textarea[name="message"]');
    await proceed.click();
    const first = await message.inputValue();
    expect(first.length).toBeGreaterThan(0);
    await choices.nth(1).check();
    await proceed.click();
    await expect(message).not.toHaveValue(first);
    await message.fill("My own partnership proposal.");
    await choices.nth(2).check();
    await proceed.click();
    await expect(message).toHaveValue("My own partnership proposal.");
    for (const link of await page.locator('a[href^="mailto:"]').all()) {
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
