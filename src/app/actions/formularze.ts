"use server";

/**
 * Wysyłka formularzy przez Google Apps Script na koncie Samorządu.
 *
 * Dlaczego server action, a nie `fetch` z przeglądarki: adres wdrożenia i
 * wspólny sekret zostają po stronie serwera. Gdyby formularz strzelał do Apps
 * Script bezpośrednio z klienta, sekret byłby widoczny w kodzie strony i
 * każdy mógłby wysyłać wiadomości w imieniu serwisu.
 *
 * Zastępuje Formspree. Powody zmiany, dla porządku:
 * - darmowy Formspree to 50 zgłoszeń miesięcznie ŁĄCZNIE z trzech formularzy —
 *   w sesji stypendialnej to za mało;
 * - dane studentów (w tym sprawy do Rzecznika) trafiały do firmy w USA i
 *   wymagały osobnej umowy powierzenia. Teraz zostają na koncie Google
 *   Samorządu, czyli tam, gdzie i tak trafiłby mail.
 *
 * Bez `APPS_SCRIPT_URL` zwracamy `not_configured` — formularz mówi o tym
 * wprost i podaje adres e-mail, zamiast udawać, że wysłał.
 */

export type FormKind = "kontakt" | "rzecznik" | "partnerzy";

export type SendResult =
  | { status: "ok" }
  | { status: "not_configured" }
  | { status: "invalid" }
  | { status: "error" };

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function sendForm(kind: FormKind, formData: FormData): Promise<SendResult> {
  if (!["kontakt", "rzecznik", "partnerzy"].includes(kind)) return { status: "invalid" };
  // Honeypot: pole ukryte przed człowiekiem, kuszące dla bota. Wypełnione =
  // udajemy sukces, żeby nie podpowiadać botowi, że został rozpoznany.
  if ((formData.get("firma") ?? "").toString().trim()) return { status: "ok" };

  const email = (formData.get("email") ?? "").toString().trim();
  const message = (formData.get("message") ?? "").toString().trim();
  const name = (formData.get("name") ?? (kind === "partnerzy" ? formData.get("contactPerson") : "") ?? "").toString().trim();
  const organisation = (formData.get("organisation") ?? "").toString().trim();
  // Temat jest zapisywany w arkuszu i mailu przez już wdrożony Apps Script.
  // Dzięki temu nazwa organizacji nie ginie i nie wymaga zmiany backendu Google.
  const subject = kind === "partnerzy" ? organisation : (formData.get("subject") ?? "").toString().trim();

  // Walidacja powtórzona na serwerze — ta w przeglądarce jest wygodą, nie
  // zabezpieczeniem, i da się ją ominąć.
  if (!EMAIL.test(email) || message.length < 10 || name.length < 2 || (kind === "partnerzy" && organisation.length < 2)) {
    return { status: "invalid" };
  }

  const url = process.env.APPS_SCRIPT_URL;
  const secret = process.env.APPS_SCRIPT_SECRET;
  if (!url || !secret) return { status: "not_configured" };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formularz: kind, name, email, subject, message, secret }),
      // Apps Script potrafi odpowiadać wolno przy zimnym starcie; bez limitu
      // użytkownik zostaje z wiecznym „wysyłam".
      signal: AbortSignal.timeout(15_000),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    return res.ok && data?.ok === true ? { status: "ok" } : { status: "error" };
  } catch {
    return { status: "error" };
  }
}

/** Czy backend formularzy jest skonfigurowany (do stanu „jeszcze nie działa"). */
export async function formsConfigured(): Promise<boolean> {
  return Boolean(process.env.APPS_SCRIPT_URL && process.env.APPS_SCRIPT_SECRET);
}
