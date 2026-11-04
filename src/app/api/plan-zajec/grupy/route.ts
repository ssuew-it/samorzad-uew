import { NextResponse, type NextRequest } from "next/server";
import { getSubgroupsFor } from "@/lib/plan-zajec/source";

/**
 * Region Frankfurt, nie domyślne USA: plan.ue.wroc.pl odrzucał zapytania
 * z amerykańskich serwerów Vercela (lokalnie z Polski odpowiadał 200), więc
 * na produkcji grupy się nie wczytywały i nie dało się dodać planu do
 * Kalendarza Google.
 */
export const preferredRegion = "fra1";


/** Podgrupy rocznika (np. „01 FiR”…„11 FiR”) w bieżącym roku akademickim. */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const mode = q.get("tryb") ?? "";
  const program = q.get("kierunek") ?? "";
  const year = q.get("rok") ?? "";
  if (!/^\w{1,12}$/.test(mode) || !/^[\w.-]{1,16}$/.test(program) || !/^\w{1,4}$/.test(year)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  try {
    const groups = await getSubgroupsFor(mode, program, year);
    return NextResponse.json(
      { groups: [...groups].sort((a, b) => a.localeCompare(b, "pl", { numeric: true })) },
      { headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" } },
    );
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
