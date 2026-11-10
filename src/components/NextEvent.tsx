"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ArrowUpRight } from "@phosphor-icons/react";
import { ScrollReveal } from "./ScrollReveal";
import { SplitFlap } from "./SplitFlap";

interface RawEvent {
  name: string;
  date: string;
  tag: string;
}
type EventItem = RawEvent & { ts: number };

function nextEvent(list: RawEvent[], now: number): EventItem | null {
  const future = list
    .map((e) => ({ ...e, ts: new Date(`${e.date}T00:00:00`).getTime() }))
    .filter((e) => !Number.isNaN(e.ts) && e.ts >= now)
    .sort((a, b) => a.ts - b.ts);
  return future[0] ?? null;
}

export function NextEvent() {
  const [state, setState] = useState<{ ev: EventItem | null; days: number }>({
    ev: null,
    days: 0,
  });
  const t = useTranslations("events");
  const locale = useLocale();

  useEffect(() => {
    const ctrl = new AbortController();
    const finish = (list: RawEvent[]) => {
      const now = Date.now();
      const e = nextEvent(list, now);
      setState({ ev: e, days: e ? Math.ceil((e.ts - now) / 86_400_000) : 0 });
    };
    fetch("/api/events", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("events"))))
      .then((data: { events?: RawEvent[] }) => {
        finish(data.events ?? []);
      })
      // Bez prawdziwego źródła sekcja znika. Lepszy brak wydarzenia niż
      // efektowny licznik z wymyśloną datą.
      .catch(() => finish([]));
    return () => ctrl.abort();
  }, []);

  const { ev, days } = state;
  if (!ev) return null;

  const dateLabel = new Date(ev.ts).toLocaleDateString(locale === "en" ? "en-GB" : "pl-PL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="section-padding" aria-labelledby="event-heading">
      <div className="mx-auto max-w-[1200px]">
        <ScrollReveal>
          <p className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-accent">
            {t("label")}
          </p>
          <h2
            id="event-heading"
            className="mt-3 font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
          >
            {t("heading")}
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mt-8 overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface">
            <div className="flex items-center justify-between gap-3 bg-[#0B1322] px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.08em] text-white/70">
              <span>{t("nearest")}</span>
              <span>{ev.tag}</span>
            </div>
            <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
              <SplitFlap text={ev.name.toUpperCase()} size="lg" />
              <div className="shrink-0 sm:text-right">
                <p className="font-mono text-[0.8125rem] text-ink-secondary">{dateLabel}</p>
                <p className="mt-1 font-display text-[1.5rem] font-extrabold tracking-[-0.02em] text-accent">
                  {t("countdown", { days })}
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <a
            href="https://www.facebook.com/samorzad.ue/events"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-1.5 font-medium text-accent transition-colors hover:text-accent-dim"
          >
            {t("all")}
            <ArrowUpRight size={18} weight="regular" aria-hidden="true" />
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}
