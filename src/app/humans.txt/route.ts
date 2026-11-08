import { AUTHOR } from "@/lib/credits";

/**
 * /humans.txt - standardowe miejsce na informację o twórcach serwisu
 * (humanstxt.org). Generowane przy buildzie, bez kosztu przy wejściu.
 */
export const dynamic = "force-static";

export function GET() {
  const tekst = `/* TEAM */
Projekt i wykonanie: ${AUTHOR.name}
Zamawiający: Samorząd Studentów Uniwersytetu Ekonomicznego we Wrocławiu
Kontakt: kontakt@samorzad.ue.wroc.pl

/* SITE */
Rok: ${AUTHOR.year}
Język: polski, angielski
Technologie: Next.js, TypeScript, Tailwind CSS, Vercel
`;
  return new Response(tekst, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
