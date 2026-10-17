import { test, expect } from "@playwright/test";

for (const path of ["kontakt", "rzecznik-praw-studenta", "partnerzy"]) {
  test(`formularz ${path}: walidacja, awaria i zachowanie danych`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => localStorage.setItem("ssuew-consent", "rejected"));
    await page.goto(`/pl/${path}`);
    const form = page.locator("form").filter({ has: page.locator('input[name="email"]') });
    const submit = form.locator('button[type="submit"]');
    // Konfiguracja jest odczytywana podczas budowania stron statycznych.
    // CI buduje z fikcyjnym adresem; lokalnie można sprawdzić także fallback.
    if (await submit.isDisabled()) {
      await expect(form.locator('a[href^="mailto:"]')).toBeVisible();
      test.skip(true, "Build bez konfiguracji formularzy; sprawdzono kontakt zastępczy");
    }
    let attempted = false;
    // Nigdy nie wysyłamy testowych zgłoszeń do prawdziwego backendu.
    await page.route("**/*", async (route) => {
      if (route.request().method() === "POST") {
        attempted = true;
        await route.abort("failed");
      } else await route.continue();
    });
    await submit.click();
    await expect(form.locator('[aria-invalid="true"]').first()).toBeFocused();
    await form.locator('input[name="name"]').fill("Jan Testowy");
    await form.locator('input[name="email"]').fill("test@example.com");
    await form.locator('textarea[name="message"]').fill("Wiadomość testowa zachowana po awarii.");
    for (const field of await form.locator('input:not([type="hidden"]):not([name="name"]):not([name="email"])').all()) {
      await field.fill("Organizacja testowa");
    }
    await submit.click();
    await expect.poll(() => attempted).toBe(true);
    await expect(submit).toBeEnabled();
    await expect(form.getByRole("alert")).toBeVisible();
    await expect(form.locator('textarea[name="message"]')).toHaveValue("Wiadomość testowa zachowana po awarii.");
    attempted = false;
    await submit.click();
    await expect.poll(() => attempted).toBe(true);
    await expect(submit).toBeEnabled();
  });
}
