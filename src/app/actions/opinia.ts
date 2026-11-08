"use server";

/**
 * Ocena strony (1-5 gwiazdek + dwa pytania opcjonalne) - przez ten sam
 * Google Apps Script co formularze kontaktowe, do zakładki „Opinie” w arkuszu
 * Samorządu, bez powiadomienia mailem (docs/apps-script/Code.gs).
 *
 * Bez danych osobowych: nie zbieramy imienia ani adresu, a komentarz ma
 * dopisek „nie wpisuj danych osobowych” (Polityka prywatności, sekcja 3f).
 */

export type FeedbackResult = { status: "ok" } | { status: "not_configured" } | { status: "invalid" } | { status: "error" };

const ZNALEZIONE = ["", "tak", "czesciowo", "nie"];
const MAX_KOMENTARZ = 1000;

export async function sendFeedback(formData: FormData): Promise<FeedbackResult> {
  if ((formData.get("firma") ?? "").toString().trim()) return { status: "ok" };

  const ocenaTekst = (formData.get("ocena") ?? "").toString().trim();
  const ocena = /^[1-5]$/.test(ocenaTekst) ? Number(ocenaTekst) : 0;
  const znalezione = (formData.get("znalezione") ?? "").toString().trim();
  if (!ocena || !ZNALEZIONE.includes(znalezione)) return { status: "invalid" };

  const komentarz = (formData.get("komentarz") ?? "").toString().trim().slice(0, MAX_KOMENTARZ);
  const stronaSurowa = (formData.get("strona") ?? "").toString().trim();
  // Tylko ścieżka serwisu - adres z innej domeny nie trafia do arkusza.
  const strona = /^\/[\w\-/%.]{0,200}$/.test(stronaSurowa) ? stronaSurowa : "";
  const jezyk = (formData.get("jezyk") ?? "").toString() === "en" ? "en" : "pl";

  const url = process.env.APPS_SCRIPT_URL;
  const secret = process.env.APPS_SCRIPT_SECRET;
  if (!url || !secret) return { status: "not_configured" };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formularz: "opinia", ocena, znalezione, komentarz, strona, jezyk, secret }),
      signal: AbortSignal.timeout(15_000),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; blad?: string } | null;
    if (res.ok && data?.ok === true) return { status: "ok" };
    console.error("[opinia] Apps Script odrzucił ocenę", { status: res.status, error: data?.blad ?? null });
    return { status: "error" };
  } catch (err) {
    console.error("[opinia] Błąd połączenia z Apps Script", { error: err instanceof Error ? err.message : String(err) });
    return { status: "error" };
  }
}
