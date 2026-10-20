"use client";

import { useTranslations } from "next-intl";
import { CalendarPlus } from "@phosphor-icons/react";
import { terminById, terminState } from "@/lib/terminy";
import { downloadIcs, useTerminFormat, useToday } from "./TerminyRoku";
import styles from "./TerminWidget.module.css";

/**
 * Jeden termin wpięty w podstronę, której dotyczy (np. wnioski z funduszu
 * na Stypendiach). Ten sam rekord co na /kalendarz - data żyje w jednym
 * miejscu. Znika po terminie, zamiast pokazywać datę, która już minęła.
 */
export function TerminWidget({ id }: { id: string }) {
  const t = useTranslations("kalendarz.terminy");
  const today = useToday();
  const { locale, range, state } = useTerminFormat();
  const termin = terminById(id);
  if (!termin) return null;
  const s = today === null ? null : terminState(termin, today);
  if (today !== null && s === null) return null;

  return (
    <div className={styles.widget} data-now={s?.kind === "now" || undefined}>
      <div className="min-w-0">
        <p className={styles.label}>{t("widgetLabel")}</p>
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
