"use client";

import { useId, useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowSquareOut, CalendarPlus, DownloadSimple } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import {
  TERMINY_SOURCES,
  terminy,
  toIcs,
  todayMidnight,
  upcomingTerminy,
  zamianyDni,
  type Termin,
  type TerminState,
} from "@/lib/terminy";
import styles from "./TerminyRoku.module.css";

/**
 * Terminy roku akademickiego na /kalendarz: pasek całego roku i lista tego,
 * co trwa albo nadchodzi. Dane: `lib/terminy.ts` (harmonogram z BIP).
 *
 * „Dziś” liczy się tylko w przeglądarce - strona jest statyczna, a dzień
 * budowania nie jest dniem wizyty. Do tego czasu lista pokazuje wszystkie
 * terminy roku, bez stanów „za X dni”.
 */

const noopSubscribe = () => () => {};
const YEAR_START = "2026-10-01";
const YEAR_END = "2027-07-31";

function at(date: string) {
  return new Date(`${date}T00:00:00`).getTime();
}

function pct(date: string) {
  const s = at(YEAR_START);
  return ((at(date) - s) / (at(YEAR_END) - s)) * 100;
}

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

function YearBar({ today }: { today: number | null }) {
  const t = useTranslations("kalendarz.terminy");
  const { fmt } = useTerminFormat();
  const general = terminy.filter((tm) => !tm.audience && tm.kind !== "uroczystosc" && tm.kind !== "wniosek");
  const months = ["2026-10-01", "2026-11-01", "2026-12-01", "2027-01-01", "2027-02-01", "2027-03-01", "2027-04-01", "2027-05-01", "2027-06-01", "2027-07-01"];
  const todayPct = today === null ? null : ((today - at(YEAR_START)) / (at(YEAR_END) - at(YEAR_START))) * 100;
  const showToday = todayPct !== null && todayPct >= 0 && todayPct <= 100;

  return (
    <div className={styles.bar} aria-hidden="true">
      <div className={styles.track}>
        {general.map((tm) => {
          const left = pct(tm.start);
          const width = Math.max(pct(tm.end ?? tm.start) - left + 0.35, 0.35);
          return (
            <span
              key={tm.id}
              className={styles.segment}
              data-kind={tm.kind}
              style={{ left: `${left}%`, width: `${width}%` }}
            />
          );
        })}
        {showToday && (
          <span className={styles.today} style={{ left: `${todayPct}%` }}>
            <span>{t("today")}</span>
          </span>
        )}
      </div>
      <ol className={styles.months}>
        {months.map((m) => (
          <li key={m} style={{ left: `${pct(m)}%` }}>
            {fmt(m, { month: "short" })}
          </li>
        ))}
      </ol>
      <ul className={styles.legend}>
        {(["zajecia", "sesja", "poprawka", "przerwa", "wolne"] as const).map((k) => (
          <li key={k}>
            <span className={styles.swatch} data-kind={k} />
            {t(`kinds.${k}`)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TerminyRoku() {
  const t = useTranslations("kalendarz.terminy");
  const today = useToday();
  const { locale, fmt, range, state } = useTerminFormat();
  const [withAudience, setWithAudience] = useState(false);
  const toggleId = useId();

  const items =
    today === null
      ? terminy.filter((tm) => withAudience || !tm.audience).map((termin) => ({ termin, state: null as TerminState | null }))
      : upcomingTerminy(today, { includeAudience: withAudience });
  const swaps = today === null ? zamianyDni : zamianyDni.filter((z) => at(z.date) >= today);

  return (
    <section className="section-padding" aria-labelledby="terminy-heading">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <h2
              id="terminy-heading"
              className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
            >
              {t("heading")}
            </h2>
            <p className="mt-3 max-w-[60ch] text-[1.0625rem] leading-[1.7] text-ink-secondary">{t("lead")}</p>
          </div>
          <button
            type="button"
            onClick={() => downloadIcs(terminy.filter((tm) => withAudience || !tm.audience), locale, "terminy-uew-2026-2027")}
            className={styles.allButton}
          >
            <DownloadSimple size={18} weight="bold" aria-hidden="true" />
            {t("downloadAll")}
          </button>
        </div>

        <YearBar today={today} />

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-[1.125rem] font-semibold tracking-[-0.01em] text-ink-primary">{t("listHeading")}</h3>
              <label htmlFor={toggleId} className={styles.toggle}>
                <input
                  id={toggleId}
                  type="checkbox"
                  checked={withAudience}
                  onChange={(e) => setWithAudience(e.target.checked)}
                />
                {t("withAudience")}
              </label>
            </div>
            <ul className={styles.list}>
              {items.map(({ termin, state: s }) => (
                <li key={termin.id} className={styles.row} data-now={s?.kind === "now" || undefined}>
                  <time dateTime={termin.start} className={styles.when}>
                    {range(termin)}
                  </time>
                  <div className="min-w-0">
                    <p className={styles.title}>
                      {termin.href ? <Link href={termin.href}>{termin.title[locale]}</Link> : termin.title[locale]}
                    </p>
                    {termin.audience && <p className={styles.audience}>{termin.audience[locale]}</p>}
                  </div>
                  {s && <span className={styles.state} data-kind={s.kind}>{state(s)}</span>}
                  <button
                    type="button"
                    onClick={() => downloadIcs([termin], locale, termin.id)}
                    className={styles.icsButton}
                    aria-label={t("addOne", { title: termin.title[locale] })}
                    title={t("addOneShort")}
                  >
                    <CalendarPlus size={20} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {swaps.length > 0 && (
            <aside aria-labelledby="zamiany-heading">
              <h3 id="zamiany-heading" className="text-[1.125rem] font-semibold tracking-[-0.01em] text-ink-primary">
                {t("swapsHeading")}
              </h3>
              <p className="mt-2 text-[0.9375rem] leading-[1.6] text-ink-secondary">{t("swapsLead")}</p>
              <dl className={styles.swaps}>
                {swaps.map((z) => (
                  <div key={z.date}>
                    <dt>
                      <time dateTime={z.date}>{fmt(z.date, { weekday: "short", day: "numeric", month: "long" })}</time>
                    </dt>
                    <dd>{t("swapAs", { day: t(`weekday.${z.weekday}`), week: z.week })}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          )}
        </div>

        <p className="mt-10 text-[0.8125rem] leading-[1.6] text-ink-secondary">
          {t("sourceLabel")}{" "}
          <a href={TERMINY_SOURCES.harmonogram.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-accent underline underline-offset-4">
            {TERMINY_SOURCES.harmonogram.label[locale]}
            <ArrowSquareOut size={14} aria-hidden="true" />
          </a>
          {". "}
          {t("inclusive")}
        </p>
      </div>
    </section>
  );
}
