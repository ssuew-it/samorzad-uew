/**
 * Oficjalne dokumenty stypendialne - linki do BIP UEW.
 *
 * Regulamin świadczeń wprowadził ZR 123/2025, a ZR 142/2025 go zmienił;
 * linki prowadzą do wersji UJEDNOLICONEJ na dzień 19.09.2025 (najnowsza
 * w BIP). Kolejność = numer załącznika i = kolejność listy w
 * `messages/*.json` → `stypendia.documents`. Treść każdego pliku sprawdzona
 * 17.10.2026 (pierwsza strona odpowiada nazwie na liście).
 *
 * Przy nowym regulaminie podmień adresy - numer w ścieżce (`/attachment/…`)
 * zmienia się z każdą publikacją. Strona zbiorcza w BIP (`STYPENDIA_BIP_PAGE`)
 * zostaje ta sama.
 */

export const STYPENDIA_BIP_PAGE = "https://www.bip.ue.wroc.pl/462/regulamin-swiadczen-dla-studentow.html";

const BIP = "https://www.bip.ue.wroc.pl/download/attachment";

export const REGULAMIN_SWIADCZEN_PDF = `${BIP}/3453/00-regulamin-swiadczen-dla-studentow-uew.pdf`;

/**
 * Własny Fundusz Stypendialny - osobny regulamin (ZR 63/2021, zmieniony ZR
 * 89/2023). PDF to tekst jednolity z obwieszczenia Rektora z 30.06.2023;
 * treść sprawdzona 20.10.2026 (§ 4: wniosek e-mailem z domeny UEW do
 * 30 listopada; § 1 ust. 3: świadczenie jednorazowe).
 */
export const WFS_BIP_PAGE =
  "https://bip.ue.wroc.pl/359/400/regulamin-przyznawania-stypendiow-z-wlasnego-funduszu-stypendialnego-uew.html";
export const WFS_REGULAMIN_PDF =
  "https://bip.ue.wroc.pl/download/attachment/1508/zalacznik-do-obwieszczenia-rektora-2-2023.pdf";

/** Załączniki 1-10 do Regulaminu świadczeń (wersja ujednolicona 19.09.2025). */
export const ZALACZNIKI: string[] = [
  `${BIP}/3442/01-zalacznik-nr-1-do-regulaminu-swiadczen-dla-studentow-uew.pdf`,
  `${BIP}/3443/02-zalacznik-nr-2-do-regulaminu-swiadczen-dla-studentow-uew.pdf`,
  `${BIP}/3444/03-zalacznik-nr-3-do-regulaminu-swiadczen-dla-studentow-uew.pdf`,
  `${BIP}/3445/04-zalacznik-nr-4-do-regulaminu-swiadczen-dla-studentow-uew.pdf`,
  `${BIP}/3446/05-zalacznik-nr-5-do-regulaminu-swiadczen-dla-studentow-uew.pdf`,
  `${BIP}/3447/06-zalacznik-nr-6-do-regulaminu-swiadczen-dla-studentow-uew.pdf`,
  `${BIP}/3448/07-zalacznik-nr-7-do-regulaminu-swiadczen-dla-studentow-uew.pdf`,
  `${BIP}/3449/08-zalacznik-nr-8-do-regulaminu-swiadczen-dla-studentow-uew.pdf`,
  `${BIP}/3450/09-zalacznik-nr-9-do-regulaminu-swiadczen-dla-studentow-uew.pdf`,
  `${BIP}/3451/10-zalacznik-nr-10-do-regulaminu-swiadczen-dla-studentow-uew.pdf`,
];
