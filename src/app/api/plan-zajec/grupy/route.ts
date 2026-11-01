import { NextResponse, type NextRequest } from "next/server";
import { currentSemesters, getSubgroups, getTree } from "@/lib/plan-zajec/source";

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
    const groups = new Set<string>();
    for (const sem of currentSemesters(await getTree())) {
      const gr = sem.modes.find((m) => m.code === mode)?.programs.find((p) => p.code === program)?.years.find((y) => y.year === year)?.gr;
      if (gr) for (const g of await getSubgroups(sem.se, gr)) groups.add(g);
    }
    return NextResponse.json(
      { groups: [...groups].sort((a, b) => a.localeCompare(b, "pl", { numeric: true })) },
      { headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" } },
    );
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
