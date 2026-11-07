/**
 * Logo do stopki mailowej (public/sig/logo-h.png) - pozioma wersja w całości.
 * Grafikę „Działamy · Wspieramy · Inspirujemy” (GIF i nieruchome kadry) robi
 * osobny skrypt: python scripts/build-signature-gif.py.
 *
 * Uruchom: node scripts/build-signature-assets.mjs
 *
 * Każdy plik ma DWA RAZY większe wymiary niż w stopce (ostry na ekranach
 * o dużej gęstości pikseli). Wymiary wyświetlane stoją w src/lib/signature.ts,
 * a zgodność pilnuje src/lib/signature-assets.test.ts.
 *
 * Kolor logo #1477b5 to niebieski z księgi znaku Samorządu (nie #2C4BFF ze
 * strony). Logo stoi na białej, zaokrąglonej podkładce: Gmail i Apple Mail
 * w ciemnym motywie nie przemalowują obrazków, a niebieski znak na
 * przezroczystym tle ginąłby na ciemnym tle.
 */
import { readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = (name) => join(root, "public", "sig", name);
const LOGO_BLUE = "#1477b5";

async function logo() {
  // Logo w całości (znak + napis) - księga znaku nie pozwala ich rozdzielać.
  const svg = readFileSync(join(root, "public", "logo-dark.svg"), "utf8").replace(
    "<defs>",
    `<defs><style>path{fill:${LOGO_BLUE}}</style>`,
  );
  const mark = await sharp(Buffer.from(svg), { density: 600 }).resize({ height: 88 }).png().toBuffer();
  const plate = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="384" height="112"><rect width="384" height="112" rx="16" fill="#fff"/></svg>`,
  );
  await sharp(plate).composite([{ input: mark, gravity: "center" }]).png().toFile(out("logo-h.png"));
}

await logo();

for (const f of ["logo-h.png"]) {
  const m = await sharp(out(f)).metadata();
  console.log(`${f}: ${m.width}×${m.height}, ${Math.round(statSync(out(f)).size / 1024)} KB`);
}
