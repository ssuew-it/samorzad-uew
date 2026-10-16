"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useTranslations } from "next-intl";
import { EnvelopeSimple } from "@phosphor-icons/react";
import { InitialsAvatar } from "../InitialsAvatar";
import { PersonCard } from "../PersonCard";
import { ScrollReveal } from "../ScrollReveal";
import { chair, viceChairs, board } from "@/lib/people";

export function ZarzadContent() {
  const reduce = useReducedMotion();
  const t = useTranslations("zarzad");
  const tPrez = useTranslations("przewodniczacy");
  const tBoard = useTranslations("board");

  return (
    <>
      {/* Prezydium */}
      <section className="section-padding" aria-labelledby="prezydium-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-accent">
              {t("prezydiumEyebrow")}
            </p>
            <h2
              id="prezydium-heading"
              className="mt-3 max-w-[24ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
            >
              {t("prezydiumHeading")}
            </h2>
          </ScrollReveal>

          {/* Przewodniczący — featured */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={reduce ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 rounded-2xl border border-accent/40 bg-bg-surface p-8"
          >
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
              <InitialsAvatar name={chair.name} size={88} />
              <div>
                <h3 className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.02em] text-ink-primary">
                  {chair.name}
                </h3>
                <p className="mt-2 text-[0.9375rem] font-medium uppercase tracking-[0.06em] text-accent">
                  {tPrez("chairRole")}
                </p>
                <a
                  href={`mailto:${chair.email}`}
                  className="mt-3 inline-flex items-center gap-2 py-1 text-[0.9375rem] text-ink-secondary transition-colors hover:text-accent"
                >
                  <EnvelopeSimple size={18} weight="regular" aria-hidden="true" />
                  {chair.email}
                </a>
              </div>
            </div>
            <p className="prose-constrained mt-6 border-t border-border-subtle pt-6 text-[0.9375rem] leading-[1.7] text-ink-secondary">
              {tPrez("chairDesc")}
            </p>
          </motion.div>

          {/* Wiceprzewodniczący */}
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {viceChairs.map((w, i) => (
              <motion.div
                key={w.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.5, delay: Math.min(i, 4) * 0.08, ease: [0.16, 1, 0.3, 1] }
                }
                className="h-full min-w-0"
              >
                <PersonCard name={w.name} role={tPrez(`roles.${w.roleKey}`)} email={w.email} className="h-full" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Członkowie Zarządu */}
      <section className="section-padding" aria-labelledby="czlonkowie-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-accent">
              {t("czlonkowieEyebrow")}
            </p>
            <h2
              id="czlonkowie-heading"
              className="mt-3 max-w-[24ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
            >
              {t("czlonkowieHeading")}
            </h2>
            <p className="prose-constrained mt-4 text-[0.9375rem] leading-[1.7] text-ink-secondary">
              {t("czlonkowieIntro")}
            </p>
          </ScrollReveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {board.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }
                }
                className="h-full min-w-0"
              >
                <PersonCard
                  name={member.name}
                  role={tBoard(`roles.${member.roleKey}`)}
                  no={i + 1}
                  org={tBoard("org")}
                  email={member.email}
                  link={
                    member.roleKey === "branch"
                      ? { href: "/filia-jelenia-gora", label: t("branchLink") }
                      : undefined
                  }
                  className="h-full min-w-0"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
