"use client";

import { useTranslations } from "next-intl";
import { CalendarPlus } from "@phosphor-icons/react";
import { upcomingTerminy, type Termin } from "@/lib/terminy";
import { downloadIcs, useTerminFormat, useToday } from "./terminy-ui";
import styles from "./TerminWidget.module.css";

/**
 * Najbliższy termin przypięty do podstrony (np. wnioski z funduszu na
 * Stypendiach). Strona przekazuje wszystkie terminy z kolumną „link na
 * stronie” równą jej adresowi - widget sam wybiera najbliższy. Gdy w
 * arkuszu przybędzie wiersz na kolejny rok, widget przełączy się bez
 * zmiany w kodzie. Po ostatnim terminie znika.
 */
export function TerminWidget({ terminy }: { terminy: Termin[] }) {
  const t = useTranslations("kalendarz.terminy");
  const today = useToday();
  const { locale, range, state } = useTerminFormat();

  const next =
    today === null
      ? { termin: [...terminy].sort((a, b) => a.start.localeCompare(b.start))[0], state: null }
      : upcomingTerminy(terminy, today, { limit: 1 })[0];
  if (!next?.termin) return null;
  const { termin, state: s } = next;

  return (
    <div className={styles.widget} data-now={s?.kind === "now" || undefined}>
      <div className="min-w-0">
        <p className={styles.label}>{termin.title[locale]}</p>
        <p className={styles.date}>
          <time dateTime={termin.end ?? termin.start}>{range(termin)}</time>
          {s && <span className={styles.state}>{state(s)}</span>}
        </p>
      </div>
      <button
        type="button"
        onClick={() => downloadIcs([termin], locale, termin.id)}
        className={styles.button}
      >
        <CalendarPlus size={18} aria-hidden="true" />
        {t("addOneShort")}
      </button>
    </div>
  );
}
