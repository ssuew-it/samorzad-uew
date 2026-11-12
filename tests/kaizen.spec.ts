import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createHmac } from "node:crypto";

// Ten sam sekret co w playwright.config.ts (webServer.env) - tylko do testów.
const TEST_AUTH_SECRET = "playwright-only-secret-0123456789abcdef";

/** Ciasteczko sesji podpisane tak samo jak signSession() w src/lib/auth-core.ts. */
function sessionToken(): string {
  const now = Date.now();
  const payload = Buffer.from(
    JSON.stringify({ email: "ala@samorzad.ue.wroc.pl", name: "Ala Kowalska", iat: now, exp: now + 60 * 60 * 1000 }),
  ).toString("base64url");
  const sig = createHmac("sha256", TEST_AUTH_SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("ssuew-consent", "rejected"));
});

test("gość nie widzi karteczek - wraca do Strefy", async ({ page }) => {
  await page.goto("/pl/strefa-dzialacza/kaizen");
  await expect(page).toHaveURL(/\/pl\/strefa-dzialacza$/);
});

for (const width of [1440, 375]) {
  test(`Działacz: formularz karteczki bez naruszeń dostępności (${width}px)`, async ({ page, context }) => {
    await context.addCookies([{ name: "ssuew_session", value: sessionToken(), domain: "localhost", path: "/" }]);
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/pl/strefa-dzialacza/kaizen");
    await expect(page.getByRole("heading", { level: 2, name: "Napisz karteczkę" })).toBeVisible();
    await expect(page.getByText(/Karteczka jest anonimowa/)).toBeVisible();
    // Tablica: serwer testowy nie ma Apps Script, więc zamiast kart uczciwy komunikat.
    await expect(page.getByRole("region", { name: "Tablica" })).toBeVisible();
    const wynik = await new AxeBuilder({ page }).include("main").analyze();
    expect(wynik.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}

test("wysłanie bez działającego Apps Script: komunikat, a tekst zostaje w formularzu", async ({ page, context }) => {
  await context.addCookies([{ name: "ssuew_session", value: sessionToken(), domain: "localhost", path: "/" }]);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/pl/strefa-dzialacza/kaizen");
  await page.getByRole("radio", { name: "Komunikacja" }).check();
  await page.getByLabel("Co zauważam").fill("Ogłoszenia giną w czacie grupy.");
  await page.getByLabel("Co proponuję").fill("Przypinać jedno podsumowanie tygodnia.");
  await page.getByRole("button", { name: "Wyślij karteczkę" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByLabel("Co zauważam")).toHaveValue("Ogłoszenia giną w czacie grupy.");
});

test("kafelek w panelu prowadzi do karteczek", async ({ page, context }) => {
  await context.addCookies([{ name: "ssuew_session", value: sessionToken(), domain: "localhost", path: "/" }]);
  await page.goto("/pl/strefa-dzialacza");
  await page.getByRole("link", { name: /Karteczki Kaizen/ }).click();
  await expect(page).toHaveURL(/\/pl\/strefa-dzialacza\/kaizen$/);
});
