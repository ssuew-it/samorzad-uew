/**
 * Stopka mailowa - JEDYNE źródło prawdy dla jej kodu HTML.
 *
 * Markup stoi na tabelach i stylach wpisanych w atrybuty, bo to treść do
 * KLIENTA POCZTOWEGO, nie do strony. Outlook renderuje HTML silnikiem Worda:
 * nie zna flexa, grida ani klas, a `background-image` potrafi zignorować albo
 * pokazać jako artefakt. Nie przepisuj tego na komponenty ani na Tailwinda -
 * stopka przestanie działać u połowy odbiorców.
 *
 * Obrazki są linkowane, nie wklejone jako base64: Gmail wycina dane w base64
 * z treści wiadomości i w efekcie stopka traci grafikę.
 */

/**
 * Adres, spod którego klient pocztowy pobierze grafiki.
 *
 * NIGDY nie bierzemy go z `window.location.origin`. Stopka żyje potem
 * w cudzych skrzynkach, więc musi wskazywać produkcję - gdyby wziąć bieżący
 * adres, komuś generującemu ją na podglądzie wdrożenia stopka pokazywałaby
 * obrazki z adresu, który za tydzień przestanie istnieć.
 */
const BASE = process.env.NEXT_PUBLIC_SIG_BASE || "https://samorzad.ue.wroc.pl";

export interface SignatureData {
  name: string;
  title: string;
  phone: string;
  email: string;
  web: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
}

/**
 * Dwie wersje z tych samych danych:
 * - daily - codzienna, z pełną grafiką,
 * - bulk - do masówek z Huntera (bierze podpis z Gmaila): mniejsza nieruchoma
 *   grafika (lżejszy plik) i bez ikony koperty - w zimnych wysyłkach każdy
 *   ciężki obrazek i zbędny link podnosi ryzyko, że mail trafi do spamu.
 */
export type SignatureVariant = "daily" | "bulk";

/**
 * Grafika „Działamy · Wspieramy · Inspirujemy” - wymiary wyświetlane, pliki są 2× większe.
 * Wysokość 190 px = wysokość kolumny danych przy dwuwierszowym stanowisku, więc
 * grafika sięga od góry do dołu karty. Obrazka nie da się rozciągnąć do wysokości
 * komórki (tło `background-image` Outlook ignoruje) - stąd stała wysokość.
 */
export const SIGNATURE_GRAPHIC: Record<SignatureVariant, { file: string; width: number; height: number }> = {
  // Codzienna: animacja (ok. 2 s, raz). Outlook na komputerze pokazuje tylko
  // pierwszą klatkę - ona sama jest pełnym obrazem (scripts/build-signature-gif.py).
  daily: { file: "grafika.gif", width: 250, height: 190 },
  // Wąski pas w tej samej wysokości - nieruchomy, lekki.
  bulk: { file: "grafika-mala.png", width: 110, height: 190 },
};

/** Białe logo (44 px wysokości) na płytce z gradientem i zapasem wokół (plik 432×136). */
const LOGO = { file: "logo-h.png", width: 216, height: 68 };

/** Szklane ikony paska (pliki 48×48) - szkło widać dopiero od 24 px. */
const ICON = 24;
const RAIL = ICON + 14;

const FULL_NAME = "Samorząd Studentów Uniwersytetu Ekonomicznego we Wrocławiu";

/** Niebieski z księgi znaku Samorządu - logo, ikony i linki. */
const BLUE = "#1477b5";
const INK = "#0f1220";
const MUTED = "#4b5163";
const LINE = "#dfe3ee";

/** Kolumna danych i odstęp przed grafiką. 296 px + karta mieści się na ekranie 360 px. */
const DATA_WIDTH = 296;
const GAP = 16;
const CARD_PADDING = 14;
/**
 * Zapas szerokości karty. Kolumny bez zapasu wypełniały wnętrze co do piksela:
 * wystarczył 1 px dodany przez pocztę (odstępy tabel w Wordzie, otoczka
 * Outlook.com, zaokrąglenia przy powiększeniu), żeby grafika spadła pod dane.
 */
const CARD_SLACK = 8;

/** Szerokość karty danej wersji - podgląd w generatorze musi ją zmieścić. */
export function signatureCardWidth(variant: SignatureVariant): number {
  return DATA_WIDTH + GAP + SIGNATURE_GRAPHIC[variant].width + 2 * CARD_PADDING + 2 + CARD_SLACK;
}

/** Wszystko, co wpisze użytkownik, trafia do HTML - więc wszystko escapujemy. */
const esc = (s = ""): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Numer w formacie, który telefon rozpozna jako link.
 *
 * Numer zapisany już z plusem zostaje bez zmian - doklejenie `+48` do numeru
 * zagranicznego dałoby adres, pod który nikt się nie dodzwoni.
 */
const telHref = (p = ""): string => {
  const czysty = p.replace(/[^\d+]/g, "");
  if (czysty.startsWith("+")) return `tel:${czysty}`;
  return `tel:+48${czysty.replace(/\D/g, "")}`;
};

/** Każda komórka z tekstem ma własną czcionkę: Outlook (silnik Worda) nie dziedziczy jej z tabeli. */
const FONT = "font-family:Arial,Helvetica,sans-serif;mso-line-height-rule:exactly;";

const TABLE = `role="presentation" cellpadding="0" cellspacing="0" border="0"`;

const img = (file: string, width: number, height: number, alt: string) =>
  `<img src="${BASE}/sig/${file}" width="${width}" height="${height}" alt="${alt}" style="display:block;border:0;outline:none;width:${width}px;height:${height}px;">`;

interface RailIcon {
  href: string;
  file: string;
  alt: string;
}

/**
 * Ikony pionowego paska. W wersji do masówek bez koperty - adres stoi
 * w tekście, a każdy link mniej to mniejsze ryzyko spamu. Profile zostają
 * (decyzja z 7.11.2026: partner ma od razu trafić na nasze media).
 */
function railIcons(d: SignatureData, variant: SignatureVariant): RailIcon[] {
  const web = d.web.trim() ? { href: "https://" + esc(bareWeb(d.web)), file: "ic_web.png", alt: "Strona Samorządu" } : null;
  const profiles = {
    instagram: d.instagram && { href: esc(d.instagram), file: "ic_instagram.png", alt: "Instagram" },
    facebook: d.facebook && { href: esc(d.facebook), file: "ic_facebook.png", alt: "Facebook" },
    linkedin: d.linkedin && { href: esc(d.linkedin), file: "ic_linkedin.png", alt: "LinkedIn" },
  };
  const mail =
    variant === "daily" && d.email.trim() ? { href: "mailto:" + esc(d.email.trim()), file: "ic_mail.png", alt: "E-mail" } : null;
  return [web, profiles.instagram, profiles.facebook, profiles.linkedin, mail].filter((i): i is RailIcon => Boolean(i));
}

function rail(icons: RailIcon[]): string {
  const rows = icons
    .map((i) => `<tr><td align="center" style="padding:4px 0;"><a href="${i.href}">${img(i.file, ICON, ICON, i.alt)}</a></td></tr>`)
    .join("");
  return `<td width="${RAIL}" valign="middle" style="width:${RAIL}px;border:1px solid ${LINE};border-radius:10px;padding:5px 0;">
      <table ${TABLE} width="100%">${rows}</table>
     </td>
     <td width="12" style="width:12px;font-size:1px;line-height:1px;">&nbsp;</td>`;
}

function textRow(content: string, style: string): string {
  return `<tr><td style="${FONT}${style}">${content}</td></tr>`;
}

/**
 * UKŁAD (przebudowa 11.2026 #2, „karta”, wzór: customesignature.com):
 * - karta w ramce: pasek ikon | dane nad logo | grafika z hasłem,
 * - dane i grafika to dwie tabele `align="left"` w jednej komórce: obok siebie,
 *   gdy jest miejsce, jedna pod drugą na telefonie - bez media queries, które
 *   Gmail wycina z wklejonych podpisów,
 * - szerokość karty wynika z kolumn (dane + grafika + marginesy), osobno dla
 *   każdej wersji; przy sztywnych 540 px grafika spadałaby pod dane nawet na
 *   komputerze,
 * - Outlook na komputerze nie zna `max-width`, więc dostaje kartę owiniętą
 *   w tabelę o stałej szerokości (komentarz warunkowy `[if mso]`),
 * - logo-h.png to białe logo na nieprzezroczystej płytce z gradientem: Gmail
 *   i Apple Mail w ciemnym motywie nie przemalowują obrazków, więc płytka
 *   wygląda tak samo na jasnym i ciemnym tle,
 * - „szkło” jest tylko w obrazkach (ikony paska) - efekty CSS w rodzaju
 *   backdrop-filter nie działają w Outlooku, a Gmail je wycina,
 * - margines pod tabelą danych odsuwa grafikę, gdy na telefonie spada pod dane
 *   (obok siebie nic nie przesuwa; Outlook kolumn nie układa w pion),
 * - puste pola (telefon, e-mail, strona, profile) nie zostawiają pustych
 *   wierszy ani pustego paska ikon.
 */
export function buildSignature(d: SignatureData, variant: SignatureVariant): string {
  const graphic = SIGNATURE_GRAPHIC[variant];
  const cardWidth = signatureCardWidth(variant);
  const icons = railIcons(d, variant);
  const email = d.email.trim();
  const phone = d.phone.trim();

  const text = [
    textRow(esc(d.name), `font-size:17px;font-weight:bold;color:${INK};line-height:21px;padding:0 0 2px 0;`),
    d.title.trim() && textRow(esc(d.title), `font-size:12px;color:${MUTED};line-height:16px;`),
    (email || phone) && `<tr><td style="font-size:1px;line-height:8px;height:8px;">&nbsp;</td></tr>`,
    email &&
      textRow(
        // <wbr> i break-all: długi adres łamie się w kolumnie, zamiast ją rozpychać
        // (przy 49 znakach przed @ grafika spadała pod dane, a telefon przewijał się w bok).
        `<a href="mailto:${esc(email)}" style="${FONT}color:${BLUE};text-decoration:none;">${esc(email).replace("@", "<wbr>@")}</a>`,
        "font-size:12px;line-height:17px;word-break:break-all;overflow-wrap:anywhere;",
      ),
    phone &&
      textRow(
        `<a href="${telHref(phone)}" style="${FONT}color:${MUTED};text-decoration:none;">tel. ${esc(phone)}</a>`,
        `font-size:12px;line-height:17px;color:${MUTED};`,
      ),
    `<tr><td style="padding:12px 0;"><table ${TABLE} width="100%"><tr><td height="1" bgcolor="${LINE}" style="height:1px;font-size:1px;line-height:1px;background:${LINE};">&nbsp;</td></tr></table></td></tr>`,
    `<tr><td>${img(LOGO.file, LOGO.width, LOGO.height, FULL_NAME)}</td></tr>`,
  ]
    .filter(Boolean)
    .join("\n      ");

  return `<!--[if mso]><table ${TABLE} width="${cardWidth}"><tr><td><![endif]-->
<table ${TABLE} width="100%" style="max-width:${cardWidth}px;border:1px solid ${LINE};border-radius:14px;border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;">
 <tr>
  <td style="padding:${CARD_PADDING}px;">
   <table ${TABLE} align="left" width="${DATA_WIDTH}" height="${graphic.height}" style="width:${DATA_WIDTH}px;margin-bottom:12px;mso-table-lspace:0pt;mso-table-rspace:0pt;">
    <tr>
     ${icons.length ? rail(icons) : ""}
     <td valign="middle">
      <table ${TABLE} width="100%">
      ${text}
      </table>
     </td>
    </tr>
   </table>
   <table ${TABLE} align="left" width="${GAP + graphic.width}" style="width:${GAP + graphic.width}px;mso-table-lspace:0pt;mso-table-rspace:0pt;">
    <tr><td valign="middle" style="padding:0 0 0 ${GAP}px;">${img(graphic.file, graphic.width, graphic.height, "Działamy, wspieramy, inspirujemy")}</td></tr>
   </table>
  </td>
 </tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->`;
}

/**
 * Wersja tekstowa do schowka (text/plain). Wcześniej był tu sam kod HTML -
 * program, który przy wklejaniu bierze tekst, wklejał znaczniki zamiast stopki.
 * Pełna nazwa Samorządu stoi tu tekstem, bo w HTML niesie ją logo.
 */
export function buildSignaturePlain(d: SignatureData): string {
  const head = [d.name, d.title].map((l) => l.trim()).filter(Boolean);
  const contact = [d.phone.trim() && `tel. ${d.phone.trim()}`, d.email.trim(), bareWeb(d.web)].filter(Boolean);
  return [...head, FULL_NAME, ...(contact.length ? ["", ...contact] : [])].join("\n");
}

/** Adres strony bez protokołu - w stopce pokazujemy „samorzad.ue.wroc.pl”. */
function bareWeb(web: string): string {
  return web.trim().replace(/^https?:\/\//i, "");
}

/** Pełny dokument do pobrania - osobno, żeby stopka w schowku została czysta. */
export function signatureDocument(html: string): string {
  return `<!doctype html>
<html lang="pl">
<head><meta charset="utf-8"><title>Stopka mailowa</title></head>
<body style="margin:0;padding:24px;background:#ffffff;">
${html}
</body>
</html>`;
}

/**
 * Jak stopkę zobaczą odbiorcy - tryby podglądu w generatorze. To przybliżenia
 * znanych zachowań programów pocztowych, nie ich silniki:
 * - light: zwykła biała wiadomość,
 * - darkPartial: Gmail w przeglądarce i na Androidzie, Apple Mail - ciemne tło,
 *   jasny tekst, obrazki bez zmian (stąd logo z białym tłem),
 * - darkInvert: Outlook.com i Gmail na iPhonie - odwrócone kolory tekstu i tła,
 *   obrazki bez zmian,
 * - phone: ekran 360 px.
 */
export type PreviewMode = "light" | "darkPartial" | "darkInvert" | "phone";

const PREVIEW_CSS: Record<PreviewMode, string> = {
  light: "",
  phone: "",
  darkPartial:
    "html,body{background:#202124!important}td{color:#e8eaed!important}td[bgcolor]{background:#5f6368!important}a{color:#8ab4f8!important}",
  darkInvert: "html{background:#ffffff;filter:invert(1) hue-rotate(180deg)}img{filter:invert(1) hue-rotate(180deg)}",
};

export function previewDocument(html: string, mode: PreviewMode): string {
  const css = PREVIEW_CSS[mode];
  return signatureDocument(html).replace(
    "</head>",
    `<style>body{padding:16px!important;margin:0}${css}</style></head>`,
  );
}

/** Domyślne wartości - stałe dla całego Samorządu, edytowalne w formularzu. */
export const SIGNATURE_DEFAULTS = {
  web: "samorzad.ue.wroc.pl",
  instagram: "https://www.instagram.com/samorzad.ue",
  facebook: "https://www.facebook.com/samorzad.ue",
  linkedin:
    "https://www.linkedin.com/company/samorząd-studentów-uniwersytetu-ekonomicznego-we-wrocławiu/",
} as const;
