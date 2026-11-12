/**
 * Zapisuje menu planu zajęć UEW (semestry, tryby, kierunki, roczniki) do
 * src/lib/plan-zajec/drzewo.json.
 *
 * Strona główna planu (index.php) jest za ochroną Cloudflare i serwer jej nie
 * pobierze, a menu zmienia się tylko przy nowym semestrze. Uruchom ten skrypt
 * po pojawieniu się nowego semestru w planie:
 *
 *   node scripts/import-plan-drzewo.mjs              (pobiera index.php)
 *   node scripts/import-plan-drzewo.mjs plik.html    (z zapisanej strony, gdy
 *                                                     Cloudflare blokuje)
 *
 * Plik HTML zapiszesz w przeglądarce: plan.ue.wroc.pl → Ctrl+S.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "src/lib/plan-zajec/drzewo.json");

let html;
if (process.argv[2]) {
  html = readFileSync(process.argv[2], "utf8");
} else {
  // Adres główny, nie index.php: index.php zasłania kontrola Cloudflare, a strona
  // główna podaje to samo menu bez niej (sprawdzone 12.11.2026). Zwykle wystarczy
  // `npm run import:plan`, który odświeża też drzewo.
  const res = await fetch("https://plan.ue.wroc.pl/", {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0 Safari/537.36", Accept: "text/html" },
  });
  html = await res.text();
  if (!res.ok || /Just a moment/.test(html)) {
    console.error("Cloudflare zablokował pobranie. Zapisz plan.ue.wroc.pl w przeglądarce i podaj ścieżkę do pliku.");
    process.exit(1);
  }
}

const { parseTree } = await import("../src/lib/plan-zajec/parse.ts");
const tree = parseTree(html);
if (!tree.length) {
  console.error("Nie znaleziono semestrów w pliku - czy to na pewno strona planu?");
  process.exit(1);
}
writeFileSync(out, JSON.stringify(tree) + "\n", "utf8");
console.log(`Zapisano ${tree.length} semestry: ${tree.map((s) => `${s.label} (se=${s.se})`).join(", ")}`);
