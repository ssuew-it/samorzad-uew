"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { FileText, DownloadSimple } from "@phosphor-icons/react";
import { ScrollReveal } from "../ScrollReveal";
import { documents as docManifest } from "@/lib/documents";

const docKeys = ["government", "ros", "russ", "residents", "electoral", "visual"];

export function RegulacjeContent() {
  const reduce = useReducedMotion();
  const t = useTranslations("regulacje");
  const tc = useTranslations("common");

  return (
    <section className="section-padding" aria-labelledby="regulacje-heading">
      <div className="mx-auto max-w-[860px]">
        <ScrollReveal>
          <p className="prose-constrained text-[1.0625rem] leading-[1.75] text-ink-secondary">
            {t("intro")}
          </p>
          <h2 id="regulacje-heading" className="sr-only">
            {t("srHeading")}
          </h2>
        </ScrollReveal>

        <ul className="mt-10 flex flex-col gap-3">
          {docKeys.map((key, i) => {
            const slot = docManifest.regulacje[key];
            const inner = (
              <>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-glow text-accent">
                  <FileText size={22} weight="regular" aria-hidden="true" />
                </span>
                <span className="flex-1 text-[1rem] font-medium tracking-[-0.01em] text-ink-primary">
                  {t(`documents.${key}`)}
                </span>
                {slot?.href ? (
                  <DownloadSimple
                    size={20}
                    weight="regular"
                    aria-hidden="true"
                    className="shrink-0 text-ink-tertiary transition-[transform,color] duration-150 ease-out group-hover:translate-y-0.5 group-hover:text-accent"
                  />
                ) : (
                  <span className="shrink-0 rounded-full border border-border-subtle px-2.5 py-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-ink-tertiary">
                    {tc("comingSoon")}
                  </span>
                )}
              </>
            );
            return (
              <motion.li
                key={key}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.45, delay: Math.min(i, 6) * 0.06, ease: [0.16, 1, 0.3, 1] }
                }
              >
                {slot?.href ? (
                  <a
                    href={slot.href}
                    {...(slot.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : { download: true })}
                    className="group flex items-center gap-4 rounded-xl border border-border-subtle bg-bg-surface p-5 transition-colors duration-150 hover:border-border-soft hover:bg-bg-elevated"
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="flex items-center gap-4 rounded-xl border border-border-subtle bg-bg-surface p-5">
                    {inner}
                  </div>
                )}
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
