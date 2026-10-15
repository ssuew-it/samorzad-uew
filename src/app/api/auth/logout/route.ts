import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth-core";

export const runtime = "nodejs";

/**
 * Wylogowanie — kasuje ciasteczko sesji. Tylko POST: link GET wylogowałby
 * działacza z dowolnej strony, która osadzi obrazek z tym adresem, a także
 * przy prefetchu linku przez przeglądarkę.
 */
export function POST(req: NextRequest) {
  const url = new URL(req.url);
  // Formularz z obcej strony też wyśle POST; przeglądarka zawsze dołącza
  // wtedy Origin, więc obcy Origin odrzucamy. Porównujemy sam host, bo za
  // proxy protokół w req.url bywa inny niż ten, który widzi przeglądarka.
  const origin = req.headers.get("origin");
  if (origin && hostOf(origin) !== url.host) {
    return new NextResponse(null, { status: 403 });
  }
  const locale = url.searchParams.get("locale") === "en" ? "en" : "pl";
  // 303: po POST przeglądarka ma pobrać stronę Strefy zwykłym GET.
  const res = NextResponse.redirect(new URL(`/${locale}/strefa-dzialacza`, url.origin), 303);
  res.cookies.delete(SESSION_COOKIE);
  return res;
}

function hostOf(origin: string): string | null {
  try {
    return new URL(origin).host;
  } catch {
    return null;
  }
}

export function GET() {
  return new NextResponse(null, { status: 405, headers: { Allow: "POST" } });
}
