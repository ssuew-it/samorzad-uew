import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createHmac } from "node:crypto";

// Ten sam sekret co w playwright.config.ts (webServer.env) - tylko do testów.
// Serwer testowy nie ma Edge Config ani zmiennych zapisu, więc panel jest
// w stanie „nieskonfigurowany”: kontakt@ jest superadminem, reszta ma rolę
// Działacz, a kontrolki edycji są wyłączone.
const TEST_AUTH_SECRET = "playwright-only-secret-0123456789abcdef";
const SUPERADMIN = { email: "kontakt@samorzad.ue.wroc.pl", name: "Samorząd Studentów" };
const DZIALACZ = { email: "ala@samorzad.ue.wroc.pl", name: "Ala Kowalska" };

/** Ciasteczko sesji podpisane tak samo jak signSession() w src/lib/auth-core.ts. */
function sessionToken(data: { email: string; name: string }): string {
  const now = Date.now();
  const payload = Buffer.from(JSON.stringify({ ...data, iat: now, exp: now + 60 * 60 * 1000 })).toString("base64url");
  const sig = createHmac("sha256", TEST_AUTH_SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

async function signIn(context: BrowserContext, who: { email: string; name: string }) {
  await context.addCookies([{ name: "ssuew_session", value: sessionToken(who), domain: "localhost", path: "/" }]);
}

async function setup(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("ssuew-consent", "rejected"));
}

test("niezalogowany wraca do Strefy", async ({ page }) => {
  await setup(page);
  await page.goto("/pl/strefa-dzialacza/role");
  await expect(page).toHaveURL(/\/pl\/strefa-dzialacza$/);
});

test("działacz bez superadmina wraca do Strefy i nie widzi listy", async ({ page, context }) => {
  await setup(page);
  await signIn(context, DZIALACZ);
  await page.goto("/pl/strefa-dzialacza/role");
  await expect(page).toHaveURL(/\/pl\/strefa-dzialacza$/);
  // Panel działacza zamiast listy ról (same etykiety panelu leżą w messages
  // i nie są tajne - tajna jest lista osób, a ta nie trafia na stronę).
  await expect(page.getByRole("heading", { level: 1, name: "Panel działacza" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Lista osób" })).toHaveCount(0);
});

test("superadmin widzi panel; bez magazynu kontrolki są wyłączone", async ({ page, context }) => {
  await setup(page);
  await signIn(context, SUPERADMIN);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/pl/strefa-dzialacza/role");
  await expect(page).toHaveURL(/\/pl\/strefa-dzialacza\/role$/);
  await expect(page.getByRole("heading", { level: 1, name: "Role i dostęp" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Lista osób" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

  // Komunikat mówi, których zmiennych brakuje.
  await expect(page.getByText("Magazyn ról nie jest podłączony")).toBeVisible();
  for (const name of ["GLOBAL_CONFIG", "EDGE_CONFIG_ID", "VERCEL_API_TOKEN"]) {
    await expect(page.locator("code", { hasText: new RegExp(`^${name}$`) })).toBeVisible();
  }
  await expect(page.getByRole("button", { name: "Dodaj osobę" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Zablokuj adres" })).toBeDisabled();
  await expect(page.getByText("Na liście nie ma jeszcze nikogo")).toBeVisible();
});

test("EN: teksty po angielsku", async ({ page, context }) => {
  await setup(page);
  await signIn(context, SUPERADMIN);
  await page.goto("/en/strefa-dzialacza/role");
  await expect(page.getByRole("heading", { level: 1, name: "Roles and access" })).toBeVisible();
  await expect(page.getByText("The role store is not connected")).toBeVisible();
  await expect(page.getByRole("button", { name: "Add person" })).toBeDisabled();
});

test("mobile 320 px: bez poziomego przewijania, przyciski 44 px", async ({ page, context }) => {
  await setup(page);
  await signIn(context, SUPERADMIN);
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/pl/strefa-dzialacza/role");
  await expect(page.getByRole("heading", { name: "Lista osób" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  for (const name of ["Dodaj osobę", "Zablokuj adres"]) {
    const box = await page.getByRole("button", { name }).boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});

for (const theme of ["light", "dark"] as const) {
  test(`axe: panel ról (${theme})`, async ({ page, context }) => {
    await setup(page);
    await signIn(context, SUPERADMIN);
    await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/pl/strefa-dzialacza/role");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Lista osób" })).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      results.violations,
      results.violations.map((v) => `${v.id}: ${v.nodes.length}× - ${v.help}`).join("\n"),
    ).toEqual([]);
  });
}
