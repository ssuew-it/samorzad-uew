"use client";

import { useId, useMemo, useState } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { ArrowSquareOut, MagnifyingGlass, X } from "@phosphor-icons/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { ScrollReveal } from "../ScrollReveal";
import { Duty, EmailLink, Portrait, useNow } from "../people/OfficeHours";
import { dean, viceDeans } from "@/lib/people";
import { deanOfficeSources } from "@/lib/living-documents";
import { type DutyPerson, type Dyzur } from "@/lib/dyzury";
import { foldProgramme, programmeMatches } from "@/lib/programmes";

const EASE = [0.16, 1, 0.3, 1] as const;

export function DziekaniContent({ dyzury }: { dyzury: Dyzur[] }) {
  const reduce = useReducedMotion();
  const t = useTranslations("dziekani");
  const tc = useTranslations("common");
  const now = useNow();
  const slotsOf = (person: DutyPerson) => dyzury.filter((d) => d.person === person);

  // - Wyszukiwarka kierunku -
  const [query, setQuery] = useState("");
  const inputId = useId();
  const statusId = useId();
  const programmes = useMemo(
    () => viceDeans.flatMap((p) => (t.raw(`kierunki.${p.key}`) as string[]).map((programme) => ({ key: p.key, name: p.name, programme }))),
    [t],
  );
  const active = foldProgramme(query).length >= 2;
  const matches = useMemo(() => {
    if (!active) return [];
    // Pełna nazwa wybiera jeden kierunek, nawet gdy jest fragmentem innych
    // („Zarządzanie” vs „Zarządzanie projektami”).
    const exact = programmes.filter((p) => foldProgramme(p.programme) === foldProgramme(query));
    return exact.length ? exact : programmes.filter((p) => programmeMatches(p.programme, query));
  }, [active, programmes, query]);
  const matchedKeys = new Set(matches.map((m) => m.key));
  const single = matches.length === 1 ? matches[0] : null;

  const finderStatus = !active
    ? t("finder.hint")
    : single
      ? t("finder.resultOne", { programme: single.programme, name: single.name })
      : matches.length
        ? t("finder.resultMany", { count: matches.length })
        : t("finder.none");

  return (
    <section className="section-padding" aria-labelledby="dziekani-heading">
      <div className="mx-auto max-w-[1200px]">
        <ScrollReveal>
          <h2
            id="dziekani-heading"
            className="max-w-[26ch] text-balance font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
          >
            {t("heading")}
          </h2>
          <p className="prose-constrained mt-4 text-pretty text-[1.0625rem] leading-[1.75] text-ink-secondary">{t("intro")}</p>
        </ScrollReveal>

        {/* Dziekan - bez kierunków; rozstrzyga sprawy z zamkniętej listy. */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={reduce ? { duration: 0 } : { duration: 0.5, ease: EASE }}
          className="mt-12 grid gap-8 rounded-2xl border border-accent/40 bg-bg-surface p-6 sm:p-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12"
        >
          <div className="flex flex-col items-start gap-6 sm:flex-row">
            <Portrait photo={dean.photo} name={dean.name} role={t("dziekanRole")} className="w-[132px] sm:w-[152px]" sizes="152px" />
            <div className="min-w-0">
              <h3 className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary">
                {dean.name}
              </h3>
              <p className="mt-2 text-[0.9375rem] font-medium text-accent">{t("dziekanRole")}</p>
              {dean.email && <EmailLink email={dean.email} />}
              <Duty slots={slotsOf("dziekan")} now={now} />
            </div>
          </div>
          <div className="min-w-0">
            <h4 className="text-[1.0625rem] font-semibold text-ink-primary">{t("dean.scopeHeading")}</h4>
            <ul className="mt-3 grid gap-2">
              {(t.raw("dean.scope") as string[]).map((item) => (
                <li key={item} className="flex gap-3 text-[0.9375rem] leading-[1.55] text-ink-secondary">
                  <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Prodziekani - wspólny zakres spraw, potem wyszukiwarka i karty. */}
        <div className="mt-16 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-12">
          <div>
            <h3 className="font-display text-[clamp(1.375rem,2.2vw,1.75rem)] font-semibold tracking-[-0.02em] text-ink-primary">
              {t("viceHeading")}
            </h3>
            <p className="mt-3 text-pretty text-[0.9375rem] leading-[1.65] text-ink-secondary">{t("viceLead")}</p>
          </div>
          <ul className="grid gap-2">
            {(t.raw("viceScope") as string[]).map((item) => (
              <li key={item} className="flex gap-3 text-[0.9375rem] leading-[1.55] text-ink-secondary">
                <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 max-w-[640px]" role="search">
          <label htmlFor={inputId} className="text-[0.8125rem] font-semibold text-ink-primary">
            {t("finder.label")}
          </label>
          <div className="mt-2 flex min-h-14 items-center gap-3 rounded-xl border border-border-medium bg-bg-surface px-4 transition-[border-color] duration-200 focus-within:border-accent has-[input:focus-visible]:outline-3 has-[input:focus-visible]:outline-offset-3 has-[input:focus-visible]:outline-accent has-[input:focus-visible]:outline-solid">
            <MagnifyingGlass size={20} className="shrink-0 text-ink-tertiary" aria-hidden="true" />
            <input
              id={inputId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("finder.placeholder")}
              autoComplete="off"
              spellCheck={false}
              aria-describedby={statusId}
              className="min-w-0 flex-1 bg-transparent py-3 text-[1rem] text-ink-primary outline-none placeholder:text-ink-tertiary focus-visible:outline-none! [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="-mr-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ink-tertiary transition-colors hover:bg-bg-elevated hover:text-ink-primary"
              >
                <X size={18} aria-hidden="true" />
                <span className="sr-only">{t("finder.clear")}</span>
              </button>
            )}
          </div>
          <p id={statusId} aria-live="polite" className="mt-3 min-h-[1.5em] text-pretty text-[0.875rem] leading-[1.55] text-ink-secondary">
            {finderStatus}
          </p>
          {matches.length > 1 && (
            <ul aria-label={t("finder.suggestions")} className="mt-3 flex flex-wrap gap-2">
              {matches.map((m) => (
                <li key={`${m.key}-${m.programme}`}>
                  <button
                    type="button"
                    onClick={() => setQuery(m.programme)}
                    className="inline-flex min-h-10 items-center rounded-full border border-border-medium bg-bg-surface px-4 text-[0.875rem] text-ink-primary transition-[background-color,border-color,transform] duration-150 ease-out hover:border-accent hover:bg-accent-glow active:scale-[0.97] motion-reduce:active:scale-100"
                  >
                    {m.programme}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Pasujący Prodziekan przesuwa się na początek - na telefonie od razu pod polem. */}
          {[...viceDeans].sort((a, b) => Number(matchedKeys.has(b.key)) - Number(matchedKeys.has(a.key))).map((p, i) => {
            const state = !active || matches.length === 0 ? "idle" : matchedKeys.has(p.key) ? "match" : "dim";
            const hits = new Set(matches.filter((m) => m.key === p.key).map((m) => m.programme));
            return (
              <motion.div
                key={p.key}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={reduce ? { duration: 0 } : { duration: 0.5, delay: Math.min(i, 4) * 0.08, ease: EASE, layout: { duration: 0.45, ease: EASE } }}
                className="h-full"
              >
                <article
                  data-state={state}
                  className="relative flex h-full flex-col rounded-2xl border border-border-subtle bg-bg-surface p-5 transition-[background-color,transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group/card data-[state=dim]:scale-[0.985] data-[state=dim]:bg-bg-base data-[state=match]:border-accent data-[state=match]:shadow-[0_0_0_4px_var(--accent-glow)] motion-reduce:transition-none motion-reduce:data-[state=dim]:scale-100"
                >
                  <span
                    aria-hidden={state !== "match"}
                    className={`absolute -top-3 left-5 rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-bg-base transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${state === "match" ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"}`}
                  >
                    {t("finder.yours")}
                  </span>
                  <div className="flex items-start gap-4">
                    <Portrait photo={p.photo} name={p.name} role={t("prodziekanRole")} className="w-[88px] transition-[filter,opacity] duration-300 group-data-[state=dim]/card:opacity-60 group-data-[state=dim]/card:grayscale motion-reduce:transition-none" sizes="88px" />
                    <div className="min-w-0 pt-1">
                      <h3 className="text-balance font-display text-[1.125rem] font-semibold leading-[1.25] tracking-[-0.01em] text-ink-primary">{p.name}</h3>
                      <p className="mt-1 text-[0.875rem] leading-[1.5] text-ink-secondary">{t("prodziekanRole")}</p>
                      {p.email && <EmailLink email={p.email} small />}
                    </div>
                  </div>
                  <Duty slots={slotsOf(p.key)} now={now} compact />
                  <ul className="mt-5 flex flex-col gap-0.5 border-t border-border-subtle pt-4">
                    {(t.raw(`kierunki.${p.key}`) as string[]).map((programme) => (
                      <li
                        key={programme}
                        className={`-mx-2 rounded-md px-2 py-0.5 text-[0.8125rem] leading-[1.5] transition-colors duration-200 ${hits.has(programme) ? "bg-accent-glow font-semibold text-ink-primary" : state === "dim" ? "text-ink-tertiary" : "text-ink-secondary"}`}
                      >
                        {programme}
                      </li>
                    ))}
                  </ul>
                </article>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-10 text-pretty text-[0.8125rem] leading-[1.6] text-ink-tertiary">
          {t("source")}{" "}
          <a
            href={deanOfficeSources.current}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-6 items-center gap-1 font-medium text-accent underline underline-offset-4 hover:text-accent-dim"
          >
            {t("sourceLink")}
            <ArrowSquareOut size={13} aria-hidden="true" />
            <span className="sr-only">({tc("newTab")})</span>
          </a>
        </p>
      </div>
    </section>
  );
}
