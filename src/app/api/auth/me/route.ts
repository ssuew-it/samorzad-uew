import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE_S, shouldRefresh, signSession, verifyToken } from "@/lib/auth-core";
import { getAccessFor, type MeResponse } from "@/lib/access";
import { readRolesStore } from "@/lib/roles-store";

export const runtime = "nodejs";

/**
 * Stan konta dla nawigacji (zalogowany? imię, zdjęcie, role) i przy okazji
 * przedłużenie sesji 14-dniowej - ten endpoint woła się przy każdym wejściu
 * na stronę, więc to naturalne miejsce na odświeżenie ciasteczka.
 *
 * `req.cookies` (NextRequest) zamiast `cookies()` z `next/headers` - łatwiej
 * testować bez mockowania Next, tak jak w callbacku.
 */
export async function GET(req: NextRequest) {
  const noStore = { "Cache-Control": "no-store" };

  // Gość bez ciasteczka to zwykły stan, nie błąd: 401 przeglądarka wypisuje
  // w konsoli jako błąd sieci na KAŻDEJ publicznej stronie (Lighthouse
  // „errors-in-console”). 204 mówi „nikt nie jest zalogowany” bez czerwieni.
  // Zły albo wygasły token i blokada dalej dostają 401 - tam coś jest nie tak.
  const raw = req.cookies.get(SESSION_COOKIE)?.value;
  if (!raw) {
    return new NextResponse(null, { status: 204, headers: noStore });
  }

  const session = await verifyToken(raw);
  if (!session) {
    return NextResponse.json({}, { status: 401, headers: noStore });
  }

  const read = await readRolesStore();
  const access = getAccessFor(session, read, new Date());

  if (access === "blocked") {
    const res = NextResponse.json({}, { status: 401, headers: noStore });
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }
  if (access === null) {
    // Sesja jest poprawna, ale magazyn ról padł - nie wiemy, czy to konto ma
    // dostęp, więc nie odmawiamy go na trwałe (ciasteczko zostaje), tylko
    // sygnalizujemy chwilową awarię.
    return NextResponse.json({}, { status: 503, headers: noStore });
  }

  const body: MeResponse = {
    name: session.name,
    email: session.email,
    picture: session.picture,
    isSuperadmin: access.isSuperadmin,
    roles: access.roles,
  };
  const res = NextResponse.json(body, { status: 200, headers: noStore });

  if (shouldRefresh(session, Date.now())) {
    const token = await signSession({ email: session.email, name: session.name, picture: session.picture });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: req.nextUrl.protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_S,
    });
  }

  return res;
}
