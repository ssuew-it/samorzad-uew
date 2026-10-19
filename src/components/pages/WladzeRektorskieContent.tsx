"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useTranslations } from "next-intl";
import { InitialsAvatar } from "../InitialsAvatar";
import { ScrollReveal } from "../ScrollReveal";
import { PersonCard } from "../PersonCard";
import { rector, viceRectors as prorektorzy } from "@/lib/people";

const rektorName = rector.name;

export function WladzeRektorskieContent() {
  const reduce = useReducedMotion();
  const t = useTranslations("wladze");

  return (
    <section className="section-padding" aria-labelledby="wladze-heading">
      <div className="mx-auto max-w-[1200px]">
        <ScrollReveal>
          <h2
            id="wladze-heading"
            className="max-w-[22ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
          >
            {t("heading")}
          </h2>
        </ScrollReveal>

        {/* Rektor — featured */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={reduce ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex flex-col items-center gap-5 rounded-2xl border border-accent/40 bg-bg-surface p-8 text-center sm:flex-row sm:text-left"
        >
          <InitialsAvatar name={rektorName} size={88} />
          <div>
            <h3 className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.02em] text-ink-primary">
              {rektorName}
            </h3>
            <p className="mt-2 text-[0.9375rem] font-medium uppercase tracking-[0.06em] text-accent">
              {t("rektorRole")}
            </p>
          </div>
        </motion.div>

        {/* Prorektorzy */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {prorektorzy.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { duration: 0.5, delay: Math.min(i, 4) * 0.08, ease: [0.16, 1, 0.3, 1] }
              }
              className="h-full"
            >
              <PersonCard name={p.name} role={t(`roles.${p.roleKey}`)} plain className="h-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
