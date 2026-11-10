import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Poprawki z audytu antislop nr 001 (anti-slop/audit-001-2026-11-09.md).

async function wejdz(page: Page, path: string, theme: "light" | "dark" = "light") {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: theme });
  await page.addInitScript((t) => {
    localStorage.setItem("ssuew-consent", "rejected");
    localStorage.setItem("theme", t);
  }, theme);
  await page.goto(path, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
}

// Nr 1 i 2: w ciemnym motywie biały tekst na akcencie i akcent na kafelkach.
for (const path of [
  "/pl/infopacki/usos",
  "/pl/infopacki/biblioteka",
  "/pl/infopacki/podania",
  "/pl/infopacki/dyplomowanie",
  "/pl/infopacki/regulamin-studiow",
  "/pl/infopacki/sprawy-studenckie",
  "/pl/infopacki/zaliczenie-semestru",
  "/pl/infopacki/zycie-studenckie",
  "/pl/organizacje-studenckie",
  "/pl/rada-uczelniana-samorzadu-studentow",
  "/pl/fue-i-psrp",
]) {
  test(`ciemny motyw: kontrast AA na ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await wejdz(page, path, "dark");
    const wynik = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
    expect(wynik.violations.flatMap((v) => v.nodes.map((n) => n.target.join(" ")))).toEqual([]);
  });
}

// Nr 3: mapa kampusu nie może rozpychać strony w bok.
for (const width of [375, 768, 1280]) {
  test(`mapa kampusu bez przewijania w bok (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await wejdz(page, "/pl/mapa-kampusu");
    const nadmiar = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(nadmiar).toBeLessThanOrEqual(1);
  });
}

// Nr 4: samodzielne linki mają co najmniej 24 px wysokości (WCAG 2.5.8).
for (const [path, name] of [
  ["/pl/dziekan-i-prodziekani", /Strona Dziekanatu/],
  ["/pl/wladze-rektorskie", /Strona Władz Uczelni/],
] as const) {
  test(`cel dotyku „${name.source}” ma co najmniej 24 px`, async ({ page }) => {
    await wejdz(page, path);
    const box = await page.getByRole("link", { name }).first().boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(24);
  });
}

// Nr 5: logotypy partnerów mają wymiary - układ nie przeskakuje.
test("logotypy partnerów na stronie głównej mają width i height", async ({ page }) => {
  await wejdz(page, "/pl");
  const bez = await page.evaluate(() =>
    [...document.querySelectorAll("img")]
      // Logo Samorządu w nawigacji to next/image z wypełnieniem ramki o stałym rozmiarze - nie przesuwa układu.
      .filter((i) => /\/partnerzy?\/|\/partners\//.test(decodeURIComponent(i.src)) && !(i.getAttribute("width") && i.getAttribute("height")))
      .map((i) => i.src.split("/").pop()),
  );
  expect(bez).toEqual([]);
});

// Nr 11: ↗ tylko przy linkach wychodzących ze strony.
test("strona główna: brak strzałki ↗ przy linkach wewnętrznych", async ({ page }) => {
  await wejdz(page, "/pl");
  const zle = await page.evaluate(() =>
    [...document.querySelectorAll("main a[href]")]
      .filter((a) => {
        const href = a.getAttribute("href") || "";
        const wewn = href.startsWith("/") || href.startsWith("#") || href.includes("samorzad.ue.wroc.pl");
        // Ikona ArrowUpRight z phosphor: każda grubość zaczyna ścieżkę od „M1xx/2xx,64V168” albo „M192,56H88”.
        const ukosna = [...a.querySelectorAll("svg path")].some((p) => /^M(1|2)\d\d,(64V168|56H88)/.test(p.getAttribute("d") || ""));
        const strzalka = a.textContent?.includes("↗") || ukosna;
        return wewn && strzalka;
      })
      .map((a) => a.textContent?.trim().slice(0, 40)),
  );
  expect(zle).toEqual([]);
});
