"use client";

import { motion, useReducedMotion } from "motion/react";
import { TERM } from "@/lib/term";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FolderOpen, EnvelopeSimple, Stamp } from "@phosphor-icons/react";
import { ScrollReveal } from "../ScrollReveal";
import { documents as docManifest } from "@/lib/documents";

export function ZarzadzeniaContent() {
  const reduce = useReducedMotion();
  const t = useTranslations("zarzadzenia");
  const tc = useTranslations("common");
  const folder = docManifest.zarzadzenia;

  return (
    <section className="section-padding" aria-labelledby="zarz-heading">
      <div className="mx-auto max-w-[1200px]">
        <ScrollReveal>
          <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-accent">
            {t("eyebrow")}
          </p>
          <h2
            id="zarz-heading"
            className="mt-3 max-w-[26ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
          >
            {t("heading")}
          </h2>
          <p className="prose-constrained mt-4 text-[1.0625rem] leading-[1.75] text-ink-secondary">
            {t("intro")}
          </p>
        </ScrollReveal>

        {/* Kadencja card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={reduce ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex flex-col items-start justify-between gap-6 rounded-2xl border border-accent/40 bg-bg-surface p-8 sm:flex-row sm:items-center"
        >
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent-glow text-accent">
              <Stamp size={26} weight="regular" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-[1.125rem] font-semibold tracking-[-0.01em] text-ink-primary">
                {t("termCardHeading", { term: TERM })}
              </h3>
              <p className="mt-1 text-[0.9375rem] leading-[1.6] text-ink-secondary">
                {t("termCardDesc")}
              </p>
            </div>
          </div>
          {folder?.href ? (
            <a
              href={folder.href}
              {...(folder.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : { download: true })}
              className="inline-flex h-12 shrink-0 items-center gap-2 rounded-lg bg-accent px-7 text-base font-medium text-bg-base transition-[background-color,transform] duration-150 ease-out hover:bg-accent-dim active:scale-[0.97]"
            >
              <FolderOpen size={20} weight="regular" aria-hidden="true" />
              {t("openButton")}
            </a>
          ) : (
            <span className="inline-flex h-12 shrink-0 items-center gap-2 rounded-lg border border-border-medium px-7 text-base font-medium text-ink-tertiary">
              <FolderOpen size={20} weight="regular" aria-hidden="true" />
              {t("openButton")} · {tc("comingSoon")}
            </span>
          )}
        </motion.div>

        {/* Archiwum */}
        <ScrollReveal>
          <div className="mt-8 flex flex-col items-start justify-between gap-6 rounded-2xl border border-border-subtle bg-bg-surface p-8 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-[1.0625rem] font-semibold tracking-[-0.01em] text-ink-primary">
                {t("archiveHeading")}
              </h3>
              <p className="mt-2 max-w-[52ch] text-[0.9375rem] leading-[1.6] text-ink-secondary">
                {t("archiveDesc")}
              </p>
            </div>
            <Link
              href="/kontakt"
              className="inline-flex h-12 shrink-0 items-center gap-2 rounded-lg border border-border-strong px-7 text-base font-medium text-ink-primary transition-colors hover:border-border-soft hover:bg-bg-elevated"
            >
              <EnvelopeSimple size={20} weight="regular" aria-hidden="true" />
              {t("archiveButton")}
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
