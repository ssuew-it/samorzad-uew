"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Breadcrumbs } from "../Breadcrumbs";
import type { TransparencyData } from "@/lib/transparency";

/**
 * Liczba, która przy pierwszym pojawieniu się na ekranie odlicza od zera do
 * wartości (ok. 0,9 s, ease-out). Wartość docelowa jest w DOM od początku
 * (SSR, czytnik ekranu), animacja tylko ją „dogania”. Przy ograniczonym
 * ruchu - od razu wartość.
 */
function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || value === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / 900);
          setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        setShown(0);
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <span ref={ref} aria-hidden="true">
      {shown}
    </span>
  );
}

export function TransparentnoscHero({ counts }: { counts: TransparencyData["counts"] }) {
  const t = useTranslations("transparentnosc");
  const tc = useTranslations("common");
  const stats = [
    { key: "regulations", value: counts.regulations },
    { key: "orders", value: counts.orders },
    { key: "resolutions", value: counts.resolutions },
  ] as const;

  return (
    <section className="border-b border-border-medium bg-bg-surface px-6 pb-12 pt-28 md:pb-16 md:pt-32" aria-labelledby="transparency-title">
      <div className="mx-auto max-w-[1120px]">
        <Breadcrumbs items={[{ label: tc("home"), href: "/" }, { label: t("metaTitle") }]} />
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:items-end lg:gap-16">
          <div>
            <h1 id="transparency-title" className="break-words font-display text-[clamp(2rem,5.5vw,4.5rem)] font-semibold leading-[1.08] tracking-[-0.03em]">{t("heroTitle")}</h1>
            <p className="mt-6 max-w-[65ch] text-pretty text-lg leading-relaxed text-ink-secondary">{t("heroLead")}</p>
            <nav aria-label={t("sectionNav")} className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              <a href="#rejestr" className="inline-flex min-h-12 items-center gap-3 text-ink-primary underline decoration-1 underline-offset-4">{t("heroRegistryCta")}<ArrowDown size={18} aria-hidden="true" /></a>
            </nav>
          </div>
          {/* Trzy liczby rejestru: regulaminy, zarządzenia, uchwały. */}
          <dl className="grid grid-cols-3 border-y border-border-medium">
            {stats.map((s, i) => (
              <div key={s.key} className={`flex flex-col-reverse justify-end py-5 ${i > 0 ? "border-l border-border-medium pl-5" : "pr-5"}`}>
                <dt className="mt-1 text-[0.8125rem] leading-[1.35] text-ink-secondary">{t(`heroStats.${s.key}`, { count: s.value })}</dt>
                <dd className="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-none tracking-[-0.04em] text-accent tabular-nums">
                  <span className="sr-only">{s.value}</span>
                  <CountUp value={s.value} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
