import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { analyze, render } from "./i18n-client-namespaces.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("i18n-client-namespaces", () => {
  const result = analyze(root);

  it("każde dynamiczne użycie tłumaczeń w komponencie klienckim ma adnotację @i18n-ns", () => {
    expect(result.errors).toEqual([]);
  });

  it("client-namespaces.generated.ts odpowiada kodowi (inaczej: npm run i18n:namespaces)", () => {
    const onDisk = fs.readFileSync(path.join(root, "src/i18n/client-namespaces.generated.ts"), "utf8");
    expect(onDisk.replace(/\r\n/g, "\n")).toBe(render(result));
  });

  it("każda wymieniona przestrzeń nazw istnieje w obu językach", () => {
    for (const locale of ["pl", "en"]) {
      const messages = JSON.parse(fs.readFileSync(path.join(root, `messages/${locale}.json`), "utf8"));
      const all = new Set([...result.global, ...Object.values(result.pages).flat()]);
      expect([...all].filter((ns) => !(ns in messages))).toEqual([]);
    }
  });

  it("każda strona eksportuje się przez withPageMessages z własną trasą", () => {
    const localeDir = path.join(root, "src/app/[locale]");
    for (const route of Object.keys(result.pages)) {
      const file = path.join(localeDir, route === "/" ? "" : route, "page.tsx");
      const source = fs.readFileSync(file, "utf8");
      expect(source, route).toContain(`export default withPageMessages(${JSON.stringify(route)},`);
    }
  });
});
