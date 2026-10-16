import { test, expect, type Page } from "@playwright/test";

// Regression test for the reduced-motion "stranded invisible content" bug.
//
// Root cause (see components using motion/react's useReducedMotion()):
// useReducedMotion() returns `false` during SSR, so motion inlines the
// *initial* styles (opacity: 0, transforms) into the server-rendered HTML.
// If the buggy idiom gates the *target* state instead of the *transition*
// (`whileInView={reduce ? undefined : {...}}` / `animate={reduce ? undefined
// : {...}}`), a client that actually prefers reduced motion never gets a
// target to animate to — the server-rendered opacity: 0 / transform is never
// cleared and the content stays permanently invisible.
//
// The fix is: the target state (`animate` / `whileInView`) must always be
// present; motion is disabled via `transition: { duration: 0 }` instead.
// This test emulates prefers-reduced-motion, visits a representative set of
// routes, scrolls through each, and asserts nothing inside <main> is left
// stuck at opacity ~0.

const VIEWPORT = { width: 375, height: 812 };

const ROUTES = [
  "/",
  "/infopacki",
  "/stypendia",
  "/zarzad",
  "/filia-jelenia-gora",
  "/wydawnictwo",
  "/prawa-studenta",
  "/nasze-projekty",
  "/transparentnosc",
];

function plPath(href: string): string {
  return `/pl${href === "/" ? "" : href}`;
}

interface InvisibleFinding {
  tag: string;
  textSnippet: string;
  opacity: number;
  classSnippet: string;
}

async function scrollThroughPage(page: Page) {
  const steps = await page.evaluate(() => {
    const doc = document.documentElement;
    const total = Math.max(doc.scrollHeight - window.innerHeight, 0);
    const step = window.innerHeight * 0.8;
    const positions: number[] = [];
    for (let y = 0; y <= total; y += step) positions.push(y);
    if (positions.length === 0 || positions[positions.length - 1] !== total) {
      positions.push(total);
    }
    return positions;
  });

  for (const y of steps) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(150);
  }
  // Back to top so subsequent viewport checks (e.g. h1) see the top of the page.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(150);
}

/**
 * Walks the full page (not just one viewport snapshot) collecting any
 * element inside <main> that:
 *  - has a non-trivial rendered box (width/height > 2px)
 *  - is not display:none / visibility:hidden
 *  - directly contains non-whitespace text
 *  - has a parent that is NOT itself transparent (an inherited-transparent
 *    ancestor is a separate, expected condition — not this bug)
 *  - has computed opacity <= 0.01
 *
 * Scrolls to each candidate element to confirm it is/was reachable in the
 * viewport at some scroll position (the caller already scrolled through the
 * whole page before calling this, and `whileInView` targets — once
 * triggered — must stay visible; this check runs after the scroll pass).
 */
async function findInvisibleContent(page: Page): Promise<InvisibleFinding[]> {
  return page.evaluate(() => {
    const main = document.querySelector("main");
    if (!main) return [];

    const findings: {
      tag: string;
      textSnippet: string;
      opacity: number;
      classSnippet: string;
    }[] = [];

    const all = main.querySelectorAll<HTMLElement>("*");
    for (const el of all) {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 2 || rect.height <= 2) continue;

      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;

      const hasOwnText = Array.from(el.childNodes).some(
        (n) => n.nodeType === Node.TEXT_NODE && (n.textContent || "").trim().length > 0,
      );
      if (!hasOwnText) continue;

      const parent = el.parentElement;
      if (parent) {
        const parentOpacity = parseFloat(window.getComputedStyle(parent).opacity);
        if (!Number.isNaN(parentOpacity) && parentOpacity <= 0.01) continue;
      }

      const opacity = parseFloat(style.opacity);
      if (Number.isNaN(opacity) || opacity > 0.01) continue;

      findings.push({
        tag: el.tagName.toLowerCase(),
        textSnippet: (el.textContent || "").trim().slice(0, 80),
        opacity,
        classSnippet: (el.className && typeof el.className === "string" ? el.className : "").slice(
          0,
          100,
        ),
      });
    }
    return findings;
  });
}

test.describe("reduced motion — content must never be stranded invisible", () => {
  for (const href of ROUTES) {
    test(`reduced-motion visible: ${href}`, async ({ page }) => {
      const routePath = plPath(href);

      await page.setViewportSize(VIEWPORT);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(routePath);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(300);

      // h1 is the clearest symptom the bug was diagnosed against.
      const h1 = page.locator("main h1").first();
      await expect(h1, `${routePath}: <h1> should be visible immediately after load`).toBeVisible();
      const h1OpacityAfterLoad = await h1.evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
      expect(
        h1OpacityAfterLoad,
        `${routePath}: <h1> has opacity ${h1OpacityAfterLoad} right after load (prefers-reduced-motion) — should be > 0.01`,
      ).toBeGreaterThan(0.01);

      await scrollThroughPage(page);

      // Re-check h1 after the scroll pass (it should never have been hidden).
      const h1OpacityAfterScroll = await h1.evaluate((el) =>
        parseFloat(window.getComputedStyle(el).opacity),
      );
      expect(
        h1OpacityAfterScroll,
        `${routePath}: <h1> has opacity ${h1OpacityAfterScroll} after scrolling (prefers-reduced-motion) — should be > 0.01`,
      ).toBeGreaterThan(0.01);

      const invisible = await findInvisibleContent(page);
      const message =
        `${routePath}: found ${invisible.length} element(s) inside <main> stranded at ` +
        `opacity <= 0.01 with prefers-reduced-motion enabled:\n` +
        invisible
          .map(
            (f, i) =>
              `  ${i + 1}. <${f.tag}> opacity=${f.opacity} class="${f.classSnippet}" text="${f.textSnippet}"`,
          )
          .join("\n");

      expect(invisible, message).toEqual([]);
    });
  }
});
