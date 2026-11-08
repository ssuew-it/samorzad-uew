/**
 * Rejestr zarządzeń w Strefie Działacza: zarządzenia Wiceprzewodniczących,
 * Członków Zarządu i Zarządu (zakładka „Zarządzenia wewnętrzne” w arkuszu
 * „Treści strony”) razem z zarządzeniami Przewodniczącego.
 *
 * Stan („uchylone”, „zmienione”) nie jest wpisywany ręcznie - wynika
 * z kolumn „Uchyla” i „Zmienia” nowszych zarządzeń. Numer, którego nie ma
 * w arkuszu, jest błędem wiersza: nie wolno po cichu oznaczyć czegoś jako
 * uchylonego przez literówkę.
 *
 * Bez "server-only": typy i id do linków używa też lista po stronie klienta.
 */
import type { Zarzadzenie } from "./zarzadzenia";
import type { RowError } from "./tresci/parse-terminy";

export type GrupaWydajacego = "przewodniczacy" | "wiceprzewodniczacy" | "czlonek" | "zarzad";

/** Wiersz zakładki „Zarządzenia wewnętrzne” po odczycie. */
export interface ZarzadzenieWewn {
  line: number;
  number: string;
  /** RRRR-MM-DD */
  date: string;
  title: string;
  /** Funkcja wydającego, np. „Wiceprzewodniczący ds. Public Relations”. */
  issuer: string;
  group: GrupaWydajacego | null;
  href?: string;
  /** Numery z kolumn „Uchyla” i „Zmienia” - tak, jak je wpisano. */
  repeals: string[];
  amends: string[];
}

/** Pozycja rejestru w Strefie, ze stanem wyliczonym z odnośników. */
export interface PozycjaRejestru {
  /** Kotwica do linku (#z-01-zrz-sido-2026-2027). */
  id: string;
  number: string;
  date: string;
  title: string;
  issuer: string;
  group: GrupaWydajacego | null;
  href?: string;
  /** Numery w brzmieniu z wiersza docelowego - tak je pokazujemy i po nich linkujemy. */
  repeals: string[];
  amends: string[];
  repealedBy: string[];
  amendedBy: string[];
}

export function grupaWydajacego(issuer: string): GrupaWydajacego | null {
  const w = issuer.trim().toLowerCase();
  if (w.startsWith("wiceprzewodnicz")) return "wiceprzewodniczacy";
  if (w.startsWith("przewodnicz")) return "przewodniczacy";
  if (w.startsWith("członek zarządu") || w.startsWith("członkini zarządu")) return "czlonek";
  if (w === "zarząd") return "zarzad";
  return null;
}

/** Klucz porównania numerów: bez spacji i wielkimi literami. */
export function kluczNumeru(n: string): string {
  return n.replace(/\s+/g, "").toUpperCase();
}

export function idZarzadzenia(n: string): string {
  const slug = kluczNumeru(n)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `z-${slug}`;
}

export function zbudujRejestr(
  wewn: ZarzadzenieWewn[],
  przewodniczacego: Zarzadzenie[],
): { items: PozycjaRejestru[]; errors: RowError[] } {
  const errors: RowError[] = [];
  const poKluczu = new Map<string, { pozycja: PozycjaRejestru; line?: number }>();
  // Kotwica linku musi być jedna na zarządzenie: „01/X/2026-2027” i „01/X/2026/2027”
  // to różne klucze, ale ta sama kotwica - traktujemy je jak powtórkę.
  const poId = new Map<string, { line?: number }>();

  const nowa = (z: Omit<PozycjaRejestru, "id" | "repeals" | "amends" | "repealedBy" | "amendedBy">): PozycjaRejestru => ({
    ...z,
    id: idZarzadzenia(z.number),
    repeals: [],
    amends: [],
    repealedBy: [],
    amendedBy: [],
  });

  for (const p of przewodniczacego) {
    poId.set(idZarzadzenia(p.number), {});
    poKluczu.set(kluczNumeru(p.number), {
      pozycja: nowa({
        number: p.number,
        date: p.date,
        title: p.title.pl,
        issuer: "Przewodniczący",
        group: "przewodniczacy",
        ...(p.href ? { href: p.href } : {}),
      }),
    });
  }

  const zrodla: ZarzadzenieWewn[] = [];
  for (const w of wewn) {
    const klucz = kluczNumeru(w.number);
    const juz = poKluczu.get(klucz) ?? poId.get(idZarzadzenia(w.number));
    if (juz) {
      const gdzie = juz.line ? `w wierszu ${juz.line}` : "w zakładce „Zarządzenia”";
      errors.push({ line: w.line, message: `numer ${w.number} jest już ${gdzie} - każde zarządzenie wpisz raz` });
      continue;
    }
    poId.set(idZarzadzenia(w.number), { line: w.line });
    poKluczu.set(klucz, {
      pozycja: nowa({
        number: w.number,
        date: w.date,
        title: w.title,
        issuer: w.issuer,
        group: w.group,
        ...(w.href ? { href: w.href } : {}),
      }),
      line: w.line,
    });
    zrodla.push(w);
  }

  // Odnośniki dopiero po zebraniu wszystkich numerów - nowsze zarządzenie
  // może stać w arkuszu nad tym, które uchyla.
  for (const w of zrodla) {
    const ja = poKluczu.get(kluczNumeru(w.number))!.pozycja;
    const powiaz = (numery: string[], kolumna: string, moje: "repeals" | "amends", ich: "repealedBy" | "amendedBy") => {
      for (const n of numery) {
        const cel = poKluczu.get(kluczNumeru(n));
        if (!cel) {
          errors.push({ line: w.line, message: `w „${kolumna}” jest numer ${n.trim()}, a takiego zarządzenia nie ma w arkuszu - popraw numer` });
          continue;
        }
        if (cel.pozycja === ja) {
          errors.push({ line: w.line, message: `zarządzenie ${w.number} wskazuje w „${kolumna}” samo siebie - wpisz numer innego zarządzenia` });
          continue;
        }
        ja[moje].push(cel.pozycja.number);
        cel.pozycja[ich].push(ja.number);
      }
    };
    powiaz(w.repeals, "Uchyla", "repeals", "repealedBy");
    powiaz(w.amends, "Zmienia", "amends", "amendedBy");
  }

  const items = [...poKluczu.values()]
    .map((v) => v.pozycja)
    .sort((a, b) => b.date.localeCompare(a.date) || b.number.localeCompare(a.number, "pl", { numeric: true }));
  return { items, errors };
}
