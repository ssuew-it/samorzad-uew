import { type NextRequest } from "next/server";
import { getFeedEntries } from "@/lib/plan-zajec/source";
import { planToIcs } from "@/lib/plan-zajec/ics";

/**
 * Kalendarz zajęć podgrupy do subskrypcji (Google, Apple, Outlook).
 * Adres: /api/plan-zajec/kalendarz.ics?tryb=S1&kierunek=FIR&rok=1&grupa=01%20FiR
 * Opcjonalnie &polowa=A|B - zajęcia tylko dla jednej połowy grupy.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const query = {
    mode: q.get("tryb") ?? "",
    program: q.get("kierunek") ?? "",
    year: q.get("rok") ?? "",
    subgroup: q.get("grupa") ?? "",
    half: (q.get("polowa") ?? "").toUpperCase(),
  };
  if (
    !/^\w{1,12}$/.test(query.mode) ||
    !/^[\w.-]{1,16}$/.test(query.program) ||
    !/^\w{1,4}$/.test(query.year) ||
    !/^[\p{L}\p{N} ./-]{1,24}$/u.test(query.subgroup) ||
    !/^[AB]?$/.test(query.half)
  ) {
    return new Response("Nieprawidłowy adres kalendarza.", { status: 400 });
  }
  try {
    const entries = await getFeedEntries(query);
    const name = `Plan zajęć ${query.subgroup}${query.half ? ` (${query.half})` : ""}`;
    return new Response(planToIcs(entries, name), {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `inline; filename="plan-${query.program}-${query.year}.ics"`,
        "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
      },
    });
  } catch {
    // 503 zamiast pustego kalendarza: Google zostawi ostatnią dobrą wersję.
    return new Response("Plan zajęć jest chwilowo niedostępny.", { status: 503, headers: { "Retry-After": "3600" } });
  }
}
