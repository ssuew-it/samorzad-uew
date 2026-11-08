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
 * Logo jest białe (wersja z księgi znaku) na nieprzezroczystej płytce
 * z gradientem: Gmail i Apple Mail w ciemnym motywie nie przemalowują
 * obrazków, więc płytka wygląda tak samo na jasnym i ciemnym tle.
 *
 * Szklane ikony paska (public/sig/ic_*.png, 48×48) wycięto z jednego renderu
 * Higgsfielda (scripts/sig-src/ikony-szklo.png, 7.11.2026) - to gotowe pliki,
 * ten skrypt ich nie generuje.
 */
import { readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = (name) => join(root, "public", "sig", name);

async function logo() {
  // Logo w całości (znak + napis) - księga znaku nie pozwala ich rozdzielać.
  // Białe logo (wersja dopuszczona księgą) na płytce z gradientem granat →
  // niebieski i paskami po skosie - tymi samymi co na grafice po prawej.
  // Płytka jest nieprzezroczysta, więc w ciemnym motywie poczty nic nie ginie.
  const svg = readFileSync(join(root, "public", "logo-dark.svg"), "utf8").replace(
    "<defs>",
    `<defs><style>path{fill:#ffffff}</style>`,
  );
  const mark = await sharp(Buffer.from(svg), { density: 600 }).resize({ height: 88 }).png().toBuffer();
  const W = 432, H = 136;
  const stripes = [];
  for (let x = W - 190; x < W + 70; x += 24) {
    stripes.push(`<polygon points="${x},${H} ${x + 5},${H} ${x + 5 + H * 0.466},0 ${x + H * 0.466},0" fill="#fff" fill-opacity="0.16"/>`);
  }
  const plate = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stop-color="#0d306e"/><stop offset="1" stop-color="#1a8ad0"/>
        </linearGradient>
        <clipPath id="c"><rect width="${W}" height="${H}" rx="24"/></clipPath>
      </defs>
      <g clip-path="url(#c)"><rect width="${W}" height="${H}" fill="url(#g)"/>${stripes.join("")}</g>
    </svg>`,
  );
  await sharp(plate).composite([{ input: mark, gravity: "center" }]).png().toFile(out("logo-h.png"));
  // Osobno płytka i samo logo - z nich python scripts/build-signature-logo-gif.py
  // składa animowane logo-h.gif (wersja kompaktowa).
  await sharp(plate).png().toFile(join(root, "scripts", "sig-src", "logo-plytka.png"));
  await sharp(mark).png().toFile(join(root, "scripts", "sig-src", "logo-znak.png"));
}

await logo();

for (const f of ["logo-h.png"]) {
  const m = await sharp(out(f)).metadata();
  console.log(`${f}: ${m.width}×${m.height}, ${Math.round(statSync(out(f)).size / 1024)} KB`);
}
