import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("ssuew-consent", "rejected"));
  await page.goto("/pl/transparentnosc");
});

// Retained for reactivation with FinancialReport; the component is intentionally unpublished.
test.skip("reports expose all source tables and reset filters when changing year", async ({ page }) => {
  const section = page.locator("#sprawozdanie-finansowe");
  for (const [year, count] of [["2024", 49], ["2023", 50], ["2022", 54]] as const) {
    await section.locator("select").first().selectOption(year);
    await expect(section.locator("tbody tr")).toHaveCount(count);
    await section.getByRole("button", { name: "Rok do roku", exact: true }).click();
    await expect(section.locator("tbody tr")).toHaveCount(8);
    await section.getByRole("button", { name: "Liczba projektów", exact: true }).click();
    await expect(section.locator("tbody tr")).toHaveCount(year === "2024" ? 8 : 9);
    await section.getByRole("button", { name: "Wykorzystanie środków", exact: true }).click();
  }
  await section.locator("input").fill("nieistniejacy-projekt");
  await expect(section.locator("tbody tr")).toHaveCount(0);
  await section.locator("select").first().selectOption("2024");
  await expect(section.locator("input")).toHaveValue("");
  await section.locator("input").fill("Juwenalia");
  await expect(section.locator("tbody tr")).toHaveCount(2);
  await expect(section.locator("tbody a").first()).toHaveAttribute("href", /#page=3$/);
  await section.getByRole("button", { name: "Wyczyść filtry" }).focus();
  await page.keyboard.press("Enter");
  await expect(section.locator("tbody tr")).toHaveCount(49);
});

test("public registry keeps financial reports unpublished and fits phone widths", async ({ page }) => {
  await expect(page.locator("#sprawozdanie-finansowe")).toHaveCount(0);
  await expect(page.locator('a[href="#sprawozdanie-finansowe"]')).toHaveCount(0);
  await expect(page.locator("#rejestr")).toBeVisible();
  for (const width of [320, 375, 768]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
