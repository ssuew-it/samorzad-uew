import { test, expect, type BrowserContext, type Page } from "@playwright/test";
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

const zaloguj = (context: BrowserContext) =>
  context.addCookies([{ name: "ssuew_session", value: sessionToken(), domain: "localhost", path: "/" }]);

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("ssuew-consent", "rejected"));
  await page.setViewportSize({ width: 1280, height: 900 });
});

// Serwer testowy nie ma arkusza (TRESCI_SHEET_ID), więc rejestr jest pusty -
// stany, filtry i linki sprawdzają testy jednostkowe (src/lib/*rejestr*).
test("po zalogowaniu: sekcja Zarządzenia z LEX-em Uczelni i pustym stanem", async ({ page, context }) => {
  await zaloguj(context);
  await page.goto("/pl/strefa-dzialacza");
  await expect(page.getByRole("heading", { level: 2, name: "Zarządzenia" })).toBeVisible();
  const lex = page.getByRole("link", { name: /LEX Uczelni/ });
  await expect(lex).toHaveAttribute("href", "https://lbd.ue.wroc.pl/183-logowanie/?ReturnUrl=%2f");
  await expect(lex).toHaveAttribute("target", "_blank");
  await expect(lex).toHaveAccessibleName(/otwiera się w nowej karcie/);
  await expect(page.getByText("W arkuszu nie ma jeszcze żadnego zarządzenia.")).toBeVisible();
});

// Same etykiety sekcji leżą w komunikatach strony (nie są tajne). Chronione są
// dane zarządzeń: strona pobiera rejestr dopiero po sprawdzeniu sesji.
test("niezalogowany nie widzi sekcji zarządzeń", async ({ page }) => {
  await page.goto("/pl/strefa-dzialacza");
  await expect(page.getByRole("heading", { level: 2, name: "Zarządzenia" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /LEX Uczelni/ })).toHaveCount(0);
});

const TYTUL = "Wszystko do działania w jednym miejscu";

/** Skan dopiero po wejściu nagłówka i końcu animacji - inaczej axe liczy kontrast półprzezroczystego tekstu. */
async function axe(page: Page) {
  await expect(page.getByRole("heading", { level: 1, name: TYTUL })).toHaveCSS("opacity", "1");
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== "running"));
  const wynik = await new AxeBuilder({ page }).include("main").analyze();
  expect(wynik.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
}

test("przed zalogowaniem: nagłówek z bramą, nowe teksty, bez naruszeń dostępności", async ({ page }) => {
  await page.goto("/pl/strefa-dzialacza");
  await expect(page.getByRole("heading", { level: 1, name: TYTUL })).toBeVisible();
  await expect(page.getByText("Strefa jest dostępna tylko dla kont w domenie @samorzad.ue.wroc.pl.", { exact: false })).toBeVisible();
  await expect(page.getByText("Sprawdź, do których Komisji Samorządu i zespołów Projektowych trwa teraz nabór.")).toBeVisible();
  await axe(page);
});

test("po zalogowaniu: karta Działacza, rola, wylogowanie, NARZĘDZIA, bez naruszeń dostępności", async ({ page, context }) => {
  await zaloguj(context);
  await page.goto("/pl/strefa-dzialacza");
  await expect(page.getByRole("heading", { level: 1, name: TYTUL })).toBeVisible();
  await expect(page.getByText("Cześć, Ala Kowalska!")).toBeVisible();
  await expect(page.getByText("Działacz", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Wyloguj się" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Narzędzia" })).toBeVisible();
  await axe(page);
});
