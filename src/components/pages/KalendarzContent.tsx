"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowSquareOut, ArrowUpRight, FacebookLogo, InstagramLogo } from "@phosphor-icons/react";
import { ScrollReveal } from "../ScrollReveal";
import { universityCalendarEmbedUrl } from "@/lib/calendar";
import { yearPosition } from "@/lib/academic";
import styles from "./KalendarzContent.module.css";

interface RawEvent {
  name: string;
  date: string;
  tag: string;
}

const channels = [
  { key: "facebook", icon: FacebookLogo, href: "https://www.facebook.com/samorzad.ue/events" },
  { key: "instagram", icon: InstagramLogo, href: "https://www.instagram.com/samorzad.ue" },
] as const;

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

function DateLeaf() {
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
          <span>
            {date
              ? date.toLocaleDateString(tag, { month: "long", year: "numeric" })
              : " "}
          </span>
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
              <span className={`${styles.weekday} block`}>
                {date.toLocaleDateString(tag, { weekday: "long" })}
              </span>
            </time>
          ) : (
            <span className="invisible block" aria-hidden="true">
              <span className={`${styles.day} block`}>00</span>
              <span className={`${styles.weekday} block`}>&nbsp;</span>
            </span>
          )}
          <p className={styles.position}>
            {pos
              ? pos.kind === "week"
                ? t("weekOfYear", { week: pos.value })
                : t("daysToStart", { days: pos.days })
              : " "}
          </p>
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

export function KalendarzContent() {
  const t = useTranslations("kalendarz");
  const tc = useTranslations("common");
  const locale = useLocale();
  const tag = locale === "en" ? "en-GB" : "pl-PL";
  const [events, setEvents] = useState<ReturnType<typeof upcoming>>([]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/events", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("events"))))
      .then((data: { events?: RawEvent[] }) => setEvents(upcoming(data.events ?? [])))
      // Bez arkusza wydarzeń zostaje informacja, gdzie je ogłaszamy. Żadnych dat z sufitu.
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  return (
    <>
      <section className="section-padding" aria-labelledby="kalendarz-events-heading">
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[minmax(280px,4fr)_8fr] lg:gap-16">
          <div className="max-w-[360px] lg:sticky lg:top-28 lg:self-start">
            <DateLeaf />
          </div>

          <div>
            <h2
              id="kalendarz-events-heading"
              className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
            >
              {t("eventsHeading")}
            </h2>
            {events.length > 0 ? (
              <>
                <p className="mt-3 text-[1.0625rem] leading-[1.7] text-ink-secondary">{t("eventsLead")}</p>
                <ul className={`${styles.events} mt-8`}>
                  {events.map((e) => {
                    const d = new Date(e.ts);
                    return (
                      <li key={`${e.date}-${e.name}`} className={styles.event}>
                        <time dateTime={e.date} className={styles.eventDate}>
                          <span className={styles.eventDay}>{d.getDate()}</span>
                          <span className={styles.eventMonth}>
                            {d.toLocaleDateString(tag, { month: "short" })}
                          </span>
                        </time>
                        <div className="min-w-0">
                          <p className="text-[1.0625rem] font-semibold leading-[1.35] text-ink-primary">{e.name}</p>
                          {e.tag && <p className="mt-1 font-mono text-[0.75rem] text-ink-secondary">{e.tag}</p>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <p className="mt-3 max-w-[56ch] text-[1.0625rem] leading-[1.7] text-ink-secondary">
                {t("emptyLead")}
              </p>
            )}

            <ScrollReveal className="mt-12">
              <h3 className="text-[1.125rem] font-semibold tracking-[-0.01em] text-ink-primary">
                {t("followHeading")}
              </h3>
              <ul className="mt-4 list-none border-t border-border-medium">
                {channels.map((c) => (
                  <li key={c.key}>
                    <a href={c.href} target="_blank" rel="noopener noreferrer" className={styles.channel}>
                      <span className={styles.channelIcon} aria-hidden="true">
                        <c.icon size={22} weight="regular" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[1rem] font-semibold text-ink-primary">
                          {t(`channels.${c.key}.title`)}
                        </span>
                        <span className="mt-0.5 block text-[0.875rem] leading-[1.5] text-ink-secondary">
                          {t(`channels.${c.key}.meta`)}
                        </span>
                        <span className="sr-only"> ({tc("newTab")})</span>
                      </span>
                      <ArrowUpRight size={20} weight="bold" aria-hidden="true" className={styles.channelArrow} />
                    </a>
                  </li>
                ))}
              </ul>
              {!universityCalendarEmbedUrl && (
                <p className="mt-6 text-[0.875rem] text-ink-secondary">{t("soon")}</p>
              )}
            </ScrollReveal>
          </div>
        </div>
      </section>

      {universityCalendarEmbedUrl && (
        <section className="section-padding pt-0" aria-labelledby="kalendarz-uni-heading">
          <ScrollReveal className="mx-auto max-w-[1200px]">
            <div className={styles.embed}>
              <div className={styles.embedBar}>
                <h2 id="kalendarz-uni-heading" className="text-[1rem] font-semibold text-ink-primary">
                  {t("uniHeading")}
                </h2>
                <a
                  href={universityCalendarEmbedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 text-[0.875rem] font-medium text-accent transition-colors hover:text-accent-dim"
                >
                  {t("openCalendar")}
                  <ArrowSquareOut size={16} weight="regular" aria-hidden="true" />
                </a>
              </div>
              <iframe
                src={universityCalendarEmbedUrl}
                title={t("frameTitle")}
                loading="lazy"
                className="block h-[640px] w-full border-0"
              />
            </div>
          </ScrollReveal>
        </section>
      )}
    </>
  );
}
