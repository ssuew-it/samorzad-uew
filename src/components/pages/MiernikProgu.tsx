"use client";

import { useEffect, useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowRight,
  CheckCircle,
  FileText,
  Minus,
  Plus,
  WarningCircle,
} from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { DURATION, EASE } from "@/lib/motion";
import {
  MAX_PEOPLE,
  PROGI_SOCJALNE,
  classify,
  formatAmountInput,
  formatPln,
  meterFraction,
  meterMax,
  monthlyPerPerson,
  parseAmount,
  parsePeople,
  type IncomePeriod,
} from "@/lib/stypendia-progi";

const P = PROGI_SOCJALNE;
const SCALE_MAX = meterMax(P);
const THRESHOLD_PCT = meterFraction(P.threshold, SCALE_MAX) * 100;
const OPS_PCT = meterFraction(P.opsAmount, SCALE_MAX) * 100;

/**
 * Czytnik ekranu dostaje wynik dopiero, gdy student przestanie pisać.
 * Bez tego każde wciśnięcie klawisza w polu kwoty kolejkowałoby nowy komunikat.
 */
const ANNOUNCE_DELAY_MS = 700;

const inputCls =
  "h-12 w-full rounded-md border border-border-strong bg-bg-surface px-3 font-mono text-[1rem] tabular-nums text-ink-primary placeholder:text-ink-tertiary aria-[invalid=true]:border-ink-primary";

/**
 * Miernik progu stypendium socjalnego. Dusza strony /stypendia (DESIGN.md §3):
 * student sam napędza miernik swoimi danymi, a ruch wynika tylko z tego,
 * że zmienia się wynik. Nic nie jest zapisywane ani wysyłane.
 */
export function MiernikProgu() {
  const t = useTranslations("miernikProgu");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const id = useId();

  // Domyślnie rok, bo regulamin liczy sumę dochodów z całego roku poprzedzającego.
  const [period, setPeriod] = useState<IncomePeriod>("year");
  const [incomeRaw, setIncomeRaw] = useState("");
  const [peopleRaw, setPeopleRaw] = useState("");
  // Błąd formatu pokazujemy po opuszczeniu pola, żeby nie krzyczeć w trakcie pisania „1 234,”.
  const [touched, setTouched] = useState({ income: false, people: false });

  const income = parseAmount(incomeRaw);
  const people = parsePeople(peopleRaw);
  const perPerson =
    income.ok && people.ok ? monthlyPerPerson(income.value, people.value, period) : null;
  const result = perPerson === null ? null : classify(perPerson, P);

  const fmt = (n: number) => formatPln(n, locale);
  const vars = {
    threshold: fmt(P.threshold),
    ops: fmt(P.opsAmount),
    year: P.academicYear,
    incomeYear: String(P.incomeYear),
  };

  const incomeError = touched.income && !income.ok && income.error !== "empty" ? income.error : null;
  const peopleError = touched.people && !people.ok && people.error !== "empty" ? people.error : null;

  const statusTitle = result ? t(`status.${result.status}`) : "";
  const distanceText = !result
    ? ""
    : result.status === "aboveThreshold"
      ? t("distanceAbove", { amount: fmt(result.distance) })
      : result.distance === 0
        ? t("distanceExact")
        : t("distanceBelow", { amount: fmt(result.distance) });

  const valueText = result
    ? t("valueText", { value: fmt(result.perPerson), status: statusTitle, distance: distanceText })
    : t("valueTextEmpty");

  const [announced, setAnnounced] = useState("");
  const announceMessage = result ? valueText : "";
  useEffect(() => {
    const timer = setTimeout(() => setAnnounced(announceMessage), ANNOUNCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [announceMessage]);

  function changePeriod(next: IncomePeriod) {
    if (next === period) return;
    // Przeliczamy wpisaną kwotę, żeby 60 000 rocznie nie zamieniło się w 60 000 miesięcznie.
    if (income.ok) {
      const converted = next === "month" ? income.value / 12 : income.value * 12;
      setIncomeRaw(formatAmountInput(converted, locale));
    }
    setPeriod(next);
  }

  function stepPeople(delta: 1 | -1) {
    const current = people.ok ? people.value : 0;
    const next = Math.min(Math.max(current + delta, 1), MAX_PEOPLE);
    setPeopleRaw(String(next));
    setTouched((s) => ({ ...s, people: true }));
  }

  const fraction = result ? meterFraction(result.perPerson, SCALE_MAX) : 0;
  const above = result?.status === "aboveThreshold";

  const ids = {
    heading: `${id}-heading`,
    income: `${id}-income`,
    incomeHelp: `${id}-income-help`,
    incomeError: `${id}-income-error`,
    people: `${id}-people`,
    peopleHelp: `${id}-people-help`,
    peopleError: `${id}-people-error`,
    meterLabel: `${id}-meter-label`,
    meterDesc: `${id}-meter-desc`,
  };

  return (
    <div className="mt-12 rounded-xl border border-border-medium bg-bg-surface" role="group" aria-labelledby={ids.heading}>
      <div className="border-b border-border-subtle px-6 pb-6 pt-7 sm:px-8">
        <p className="font-mono text-[0.75rem] font-medium uppercase tracking-[0.08em] text-accent">
          {t("eyebrow", vars)}
        </p>
        <h3
          id={ids.heading}
          className="mt-2 text-balance font-display text-[clamp(1.375rem,2.4vw,1.75rem)] font-semibold leading-[1.2] tracking-[-0.015em] text-ink-primary"
        >
          {t("heading")}
        </h3>
        <p className="prose-constrained mt-3 text-[0.9375rem] leading-[1.7] text-ink-secondary">
          {t("lead", vars)}
        </p>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* Wejście: to student napędza miernik. */}
        <div className="flex flex-col gap-7 border-b border-border-subtle px-6 py-7 sm:px-8 lg:border-b-0 lg:border-r">
          <fieldset>
            <legend className="text-[0.875rem] font-semibold text-ink-primary">{t("periodLegend")}</legend>
            <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg border border-border-medium bg-bg-elevated p-1">
              {(["year", "month"] as const).map((p) => (
                <label
                  key={p}
                  className="relative flex min-h-11 cursor-pointer items-center justify-center rounded-md px-3 text-center text-[0.875rem] font-medium text-ink-secondary transition-colors hover:text-ink-primary has-checked:bg-bg-surface has-checked:text-ink-primary has-checked:shadow-[inset_0_0_0_1px_var(--border-medium)] has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent"
                >
                  <input
                    type="radio"
                    name={`${id}-period`}
                    value={p}
                    checked={period === p}
                    onChange={() => changePeriod(p)}
                    className="sr-only"
                  />
                  {p === "year" ? t("periodYear", vars) : t("periodMonth")}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor={ids.income} className="block text-[0.875rem] font-semibold text-ink-primary">
              {period === "year" ? t("incomeLabelYear", vars) : t("incomeLabelMonth")}
            </label>
            <p id={ids.incomeHelp} className="mt-1 text-[0.8125rem] leading-[1.55] text-ink-tertiary">
              {period === "year" ? t("incomeHelpYear", vars) : t("incomeHelpMonth", vars)}
            </p>
            <div className="relative mt-3">
              <input
                id={ids.income}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                spellCheck={false}
                value={incomeRaw}
                placeholder={period === "year" ? t("incomePlaceholderYear") : t("incomePlaceholderMonth")}
                onChange={(e) => setIncomeRaw(e.target.value)}
                onBlur={() => setTouched((s) => ({ ...s, income: true }))}
                aria-invalid={incomeError ? true : undefined}
                aria-describedby={`${ids.incomeHelp}${incomeError ? ` ${ids.incomeError}` : ""}`}
                className={`${inputCls} pr-12`}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-[0.875rem] text-ink-tertiary"
              >
                zł
              </span>
            </div>
            {incomeError && (
              <p id={ids.incomeError} className="mt-2 flex items-start gap-1.5 text-[0.8125rem] font-medium leading-[1.5] text-ink-primary">
                <WarningCircle size={16} weight="fill" className="mt-0.5 shrink-0" aria-hidden="true" />
                {t(`errors.amount.${incomeError}`)}
              </p>
            )}
          </div>

          <div>
            <label htmlFor={ids.people} className="block text-[0.875rem] font-semibold text-ink-primary">
              {t("peopleLabel")}
            </label>
            <p id={ids.peopleHelp} className="mt-1 text-[0.8125rem] leading-[1.55] text-ink-tertiary">
              {t("peopleHelp")}
            </p>
            <div className="mt-3 flex items-stretch gap-2">
              <button
                type="button"
                onClick={() => stepPeople(-1)}
                aria-label={t("peopleDecrease")}
                aria-controls={ids.people}
                className="scholarship-motion-control flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border-strong text-ink-primary transition-colors hover:bg-bg-elevated active:scale-[0.97]"
              >
                <Minus size={18} weight="bold" aria-hidden="true" />
              </button>
              <input
                id={ids.people}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={peopleRaw}
                placeholder={t("peoplePlaceholder")}
                onChange={(e) => setPeopleRaw(e.target.value)}
                onBlur={() => setTouched((s) => ({ ...s, people: true }))}
                aria-invalid={peopleError ? true : undefined}
                aria-describedby={`${ids.peopleHelp}${peopleError ? ` ${ids.peopleError}` : ""}`}
                className={`${inputCls} max-w-[7rem] text-center`}
              />
              <button
                type="button"
                onClick={() => stepPeople(1)}
                aria-label={t("peopleIncrease")}
                aria-controls={ids.people}
                className="scholarship-motion-control flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border-strong text-ink-primary transition-colors hover:bg-bg-elevated active:scale-[0.97]"
              >
                <Plus size={18} weight="bold" aria-hidden="true" />
              </button>
            </div>
            {peopleError && (
              <p id={ids.peopleError} className="mt-2 flex items-start gap-1.5 text-[0.8125rem] font-medium leading-[1.5] text-ink-primary">
                <WarningCircle size={16} weight="fill" className="mt-0.5 shrink-0" aria-hidden="true" />
                {t(`errors.people.${peopleError}`, { max: MAX_PEOPLE })}
              </p>
            )}
          </div>
        </div>

        {/* Wynik: odczyt, miernik i to, co z niego wynika. */}
        <div className="flex flex-col px-6 py-7 sm:px-8">
          <p id={ids.meterLabel} className="text-[0.875rem] font-semibold text-ink-secondary">
            {t("resultLabel")}
          </p>
          <p className="mt-2 font-mono text-[clamp(2rem,5vw,2.75rem)] font-semibold leading-none tabular-nums tracking-[-0.02em] text-ink-primary">
            {result ? (
              fmt(result.perPerson)
            ) : (
              // Pusty odczyt to tylko kształt liczby; czytnik dostaje zdanie poniżej.
              <span aria-hidden="true" className="text-ink-tertiary">
                {t("resultPlaceholder")}
              </span>
            )}
          </p>

          <div className="mt-4 min-h-[3.25rem]">
            {result ? (
              <p className="flex items-start gap-2 text-[0.9375rem] leading-[1.5] text-ink-primary">
                {above ? (
                  <WarningCircle size={22} weight="fill" className="mt-px shrink-0 text-ink-primary" aria-hidden="true" />
                ) : (
                  <CheckCircle size={22} weight="fill" className="mt-px shrink-0 text-accent" aria-hidden="true" />
                )}
                <span>
                  <strong className="font-semibold">{statusTitle}</strong>{" "}
                  <span className="text-ink-secondary">{distanceText}</span>
                </span>
              </p>
            ) : (
              <p className="text-[0.9375rem] leading-[1.6] text-ink-secondary">{t("resultEmpty")}</p>
            )}
          </div>

          {/*
            Miernik. Wypełnienie rośnie od poprzedniej wartości (scaleX, sam transform),
            znaczniki stoją w miejscu. Strefę ponad progiem zaznacza kreskowanie,
            więc przekroczenie widać także bez rozróżniania kolorów.
          */}
          <div
            role="meter"
            aria-labelledby={ids.meterLabel}
            aria-describedby={ids.meterDesc}
            aria-valuemin={0}
            aria-valuemax={SCALE_MAX}
            aria-valuenow={result ? Math.min(result.perPerson, SCALE_MAX) : 0}
            aria-valuetext={valueText}
            className="relative mt-8 pb-7 pt-7"
          >
            <span
              aria-hidden="true"
              className="absolute top-0 -translate-x-1/2 whitespace-nowrap font-mono text-[0.75rem] font-medium text-ink-primary"
              style={{ left: `${THRESHOLD_PCT}%` }}
            >
              {t("tickThreshold", { amount: fmt(P.threshold) })}
            </span>

            <div className="relative h-4 overflow-hidden rounded-[3px] bg-bg-subtle">
              <motion.div
                aria-hidden="true"
                className={`absolute inset-0 transition-colors duration-300 ${above ? "bg-ink-secondary" : "bg-accent"}`}
                style={{ originX: 0 }}
                initial={false}
                animate={{ scaleX: fraction }}
                transition={reduce ? { duration: 0 } : { duration: DURATION.draw, ease: EASE }}
              />
              <div
                aria-hidden="true"
                className="absolute inset-y-0 right-0 opacity-70"
                style={{
                  left: `${THRESHOLD_PCT}%`,
                  backgroundImage:
                    "repeating-linear-gradient(135deg, var(--bg-surface) 0 2px, transparent 2px 7px)",
                }}
              />
            </div>

            {[
              { pct: OPS_PCT, strong: false },
              { pct: THRESHOLD_PCT, strong: true },
            ].map((tick) => (
              <span
                key={tick.pct}
                aria-hidden="true"
                className={`absolute top-[1.375rem] h-7 -translate-x-1/2 ${tick.strong ? "w-[2px] bg-ink-primary" : "w-px bg-ink-secondary"}`}
                style={{ left: `${tick.pct}%` }}
              />
            ))}

            <span
              aria-hidden="true"
              className="absolute bottom-0 -translate-x-1/2 whitespace-nowrap font-mono text-[0.75rem] text-ink-secondary"
              style={{ left: `${OPS_PCT}%` }}
            >
              {t("tickOps", { amount: fmt(P.opsAmount) })}
            </span>
            <span aria-hidden="true" className="absolute bottom-0 left-0 font-mono text-[0.75rem] text-ink-tertiary">
              0
            </span>
            <span aria-hidden="true" className="absolute bottom-0 right-0 font-mono text-[0.75rem] text-ink-tertiary">
              {fmt(SCALE_MAX)}
            </span>
            <p id={ids.meterDesc} className="sr-only">
              {t("meterDescription", vars)}
            </p>
          </div>

          <p className="sr-only" aria-live="polite">
            {announced}
          </p>

          {result?.status === "belowOps" && (
            <div className="mt-7 flex gap-3 rounded-lg border border-border-medium bg-bg-elevated p-4">
              <FileText size={20} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              <div>
                <p className="text-[0.875rem] font-semibold text-ink-primary">{t("opsNote.title", vars)}</p>
                <p className="mt-1 text-[0.8125rem] leading-[1.6] text-ink-secondary">{t("opsNote.body")}</p>
              </div>
            </div>
          )}

          {above && (
            <div className="mt-7">
              <p className="text-[0.875rem] leading-[1.6] text-ink-primary">{t("above.lead")}</p>
              <ul className="mt-3 border-y border-border-medium">
                {(["zapomoga", "rektora", "rzecznik"] as const).map((key) => {
                  const inner = (
                    <>
                      <span>
                        <span className="block text-[0.9375rem] font-semibold text-ink-primary transition-colors group-hover:text-accent">
                          {t(`above.links.${key}.title`)}
                        </span>
                        <span className="mt-0.5 block text-[0.8125rem] leading-[1.5] text-ink-secondary">
                          {t(`above.links.${key}.desc`)}
                        </span>
                      </span>
                      <ArrowRight
                        size={18}
                        aria-hidden="true"
                        className="shrink-0 text-ink-tertiary transition-[color,transform] duration-200 group-hover:translate-x-1 group-hover:text-accent"
                      />
                    </>
                  );
                  const cls =
                    "scholarship-motion-control group flex min-h-14 items-center justify-between gap-4 py-3";
                  return (
                    <li key={key} className="border-b border-border-subtle last:border-b-0">
                      {key === "rzecznik" ? (
                        <Link href="/rzecznik-praw-studenta" className={cls}>
                          {inner}
                        </Link>
                      ) : (
                        <a href={`#${key}`} className={cls}>
                          {inner}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-[0.8125rem] leading-[1.6] text-ink-secondary">{t("above.lostIncome", vars)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Kontekst, który zmienia wynik, i granice tego narzędzia. */}
      <div className="grid gap-6 border-t border-border-subtle px-6 py-6 sm:px-8 lg:grid-cols-2 lg:gap-10">
        <div>
          <p className="text-[0.875rem] font-semibold text-ink-primary">{t("independence.title")}</p>
          <p className="mt-1 text-[0.8125rem] leading-[1.6] text-ink-secondary">
            {t("independence.body", { amount: fmt(P.independence) })}
          </p>
        </div>
        <div className="text-[0.8125rem] leading-[1.6] text-ink-tertiary">
          <p className="text-ink-secondary">{t("disclaimer")}</p>
          <p className="mt-2">{t("source", { source: P.source, year: P.academicYear })}</p>
          <p className="mt-2">{t("privacy")}</p>
        </div>
      </div>
    </div>
  );
}
