"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, ArrowUpRight, CaretDown, FileText, Megaphone, X } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { ScrollReveal } from "../ScrollReveal";
import { SectionRail } from "../SectionRail";
import { RIGHT_KEYS as rightKeys, rzecznikHref, type RightKey } from "@/lib/prawa-studenta";
import styles from "./PrawaStudenta.module.css";

const BROKEN_STEPS = ["describe", "match", "write"] as const;

/** Identyfikator artykułu w kodeksie — ten sam, którego używa spis § (SectionRail). */
const articleId = (key: RightKey) => `prawo-${rightKeys.indexOf(key) + 1}`;

export function PrawaStudentaContent() {
  const t = useTranslations("prawaStudenta");
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState<RightKey | null>(null);
  /** Licznik wyborów — restartuje animację podświetlenia przy ponownym wyborze. */
  const [pulse, setPulse] = useState(0);
  const detailsRefs = useRef<Partial<Record<RightKey, HTMLDetailsElement | null>>>({});

  /**
   * Po wyborze sytuacji rozwijamy „Co to znaczy” właściwego artykułu.
   *
   * Celowo BEZ automatycznego przewijania: wynik z następnym krokiem pojawia
   * się tuż pod wyborem, a przeniesienie strony gdzie indziej zabrałoby go
   * sprzed oczu (a czytnikowi ekranu — kontekst). Do artykułu prowadzi
   * przycisk „Przejdź do §…”.
   */
  useEffect(() => {
    if (!selected) return;
    const details = detailsRefs.current[selected];
    if (details) details.open = true;
  }, [selected, pulse]);

  /** Płynne przejście do artykułu (lub natychmiastowe przy ograniczonym ruchu). */
  const goTo = (key: RightKey) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const el = document.getElementById(articleId(key));
    if (!el) return;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    history.replaceState(null, "", `#${articleId(key)}`);
  };

  const choose = (key: RightKey) => {
    setSelected(key);
    setPulse((n) => n + 1);
  };

  const ref = (key: RightKey) => `§${rightKeys.indexOf(key) + 1}`;

  return (
    <>
      <SectionRail ids={rightKeys.map((k) => articleId(k))} label={t("sectionIndex")} />

      {/* Wstęp + „Gdy ktoś łamie Twoje prawa” — obok siebie, bo osoba z problemem
          szuka drogi wyjścia od razu, a nie w FAQ na samym dole. */}
      <section className="section-padding" aria-labelledby="prawa-lista-heading">
        <div className={`mx-auto max-w-[1200px] ${styles.introGrid}`}>
          <ScrollReveal>
            <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-accent">{t("eyebrow")}</p>
            <h2
              id="prawa-lista-heading"
              className="mt-3 max-w-[22ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
            >
              {t("heading")}
            </h2>
            <p className="mt-4 max-w-[60ch] text-[1.0625rem] leading-[1.75] text-ink-secondary">{t("intro")}</p>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <aside className={styles.broken} aria-labelledby="prawa-broken-heading">
              <h3 id="prawa-broken-heading" className={styles.brokenHeading}>
                {t("broken.heading")}
              </h3>
              <ol className={styles.brokenSteps}>
                {BROKEN_STEPS.map((step, i) => (
                  <li key={step} className={styles.brokenStep}>
                    <span className={styles.brokenNo} aria-hidden="true">
                      {i + 1}
                    </span>
                    <span>
                      <span className={styles.brokenTitle}>{t(`broken.steps.${step}.title`)}</span>
                      <span className={styles.brokenDesc}>{t(`broken.steps.${step}.desc`)}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <Link href="/rzecznik-praw-studenta" className={styles.brokenCta}>
                <Megaphone size={18} weight="regular" aria-hidden="true" />
                {t("broken.cta")}
                <ArrowRight size={16} weight="bold" aria-hidden="true" />
              </Link>
            </aside>
          </ScrollReveal>
        </div>
      </section>

      {/* Selektor: od sytuacji do paragrafu. Sytuacje są zbudowane wyłącznie
          z treści siedmiu praw poniżej — nie obiecujemy niczego, czego tam nie ma. */}
      <section className={`section-padding pt-0 ${styles.selectorSection}`} aria-labelledby="prawa-selector-heading">
        <div className="mx-auto max-w-[1200px]">
          <div className={styles.selector}>
            <div className={styles.selectorHead}>
              <h2 id="prawa-selector-heading" className={styles.selectorHeading}>
                {t("selector.heading")}
              </h2>
              <p className={styles.selectorLead}>{t("selector.lead")}</p>
            </div>

            <fieldset className={styles.cases}>
              <legend className="sr-only">{t("selector.legend")}</legend>
              {rightKeys.map((key) => (
                <label key={key} className={styles.case} data-checked={selected === key ? "true" : undefined}>
                  <input
                    type="radio"
                    name="prawa-case"
                    value={key}
                    checked={selected === key}
                    onChange={() => choose(key)}
                    // Ponowne kliknięcie zaznaczonej opcji nie wywołuje onChange,
                    // a ma powtórzyć podświetlenie artykułu.
                    onClick={() => {
                      if (selected === key) choose(key);
                    }}
                    className={styles.caseInput}
                  />
                  <span className={styles.caseRef} aria-hidden="true">
                    {ref(key)}
                  </span>
                  <span className={styles.caseText}>{t(`selector.cases.${key}`)}</span>
                </label>
              ))}
            </fieldset>

            {/* Wynik ogłaszany grzecznie — bez zabierania fokusu z wyboru. */}
            <div className={styles.result} aria-live="polite">
              {selected && (
                <div key={`${selected}-${pulse}`} className={styles.resultInner}>
                  <p className={styles.resultMatch}>
                    {t("selector.matched", { ref: ref(selected), title: t(`rights.${selected}.title`) })}
                  </p>
                  <p className={styles.resultNext}>
                    {t("selector.next")}{" "}
                    {/* Wybrana sytuacja jedzie do formularza Rzecznika jako gotowy temat. */}
                    <Link href={rzecznikHref(selected)} className={styles.resultLink}>
                      {t("broken.cta")}
                      <ArrowRight size={14} weight="bold" aria-hidden="true" />
                    </Link>
                  </p>
                  <div className={styles.resultActions}>
                    <a href={`#${articleId(selected)}`} onClick={goTo(selected)} className={styles.resultGo}>
                      {t("selector.goTo", { ref: ref(selected) })}
                    </a>
                    <button type="button" className={styles.resultReset} onClick={() => setSelected(null)}>
                      <X size={14} weight="bold" aria-hidden="true" />
                      {t("selector.reset")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Kodeks: prawa jak artykuły aktu — jedna kolumna, duży numer § z lewej. */}
      <section className="section-padding pt-0" aria-labelledby="prawa-kodeks-heading">
        <div className="mx-auto max-w-[1200px]">
          <h2 id="prawa-kodeks-heading" className={styles.codeHeading}>
            {t("codeHeading")}
          </h2>
          <ol className={styles.code}>
            {rightKeys.map((key, i) => (
              <li
                key={key}
                id={articleId(key)}
                className={`reveal ${styles.article}`}
                data-selected={selected === key ? "true" : undefined}
              >
                {/* Poświata wybranego artykułu: nowy `key` przy każdym wyborze
                    montuje ją od nowa, więc animacja rusza od początku także
                    przy ponownym wybraniu tej samej sytuacji. */}
                {selected === key && <span key={`glow-${pulse}`} className={styles.glow} aria-hidden="true" />}
                <span className={styles.articleRef} aria-hidden="true">
                  §{i + 1}
                </span>
                <div className={styles.articleBody}>
                  <h3 className={styles.articleTitle}>{t(`rights.${key}.title`)}</h3>
                  <p className={styles.articleDesc}>{t(`rights.${key}.desc`)}</p>
                  <details
                    className={styles.expl}
                    ref={(el) => {
                      detailsRefs.current[key] = el;
                    }}
                  >
                    <summary className={styles.explSummary}>
                      {t("expandLabel")}
                      <CaretDown size={12} weight="bold" aria-hidden="true" className={styles.explCaret} />
                    </summary>
                    <p className={styles.explText}>{t(`rights.${key}.expl`)}</p>
                  </details>
                </div>
              </li>
            ))}
          </ol>

          <ScrollReveal>
            <div className="mt-12 flex flex-col gap-4 sm:flex-row">
              <a
                href="https://isap.sejm.gov.pl/isap.nsf/download.xsp/WDU20180001668/U/D20181668Lj.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-accent px-7 text-base font-medium text-bg-base transition-[background-color,transform] duration-150 ease-out hover:bg-accent-dim active:scale-[0.97]"
              >
                <FileText size={20} weight="regular" aria-hidden="true" />
                {t("ctaPdf")}
              </a>
              <Link
                href="/rzecznik-praw-studenta"
                className="inline-flex h-12 items-center gap-2 rounded-lg border border-border-strong px-7 text-base font-medium text-ink-primary transition-colors hover:border-border-soft hover:bg-bg-elevated"
              >
                <Megaphone size={20} weight="regular" aria-hidden="true" />
                {t("ctaRzecznik")}
              </Link>
              <Link
                href="/dla-studenta"
                className="inline-flex h-12 items-center gap-1.5 px-3 text-base font-medium text-accent transition-colors hover:text-accent-dim"
              >
                {t("ctaBack")}
                <ArrowUpRight size={18} weight="regular" aria-hidden="true" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
