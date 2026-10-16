"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CaretUp, CaretDown } from "@phosphor-icons/react";
import { Marquee } from "./Marquee";

/**
 * Ticker walut z publicznego API NBP (api.nbp.pl) — sygnatura „uczelnia
 * ekonomiczna". Client-side, bez backendu/klucza; przy błędzie znika cicho.
 */
const WANTED = ["EUR", "USD", "GBP", "CHF", "CNY", "JPY"];

interface Rate {
  code: string;
  value: number;
  up: boolean | null;
}

interface NbpTable {
  rates: Array<{ code: string; mid: number }>;
}

export function EconTicker() {
  const [rates, setRates] = useState<Rate[] | null>(null);
  const t = useTranslations("econ");
  const locale = useLocale();

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("https://api.nbp.pl/api/exchangerates/tables/A/last/2?format=json", {
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? (r.json() as Promise<NbpTable[]>) : Promise.reject(new Error("nbp"))))
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const curr = data[data.length - 1];
        const prev = data[0];
        const prevMid = new Map(prev.rates.map((r) => [r.code, r.mid] as const));
        setRates(
          curr.rates
            .filter((r) => WANTED.includes(r.code))
            .sort((a, b) => WANTED.indexOf(a.code) - WANTED.indexOf(b.code))
            .map((r) => ({
              code: r.code,
              value: r.mid,
              up: prevMid.has(r.code) ? r.mid >= (prevMid.get(r.code) as number) : null,
            })),
        );
      })
      .catch(() => {
        /* cicho — sekcja się nie renderuje */
      });
    return () => ctrl.abort();
  }, []);

  if (!rates || rates.length === 0) return null;

  return (
    <section aria-label={t("srHeading")} className="border-y border-border-subtle bg-bg-surface">
      <div className="mx-auto flex max-w-[1200px] items-stretch">
        <span className="flex shrink-0 items-center border-r border-border-subtle bg-accent px-4 font-mono text-[10px] uppercase tracking-[0.12em] text-bg-base">
          {t("label")}
        </span>
        <div className="min-w-0 flex-1 py-2.5">
          <Marquee speed={28}>
            {rates.map((r) => (
              <span
                key={r.code}
                className="mx-5 inline-flex items-center gap-1.5 font-mono text-[12px] text-ink-secondary"
              >
                <span className="text-ink-primary">{r.code}/PLN</span>
                <span className="tabular-nums">{r.value.toFixed(4)}</span>
                {r.up === null ? null : r.up ? (
                  <CaretUp size={11} weight="bold" aria-hidden="true" className="text-accent" />
                ) : (
                  <CaretDown size={11} weight="bold" aria-hidden="true" className="text-ink-tertiary" />
                )}
              </span>
            ))}
          </Marquee>
        </div>
      </div>

      {/* Accessible equivalent of the aria-hidden marquee above (WCAG 1.1.1). */}
      <div className="sr-only">
        <p>{t("srHeading")}</p>
        <ul>
          {rates.map((r) => (
            <li key={r.code}>
              {t("rateLabel", {
                code: r.code,
                value: new Intl.NumberFormat(locale, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(r.value),
              })}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
