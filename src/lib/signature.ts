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

function contactRow(icon: string, href: string, label: string): string {
  return `
    <tr><td style="padding:3px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td width="20" valign="middle"><img src="${BASE}/sig/${icon}" width="20" height="20" alt="" style="display:block;border:0;"></td>
        <td width="10" style="font-size:1px;line-height:1px;">&nbsp;</td>
        <td valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;"><a href="${href}" style="color:#333333;text-decoration:none;">${label}</a></td>
      </tr></table></td></tr>`;
}

function socialCell(url: string, icon: string, alt: string): string {
  return `<td valign="middle"><a href="${esc(url)}"><img src="${BASE}/sig/${icon}" width="22" height="22" alt="${alt}" style="display:block;border:0;"></a></td><td width="6" style="font-size:1px;">&nbsp;</td>`;
}

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
    <tr><td style="padding:12px 0 0 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        ${socials}
        ${d.socialLabel ? `<td width="4" style="font-size:1px;">&nbsp;</td><td valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#5a6572;">${esc(d.socialLabel)}</td>` : ""}
      </tr></table></td></tr>`
      : "";

  // Baner wyświetlany w 222×150; plik ma 444×300, czyli dokładnie dwa razy
  // tyle - na ekranach o dużej gęstości pikseli nie będzie rozmyty.
  const bannerCell = d.showBanner
    ? `<td valign="middle" style="padding:0 0 0 8px;"><img src="${BASE}/sig/banner.jpg" width="222" height="150" alt="Działamy, wspieramy, inspirujemy" style="display:block;border:0;outline:none;"></td>`
    : "";

  // Znak: 167×100, a nie 116×100 z pierwotnego szablonu. Przekazany plik ma
  // proporcję 369,93:220,98 - przy szerokości 116 logotyp byłby ściśnięty
  // o jedną trzecią. Źródło w public/sig/logo.svg, PNG renderowany w 2×.
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;color:#333333;">
 <tr>
  <td valign="middle" style="padding:0 18px 0 0;"><img src="${BASE}/sig/logo.png" width="167" height="100" alt="Samorząd Studentów UEW" style="display:block;border:0;outline:none;"></td>
  <td width="2" bgcolor="#dbe3ec" style="width:2px;line-height:1px;font-size:1px;">&nbsp;</td>
  <td valign="middle" style="padding:0 18px;">
   <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
    <tr><td style="font-size:19px;font-weight:bold;color:#14284a;line-height:1.15;padding-bottom:2px;">${esc(d.name)}</td></tr>
    <tr><td style="font-size:13px;font-weight:bold;color:#1a6ac0;line-height:1.25;">${esc(d.title)}</td></tr>
    <tr><td style="font-size:13px;color:#5a6572;line-height:1.25;padding-bottom:12px;">${esc(d.org)}</td></tr>
    ${contactRow("ic_phone.png", telHref(d.phone), esc(d.phone))}
    ${contactRow("ic_mail.png", "mailto:" + esc(d.email), esc(d.email))}
    ${contactRow("ic_web.png", "https://" + esc(d.web), esc(d.web))}
    ${socialRow}
   </table>
  </td>
  ${bannerCell}
 </tr>
</table>`;
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
