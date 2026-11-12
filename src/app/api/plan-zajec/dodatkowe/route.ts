import { NextResponse, type NextRequest } from "next/server";
import { getExtrasFor } from "@/lib/plan-zajec/source";

/**
 * Lektoraty (SJO) i zajęcia WF do dołożenia do planu grupy - z pliku planu,
 * bez zapytań do plan.ue.wroc.pl.
 * Adres: /api/plan-zajec/dodatkowe?tryb=S1&kierunek=FIR&rok=2
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const mode = q.get("tryb") ?? "";
  const program = q.get("kierunek") ?? "";
  const year = q.get("rok") ?? "";
  if (!/^\w{1,12}$/.test(mode) || !/^[\w.-]{1,16}$/.test(program) || !/^\w{1,4}$/.test(year)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  return NextResponse.json(getExtrasFor(mode, program, year), {
    headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" },
  });
}
