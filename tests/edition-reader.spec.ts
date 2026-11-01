import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const open = async (page: import("@playwright/test").Page) => {
  await page.goto("/pl/wydawnictwo", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Akceptuj/ }).click().catch(() => {});
  // .first(): na wąskim ekranie przycisk niesie każda karta rozdziału (wszystkie
  // otwierają ten sam tom), więc bez zawężenia strict mode odrzuca kliknięcie.
  await page.getByRole("button", { name: /Przejrzyj wydanie/ }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
};

test("otwiera się i zamyka Escape'em, fokus wraca na przycisk", async ({ page }) => {
  await open(page);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Przejrzyj wydanie/ })).toBeFocused();
});

test("strzałki przewracają strony i licznik się zgadza", async ({ page }) => {
  await open(page);
  // Strona ma TRZY regiony aria-live="polite" (panel SpineWall pod spodem,
  // licznik czytnika, i jeszcze jeden w WydawnictwoContent) — bez zawężenia
  // do dialogu selektor łapie panel SpineWall zamiast licznika i test kłamie.
  const counter = page.locator('[role="dialog"] [aria-live="polite"]');
  await expect(counter).toContainText("1");
  await page.keyboard.press("ArrowRight");
  await expect(counter).toContainText("2");
  await page.keyboard.press("ArrowLeft");
  await expect(counter).toContainText("1");
});

test("odnośnik do pełnego tekstu istnieje i wskazuje PDF", async ({ page }) => {
  await open(page);
  // Zawężone do dialogu: PDF oferuje teraz także panel tomu na stronie, więc
  // bez tego selektor łapie dwa odnośniki i strict mode odrzuca sprawdzenie.
  const pdf = page.getByRole("dialog").getByRole("link", { name: /Czytaj pełny tekst/ });
  await expect(pdf).toHaveAttribute("href", /\.pdf$/);
});

test("brak naruszeń axe przy otwartym czytniku", async ({ page }) => {
  await open(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("da się otworzyć i zamknąć na 375 px, bez poziomego rozpychania", async ({ page }) => {
  // Poniżej breakpointu md (768 px) panel szczegółów SpineWall jest ukryty, a
  // treść niosą karty mobilne — czytnik musi więc mieć własny przycisk na
  // karcie. Test otwiera go NAPRAWDĘ na 375 px (nie zwężając okna po
  // otwarciu), bo inaczej nie sprawdzałby, czy da się tu w ogóle dostać.
  await page.setViewportSize({ width: 375, height: 800 });
  await open(page);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);

  // Fokus musi wrócić na przycisk karty, nie na ukryty przycisk panelu.
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Przejrzyj wydanie/ }).first()).toBeFocused();
});

test("silnik 3D nie pobiera się, dopóki czytnik nie zostanie otwarty", async ({ page }) => {
  // Cała oszczędność dynamicznego importu polega na tym, że odwiedzający
  // podstronę Wydawnictwa nie płaci za `three`, jeśli nie otworzy czytnika.
  // Test pilnuje właśnie tego, a nie samego istnienia osobnej porcji —
  // porcja może istnieć i mimo to być pobierana z góry.
  const pobrane: string[] = [];
  page.on("response", (r) => pobrane.push(r.url()));

  await page.goto("/pl/wydawnictwo", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Akceptuj/ }).click().catch(() => {});
  await page.waitForLoadState("networkidle");

  const licznik = () =>
    page.evaluate(async (adresy) => {
      const wyniki = await Promise.all(
        adresy.map(async (u) => {
          try {
            return (await (await fetch(u)).text()).includes("WebGLRenderer");
          } catch {
            return false;
          }
        }),
      );
      return wyniki.filter(Boolean).length;
    }, pobrane.filter((u) => u.endsWith(".js")));

  expect(await licznik(), "three pobrane przed otwarciem czytnika").toBe(0);

  pobrane.length = 0;
  await page.getByRole("button", { name: /Przejrzyj wydanie/ }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  // Czekamy na SKUTEK, a nie na ciszę w sieci: `networkidle` potrafi wrócić
  // natychmiast, zanim dynamiczny import w efekcie w ogóle wystartuje. Widoczne
  // płótno oznacza, że scena wstała, czyli że silnik naprawdę się pobrał.
  //
  // Hojny limit, bo tu pobiera się pół megabajta silnika i buduje scena WebGL,
  // a pełny zestaw idzie na czterech procesach naraz — przy domyślnych 5 s
  // test padał na obciążeniu, nie na błędzie.
  await expect(page.locator('[role="dialog"] canvas')).toBeVisible({ timeout: 25_000 });

  expect(await licznik(), "three NIE pobrane po otwarciu czytnika").toBeGreaterThan(0);
});

test("jeden gest kółkiem przewraca dokładnie jedną kartkę", async ({ page }) => {
  await open(page);

  // Kółko obsługuje płótno sceny, więc bez niej nie ma czego testować.
  const canvas = page.locator('[role="dialog"] canvas');
  await expect(canvas).toBeVisible();

  // Zawężenie do dialogu jest konieczne: na stronie są TRZY regiony
  // aria-live="polite" i bez tego selektor łapie panel SpineWall pod spodem.
  const counter = page.locator('[role="dialog"] [aria-live="polite"]');
  await expect(counter).toContainText("1");

  // Seria wysyłana JEDNYM ciągiem w przeglądarce, a nie przez page.mouse.wheel.
  // Trackpad wypluwa kilkadziesiąt zdarzeń w ułamku sekundy i właśnie przed tym
  // broni blokada. `page.mouse.wheel` czeka na odpowiedź strony po każdym
  // zdarzeniu, więc w wolnym środowisku testowym rozkładał je na sekundy —
  // czyli sprawdzał dwanaście osobnych przewinięć, a nie jeden gest.
  await canvas.evaluate((el) => {
    for (let i = 0; i < 12; i++) {
      el.dispatchEvent(new WheelEvent("wheel", { deltaY: 30, bubbles: true, cancelable: true }));
    }
  });

  // Druga rozkładówka, nie dwudziesta. Sama zmiana licznika by nie wystarczyła:
  // przeskok o dwanaście kartek też zmienia tekst, a to właśnie ten błąd
  // blokada kółka ma wykluczać.
  //
  // Hojny limit czasu, bo licznik zmienia się dopiero po WYLĄDOWANIU kartki,
  // a przy kilku scenach WebGL naraz (pełny zestaw idzie na czterech
  // procesach) animacja potrafi zwolnić wielokrotnie. Asercja jest ta sama —
  // czekamy dłużej, nie sprawdzamy mniej.
  await expect(counter).toContainText("2-3", { timeout: 25_000 });
});

test("przeciągnięcie kartki za połowę przewraca ją, przed połową — cofa", async ({ page }) => {
  await open(page);
  const canvas = page.locator('[role="dialog"] canvas');
  await expect(canvas).toBeVisible();
  const counter = page.locator('[role="dialog"] [aria-live="polite"]');
  const box = (await canvas.boundingBox())!;
  const y = box.y + box.height / 2;

  const drag = async (doX: number) => {
    await page.mouse.move(box.x + box.width * 0.78, y);
    await page.mouse.down();
    // Kilka kroków, bo pojedynczy skok nie odwzorowuje ciągnięcia palcem.
    for (let i = 1; i <= 8; i++) {
      const t = i / 8;
      await page.mouse.move(box.x + box.width * (0.78 + (doX - 0.78) * t), y);
    }
    await page.mouse.up();
  };

  // Puszczone przed połową — kartka wraca, rozkładówka bez zmian. Tu czekamy
  // NA CZAS, a nie na warunek: asercja „nadal 1" spełniłaby się natychmiast
  // także wtedy, gdyby kartka miała się przewrócić chwilę później.
  await drag(0.68);
  await page.waitForTimeout(3000);
  await expect(counter).toContainText("Strony 1 z");

  // Przeciągnięte przez grzbiet na drugą stronę — kartka dochodzi do końca.
  await drag(0.16);
  await expect(counter).toContainText("2-3", { timeout: 25_000 });
});

test.describe("na telefonie", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("scena ma niezerowy rozmiar i przyjmuje gest palcem", async ({ page }) => {
    // Ten test istnieje przez konkretną awarię: reguła mobilna ukrywała
    // `.stage > :first-child`, czyli — odkąd przed rozkładówką stanęło płótno —
    // ukrywała scenę. Statyczne strony były już wtedy zdjęte, więc czytnik na
    // telefonie pokazywał PUSTE pole. Nic tego nie łapało: testy sprawdzały
    // otwieranie, fokus i rozpychanie, ale nie to, czy cokolwiek widać.
    await open(page);
    const canvas = page.locator('[role="dialog"] canvas');
    await expect(canvas).toBeVisible({ timeout: 25_000 });

    const stan = await canvas.evaluate((el: HTMLCanvasElement) => ({
      w: el.clientWidth,
      h: el.clientHeight,
      touch: getComputedStyle(el).touchAction,
    }));
    expect(stan.w, "szerokość płótna na telefonie").toBeGreaterThan(100);
    expect(stan.h, "wysokość płótna na telefonie").toBeGreaterThan(100);
    // Bez `touch-action: none` przeglądarka uznaje ruch palcem po płótnie za
    // przewijanie strony i przerywa przeciąganie kartki.
    expect(stan.touch, "touch-action płótna").toBe("none");
  });
});
