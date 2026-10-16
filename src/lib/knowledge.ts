/**
 * Wyszukiwanie po TREŚCI strony (nie tylko po tytułach). Korzysta z tłumaczeń,
 * które next-intl i tak ładuje do przeglądarki — bez pobierania indeksu.
 *
 * Ten moduł jest też fundamentem pod przyszłego asystenta AI: buduje korpus
 * i mapowanie fragment → źródłowa sekcja.
 */

export interface Passage {
  text: string;
  namespace: string;
  href: string;
  label: string;
}

export interface Hit {
  passage: Passage;
  score: number;
  /** Indeks pierwszego trafienia w znormalizowanym tekście (do podświetlenia). */
  index: number;
}

/**
 * Namespace i18n → dokąd prowadzi jego treść. Bez wpisu = nie indeksujemy.
 * Eksportowane też dla `src/lib/corpus.ts` (korpus asystenta AI) — jedno
 * źródło prawdy dla obu.
 */
export const NAMESPACE_ROUTES: Record<string, { href: string; label: string }> = {
  stypendia: { href: "/stypendia", label: "Stypendia i wsparcie" },
  stypRektora: { href: "/stypendia#rektora", label: "Stypendium Rektora" },
  stypSocjalne: { href: "/stypendia#socjalne", label: "Stypendium socjalne" },
  stypNiepelnosprawni: { href: "/stypendia#niepelnosprawni", label: "Stypendium dla osób z niepełnosprawnością" },
  zapomoga: { href: "/stypendia#zapomoga", label: "Zapomoga" },
  wsparcie: { href: "/stypendia#wsparcie", label: "Wsparcie materialne" },
  kalkulator: { href: "/stypendia#kalkulator", label: "Kalkulator średniej" },
  prawaStudenta: { href: "/prawa-studenta", label: "Prawa studenta" },
  prawo: { href: "/prawo-dla-studenta", label: "Prawo dla studenta" },
  rzecznik: { href: "/rzecznik-praw-studenta", label: "Rzecznik Praw Studenta" },
  dlaStudenta: { href: "/dla-studenta", label: "Strefa studenta" },
  pomoc: { href: "/pomoc-psychologiczna", label: "Pomoc psychologiczna" },
  infopacki: { href: "/infopacki", label: "Infopacki" },
  mapa: { href: "/mapa-kampusu", label: "Mapa kampusu" },
  organizacje: { href: "/organizacje-studenckie", label: "Organizacje studenckie" },
  wydawnictwo: { href: "/wydawnictwo", label: "Wydawnictwo UEW" },
  kalendarz: { href: "/kalendarz", label: "Kalendarz" },
  kontakt: { href: "/kontakt", label: "Kontakt" },
  naszaDzialalnosc: { href: "/nasza-dzialalnosc", label: "Nasza działalność" },
  struktura: { href: "/struktura-samorzadu", label: "Struktura Samorządu" },
  przewodniczacy: { href: "/zarzad", label: "Przewodniczący" },
  zarzad: { href: "/zarzad", label: "Zarząd Samorządu" },
  board: { href: "/zarzad", label: "Zarząd Samorządu" },
  filia: { href: "/filia-jelenia-gora", label: "Samorząd Filii w Jeleniej Górze" },
  russ: { href: "/rada-uczelniana-samorzadu-studentow", label: "RUSS" },
  skw: { href: "/studencka-komisja-wyborcza", label: "Komisja Wyborcza" },
  transparentnosc: { href: "/transparentnosc", label: "Transparentność" },
  regulacje: { href: "/regulacje-wewnetrzne", label: "Regulacje wewnętrzne" },
  zarzadzenia: { href: "/zarzadzenia-przewodniczacego", label: "Zarządzenia" },
  naszeProjekty: { href: "/nasze-projekty", label: "Nasze projekty" },
  rekrutacja: { href: "/rekrutacja", label: "Rekrutacja" },
  fuePsrp: { href: "/fue-i-psrp", label: "FUE i PSRP" },
  partnerzy: { href: "/partnerzy", label: "Partnerzy" },
  wspolpracuj: { href: "/wspolpracuj-z-nami", label: "Współpracuj z nami" },
  wladze: { href: "/wladze-rektorskie", label: "Władze rektorskie" },
  dziekani: { href: "/dziekan-i-prodziekani", label: "Dziekani" },
  prywatnosc: { href: "/prywatnosc", label: "Polityka prywatności" },
  deklaracja: { href: "/deklaracja-dostepnosci", label: "Deklaracja dostępności" },
};

/** Klucze techniczne — nie są treścią dla czytelnika. */
const SKIP_KEY = /^(meta|og|aria|crumb|hub|nav|label|submit|err|placeholder)/i;
const MIN_LENGTH = 40;

/** Bez ogonków, bez wielkości liter — żeby „srednia" znalazło „średnią". */
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/gi, "l")
    .toLowerCase();
}

export function buildPassages(messages: unknown): Passage[] {
  const out: Passage[] = [];
  if (!messages || typeof messages !== "object") return out;

  for (const [namespace, value] of Object.entries(messages as Record<string, unknown>)) {
    const route = NAMESPACE_ROUTES[namespace];
    if (!route) continue;
    collect(value, namespace, route, out);
  }
  return out;
}

function collect(
  node: unknown,
  namespace: string,
  route: { href: string; label: string },
  out: Passage[],
  key = "",
): void {
  if (typeof node === "string") {
    if (node.length >= MIN_LENGTH && !SKIP_KEY.test(key)) {
      out.push({ text: node, namespace, href: route.href, label: route.label });
    }
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item) => collect(item, namespace, route, out, key));
    return;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      collect(v, namespace, route, out, k);
    }
  }
}

export function searchPassages(passages: Passage[], query: string, limit = 6): Hit[] {
  const q = normalize(query.trim());
  if (q.length < 3) return [];
  const words = q.split(/\s+/).filter((w) => w.length >= 3);
  if (words.length === 0) return [];

  const hits: Hit[] = [];
  for (const passage of passages) {
    const hay = normalize(passage.text);
    const phraseAt = hay.indexOf(q);
    const matched = words.filter((w) => hay.includes(w));
    if (phraseAt === -1 && matched.length === 0) continue;

    // Fraza bije rozsypane słowa; więcej trafionych słów = wyżej.
    const score = (phraseAt >= 0 ? 100 : 0) + matched.length * 10 - passage.text.length / 1000;
    const index = phraseAt >= 0 ? phraseAt : hay.indexOf(matched[0]);
    hits.push({ passage, score, index });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Wycinek ~160 znaków wokół trafienia, do pokazania w wynikach. */
export function excerpt(text: string, index: number, radius = 80): string {
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + radius);
  return (start > 0 ? "…" : "") + text.slice(start, end).trim() + (end < text.length ? "…" : "");
}
