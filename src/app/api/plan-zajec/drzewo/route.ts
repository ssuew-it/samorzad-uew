import { NextResponse } from "next/server";
import { currentSemesters, getTree } from "@/lib/plan-zajec/source";

/**
 * Kierunki i roczniki bieżącego roku akademickiego z planu zajęć UEW - do
 * formularza subskrypcji. Łączy semestry tego roku, żeby lista nie zależała
 * od tego, czy w menu planu jest już semestr letni.
 */
export const revalidate = 21600;

export async function GET() {
  try {
    const sems = currentSemesters(await getTree());
    const modes = new Map<string, { code: string; label: string; programs: Map<string, Set<string>> }>();
    for (const sem of sems)
      for (const m of sem.modes) {
        const mode = modes.get(m.code) ?? { code: m.code, label: m.label, programs: new Map() };
        for (const p of m.programs) {
          const years = mode.programs.get(p.code) ?? new Set<string>();
          for (const y of p.years) years.add(y.year);
          mode.programs.set(p.code, years);
        }
        modes.set(m.code, mode);
      }
    return NextResponse.json({
      year: sems[0]?.label.split(" ")[0] ?? "",
      modes: [...modes.values()].map((m) => ({
        code: m.code,
        label: m.label,
        programs: [...m.programs].map(([code, years]) => ({ code, years: [...years].sort() })).sort((a, b) => a.code.localeCompare(b.code, "pl")),
      })),
    });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
