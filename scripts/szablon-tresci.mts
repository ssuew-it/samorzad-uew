/**
 * Generuje szablony zakładek arkusza „Treści strony” z danych w kodzie
 * (wersji awaryjnej), żeby nowy arkusz od razu miał komplet terminów.
 *
 *   node --experimental-strip-types scripts/szablon-tresci.mts
 *
 * Wynik: docs/szablony/tresci-terminy.csv i tresci-zamiany-dni.csv.
 * Import: Plik → Importuj → Prześlij → „Wstaw nowe arkusze”, potem nazwij
 * zakładki dokładnie „Terminy” i „Zamiany dni”.
 */
import { writeFileSync } from "node:fs";
import { TERMINY_Z_KODU, ZAMIANY_Z_KODU } from "../src/lib/terminy.ts";

const KIND_PL = { zajecia: "zajęcia", sesja: "sesja", poprawka: "poprawka", przerwa: "przerwa", wolne: "dzień wolny", wniosek: "wniosek", uroczystosc: "uroczystość" } as const;
const DAY_PL = { mon: "poniedziałek", tue: "wtorek", wed: "środa", thu: "czwartek", fri: "piątek" } as const;

const q = (v: string | undefined) => `"${(v ?? "").replace(/"/g, '""')}"`;
const csv = (rows: (string | undefined)[][]) => rows.map((r) => r.map(q).join(",")).join("\r\n") + "\r\n";

writeFileSync(
  "docs/szablony/tresci-terminy.csv",
  "\uFEFF" +
    csv([
      ["rodzaj", "tytuł", "tytuł EN", "od", "do", "dla kogo", "dla kogo EN", "źródło", "źródło EN", "link źródła", "link na stronie", "id"],
      ...TERMINY_Z_KODU.map((t) => [
        KIND_PL[t.kind], t.title.pl, t.title.en, t.start, t.end, t.audience?.pl, t.audience?.en, t.source.label.pl, t.source.label.en, t.source.href, t.href, t.id,
      ]),
    ]),
);
writeFileSync(
  "docs/szablony/tresci-zamiany-dni.csv",
  "\uFEFF" + csv([["data", "plan z dnia", "tydzień"], ...ZAMIANY_Z_KODU.map((z) => [z.date, DAY_PL[z.weekday], z.week])]),
);
console.log(`terminy: ${TERMINY_Z_KODU.length}, zamiany dni: ${ZAMIANY_Z_KODU.length}`);
