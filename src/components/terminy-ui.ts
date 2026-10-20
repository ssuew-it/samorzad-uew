"use client";

import { useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toIcs, todayMidnight, type Termin, type TerminState } from "@/lib/terminy";

/** Wspólne dla listy terminów, siatki miesięcy i widgetu na podstronach. */

const noopSubscribe = () => () => {};

export function downloadIcs(list: Termin[], locale: "pl" | "en", name: string) {
  const blob = new Blob([toIcs(list, locale)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export function useToday() {
  return useSyncExternalStore(noopSubscribe, () => todayMidnight(), () => null);
}

export function useTerminFormat() {
  const locale: "pl" | "en" = useLocale() === "en" ? "en" : "pl";
  const tag = locale === "en" ? "en-GB" : "pl-PL";
  const t = useTranslations("kalendarz.terminy");
  const fmt = (date: string, opts: Intl.DateTimeFormatOptions) =>
    new Date(`${date}T12:00:00`).toLocaleDateString(tag, opts);
  const range = (tm: Termin) => {
    if (!tm.end) return fmt(tm.start, { day: "numeric", month: "long" });
    const sameMonth = tm.start.slice(0, 7) === tm.end.slice(0, 7);
    return sameMonth
      ? `${fmt(tm.start, { day: "numeric" })}-${fmt(tm.end, { day: "numeric", month: "long" })}`
      : `${fmt(tm.start, { day: "numeric", month: "short" })} - ${fmt(tm.end, { day: "numeric", month: "short" })}`;
  };
  const state = (s: TerminState) =>
    s.kind === "now"
      ? t("now", { days: s.daysLeft })
      : s.daysTo === 1
        ? t("tomorrow")
        : t("inDays", { days: s.daysTo });
  return { locale, tag, fmt, range, state };
}
