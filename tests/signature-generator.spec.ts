import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createHmac } from "node:crypto";

// Ten sam sekret co w playwright.config.ts (webServer.env) - tylko do testów.
const TEST_AUTH_SECRET = "playwright-only-secret-0123456789abcdef";
const SSUEW = "Samorządu Studentów Uniwersytetu Ekonomicznego we Wrocławiu";

/** Ciasteczko sesji podpisane tak samo jak signSession() w src/lib/auth-core.ts. */
function sessionToken(): string {
  const now = Date.now();
  const payload = Buffer.from(
    JSON.stringify({ email: "ala@samorzad.ue.wroc.pl", name: "Ala Kowalska", iat: now, exp: now + 60 * 60 * 1000 }),
  ).toString("base64url");
  const sig = createHmac("sha256", TEST_AUTH_SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

test.beforeEach(async ({ page, context }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("ssuew-consent", "rejected"));
  await context.addCookies([{ name: "ssuew_session", value: sessionToken(), domain: "localhost", path: "/" }]);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/pl/strefa-dzialacza/generator-stopki");
});

test("funkcje: domyślnie Członek Komisji, grupy z nagłówkami", async ({ page }) => {
  const funkcja = page.getByLabel("Funkcja");
  await expect(funkcja).toHaveValue(`Członek Komisji ${SSUEW}`);
  const grupy = await funkcja.locator("optgroup").evaluateAll((g) => g.map((x) => x.getAttribute("label")));
  expect(grupy).toEqual(["Komisje", "Zarząd", "Komisja Rewizyjna", "Studencka Komisja Wyborcza", "Rzecznik Praw Studenta"]);
  await funkcja.selectOption(`Rzecznik Praw Studenta ${SSUEW}`);
  await expect(page.frameLocator("iframe").first().getByText(`Rzecznik Praw Studenta ${SSUEW}`)).toBeVisible();
});

test("telefon dostaje spacje co trzy cyfry, a strony nie da się edytować", async ({ page }) => {
  const tel = page.getByLabel("Telefon");
  await tel.pressSequentially("514174791");
  await expect(tel).toHaveValue("514 174 791");
  await expect(page.getByLabel("Strona", { exact: true })).toHaveCount(0);
});

test("wersja do masówek: pas grafiki obok danych", async ({ page }) => {
  await page.getByRole("radio", { name: /Do masówek/ }).click();
  const podglad = page.frameLocator("iframe").first();
  await expect(podglad.locator('img[src*="grafika-pas.png"]')).toHaveCount(1);
  await expect(podglad.locator('img[src*="ic_mail.png"]')).toHaveCount(0);
});

test("generator bez naruszeń dostępności (axe)", async ({ page }) => {
  await expect(page.getByLabel("Funkcja")).toBeVisible();
  // Ramki podglądu to dokumenty z samą stopką mailową (bez main/h1 - tak jak
  // w skrzynce odbiorcy), więc reguły struktury strony ich nie dotyczą.
  const wynik = await new AxeBuilder({ page }).include("main").exclude("iframe").analyze();
  expect(wynik.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
});
