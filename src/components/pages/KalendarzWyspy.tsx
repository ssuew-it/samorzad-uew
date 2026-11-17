"use client";

import { fetchEvents } from "@/lib/events-client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { yearPosition } from "@/lib/academic";
import styles from "./KalendarzContent.module.css";

/**
 * Wyspy Kalendarza: kartka z dzisiejszą datą (z przeglądarki, nie z dnia
 * budowania) i lista najbliższych wydarzeń z /api/events. Reszta strony
 * renderuje się na serwerze (KalendarzContent).
 */

interface RawEvent {
  name: string;
  nameEn?: string;
  date: string;
  time?: string;
  place?: string;
  href?: string;
  tag: string;
}

/**
 * Dzisiejsza data tylko po stronie przeglądarki. Strona jest generowana
 * statycznie, więc data z serwera byłaby dniem budowania, nie dniem wizyty.
 * Migawka to ciąg RRRR-MM-DD: stabilny przez cały dzień, bez pętli renderów.
 */
const noopSubscribe = () => () => {};
function todayStamp() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function DateLeaf() {
  const t = useTranslations("kalendarz");
  const locale = useLocale();
  const stamp = useSyncExternalStore(noopSubscribe, todayStamp, () => null);
  const tag = locale === "en" ? "en-GB" : "pl-PL";

  const date = stamp ? new Date(`${stamp}T12:00:00`) : null;
  const pos = date ? yearPosition(date) : null;

  return (
    <div className={styles.pad}>
      <div key={stamp ?? "pusto"} className={styles.sheet} data-dated={Boolean(date)}>
        <div className={styles.band}>
          <span>{date ? date.toLocaleDateString(tag, { month: "long", year: "numeric" }) : " "}</span>
          <span className={styles.holes} aria-hidden="true">
            <span />
            <span />
          </span>
        </div>
        <div className={styles.body}>
          <p className="font-mono text-[0.75rem] text-ink-secondary">{t("todayLabel")}</p>
          {date ? (
            <time dateTime={stamp ?? undefined}>
              <span className={`${styles.day} block`}>{date.getDate()}</span>
              <span className={`${styles.weekday} block`}>{date.toLocaleDateString(tag, { weekday: "long" })}</span>
            </time>
          ) : (
            <span className="invisible block" aria-hidden="true">
              <span className={`${styles.day} block`}>00</span>
              <span className={`${styles.weekday} block`}>&nbsp;</span>
            </span>
          )}
          <p className={styles.position}>{pos ? (pos.kind === "week" ? t("weekOfYear", { week: pos.value }) : t("daysToStart", { days: pos.days })) : " "}</p>
        </div>
      </div>
    </div>
  );
}

function upcoming(list: RawEvent[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return list
    .map((e) => ({ ...e, ts: new Date(`${e.date}T00:00:00`).getTime() }))
    .filter((e) => !Number.isNaN(e.ts) && e.ts >= today.getTime())
    .sort((a, b) => a.ts - b.ts)
    .slice(0, 6);
}

export function NajblizszeWydarzenia() {
  const t = useTranslations("kalendarz");
  const tc = useTranslations("common");
  const locale = useLocale();
  const tag = locale === "en" ? "en-GB" : "pl-PL";
  const [events, setEvents] = useState<ReturnType<typeof upcoming>>([]);

  useEffect(() => {
    let alive = true;
    fetchEvents<{ events?: RawEvent[] }>()
      .then((data) => alive && setEvents(upcoming(data.events ?? [])))
      // Bez arkusza wydarzeń zostaje informacja, gdzie je ogłaszamy. Żadnych dat z sufitu.
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return events.length > 0 ? (
    <>
      <p className="mt-3 text-[1.0625rem] leading-[1.7] text-ink-secondary">{t("eventsLead")}</p>
      <ul className={`${styles.events} mt-8`}>
        {events.map((e) => {
          const d = new Date(e.ts);
          return (
            <li key={`${e.date}-${e.name}`} className={styles.event}>
              <time dateTime={e.date} className={styles.eventDate}>
                <span className={styles.eventDay}>{d.getDate()}</span>
                <span className={styles.eventMonth}>{d.toLocaleDateString(tag, { month: "short" })}</span>
              </time>
              <div className="min-w-0">
                <p className="text-[1.0625rem] font-semibold leading-[1.35] text-ink-primary">
                  {e.href ? (
                    <a href={e.href} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-accent hover:underline">
                      {(locale === "en" && e.nameEn) || e.name}
                      <span className="sr-only"> ({tc("newTab")})</span>
                    </a>
                  ) : (
                    (locale === "en" && e.nameEn) || e.name
                  )}
                </p>
                {(e.time || e.place) && <p className="mt-1 text-[0.9375rem] text-ink-secondary">{[e.time, e.place].filter(Boolean).join(" · ")}</p>}
                {e.tag && <p className="mt-1 font-mono text-[0.75rem] text-ink-secondary">{e.tag}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  ) : (
    <p className="mt-3 max-w-[56ch] text-[1.0625rem] leading-[1.7] text-ink-secondary">{t("emptyLead")}</p>
  );
}
