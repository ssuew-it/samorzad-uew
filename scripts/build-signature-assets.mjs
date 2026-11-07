/**
 * Grafiki stopki mailowej (public/sig) - logo w poziomej wersji i kadry grafiki
 * „Działamy · Wspieramy · Inspirujemy”.
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

/**
 * Kadr grafiki: przycięty od prawego dołu (tam stoi hasło, więc zostaje całe),
 * lewy brzeg ścięty po skosie, zaokrąglone rogi i białe paski tylko w lewej
 * części - wygaszane ku prawej, żeby nigdy nie przecięły hasła.
 */
async function graphic(file, w, h, r) {
  const cut = Math.round(w * 0.22);
  const shape = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <clipPath id="c"><rect width="${w}" height="${h}" rx="${r}"/></clipPath>
      <polygon clip-path="url(#c)" points="${cut},0 ${w},0 ${w},${h} 0,${h}" fill="#000"/>
    </svg>`,
  );
  // Paski 115° co 25 px (w skali 2× - 50 px), szerokość 3 px (6 px), w lewych 46%.
  const step = Math.round(w / 8);
  const band = Math.max(3, Math.round(w / 130));
  const stripeW = Math.round(w * 0.46);
  const stripes = [];
  for (let x = -h; x < stripeW + h; x += step) {
    stripes.push(`<polygon points="${x},${h} ${x + band},${h} ${x + band + h * 0.466},0 ${x + h * 0.466},0" fill="#fff"/>`);
  }
  const overlay = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs>
        <linearGradient id="fade" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stop-color="#fff" stop-opacity="1"/>
          <stop offset="0.55" stop-color="#fff" stop-opacity="1"/>
          <stop offset="1" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
        <mask id="m"><rect width="${stripeW}" height="${h}" fill="url(#fade)"/></mask>
      </defs>
      <g mask="url(#m)">${stripes.join("")}</g>
    </svg>`,
  );
  const photo = await sharp(join(root, "public", "sig", "banner.jpg"))
    .resize(w, h, { fit: "cover", position: "right bottom" })
    .composite([{ input: overlay }])
    .png()
    .toBuffer();
  await sharp(photo)
    .ensureAlpha()
    .composite([{ input: shape, blend: "dest-in" }])
    .png({ compressionLevel: 9 })
    .toFile(out(file));
}

await logo();
await graphic("grafika.png", 400, 270, 20);
await graphic("grafika-mala.png", 240, 162, 12);

for (const f of ["logo-h.png", "grafika.png", "grafika-mala.png"]) {
  const m = await sharp(out(f)).metadata();
  console.log(`${f}: ${m.width}×${m.height}, ${Math.round(statSync(out(f)).size / 1024)} KB`);
}
