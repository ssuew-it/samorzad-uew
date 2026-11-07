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
    // 204 (gość bez ciasteczka) nie ma treści - tak odpowiada prawdziwy endpoint.
    status === 204
      ? r.fulfill({ status })
      : r.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) }),
  );
}

test("niezalogowany widzi zwykły przycisk", async ({ page }) => {
  await setup(page, 204);
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
  await expect(page.getByRole("link", { name: "Panel Działacza" })).toBeVisible();
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
  await page.getByRole("link", { name: "Panel Działacza" }).click();
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
  // Te same nazwy co w reszcie EN: „Members area”, „Members panel”.
  await expect(page.getByRole("link", { name: "Members panel" })).toBeVisible();
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
  await setup(page, 204);
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

// 401 = zły/wygasły token albo blokada, 204 = ciasteczko zniknęło (gość).
for (const status of [401, 204]) {
  test(`${status} czyści podpowiedź z localStorage`, async ({ page }) => {
    await setup(page, status);
    await page.addInitScript(() => {
      // Tylko przy pierwszym wejściu - inaczej skrypt wpisywałby ją z powrotem.
      if (!sessionStorage.getItem("seeded")) {
        sessionStorage.setItem("seeded", "1");
        localStorage.setItem("ssuew-konto", JSON.stringify({ name: "Ala Kowalska" }));
      }
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    // Czekamy na odpowiedź i dopiero wtedy patrzymy - przed nią przycisk
    // konta stoi z podpowiedzi.
    const answered = page.waitForResponse("**/api/auth/me");
    await page.goto("/pl");
    await answered;
    await expect.poll(() => page.evaluate(() => localStorage.getItem("ssuew-konto"))).toBeNull();
    await expect(
      page.getByRole("navigation", { name: /./ }).first().getByRole("link", { name: "Zaloguj się", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Konto:/ })).toHaveCount(0);
  });
}

test("prawdziwy serwer (bez sesji): 204 bez błędu w konsoli i bez wiszącego żądania", async ({ page }) => {
  // Bez page.route - odpowiedź idzie z serwera testowego. Nieodczytana treść
  // trzymała żądanie „w toku” i strona nie osiągała `networkidle`. Gość bez
  // ciasteczka dostaje 204, nie 401 - inaczej każda publiczna strona miałaby
  // błąd w konsoli (Lighthouse „errors-in-console”).
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.addInitScript(() => localStorage.setItem("ssuew-consent", "rejected"));
  await page.setViewportSize({ width: 1440, height: 900 });
  const finished = page.waitForEvent("requestfinished", {
    predicate: (r) => r.url().endsWith("/api/auth/me"),
    timeout: 15_000,
  });
  await page.goto("/pl/kontakt");
  const req = await finished;
  expect((await req.response())?.status()).toBe(204);
  await expect(page.getByRole("button", { name: /Konto:/ })).toHaveCount(0);
  expect(errors.filter((e) => /auth\/me|401/.test(e))).toEqual([]);
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

test("wylogowanie przyciskiem w panelu Strefy kasuje podpowiedź konta", async ({ page, context }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("ssuew-consent", "rejected"));
  await context.addCookies([
    { name: "ssuew_session", value: sessionToken({ email: me.email, name: me.name }), domain: "localhost", path: "/" },
  ]);
  // /api/auth/me długo milczy: po wylogowaniu przycisk w pasku może wtedy
  // wziąć się WYŁĄCZNIE ze starej podpowiedzi w localStorage.
  await page.route("**/api/auth/me", async (r) => {
    await new Promise((res) => setTimeout(res, 10_000));
    await r.fulfill({ status: 204 }).catch(() => {});
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/pl/strefa-dzialacza");
  const account = page.getByRole("button", { name: /Konto: Ala Kowalska/ });
  await expect(account).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("ssuew-konto"))).toContain("Ala Kowalska");

  // Menu konta zamknięte, więc jedyny widoczny „Wyloguj się” to przycisk panelu.
  await page.getByRole("button", { name: "Wyloguj się", exact: true }).click();
  // Widok dla niezalogowanych (karta logowania) - przekierowanie już się odbyło.
  await expect(page.locator("#strefa-heading")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("ssuew-konto"))).toBeNull();
  await expect(account).toHaveCount(0);
  await expect(
    page.getByRole("navigation", { name: /./ }).first().getByRole("link", { name: "Zaloguj się", exact: true }),
  ).toBeVisible();
});

/**
 * Wstrzymuje JS strony (chunki Next) do wywołania `release` - tak widać stan
 * sprzed hydratacji, czyli to, co przeglądarka maluje z samego HTML i CSS.
 * Arkusze CSS przechodzą bez czekania, inaczej strona w ogóle by się nie
 * namalowała.
 */
async function holdScripts(page: Page): Promise<() => void> {
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  await page.route(/\/_next\/static\/chunks\/.*\.js(\?.*)?$/, async (r) => {
    await gate;
    await r.continue();
  });
  return release;
}

/** Rejestrator od pierwszej klatki: czy link „Zaloguj się” w pasku był choć raz widoczny. */
function watchLoginLink() {
  const w = window as unknown as { __loginSeen: boolean };
  w.__loginSeen = false;
  const tick = () => {
    for (const a of document.querySelectorAll<HTMLElement>("header nav a")) {
      if (a.textContent?.trim() === "Zaloguj się" && a.checkVisibility()) w.__loginSeen = true;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

test("podpowiedź konta: przed hydratacją szkielet zamiast „Zaloguj się”, bez skoku (desktop)", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") errors.push(m.text());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("ssuew-consent", "rejected");
    localStorage.setItem("ssuew-konto", JSON.stringify({ name: "Ala Kowalska" }));
  });
  await page.addInitScript(watchLoginLink);
  await page.route("**/api/auth/me", async (r) => {
    await new Promise((res) => setTimeout(res, 1500));
    await r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(me) }).catch(() => {});
  });
  const release = await holdScripts(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/pl", { waitUntil: "domcontentloaded" });

  // Tuż po DOMContentLoaded, bez JS strony: link logowania schowany, w jego
  // miejscu szkielet przycisku konta.
  const nav = page.getByRole("navigation", { name: /./ }).first();
  const skeleton = page.locator('[data-konto-szkielet="desktop"]');
  await expect(skeleton).toBeVisible();
  await expect(nav.getByRole("link", { name: "Zaloguj się", exact: true })).toBeHidden();
  await page.evaluate(() => document.fonts.ready);
  // Zalogowany widzi samą lupę (pełne „Szukaj ⌘K” nie mieściło się obok
  // przycisku konta w pasku 1200 px) - i to od pierwszej klatki, bez skoku.
  await expect(page.locator("header nav button:has(kbd)")).toBeHidden();
  const search = page.locator("header nav .nav-search-icon");
  await expect(search).toBeVisible();
  const searchBefore = await search.boundingBox();
  const before = await skeleton.boundingBox();

  release();
  const btn = page.getByRole("button", { name: /Konto: Ala Kowalska/ });
  await expect(btn).toBeVisible();
  const after = await btn.boundingBox();
  const searchAfter = await search.boundingBox();
  // Przycisk konta zajmuje dokładnie miejsce szkieletu, a sąsiedzi stoją.
  expect(Math.abs(after!.x - before!.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(after!.width - before!.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(after!.height - before!.height)).toBeLessThanOrEqual(1);
  expect(Math.abs(searchAfter!.x - searchBefore!.x)).toBeLessThanOrEqual(1);
  await expect(skeleton).toHaveCount(0);

  // Po odpowiedzi serwera wciąż konto; „Zaloguj się” nie mignęło ani razu.
  await page.waitForResponse("**/api/auth/me");
  await expect(btn).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { __loginSeen: boolean }).__loginSeen)).toBe(false);
  // Atrybut na <html> ustawiony przed hydratacją nie wywołuje błędu hydratacji.
  expect(errors.filter((e) => /hydrat|#418|#425/i.test(e))).toEqual([]);
});

test("podpowiedź konta: miejsce na avatar zarezerwowane przed hydratacją (mobile)", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("ssuew-consent", "rejected");
    localStorage.setItem("ssuew-konto", JSON.stringify({ name: "Ala Kowalska" }));
  });
  await page.route("**/api/auth/me", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(me) }),
  );
  const release = await holdScripts(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/pl", { waitUntil: "domcontentloaded" });

  const skeleton = page.locator('[data-konto-szkielet="mobile"]');
  await expect(skeleton).toBeVisible();
  await expect(page.locator('[data-konto-szkielet="desktop"]')).toBeHidden();
  const toggle = page.locator('button[aria-controls="mobile-menu"]');
  const toggleBefore = await toggle.boundingBox();
  const before = await skeleton.boundingBox();

  release();
  const btn = page.getByRole("button", { name: /Konto: Ala Kowalska/ });
  await expect(btn).toBeVisible();
  const after = await btn.boundingBox();
  expect(Math.abs(after!.x - before!.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(after!.width - before!.width)).toBeLessThanOrEqual(1);
  expect(Math.abs((await toggle.boundingBox())!.x - toggleBefore!.x)).toBeLessThanOrEqual(1);
});

test("bez podpowiedzi: szkielet ukryty, „Zaloguj się” widoczne od razu", async ({ page }) => {
  await setup(page, 204);
  const release = await holdScripts(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/pl", { waitUntil: "domcontentloaded" });
  const nav = page.getByRole("navigation", { name: /./ }).first();
  await expect(nav.getByRole("link", { name: "Zaloguj się", exact: true })).toBeVisible();
  await expect(page.locator("[data-konto-szkielet]")).toHaveCount(2);
  for (const s of await page.locator("[data-konto-szkielet]").all()) await expect(s).toBeHidden();
  release();
});
