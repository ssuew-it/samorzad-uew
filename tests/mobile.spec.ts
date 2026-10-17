import { test, expect } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { searchIndex } from "../src/lib/searchIndex";

// Same route source sitemap.ts / a11y.spec.ts consume. Fragment-only entries
// (e.g. "/stypendia#kalkulator") point at a section of an already-listed
// page, not a distinct document — skip them (mirrors a11y.spec.ts's own
// filter). All hrefs in searchIndex are internal, so no external-href
// filtering is needed beyond that.
const ROUTES = [...new Set(searchIndex.map((s) => s.href).filter((href) => !href.includes("#")))];

const VIEWPORT = { width: 375, height: 812 };
const MIN_TAP_TARGET = 24; // WCAG 2.5.8 minimum (2.5.5 comfortable target is 44)
const MIN_FONT_SIZE = 12;

const OUT_DIR = process.env.MOBILE_AUDIT_DIR ?? path.join(process.cwd(), "docs", "mobile");
const SHOTS_DIR = path.join(OUT_DIR, "shots");
const FINDINGS_PATH = path.join(OUT_DIR, "findings.json");

fs.mkdirSync(SHOTS_DIR, { recursive: true });

function plPath(href: string): string {
  return `/pl${href === "/" ? "" : href}`;
}

function slugify(href: string): string {
  return href === "/" ? "home" : href.replace(/^\//, "").replace(/\//g, "-");
}

interface OverflowCulprit {
  tag: string;
  classSnippet: string;
  overflowPx: number;
  rectRight: number;
}

interface TapTargetFinding {
  tag: string;
  classSnippet: string;
  accessibleName: string;
  width: number;
  height: number;
}

interface TextFinding {
  tag: string;
  classSnippet: string;
  fontSize: number;
  textSnippet: string;
}

interface WidthOffender {
  tag: string;
  classSnippet: string;
  width: number;
  rectRight: number;
}

interface RouteFinding {
  route: string;
  path: string;
  ok: boolean;
  error?: string;
  horizontalOverflow: {
    overflows: boolean;
    scrollWidth: number;
    innerWidth: number;
    culprits: OverflowCulprit[];
  };
  tapTargets: {
    checked: number;
    tooSmall: TapTargetFinding[];
  };
  textLegibility: {
    tooSmall: TextFinding[];
  };
  contentWidth: {
    offenders: WidthOffender[];
  };
}

const results: RouteFinding[] = [];

test.describe("mobile diagnostic — PL / 375x812 (all routes)", () => {
  // playwright.config.ts sets fullyParallel: true, which would otherwise
  // scatter these tests across separate worker processes — each with its
  // own module state, so the shared `results` array (written once in
  // afterAll) would only ever see one worker's subset. Force this block
  // into a single worker so every route's finding lands in the same array
  // before the aggregate findings.json is written. Every test body is
  // wrapped in try/catch and never throws/fails an expect, so serial
  // mode's fail-fast-on-failure never triggers — one broken route can't
  // stop the run.
  test.describe.configure({ mode: "serial" });

  for (const href of ROUTES) {
    test(`mobile375: ${href}`, async ({ page }) => {
      const routePath = plPath(href);
      const finding: RouteFinding = {
        route: href,
        path: routePath,
        ok: false,
        horizontalOverflow: { overflows: false, scrollWidth: 0, innerWidth: 0, culprits: [] },
        tapTargets: { checked: 0, tooSmall: [] },
        textLegibility: { tooSmall: [] },
        contentWidth: { offenders: [] },
      };

      try {
        await page.setViewportSize(VIEWPORT);
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(routePath);
        await page.waitForLoadState("networkidle");

        // 1. Horizontal overflow
        const overflow = await page.evaluate(() => {
          const scrollWidth = document.documentElement.scrollWidth;
          const innerWidth = window.innerWidth;
          const overflows = scrollWidth > innerWidth + 1;
          const culprits: OverflowCulprit[] = [];
          if (overflows) {
            const all = document.querySelectorAll<HTMLElement>("body *");
            for (const el of all) {
              const rect = el.getBoundingClientRect();
              if (rect.width === 0 && rect.height === 0) continue;
              if (rect.right > innerWidth + 1) {
                culprits.push({
                  tag: el.tagName.toLowerCase(),
                  classSnippet: (el.className && typeof el.className === "string"
                    ? el.className
                    : "" ) .slice(0, 80),
                  overflowPx: Math.round((rect.right - innerWidth) * 100) / 100,
                  rectRight: Math.round(rect.right * 100) / 100,
                });
              }
            }
          }
          // Keep only the biggest offenders (top-level-ish): sort desc, cap at 15
          culprits.sort((a, b) => b.overflowPx - a.overflowPx);
          return { scrollWidth, innerWidth, overflows, culprits: culprits.slice(0, 15) };
        });
        finding.horizontalOverflow = overflow;

        // 2. Tap targets
        const tapTargets = await page.evaluate((minTarget) => {
          const selector = "a, button, [role=button], select, input";
          const elements = document.querySelectorAll<HTMLElement>(selector);
          let checked = 0;
          const tooSmall: TapTargetFinding[] = [];
          for (const el of elements) {
            const style = window.getComputedStyle(el);
            if (style.display === "none" || style.visibility === "hidden") continue;
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) continue;
            // Skip hidden inputs (type=hidden / checkbox visually replaced etc. still measured as rendered box)
            checked++;
            if (rect.width < minTarget || rect.height < minTarget) {
              const accessibleName =
                el.getAttribute("aria-label") ||
                el.getAttribute("title") ||
                (el.textContent || "").trim().slice(0, 60) ||
                el.getAttribute("alt") ||
                "";
              tooSmall.push({
                tag: el.tagName.toLowerCase(),
                classSnippet: (el.className && typeof el.className === "string" ? el.className : "").slice(0, 80),
                accessibleName,
                width: Math.round(rect.width * 100) / 100,
                height: Math.round(rect.height * 100) / 100,
              });
            }
          }
          return { checked, tooSmall };
        }, MIN_TAP_TARGET);
        finding.tapTargets = tapTargets;

        // 3. Text legibility
        const textLegibility = await page.evaluate((minFont) => {
          const tooSmall: TextFinding[] = [];
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
              if (!node.textContent || !node.textContent.trim()) return NodeFilter.FILTER_REJECT;
              return NodeFilter.FILTER_ACCEPT;
            },
          });
          let node: Node | null;
          while ((node = walker.nextNode())) {
            const parent = node.parentElement;
            if (!parent) continue;
            const style = window.getComputedStyle(parent);
            if (style.display === "none" || style.visibility === "hidden") continue;
            const fontSize = parseFloat(style.fontSize);
            if (Number.isNaN(fontSize) || fontSize >= minFont) continue;
            // Confirm the text is actually visible (has a rendered rect)
            const range = document.createRange();
            range.selectNodeContents(node);
            const rect = range.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) continue;
            tooSmall.push({
              tag: parent.tagName.toLowerCase(),
              classSnippet: (parent.className && typeof parent.className === "string" ? parent.className : "").slice(0, 80),
              fontSize: Math.round(fontSize * 100) / 100,
              textSnippet: (node.textContent ?? "").trim().slice(0, 60),
            });
          }
          return { tooSmall: tooSmall.slice(0, 30) };
        }, MIN_FONT_SIZE);
        finding.textLegibility = textLegibility;

        // 4. Content width (elements wider than viewport, excluding
        // deliberately horizontally-scrollable containers)
        const contentWidth = await page.evaluate((viewportWidth) => {
          const offenders: WidthOffender[] = [];
          const all = document.querySelectorAll<HTMLElement>("body *");
          for (const el of all) {
            const style = window.getComputedStyle(el);
            if (style.display === "none" || style.visibility === "hidden") continue;
            if (style.overflowX === "auto" || style.overflowX === "scroll") continue;
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) continue;
            if (rect.width > viewportWidth + 1 || rect.right > viewportWidth + 1) {
              offenders.push({
                tag: el.tagName.toLowerCase(),
                classSnippet: (el.className && typeof el.className === "string" ? el.className : "").slice(0, 80),
                width: Math.round(rect.width * 100) / 100,
                rectRight: Math.round(rect.right * 100) / 100,
              });
            }
          }
          offenders.sort((a, b) => b.width - a.width);
          return { offenders: offenders.slice(0, 15) };
        }, VIEWPORT.width);
        finding.contentWidth = contentWidth;

        await page.screenshot({
          path: path.join(SHOTS_DIR, `${slugify(href)}.png`),
          fullPage: true,
        });

        finding.ok = true;
      } catch (err) {
        finding.ok = false;
        finding.error = err instanceof Error ? err.message : String(err);
      }

      results.push(finding);

      console.log(
        `[mobile375] ${routePath} — overflow:${finding.horizontalOverflow.overflows ? "YES" : "no"} ` +
          `tapTargets<24px:${finding.tapTargets.tooSmall.length}/${finding.tapTargets.checked} ` +
          `text<12px:${finding.textLegibility.tooSmall.length} ` +
          `widthOffenders:${finding.contentWidth.offenders.length}` +
          (finding.error ? ` ERROR:${finding.error}` : ""),
      );
    });
  }

  test.afterAll(async () => {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const sorted = [...results].sort((a, b) => a.route.localeCompare(b.route));
    const summary = {
      generatedAt: new Date().toISOString(),
      viewport: VIEWPORT,
      minTapTargetPx: MIN_TAP_TARGET,
      minFontSizePx: MIN_FONT_SIZE,
      routesMeasured: sorted.length,
      routesWithOverflow: sorted.filter((r) => r.horizontalOverflow.overflows).length,
      routesWithSmallTapTargets: sorted.filter((r) => r.tapTargets.tooSmall.length > 0).length,
      routesWithSmallText: sorted.filter((r) => r.textLegibility.tooSmall.length > 0).length,
      routesWithErrors: sorted.filter((r) => !r.ok).length,
      routes: sorted,
    };
    fs.writeFileSync(FINDINGS_PATH, JSON.stringify(summary, null, 2), "utf-8");
    console.log(
      `[mobile375] wrote ${FINDINGS_PATH} — ${summary.routesMeasured} routes, ` +
        `${summary.routesWithOverflow} with overflow, ` +
        `${summary.routesWithSmallTapTargets} with sub-24px tap targets, ` +
        `${summary.routesWithSmallText} with sub-12px text, ` +
        `${summary.routesWithErrors} errored`,
    );
    // Zapisz pełną diagnostykę przed sprawdzeniem bramki regresji.
    expect(sorted.filter((finding) => !finding.ok), "Nie udało się zbadać wszystkich tras").toEqual([]);
    expect(sorted.filter((finding) => finding.horizontalOverflow.overflows).map((finding) => finding.route), "Poziome przewijanie na telefonie").toEqual([]);
  });
});
