/**
 * Polska typografia: jednoliterowe słowa („w”, „z”, „i”, „a”, „o”, „u”) i znak
 * paragrafu nie mogą zostać same na końcu linii - wiążemy je twardą spacją
 * z następnym wyrazem.
 *
 * Robimy to raz, przy wczytaniu tłumaczeń (src/i18n/request.ts), a nie w
 * plikach messages: tam twarda spacja jest niewidoczna i ktoś edytujący tekst
 * łatwo by ją zgubił albo skopiował w złe miejsce.
 */
// Twarda spacja (U+00A0) zapisana kodem - w źródle byłaby niewidoczna.
const NBSP = String.fromCharCode(0xa0);

// Słowo jednoliterowe na początku tekstu albo po spacji, nawiasie lub
// cudzysłowie; dalej zwykła spacja i coś, co nie jest kolejną spacją.
const JEDNOLITEROWE = /(^|[\s(„"«])([aiouwzAIOUWZ]) (?=\S)/g;
const PARAGRAF = /§ (?=\d)/g;
// Drugi przebieg: przy „i w Senacie” pierwszy zjada spację po „i”, więc „w”
// stoi już po twardej spacji, a nie po zwykłej - tu ją łapiemy.
const PO_TWARDEJ = new RegExp(`(${NBSP})([aiouwzAIOUWZ]) (?=\\S)`, "g");

export function sierotki(tekst: string): string {
  return tekst.replace(JEDNOLITEROWE, `$1$2${NBSP}`).replace(PARAGRAF, `§${NBSP}`).replace(PO_TWARDEJ, `$1$2${NBSP}`);
}

/** Całe drzewo tłumaczeń: napisy przechodzą przez `sierotki`, reszta bez zmian. */
export function sierotkiWTekstach<T>(wartosc: T): T {
  if (typeof wartosc === "string") return sierotki(wartosc) as T;
  if (Array.isArray(wartosc)) return wartosc.map((v) => sierotkiWTekstach(v)) as T;
  if (wartosc && typeof wartosc === "object") {
    return Object.fromEntries(Object.entries(wartosc).map(([k, v]) => [k, sierotkiWTekstach(v)])) as T;
  }
  return wartosc;
}
