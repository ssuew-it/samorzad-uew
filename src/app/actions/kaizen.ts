"use server";

/**
 * Karteczka Kaizen ze Strefy Działacza - przez ten sam Google Apps Script co
 * formularze, do zakładki „Kaizen” w PRYWATNYM arkuszu formularzy
 * (docs/apps-script/Code.gs).
 *
 * Anonimowa wobec Zarządu: wysłać może tylko zalogowany Działacz (żeby nie
 * pisał nikt spoza Samorządu), ale do arkusza idzie wyłącznie obszar i treść -
 * bez imienia, adresu i czegokolwiek z sesji.
 */
import { getAccess } from "@/lib/access";
import { walidujKarteczke } from "@/lib/kaizen";

export type KaizenResult = { status: "ok" } | { status: "unauthorized" } | { status: "invalid" } | { status: "not_configured" } | { status: "error" };

export async function sendKaizen(formData: FormData): Promise<KaizenResult> {
  if ((formData.get("firma") ?? "").toString().trim()) return { status: "ok" };
  if (!(await getAccess())) return { status: "unauthorized" };

  const wynik = walidujKarteczke({
    obszar: (formData.get("obszar") ?? "").toString(),
    zauwazam: (formData.get("zauwazam") ?? "").toString(),
    proponuje: (formData.get("proponuje") ?? "").toString(),
  });
  if (!wynik.ok) return { status: "invalid" };

  const url = process.env.APPS_SCRIPT_URL;
  const secret = process.env.APPS_SCRIPT_SECRET;
  if (!url || !secret) return { status: "not_configured" };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formularz: "kaizen", ...wynik.karteczka, secret }),
      signal: AbortSignal.timeout(15_000),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; blad?: string } | null;
    if (res.ok && data?.ok === true) return { status: "ok" };
    console.error("[kaizen] Apps Script odrzucił karteczkę", { status: res.status, error: data?.blad ?? null });
    return { status: "error" };
  } catch (err) {
    console.error("[kaizen] Błąd połączenia z Apps Script", { error: err instanceof Error ? err.message : String(err) });
    return { status: "error" };
  }
}
