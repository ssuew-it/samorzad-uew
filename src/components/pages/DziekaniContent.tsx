"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useTranslations } from "next-intl";
import { InitialsAvatar } from "../InitialsAvatar";
import { ScrollReveal } from "../ScrollReveal";
import { PersonCard } from "../PersonCard";
import { dean, viceDeans as prodziekani } from "@/lib/people";

const dziekanName = dean.name;

export function DziekaniContent() {
  const reduce = useReducedMotion();
  const t = useTranslations("dziekani");

  return (
    <section className="section-padding" aria-labelledby="dziekani-heading">
      <div className="mx-auto max-w-[1200px]">
        <ScrollReveal>
          <h2
            id="dziekani-heading"
            className="max-w-[26ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
          >
            {t("heading")}
          </h2>
          <p className="prose-constrained mt-4 text-[1.0625rem] leading-[1.75] text-ink-secondary">
            {t("intro")}
          </p>
        </ScrollReveal>

        {/* Dziekan — featured */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={reduce ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex flex-col items-center gap-5 rounded-2xl border border-accent/40 bg-bg-surface p-8 text-center sm:flex-row sm:text-left"
        >
          <InitialsAvatar name={dziekanName} size={88} />
          <div>
            <h3 className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.02em] text-ink-primary">
              {dziekanName}
            </h3>
            <p className="mt-2 text-[0.9375rem] font-medium uppercase tracking-[0.06em] text-accent">
              {t("dziekanRole")}
            </p>
            <ul className="mt-4 flex max-w-[760px] flex-wrap gap-x-4 gap-y-2">
              {(t.raw("kierunki.turowska") as string[]).map((kierunek) => (
                <li key={kierunek} className="text-[0.75rem] text-ink-secondary">{kierunek}</li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Prodziekani */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {prodziekani.map((p, i) => (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { duration: 0.5, delay: Math.min(i, 4) * 0.08, ease: [0.16, 1, 0.3, 1] }
              }
              className="h-full"
            >
              <PersonCard name={p.name} role={t("prodziekanRole")} meta={t.raw(`kierunki.${p.key}`) as string[]} plain className="h-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
