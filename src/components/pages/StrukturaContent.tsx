"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Crown,
  Gear,
  Scroll,
  ShieldCheck,
  Checks,
  type Icon,
} from "@phosphor-icons/react";
import { ScrollReveal } from "../ScrollReveal";
import { Impulse } from "../Impulse";
import { Tilt } from "../Tilt";
import { DURATION } from "@/lib/motion";

const top = {
  icon: Crown,
  href: "/zarzad",
};

interface Organ {
  key: string;
  icon: Icon;
  href?: string;
}

const organs: Organ[] = [
  { key: "board", icon: Gear, href: "/zarzad" },
  { key: "russ", icon: Scroll },
  { key: "audit", icon: ShieldCheck },
  { key: "election", icon: Checks, href: "/studencka-komisja-wyborcza" },
];

export function StrukturaContent() {
  const reduce = useReducedMotion();
  const t = useTranslations("struktura");
  const TopIcon = top.icon;
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section className="section-padding" aria-labelledby="struktura-heading">
      <div className="mx-auto max-w-[1200px]">
        <ScrollReveal>
          <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-accent">
            {t("eyebrow")}
          </p>
          <h2
            id="struktura-heading"
            className="mt-3 max-w-[22ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
          >
            {t("heading")}
          </h2>
        </ScrollReveal>

        {/* Org chart */}
        <div className="mt-14 flex flex-col items-center">
          {/* Top node */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={reduce ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md"
          >
            <Tilt max={5}>
              <div className="group relative rounded-xl border border-accent/40 bg-bg-surface p-6 text-center transition-colors duration-150 hover:bg-bg-elevated">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-accent-glow text-accent">
                  <TopIcon size={26} weight="regular" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-[1.125rem] font-semibold tracking-[-0.01em] text-ink-primary">
                  {t("top.title")}
                </h3>
                <p className="mt-2 text-[0.875rem] leading-[1.6] text-ink-secondary">
                  {t("top.role")}
                </p>
                <Link
                  href={top.href}
                  aria-label={t("top.title")}
                  className="absolute inset-0 rounded-xl"
                />
              </div>
            </Tilt>
          </motion.div>

          {/* Drawing connector */}
          <Impulse
            orientation="vertical"
            amount={0.4}
            delay={0.25}
            duration={DURATION.reveal}
            className={`my-2 h-10 w-px transition-colors duration-300 ${
              hovered !== null ? "bg-accent" : "bg-border-medium"
            }`}
          />

          {/* Organ nodes */}
          <div className="grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {organs.map((organ, i) => {
              const Glyph = organ.icon;
              return (
                <motion.div
                  key={organ.key}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : {
                          duration: 0.5,
                          delay: 0.4 + i * 0.08,
                          ease: [0.16, 1, 0.3, 1],
                        }
                  }
                >
                  <Tilt className="h-full" max={6}>
                    <div
                      className={`relative flex h-full flex-col overflow-hidden rounded-xl border bg-bg-surface p-6 transition-[border-color,background-color,box-shadow,opacity] duration-300 ease-out ${
                        hovered === i
                          ? "border-accent/60 shadow-lg shadow-black/5"
                          : "border-border-subtle hover:border-border-soft hover:bg-bg-elevated"
                      } ${hovered !== null && hovered !== i ? "opacity-50" : "opacity-100"}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-0 top-0 h-[2px] origin-left bg-accent transition-transform duration-300 ${
                          hovered === i ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-glow text-accent">
                        <Glyph size={24} weight="regular" aria-hidden="true" />
                      </span>
                      <h3 className="mt-5 text-[1rem] font-semibold leading-snug tracking-[-0.01em] text-ink-primary">
                        {t(`organs.${organ.key}.title`)}
                      </h3>
                      <p className="mt-2 text-[0.875rem] leading-[1.6] text-ink-secondary">
                        {t(`organs.${organ.key}.role`)}
                      </p>
                      {organ.href && (
                        <Link
                          href={organ.href}
                          aria-label={t(`organs.${organ.key}.title`)}
                          className="absolute inset-0 rounded-xl"
                        />
                      )}
                    </div>
                  </Tilt>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
