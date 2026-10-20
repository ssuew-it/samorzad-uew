"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowSquareOut, CalendarPlus, DownloadSimple } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { upcomingTerminy, type Termin, type TerminState, type TerminyData } from "@/lib/terminy";
import { KalendarzSiatka } from "./KalendarzSiatka";
import { downloadIcs, useTerminFormat, useToday } from "./terminy-ui";
import styles from "./TerminyRoku.module.css";

/**
 * Terminy roku akademickiego na /kalendarz: pasek całego roku i lista tego,
 * co trwa albo nadchodzi. Dane przychodzą z serwera (arkusz „Treści strony”
 * albo wersja awaryjna z kodu, patrz `lib/tresci`).
 *
 * „Dziś” liczy się tylko w przeglądarce - strona jest statyczna, a dzień
 * budowania nie jest dniem wizyty. Do tego czasu lista pokazuje wszystkie
 * terminy, bez stanów „za X dni”.
 */

function at(date: string) {
  return new Date(`${date}T00:00:00`).getTime();
}


/**
 * Rok akademicki do pokazania: od września liczymy już nowy (wtedy student
 * patrzy na nadchodzący rok, nie na miniony). Bez daty z przeglądarki -
 * rok najwcześniejszego terminu z danych.
 */
function academicYear(today: number | null, terminy: Termin[]): number {
  if (today !== null) {
    const d = new Date(today);
    return d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1;
  }
  const first = terminy.map((t) => t.start).sort()[0];
  const d = first ? new Date(at(first)) : new Date();
  return d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1;
}

export function TerminyRoku({ data }: { data: TerminyData }) {
  const t = useTranslations("kalendarz.terminy");
  const today = useToday();
  const { locale, fmt, range, state } = useTerminFormat();
  const [withAudience, setWithAudience] = useState(false);
  const toggleId = useId();
  const year = academicYear(today, data.terminy);

  const visible = data.terminy.filter((tm) => withAudience || !tm.audience);
  const items =
    today === null
      ? [...visible].sort((a, b) => a.start.localeCompare(b.start)).map((termin) => ({ termin, state: null as TerminState | null }))
      : upcomingTerminy(data.terminy, today, { includeAudience: withAudience });
  const swaps = [...(today === null ? data.zamiany : data.zamiany.filter((z) => at(z.date) >= today))].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  // Źródła tylko tych terminów, które są na liście - bez powtórzeń.
  const sources = [...new Map(items.map(({ termin }) => [termin.source.label.pl, termin.source])).values()];

  return (
    <section className="section-padding" aria-labelledby="terminy-heading">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <h2
              id="terminy-heading"
              className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
            >
              {t("heading", { year: `${year}/${year + 1}` })}
            </h2>
            <p className="mt-3 max-w-[60ch] text-[1.0625rem] leading-[1.7] text-ink-secondary">{t("lead")}</p>
          </div>
          <button
            type="button"
            onClick={() => downloadIcs(visible, locale, `terminy-uew-${year}-${year + 1}`)}
            className={styles.allButton}
          >
            <DownloadSimple size={18} weight="bold" aria-hidden="true" />
            {t("downloadAll")}
          </button>
        </div>

        <KalendarzSiatka terminy={visible} zamiany={data.zamiany} year={year} today={today} />

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
            {items.length > 0 ? (
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
            ) : (
              <p className="mt-4 text-[0.9375rem] text-ink-secondary">{t("empty")}</p>
            )}
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
                    <dd>
                      {z.week
                        ? t("swapAs", { day: t(`weekday.${z.weekday}`), week: z.week })
                        : t("swapAsNoWeek", { day: t(`weekday.${z.weekday}`) })}
                    </dd>
                  </div>
                ))}
              </dl>
            </aside>
          )}
        </div>

        {sources.length > 0 && (
          <p className="mt-10 text-[0.8125rem] leading-[1.6] text-ink-secondary">
            {t("sourceLabel")}{" "}
            {sources.map((src, i) => (
              <span key={src.label.pl}>
                {i > 0 && "; "}
                {src.href ? (
                  <a href={src.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-accent underline underline-offset-4">
                    {src.label[locale]}
                    <ArrowSquareOut size={14} aria-hidden="true" />
                  </a>
                ) : (
                  src.label[locale]
                )}
              </span>
            ))}
            {". "}
            {t("inclusive")}
          </p>
        )}
      </div>
    </section>
  );
}
