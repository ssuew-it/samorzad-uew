"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import type { Zarzadzenie } from "@/lib/zarzadzenia";
import { Link } from "@/i18n/navigation";
import { documents } from "@/lib/documents";
import { PersonCard } from "../PersonCard";
import { ScrollReveal } from "../ScrollReveal";
import { chair, viceChairs, board } from "@/lib/people";

export function ZarzadContent({ orders }: { orders: Zarzadzenie[] }) {
  const locale = useLocale() === "en" ? "en" : "pl";
  const tc = useTranslations("common");
  const reduce = useReducedMotion();
  const t = useTranslations("zarzad");
  const tPrez = useTranslations("przewodniczacy");
  const tBoard = useTranslations("board");
  const ordersPublished = orders.length > 0 || Boolean(documents.zarzadzenia?.href);
  const latest = orders.slice(0, 3);

  // Akty Przewodniczącego mają miejsce przy nim samym (decyzja z 1.11.2026):
  // bez osobnej podstrony, ale z bezpośrednim wejściem do zarządzeń.
  const chairActs = [
    { key: "orders", href: "/zarzadzenia-przewodniczacego", status: ordersPublished ? t("chairActs.published") : t("chairActs.pending") },
    { key: "regulations", href: "/regulacje-wewnetrzne" },
  ] as const;

  return (
    <>
      {/* Prezydium */}
      <section className="section-padding" aria-labelledby="prezydium-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <h2
              id="prezydium-heading"
              className="max-w-[24ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
            >
              {t("prezydiumHeading")}
            </h2>
          </ScrollReveal>

          {/* Przewodniczący - featured */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={reduce ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            id="przewodniczacy"
            className="mt-12 grid scroll-mt-28 items-start gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-14"
          >
            <PersonCard
              name={chair.name}
              role={tPrez("chairRole")}
              email={chair.email}
              photo={chair.photo}
              featured
              className="w-full max-w-[420px]"
            />
            <div className="min-w-0">
            <p className="prose-constrained text-pretty text-[1rem] leading-[1.75] text-ink-secondary">
              {tPrez("chairDesc")}
            </p>
            <nav aria-labelledby="chair-acts-heading" className="mt-8 border-t border-border-subtle pt-6">
              <h3 id="chair-acts-heading" className="font-display text-[1.125rem] font-semibold text-ink-primary">
                {t("chairActs.heading")}
              </h3>
              {latest.length > 0 && (
                <ul className="mt-4 list-none border-t border-border-soft" aria-label={t("chairActs.latest")}>
                  {latest.map((order) => {
                    const inner = (
                      <>
                        <span className="min-w-0">
                          <span className="block font-mono text-[0.75rem] text-ink-secondary">{order.number}</span>
                          <span className="mt-0.5 block">{order.title[locale]}</span>
                        </span>
                        {order.href ? <ArrowUpRight size={16} weight="bold" aria-hidden="true" className="shrink-0" /> : null}
                      </>
                    );
                    const cls = "flex min-h-14 items-center justify-between gap-4 py-3 text-[0.9375rem] text-ink-primary transition-colors hover:text-accent";
                    return (
                      <li key={order.number} className="border-b border-border-soft">
                        {order.href ? (
                          <a href={order.href} target="_blank" rel="noopener noreferrer" className={cls}>
                            {inner}
                            <span className="sr-only"> ({tc("newTab")})</span>
                          </a>
                        ) : (
                          <Link href="/zarzadzenia-przewodniczacego" className={cls}>{inner}</Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
              <ul className={`list-none border-t border-border-soft ${latest.length > 0 ? "mt-6" : "mt-4"}`}>
                {chairActs.map((act) => (
                  <li key={act.key} className="border-b border-border-soft">
                    <Link
                      href={act.href}
                      className="group flex min-h-14 items-center justify-between gap-4 py-3 text-[0.9375rem] font-medium text-ink-primary transition-colors hover:text-accent"
                    >
                      <span>
                        {t(`chairActs.${act.key}`)}
                        {"status" in act && (
                          <span className="mt-0.5 block text-[0.8125rem] font-normal text-ink-secondary">{act.status}</span>
                        )}
                      </span>
                      <ArrowRight size={16} weight="bold" aria-hidden="true" className="shrink-0 transition-transform duration-150 ease-out group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            </div>
          </motion.div>

          {/* Wiceprzewodniczący - osobne organy, nie „drugi rząd” Przewodniczącego. */}
          <p className="prose-constrained mt-12 text-[0.9375rem] leading-[1.7] text-ink-secondary">
            {tPrez("wiceIntro")}
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                <PersonCard name={w.name} role={tPrez(`roles.${w.roleKey}`)} email={w.email} photo={w.photo} className="h-full" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Członkowie Zarządu */}
      <section className="section-padding" aria-labelledby="czlonkowie-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <h2
              id="czlonkowie-heading"
              className="max-w-[24ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
            >
              {t("czlonkowieHeading")}
            </h2>
            <p className="prose-constrained mt-4 text-[0.9375rem] leading-[1.7] text-ink-secondary">
              {t("czlonkowieIntro")}
            </p>
          </ScrollReveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                  email={member.email}
                  photo={member.photo}
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
