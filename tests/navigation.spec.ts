import { test, expect } from "@playwright/test";

for (const width of [320, 375, 768, 1024]) {
  test(`menu dostępne na ekranie ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 812 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => localStorage.setItem("ssuew-consent", "rejected"));
    await page.goto("/pl/partnerzy");
    const toggle = page.locator('button[aria-controls="mobile-menu"]');
    await expect(toggle).toBeInViewport({ ratio: 1 });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    const menu = page.locator("#mobile-menu");
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("group", { name: "Język / Language" })).toBeVisible();
    await menu.getByRole("link", { name: "Kontakt", exact: true }).click();
    await expect(page).toHaveURL(/\/pl\/kontakt$/);
    await expect(menu).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}

test("Partnerzy: jedna ściana logo i bezpośrednie odnośniki", async ({ page }) => {
  await page.goto("/pl/partnerzy");
  const main = page.locator("main");
  await expect(main.getByRole("img", { name: "BNY", exact: true })).toHaveCount(1);
  await expect(main.locator('a[href="https://www.bny.com"]')).toBeVisible();
  await expect(main.getByRole("dialog")).toHaveCount(0);
  await expect(main.locator('input[name="name"]')).toBeVisible();
});
