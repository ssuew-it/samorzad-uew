import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("ssuew-consent", "rejected"));
});

for (const width of [1280, 375]) {
  test(`galeria projektu: podgląd, strzałki, Escape oddaje fokus (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/pl/nasze-projekty");
    const galeria = page.getByRole("list", { name: "Zdjęcia: Bal UEW" });
    const miniatura = galeria.getByRole("button").nth(1);
    await miniatura.scrollIntoViewIfNeeded();
    const opis = await miniatura.locator("img").getAttribute("alt");
    await miniatura.click();

    const podglad = page.getByRole("dialog", { name: "Podgląd zdjęcia" });
    await expect(podglad).toBeVisible();
    await expect(podglad.locator("figcaption")).toContainText("Zdjęcie 2 z 14");
    await expect(podglad.getByRole("img")).toHaveAttribute("alt", opis!);

    await page.keyboard.press("ArrowRight");
    await expect(podglad.locator("figcaption")).toContainText("Zdjęcie 3 z 14");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(podglad.locator("figcaption")).toContainText("Zdjęcie 1 z 14");

    const wynik = await new AxeBuilder({ page }).include("dialog[open]").analyze();
    expect(wynik.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);

    await page.keyboard.press("Escape");
    await expect(podglad).toBeHidden();
    await expect(miniatura).toBeFocused();
  });
}

test("pasek galerii: przyciski przewijają i gasną na początku", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/pl/nasze-projekty");
  const projekt = page.locator("#projekt-bal");
  const wstecz = projekt.getByRole("button", { name: "Poprzednie zdjęcia" });
  const dalej = projekt.getByRole("button", { name: "Następne zdjęcia" });
  await dalej.scrollIntoViewIfNeeded();
  await expect(wstecz).toBeDisabled();
  await dalej.click();
  await expect(wstecz).toBeEnabled();
  expect(await projekt.getByRole("list", { name: "Zdjęcia: Bal UEW" }).evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
});

test("Zjazd FUE: galeria zdjęć bez naruszeń dostępności", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/pl/fue-i-psrp");
  const galeria = page.getByRole("group", { name: "Zdjęcia ze zjazdu Forum Uczelni Ekonomicznych" });
  await galeria.scrollIntoViewIfNeeded();
  await expect(galeria.getByRole("button")).toHaveCount(7);
  const wynik = await new AxeBuilder({ page }).include('[role="group"]').analyze();
  expect(wynik.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
});
