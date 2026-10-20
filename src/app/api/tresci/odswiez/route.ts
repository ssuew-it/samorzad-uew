import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { TRESCI_TAG } from "@/lib/tresci/arkusz";

/**
 * Odświeżenie treści strony po edycji arkusza „Treści strony”.
 *
 * Woła to skrypt Apps Script przypięty do arkusza (docs/apps-script/Tresci.gs)
 * - po każdej zmianie, z kilkusekundowym opóźnieniem, żeby seria edycji dała
 * jedno odświeżenie. `expire: 0` unieważnia dane od razu: następna wizyta
 * na stronie pobiera świeży arkusz zamiast pokazywać starą wersję.
 *
 * Sekret (TRESCI_SECRET) musi być ten sam w Vercelu i w skrypcie. Bez niego
 * każdy, kto zna adres, mógłby co chwilę zmuszać stronę do pobierania arkusza.
 */
export async function POST(request: Request) {
  const expected = process.env.TRESCI_SECRET;
  if (!expected) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  let secret = "";
  try {
    const body = (await request.json()) as { secret?: unknown };
    secret = typeof body.secret === "string" ? body.secret : "";
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const a = Buffer.from(secret);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  revalidateTag(TRESCI_TAG, { expire: 0 });
  return NextResponse.json({ ok: true, refreshedAt: new Date().toISOString() });
}
