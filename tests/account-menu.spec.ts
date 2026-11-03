import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createHmac } from "node:crypto";

// Odpowiedź /api/auth/me podstawiamy w przeglądarce - serwer testowy nie ma
// sesji Google ani magazynu ról, a przycisk konta zależy wyłącznie od tego,
// co zwróci ten endpoint.
const me = {
  name: "Ala Kowalska",
  email: "ala@samorzad.ue.wroc.pl",
  isSuperadmin: true,
  roles: [
    { role: "superadmin", until: null },
    { role: "zarzad", until: "2027-05-31" },
  ],
};

async function setup(page: Page, status: number, body: unknown = {}) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("ssuew-consent", "rejected"));
  await page.route("**/api/auth/me", (r) =>
    r.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) }),
  );
}

test("niezalogowany widzi zwykły przycisk", async ({ page }) => {
  await setup(page, 401);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/pl");
  await expect(
    page.getByRole("navigation", { name: /./ }).first().getByRole("link", { name: "Zaloguj się", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Konto:/ })).toHaveCount(0);
});

test("zalogowany: przycisk konta, menu z rolami, Esc zamyka", async ({ page }) => {
  await setup(page, 200, me);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/pl");
  const btn = page.getByRole("button", { name: /Konto: Ala Kowalska/ });
  // Widoczny napis jest częścią nazwy dostępnej (WCAG 2.5.3 Label in Name).
  await expect(btn).toHaveAccessibleName("Strefa Działacza - Konto: Ala Kowalska, zalogowano");
  await expect(btn).toContainText("Strefa Działacza");
  await btn.click();
  await expect(btn).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("do 31.05.2027")).toBeVisible();
  await expect(page.getByText("ala@samorzad.ue.wroc.pl")).toBeVisible();
  await expect(page.getByText("Zarząd", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Panel działacza" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Role i dostęp" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Wyloguj się" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(btn).toHaveAttribute("aria-expanded", "false");
  await expect(btn).toBeFocused();
  await expect(page.getByText("do 31.05.2027")).toHaveCount(0);
});

test("klik poza menu zamyka, zwykły działacz nie widzi „Role i dostęp”", async ({ page }) => {
  await setup(page, 200, { ...me, isSuperadmin: false, roles: [{ role: "normal", until: null }] });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/pl");
  const btn = page.getByRole("button", { name: /Konto: Ala Kowalska/ });
  await btn.click();
  await expect(page.getByText("Działacz", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Role i dostęp" })).toHaveCount(0);
  await page.mouse.click(700, 600);
  await expect(btn).toHaveAttribute("aria-expanded", "false");
});

test("przejście do panelu zamyka menu", async ({ page }) => {
  await setup(page, 200, me);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/pl");
  const btn = page.getByRole("button", { name: /Konto: Ala Kowalska/ });
  await btn.click();
  await page.getByRole("link", { name: "Panel działacza" }).click();
  await expect(page).toHaveURL(/\/pl\/strefa-dzialacza$/);
  await expect(btn).toHaveAttribute("aria-expanded", "false");
});

test("EN: teksty po angielsku", async ({ page }) => {
  await setup(page, 200, me);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en");
  const btn = page.getByRole("button", { name: "Members area - Account: Ala Kowalska, signed in" });
  await expect(btn).toContainText("Members area");
  await btn.click();
  await expect(page.getByText("until 31.05.2027")).toBeVisible();
  await expect(page.getByText("Board", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
});

test("mobile 375 px: avatar na pasku, bez poziomego przewijania", async ({ page }) => {
  await setup(page, 200, me);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/pl");
  const btn = page.getByRole("button", { name: /Konto: Ala Kowalska/ });
  await expect(btn).toBeInViewport({ ratio: 1 });
  await expect(btn).toHaveAccessibleName("Konto: Ala Kowalska, zalogowano");
  const box = await btn.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await expect(page.locator('button[aria-controls="mobile-menu"]')).toBeInViewport({ ratio: 1 });
  await btn.click();
  await expect(btn).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("do 31.05.2027")).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);

  // Rozwijane menu: zalogowany widzi „Strefa Działacza”, nie „Zaloguj się”.
  await page.keyboard.press("Escape");
  await page.locator('button[aria-controls="mobile-menu"]').click();
  const drawer = page.locator("#mobile-menu");
  const strefa = drawer.getByRole("link", { name: "Strefa Działacza", exact: true });
  await expect(strefa).toBeVisible();
  await expect(strefa).toHaveAttribute("href", "/pl/strefa-dzialacza");
  await expect(drawer.getByRole("link", { name: "Zaloguj się", exact: true })).toHaveCount(0);
});

test("mobile: niezalogowany ma „Zaloguj się” w rozwijanym menu i brak avatara", async ({ page }) => {
  await setup(page, 401);
  await page.setViewportSize({ width: 375, height: 812 });
  const answered = page.waitForResponse("**/api/auth/me");
  await page.goto("/pl");
  await answered;
  await expect(page.getByRole("button", { name: /Konto:/ })).toHaveCount(0);
  await page.locator('button[aria-controls="mobile-menu"]').click();
  const drawer = page.locator("#mobile-menu");
  await expect(drawer.getByRole("link", { name: "Zaloguj się", exact: true })).toBeVisible();
  await expect(drawer.getByRole("link", { name: "Strefa Działacza", exact: true })).toHaveCount(0);
});

// Ten sam sekret co w playwright.config.ts (webServer.env) - tylko do testów.
const TEST_AUTH_SECRET = "playwright-only-secret-0123456789abcdef";

/** Ciasteczko sesji podpisane tak samo jak signSession() w src/lib/auth-core.ts. */
function sessionToken(data: { email: string; name: string; picture?: string }): string {
  const now = Date.now();
  const payload = Buffer.from(JSON.stringify({ ...data, iat: now, exp: now + 60 * 60 * 1000 })).toString("base64url");
  const sig = createHmac("sha256", TEST_AUTH_SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

test("pierwsze logowanie (bez podpowiedzi): Strefa od razu pokazuje przycisk konta", async ({ page, context }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("ssuew-consent", "rejected"));
  const picture = "https://lh3.googleusercontent.com/a/test=s96-c";
  await context.addCookies([
    {
      name: "ssuew_session",
      value: sessionToken({ email: me.email, name: me.name, picture }),
      domain: "localhost",
      path: "/",
    },
  ]);
  await page.route("https://lh3.googleusercontent.com/**", (r) =>
    r.fulfill({ status: 200, contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>' }),
  );
  // /api/auth/me odpowiada z opóźnieniem 1,5 s - przycisk konta ma stać
  // w rogu wcześniej, zasiany danymi, które serwer Strefy już zna.
  let answered = false;
  await page.route("**/api/auth/me", async (r) => {
    await new Promise((res) => setTimeout(res, 1500));
    answered = true;
    await r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ...me, picture }) });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/pl/strefa-dzialacza");

  const nav = page.getByRole("navigation", { name: /./ }).first();
  // `answered` poniżej rozstrzyga, czy przycisk zdążył PRZED odpowiedzią.
  await expect(page.getByRole("button", { name: /Konto: Ala Kowalska/ })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Zaloguj się", exact: true })).toHaveCount(0);
  expect(answered).toBe(false);
  expect(await page.evaluate(() => localStorage.getItem("ssuew-konto"))).toContain("Ala Kowalska");
  await expect(
    page.getByRole("button", { name: /Konto: Ala Kowalska/ }).locator("img[referrerpolicy='no-referrer']"),
  ).toHaveAttribute("src", picture);
});

test("mobile 320 px: pasek mieści avatar i przycisk menu", async ({ page }) => {
  await setup(page, 200, me);
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/pl");
  await expect(page.getByRole("button", { name: /Konto: Ala Kowalska/ })).toBeInViewport({ ratio: 1 });
  await expect(page.locator('button[aria-controls="mobile-menu"]')).toBeInViewport({ ratio: 1 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test("podpowiedź z localStorage: konto od razu, 503 jej nie kasuje", async ({ page }) => {
  await setup(page, 503);
  await page.addInitScript(() =>
    localStorage.setItem("ssuew-konto", JSON.stringify({ name: "Ala Kowalska" })),
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/pl");
  await expect(page.getByRole("button", { name: /Konto: Ala Kowalska/ })).toBeVisible();
  // Po odpowiedzi 503 stan zostaje - nie wylogowujemy z powodu awarii magazynu.
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("button", { name: /Konto: Ala Kowalska/ })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("ssuew-konto"))).toContain("Ala Kowalska");
});

test("401 czyści podpowiedź z localStorage", async ({ page }) => {
  await setup(page, 401);
  await page.addInitScript(() => {
    // Tylko przy pierwszym wejściu - inaczej skrypt wpisywałby ją z powrotem.
    if (!sessionStorage.getItem("seeded")) {
      sessionStorage.setItem("seeded", "1");
      localStorage.setItem("ssuew-konto", JSON.stringify({ name: "Ala Kowalska" }));
    }
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  // Serwer zawsze renderuje „Zaloguj się”, więc samo sprawdzenie przycisku
  // przeszłoby przed hydratacją - czekamy na odpowiedź i dopiero wtedy patrzymy.
  const answered = page.waitForResponse("**/api/auth/me");
  await page.goto("/pl");
  await answered;
  await expect.poll(() => page.evaluate(() => localStorage.getItem("ssuew-konto"))).toBeNull();
  await expect(
    page.getByRole("navigation", { name: /./ }).first().getByRole("link", { name: "Zaloguj się", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Konto:/ })).toHaveCount(0);
});

test("prawdziwy serwer (bez sesji): 401 nie zostawia wiszącego żądania", async ({ page }) => {
  // Bez page.route - odpowiedź idzie z serwera testowego. Nieodczytana treść
  // 401 trzymała żądanie „w toku” i strona nie osiągała `networkidle`.
  await page.addInitScript(() => localStorage.setItem("ssuew-consent", "rejected"));
  await page.setViewportSize({ width: 1440, height: 900 });
  const finished = page.waitForEvent("requestfinished", {
    predicate: (r) => r.url().endsWith("/api/auth/me"),
    timeout: 15_000,
  });
  await page.goto("/pl/kontakt");
  const req = await finished;
  expect((await req.response())?.status()).toBe(401);
  await expect(page.getByRole("button", { name: /Konto:/ })).toHaveCount(0);
});

for (const theme of ["light", "dark"] as const) {
  test(`axe: otwarte menu konta (${theme})`, async ({ page }) => {
    await setup(page, 200, me);
    await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/pl");
    await page.getByRole("button", { name: /Konto: Ala Kowalska/ }).click();
    await expect(page.getByText("do 31.05.2027")).toBeVisible();
    const results = await new AxeBuilder({ page })
      .include("header")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      results.violations,
      results.violations.map((v) => `${v.id}: ${v.nodes.length}× - ${v.help}`).join("\n"),
    ).toEqual([]);
  });
}
