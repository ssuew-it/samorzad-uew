/**
 * Które przestrzenie nazw tłumaczeń muszą trafić do przeglądarki.
 *
 * Wcześniej layout przekazywał do `NextIntlClientProvider` CAŁY plik
 * messages/{pl,en}.json (~214 KB), więc każda strona niosła w HTML teksty
 * wszystkich pozostałych. Komponenty serwerowe tego nie potrzebują - czytają
 * tłumaczenia po stronie serwera. Do przeglądarki idzie tylko to, czego używają
 * komponenty klienckie.
 *
 * Skrypt chodzi po grafie importów od layoutu i od każdej strony. Plik jest
 * kliencki, jeśli ma "use client" albo importuje go plik kliencki - dokładnie
 * tak, jak granicę rysuje React. Z plików klienckich zbiera argumenty
 * `useTranslations("ns")`.
 *
 * Wywołania, których nie da się odczytać statycznie (`useTranslations()` bez
 * argumentu, `useTranslations(zmienna)`, `useMessages()`), w pliku klienckim
 * wymagają adnotacji `// @i18n-ns ns1 ns2` - inaczej skrypt zgłasza błąd,
 * zamiast po cichu wysłać za mało tekstów.
 *
 * Użycie: `npm run i18n:namespaces` (zapisuje src/i18n/client-namespaces.generated.ts).
 * Test w scripts/i18n-client-namespaces.test.mjs pilnuje, żeby plik był aktualny.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT = "src/i18n/client-namespaces.generated.ts";

/** Wpisy wspólne dla wszystkich stron (renderowane przez layout). */
const GLOBAL_ENTRIES = ["layout.tsx", "template.tsx", "not-found.tsx"];

function resolveImport(srcDir, from, spec) {
  let base;
  if (spec.startsWith("@/")) base = path.join(srcDir, spec.slice(2));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(from), spec);
  else return null;
  for (const c of [base, `${base}.tsx`, `${base}.ts`, path.join(base, "index.tsx"), path.join(base, "index.ts")]) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

function parseFile(srcDir, file) {
  const s = fs.readFileSync(file, "utf8");
  const deps = [];
  // `import type` / `export type` nie trafiają do paczki - pomijamy.
  for (const m of s.matchAll(/(?:^|\n)\s*(import|export)\s+(?!type\s)[^;]*?\sfrom\s+["']([^"']+)["']/g)) deps.push(m[2]);
  for (const m of s.matchAll(/(?:^|\n)\s*import\s+["']([^"']+)["']/g)) deps.push(m[1]);
  for (const m of s.matchAll(/import\(\s*["']([^"']+)["']\s*\)/g)) deps.push(m[1]);
  const annotated = [...s.matchAll(/@i18n-ns\s+([^\n*]+)/g)].flatMap((m) => m[1].trim().split(/[\s,]+/));
  return {
    client: /^\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*["']use client["']/.test(s),
    deps: deps.map((d) => resolveImport(srcDir, file, d)).filter(Boolean),
    namespaces: [...s.matchAll(/useTranslations\(\s*["']([^"']+)["']/g)].map((m) => m[1].split(".")[0]),
    opaque: /useTranslations\(\s*(?:\)|[^"'\s)])|useMessages\(/.test(s),
    annotated,
  };
}

export function analyze(root) {
  const srcDir = path.join(root, "src");
  const localeDir = path.join(srcDir, "app", "[locale]");
  const cache = new Map();
  const info = (f) => {
    if (!cache.has(f)) cache.set(f, parseFile(srcDir, f));
    return cache.get(f);
  };
  const errors = [];

  function collect(entries) {
    const out = new Set();
    // Ten sam plik może być raz serwerowy, raz kliencki - stan to para (plik, kontekst).
    const seen = new Set();
    const stack = entries.map((f) => [f, false]);
    while (stack.length) {
      const [file, parentClient] = stack.pop();
      const i = info(file);
      const client = parentClient || i.client;
      const key = `${file}|${client}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (client) {
        i.namespaces.forEach((n) => out.add(n));
        i.annotated.forEach((n) => out.add(n));
        if (i.opaque && i.annotated.length === 0) {
          errors.push(`${path.relative(root, file)}: dynamiczne useTranslations/useMessages w komponencie klienckim bez adnotacji // @i18n-ns`);
        }
      }
      for (const d of i.deps) stack.push([d, client]);
    }
    return out;
  }

  const global = collect(GLOBAL_ENTRIES.map((f) => path.join(localeDir, f)).filter((f) => fs.existsSync(f)));

  const pages = {};
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name === "page.tsx") {
        const rel = path.relative(localeDir, dir).split(path.sep).join("/");
        const route = rel ? `/${rel}` : "/";
        pages[route] = [...collect([full])].filter((n) => !global.has(n)).sort();
      }
    }
  })(localeDir);

  const sortedPages = Object.fromEntries(Object.entries(pages).sort(([a], [b]) => a.localeCompare(b)));
  return { global: [...global].sort(), pages: sortedPages, errors: [...new Set(errors)] };
}

export function render({ global, pages }) {
  const lines = [
    "// Wygenerowane przez scripts/i18n-client-namespaces.mjs - nie edytuj ręcznie.",
    "// Po zmianie komponentów: npm run i18n:namespaces",
    "",
    "/** Teksty komponentów klienckich z layoutu - potrzebne na każdej stronie. */",
    `export const GLOBAL_CLIENT_NAMESPACES: readonly string[] = ${JSON.stringify(global)};`,
    "",
    "/** Dodatkowe teksty komponentów klienckich danej strony (ścieżka bez prefiksu języka). */",
    "export const PAGE_CLIENT_NAMESPACES: Record<string, readonly string[]> = {",
    ...Object.entries(pages).map(([route, ns]) => `  ${JSON.stringify(route)}: ${JSON.stringify(ns)},`),
    "};",
    "",
  ];
  return lines.join("\n");
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const result = analyze(root);
  if (result.errors.length) {
    console.error(result.errors.join("\n"));
    process.exit(1);
  }
  fs.writeFileSync(path.join(root, OUT), render(result));
  console.log(`Zapisano ${OUT}: ${result.global.length} wspólnych, ${Object.keys(result.pages).length} stron.`);
}
