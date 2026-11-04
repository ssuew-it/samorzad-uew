/**
 * Stopka mailowa - JEDYNE źródło prawdy dla jej kodu HTML.
 *
 * Markup stoi na tabelach i stylach wpisanych w atrybuty, bo to treść do
 * KLIENTA POCZTOWEGO, nie do strony. Outlook renderuje HTML silnikiem Worda:
 * nie zna flexa, grida ani klas, a `background-image` i `border-radius`
 * potrafi zignorować albo pokazać jako artefakt. Nie przepisuj tego na
 * komponenty ani na Tailwinda - stopka przestanie działać u połowy odbiorców.
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
  org: string;
  phone: string;
  email: string;
  web: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  socialLabel?: string;
  showBanner: boolean;
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

function contactRow(icon: string, href: string, label: string): string {
  // Odstęp ikona-tekst jako padding komórki, nie pusta komórka z &nbsp; -
  // ta zapadała się na wąskim ekranie i tekst przyklejał się do ikony.
  return `
    <tr><td style="padding:3px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td width="20" valign="middle"><img src="${BASE}/sig/${icon}" width="20" height="20" alt="" style="display:block;border:0;width:20px;height:20px;"></td>
        <td valign="middle" style="${FONT}font-size:13px;line-height:18px;padding:0 0 0 10px;"><a href="${href}" style="color:#333333;text-decoration:none;">${label}</a></td>
      </tr></table></td></tr>`;
}

function socialCell(url: string, icon: string, alt: string): string {
  return `<td valign="middle" style="padding:0 6px 0 0;"><a href="${esc(url)}"><img src="${BASE}/sig/${icon}" width="22" height="22" alt="${alt}" style="display:block;border:0;width:22px;height:22px;"></a></td>`;
}

/**
 * UKŁAD (przebudowa 11.2026, po skargach „stopki źle się robią”):
 * - logo | linia | dane; baner POD danymi, nie trzecią kolumną - stopka ma
 *   ok. 430 px zamiast 720 i mieści się w aplikacjach na telefonie,
 * - logo z białym tłem (logo-bg.png): przezroczyste granatowe ginęło
 *   w ciemnym motywie Gmaila i Outlooka, które nie przemalowują obrazków,
 * - puste pola (telefon, e-mail, strona) nie zostawiają wiersza z samą ikoną.
 */
export function buildSignature(d: SignatureData): string {
  const socials = [
    d.instagram && socialCell(d.instagram, "ic_instagram.png", "Instagram"),
    d.facebook && socialCell(d.facebook, "ic_facebook.png", "Facebook"),
    d.linkedin && socialCell(d.linkedin, "ic_linkedin.png", "LinkedIn"),
  ]
    .filter(Boolean)
    .join("");

  const socialRow =
    socials || d.socialLabel
      ? `
    <tr><td style="padding:10px 0 0 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        ${socials}
        ${d.socialLabel ? `<td valign="middle" style="${FONT}font-size:13px;line-height:18px;color:#5a6572;padding:0 0 0 2px;">${esc(d.socialLabel)}</td>` : ""}
      </tr></table></td></tr>`
      : "";

  // Baner wyświetlany w 222×150; plik ma 444×300, czyli dokładnie dwa razy
  // tyle - na ekranach o dużej gęstości pikseli nie będzie rozmyty.
  const bannerRow = d.showBanner
    ? `
    <tr><td style="padding:14px 0 0 0;"><img src="${BASE}/sig/banner.jpg" width="222" height="150" alt="Działamy, wspieramy, inspirujemy" style="display:block;border:0;outline:none;width:222px;height:150px;"></td></tr>`
    : "";

  const contacts = [
    d.phone.trim() && contactRow("ic_phone.png", telHref(d.phone), esc(d.phone)),
    d.email.trim() && contactRow("ic_mail.png", "mailto:" + esc(d.email), esc(d.email)),
    d.web.trim() && contactRow("ic_web.png", "https://" + esc(bareWeb(d.web)), esc(bareWeb(d.web))),
  ]
    .filter(Boolean)
    .join("");

  // Znak: 134×80 przy proporcji przekazanego pliku (369,93:220,98).
  // Plik logo-bg.png ma 268×160, czyli 2× - ostry na ekranach retina.
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;${FONT}color:#333333;">
 <tr>
  <td valign="top" style="padding:0 16px 0 0;"><img src="${BASE}/sig/logo-bg.png" width="134" height="80" alt="Samorząd Studentów Uniwersytetu Ekonomicznego we Wrocławiu" style="display:block;border:0;outline:none;width:134px;height:80px;"></td>
  <td width="2" bgcolor="#dbe3ec" style="width:2px;line-height:1px;font-size:1px;">&nbsp;</td>
  <td valign="top" style="padding:0 0 0 16px;">
   <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;">
    <tr><td style="${FONT}font-size:19px;font-weight:bold;color:#14284a;line-height:23px;padding-bottom:2px;">${esc(d.name)}</td></tr>
    ${d.title.trim() ? `<tr><td style="${FONT}font-size:13px;font-weight:bold;color:#1a6ac0;line-height:17px;">${esc(d.title)}</td></tr>` : ""}
    ${d.org.trim() ? `<tr><td style="${FONT}font-size:13px;color:#5a6572;line-height:17px;">${esc(d.org)}</td></tr>` : ""}
    ${contacts ? `<tr><td style="font-size:1px;line-height:10px;height:10px;">&nbsp;</td></tr>${contacts}` : ""}
    ${socialRow}
    ${bannerRow}
   </table>
  </td>
 </tr>
</table>`;
}

/**
 * Wersja tekstowa do schowka (text/plain). Wcześniej był tu sam kod HTML -
 * program, który przy wklejaniu bierze tekst, wklejał znaczniki zamiast stopki.
 */
export function buildSignaturePlain(d: SignatureData): string {
  const head = [d.name, d.title, d.org].map((l) => l.trim()).filter(Boolean);
  const contact = [d.phone.trim() && `tel. ${d.phone.trim()}`, d.email.trim(), bareWeb(d.web)].filter(Boolean);
  return [...head, ...(contact.length ? ["", ...contact] : [])].join("\n");
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
  org: "Samorząd Studentów UEW",
  web: "samorzad.ue.wroc.pl",
  instagram: "https://www.instagram.com/samorzad.ue",
  facebook: "https://www.facebook.com/samorzad.ue",
  linkedin:
    "https://www.linkedin.com/company/samorząd-studentów-uniwersytetu-ekonomicznego-we-wrocławiu/",
  socialLabel: "/samorzad.ue",
} as const;
