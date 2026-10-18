import { test, expect } from "@playwright/test";

for (const width of [320, 375, 768, 1440]) {
  test(`główna: nagłówek nie zasłania tytułu przy ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/pl");
    const title = page.locator("#home-hero-title");
    await expect(title).toBeVisible();
    const titleBox = await title.boundingBox();
    const headerBox = await page.locator("header").first().boundingBox();
    expect(titleBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height + 24);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}

test("menu: przycisk zamknięcia dostępny klawiaturą, zmiana rozmiaru odblokowuje stronę", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("ssuew-consent", "rejected"));
  await page.goto("/pl");
  const toggle = page.locator('button[aria-controls="mobile-menu"]');
  await toggle.click();
  await expect(page.locator("#mobile-menu button").first()).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(toggle).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator("#mobile-menu")).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

test("logo dostępne bez JavaScriptu", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("/pl");
    await expect(page.locator('header img[src*="logo-dark.svg"]')).toBeVisible();
  } finally {
    await context.close();
  }
});
