/**
 * Dane rejestru jawności (Transparentność) zebrane z arkusza „Treści strony”
 * i manifestu dokumentów: liczby do hero, liczniki w wierszach i lista
 * ostatnio opublikowanych uchwał oraz zarządzeń.
 */
import { documents } from "./documents";
import type { RussResolution } from "./russ";
import type { Zarzadzenie } from "./zarzadzenia";

export interface RecentAct {
  kind: "order" | "resolution";
  number: string;
  /** RRRR-MM-DD */
  date: string;
  title: { pl: string; en: string };
  href?: string;
}

export interface TransparencyData {
  counts: { regulations: number; orders: number; resolutions: number };
  lastOrder?: string;
  lastResolution?: string;
  recent: RecentAct[];
}

const newest = (a: { date: string }, b: { date: string }) => b.date.localeCompare(a.date);

export function buildTransparency(orders: Zarzadzenie[], resolutions: RussResolution[], recentLimit = 5): TransparencyData {
  // Regulaminy = akty z plikiem w Regulacjach, bez księgi znaku (to nie akt prawny).
  const regulations = Object.entries(documents.regulacje).filter(([key, slot]) => key !== "visual" && slot.href).length;
  const recent: RecentAct[] = [
    ...orders.map((o) => ({ kind: "order" as const, number: o.number, date: o.date, title: o.title, href: o.href })),
    ...resolutions.map((r) => ({ kind: "resolution" as const, number: r.number, date: r.date, title: r.title, href: r.href })),
  ]
    .sort(newest)
    .slice(0, recentLimit);
  return {
    counts: { regulations, orders: orders.length, resolutions: resolutions.length },
    lastOrder: [...orders].sort(newest)[0]?.date,
    lastResolution: [...resolutions].sort(newest)[0]?.date,
    recent,
  };
}
