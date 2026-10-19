"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowUpRight,
  FileText,
  ArrowSquareOut,
  type Icon,
} from "@phosphor-icons/react";
import { ScrollReveal } from "../ScrollReveal";
import { REGULAMIN_SWIADCZEN_PDF } from "@/lib/stypendia-dokumenty";

/**
 * Regulamin świadczeń - oficjalny PDF w BIP (wersja ujednolicona 19.09.2025).
 * Wcześniej kopia na Dysku Google, która nie aktualizuje się sama.
 */
export const REGULAMIN_HREF = REGULAMIN_SWIADCZEN_PDF;

export interface DetailNote {
  title: string;
  desc: string;
}

export interface ExtraLink {
  label: string;
  href: string;
}

export interface StypendiumDetailProps {
  eyebrow: string;
  heading: string;
  intro: string;
  notes: DetailNote[];
  /** Override the default 3-step USOSweb flow if a variant needs it. */
  steps?: { title: string; desc: string }[];
  regulaminHref?: string;
  extraLinks?: ExtraLink[];
  /** Unikalny id sekcji na hubie (kotwica + id nagłówka). Domyślnie pojedyncza strona. */
  sectionId?: string;
  /**
   * Narzędzie właściwe dla tego świadczenia (np. miernik progu przy socjalnym).
   * Stoi między wstępem a krokami: najpierw „czy to dla mnie?”, potem „jak złożyć”.
   */
  children?: ReactNode;
}

export function StypendiumDetailContent({
  eyebrow,
  heading,
  intro,
  notes,
  steps: stepsProp,
  regulaminHref = REGULAMIN_HREF,
  extraLinks = [],
  sectionId,
  children,
}: StypendiumDetailProps) {
  const reduce = useReducedMotion();
  const t = useTranslations("stypendiumDetail");

  return (
    <section
      id={sectionId}
      className={`section-padding${sectionId ? " scroll-mt-24" : ""}`}
      aria-labelledby={sectionId ? `${sectionId}-heading` : "styp-heading"}
    >
      <div className="mx-auto max-w-[1200px]">
        <ScrollReveal>
          <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-accent">
            {eyebrow}
          </p>
          <h2
            id={sectionId ? `${sectionId}-heading` : "styp-heading"}
            className="mt-3 max-w-[24ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
          >
            {heading}
          </h2>
          <p className="prose-constrained mt-4 text-[1.0625rem] leading-[1.75] text-ink-secondary">
            {intro}
          </p>
        </ScrollReveal>

        {children}

        {/*
          Kroki wniosku tylko wtedy, gdy wariant ma WŁASNE. Wspólny proces
          (USOSweb → dokumenty → decyzja) stoi raz, w sekcji „Jak złożyć
          wniosek” na górze huba - wcześniej te same trzy kroki powtarzały się
          przy każdym z czterech świadczeń. Na hubie zostaje odnośnik do niej.
        */}
        {stepsProp ? (
          <ol className="relative mt-12 grid gap-6 md:grid-cols-3">
            {stepsProp.map((step, i) => (
              <li key={step.title} className="reveal relative">
                <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-accent bg-bg-base font-display text-[1.125rem] text-accent tabular-nums">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-[1.0625rem] font-semibold tracking-[-0.01em] text-ink-primary">{step.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-[1.65] text-ink-secondary">{step.desc}</p>
              </li>
            ))}
          </ol>
        ) : sectionId ? (
          <a
            href="#jak-zlozyc"
            className="group mt-10 inline-flex min-h-11 items-center gap-2 rounded-full border border-border-medium px-4 text-[0.875rem] font-medium text-ink-secondary transition-colors hover:border-accent hover:text-accent"
          >
            <span className="font-mono text-[0.75rem] text-accent">01 → 03</span>
            {t("processLink")}
            <ArrowUpRight size={15} weight="bold" aria-hidden="true" className="transition-transform duration-200 group-hover:-translate-y-0.5" />
          </a>
        ) : null}

        {/* Variant-specific notes */}
        {notes.length > 0 && (
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {notes.map((note, i) => (
              <motion.div
                key={note.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.5, delay: Math.min(i, 4) * 0.05, ease: [0.16, 1, 0.3, 1] }
                }
                className="rounded-xl border border-border-subtle bg-bg-surface p-6"
              >
                <h3 className="text-[1.0625rem] font-semibold tracking-[-0.01em] text-ink-primary">
                  {note.title}
                </h3>
                <p className="mt-2 text-[0.9375rem] leading-[1.65] text-ink-secondary">
                  {note.desc}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA row */}
        <ScrollReveal>
          <div className="mt-12 flex flex-col flex-wrap gap-4 sm:flex-row">
            <a
              href={regulaminHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-accent px-7 text-base font-medium text-bg-base transition-[background-color,transform] duration-150 ease-out hover:bg-accent-dim active:scale-[0.97]"
            >
              <FileText size={20} weight="regular" aria-hidden="true" />
              {t("regulaminButton")}
            </a>
            {extraLinks.map((link) => {
              const OutIcon: Icon = ArrowSquareOut;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-lg border border-border-strong px-7 text-base font-medium text-ink-primary transition-colors hover:border-border-soft hover:bg-bg-elevated"
                >
                  <OutIcon size={18} weight="regular" aria-hidden="true" />
                  {link.label}
                </a>
              );
            })}
            {!sectionId && (
              <Link
                href="/stypendia"
                className="inline-flex h-12 items-center gap-1.5 px-3 text-base font-medium text-accent transition-colors hover:text-accent-dim"
              >
                {t("allButton")}
                <ArrowUpRight size={18} weight="regular" aria-hidden="true" />
              </Link>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
