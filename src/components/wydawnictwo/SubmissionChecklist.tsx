"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowSquareOut, Check } from "@phosphor-icons/react";
import { ScrollReveal } from "../ScrollReveal";

/**
 * „Zanim zgłosisz artykuł” - lista kontrolna z Poradnika dla autorów
 * Debiutów Studenckich i stron „Dla autorów” Wydawnictwa (sprawdzone 4.11.2026).
 *
 * Odhaczone punkty zostają w tej przeglądarce (localStorage), bo artykuł pisze
 * się tygodniami - lista ma czekać, aż wrócisz. Brak pamięci (tryb prywatny)
 * niczego nie psuje: lista działa, tylko się nie zapamiętuje.
 */
const STORAGE_KEY = "ssuew:debiuty-lista";

/** Oficjalne materiały Wydawnictwa; podpisy w messages: wydawnictwo.checklist.links. */
const LINKS = {
  plan: "https://wydawnictwo.uew.pl/wp-content/uploads/sites/32/2026/01/Plan-Wydawniczy-DS_2026_OST.pdf",
  template: "https://wydawnictwo.uew.pl/wp-content/uploads/sites/32/2026/07/szablon_debiuty_studenckie-aktualny.docx",
  guide: "https://wydawnictwo.uew.pl/wp-content/uploads/sites/32/2026/02/Poradnik-dla-autorow-scaled.jpg",
  standards: "https://wydawnictwo.uew.pl/dla-autorow/zasady-edytorskie/",
  ai: "https://wydawnictwo.uew.pl/dla-autorow/polityka-ai-ml/",
  ethics: "https://wydawnictwo.uew.pl/dla-autorow/zasady-etyczne/",
} as const;

type Group = { title: string; items: string[] };

export function SubmissionChecklist() {
  const t = useTranslations("wydawnictwo.checklist");
  const tc = useTranslations("common");
  const groups = t.raw("groups") as Group[];
  const ids = groups.flatMap((g, gi) => g.items.map((_, ii) => `${gi}-${ii}`));
  const [done, setDone] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as string[];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Array.isArray(saved)) setDone(new Set(saved));
    } catch {
      // Brak dostępu do pamięci - lista działa bez zapamiętywania.
    }
  }, []);

  const save = (next: Set<string>) => {
    setDone(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      // jw.
    }
  };

  const toggle = (id: string) => {
    const next = new Set(done);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    save(next);
  };

  const count = ids.filter((id) => done.has(id)).length;

  return (
    <section className="section-padding pt-0" aria-labelledby="wydawnictwo-lista-heading">
      <div className="mx-auto max-w-[1200px]">
        <ScrollReveal>
          <h2
            id="wydawnictwo-lista-heading"
            className="max-w-[24ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
          >
            {t("heading")}
          </h2>
          <p className="prose-constrained mt-4 text-[1.0625rem] leading-[1.75] text-ink-secondary">{t("intro")}</p>
        </ScrollReveal>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex min-w-[240px] flex-1 items-center gap-4">
            <div
              className="h-1.5 flex-1 overflow-hidden bg-border-subtle"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={ids.length}
              aria-valuenow={count}
              aria-label={t("progressLabel")}
            >
              <div
                className="h-full origin-left bg-accent transition-transform duration-300 ease-out motion-reduce:transition-none"
                style={{ transform: `scaleX(${ids.length ? count / ids.length : 0})` }}
              />
            </div>
            <p className="shrink-0 font-mono text-[0.8125rem] text-ink-secondary" aria-live="polite">
              {t("progress", { done: count, total: ids.length })}
            </p>
          </div>
          {count > 0 && (
            <button
              type="button"
              onClick={() => save(new Set())}
              className="min-h-11 text-[0.875rem] font-medium text-ink-secondary underline underline-offset-2 transition-colors hover:text-accent"
            >
              {t("reset")}
            </button>
          )}
        </div>

        <div className="mt-8 grid gap-px bg-border-subtle sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g, gi) => (
            <fieldset key={g.title} className="min-w-0 bg-bg-base p-6">
              <legend className="sr-only">{g.title}</legend>
              <p aria-hidden="true" className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-ink-tertiary">
                {String(gi + 1).padStart(2, "0")} · {g.title}
              </p>
              <ul className="mt-4 flex flex-col gap-1">
                {g.items.map((item, ii) => {
                  const id = `${gi}-${ii}`;
                  const checked = done.has(id);
                  return (
                    <li key={id}>
                      <label className="group flex min-h-11 cursor-pointer items-start gap-3 py-1.5">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(id)}
                          className="peer sr-only"
                        />
                        <span
                          aria-hidden="true"
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border transition-colors duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
                            checked ? "border-accent bg-accent text-white" : "border-border-strong group-hover:border-accent"
                          }`}
                        >
                          {checked && <Check size={13} weight="bold" />}
                        </span>
                        <span
                          className={`text-[0.9375rem] leading-[1.55] transition-colors ${
                            checked ? "text-ink-tertiary line-through decoration-border-strong" : "text-ink-secondary"
                          }`}
                        >
                          {item}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          ))}
        </div>

        <div className="mt-8">
          <p className="text-[0.875rem] font-semibold text-ink-primary">{t("linksHeading")}</p>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {(Object.keys(LINKS) as (keyof typeof LINKS)[]).map((key) => (
              <li key={key}>
                <a
                  href={LINKS[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem] font-medium text-accent transition-colors hover:text-accent-dim"
                >
                  {t(`links.${key}`)}
                  <ArrowSquareOut size={15} weight="regular" aria-hidden="true" />
                  <span className="sr-only"> ({tc("newTab")})</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
