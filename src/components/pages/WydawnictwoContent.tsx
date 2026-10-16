"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useTranslations } from "next-intl";
import { GraduationCap, SealCheck, UsersThree, ArrowSquareOut, type Icon } from "@phosphor-icons/react";
import { ScrollReveal } from "../ScrollReveal";
import { EditionShelf } from "../wydawnictwo/EditionShelf";
import { CitationForge } from "../wydawnictwo/CitationForge";
import { publications } from "@/lib/publications";
import { editions, publisher } from "@/lib/editions";

const factKeys = ["years", "license", "circles"] as const;
const factIcons: Record<(typeof factKeys)[number], Icon> = {
  years: GraduationCap,
  license: SealCheck,
  circles: UsersThree,
};

const pathKeys = ["draft", "mentor", "submit", "review", "layout", "publish"] as const;

export function WydawnictwoContent() {
  const reduce = useReducedMotion();
  const t = useTranslations("wydawnictwo");

  // Punkt wyjścia dla żywego cytowania: PRAWDZIWY pierwszy wpis z tomu, żeby
  // sekcja pokazywała autentyczny wzór, zanim ktokolwiek zacznie pisać.
  const seed = publications[0];

  return (
    <>
      {/* a) Czym są Debiuty Studenckie */}
      <section className="section-padding" aria-labelledby="wydawnictwo-o-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-accent">
              {t("aboutEyebrow")}
            </p>
            <h2
              id="wydawnictwo-o-heading"
              className="mt-3 max-w-[24ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
            >
              {t("aboutHeading")}
            </h2>
            <p className="prose-constrained mt-4 text-[1.0625rem] leading-[1.75] text-ink-secondary">
              {t("aboutIntro")}
            </p>
          </ScrollReveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {factKeys.map((key, i) => {
              const Glyph = factIcons[key];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }
                  }
                  /* Ruch tylko na `transform` i `box-shadow` — obie właściwości
                     przeglądarka animuje bez przeliczania układu strony, więc
                     kafli może być dowolnie wiele bez kosztu przy przewijaniu. */
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-bg-surface p-6 transition-[transform,box-shadow,border-color] duration-200 hover:border-accent/40 hover:shadow-[0_16px_34px_-20px_rgba(15,23,42,0.5)] motion-safe:hover:-translate-y-1"
                >
                  {/* Kreska akcentu wysuwa się od lewej przy najechaniu.
                      Przy zredukowanym ruchu pojawia się bez animacji. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-x-100 motion-reduce:transition-none"
                  />
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-glow text-accent transition-transform duration-200 motion-safe:group-hover:scale-110">
                    <Glyph size={24} weight="regular" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-[1.0625rem] font-semibold tracking-[-0.01em] text-ink-primary">
                    {t(`facts.${key}.title`)}
                  </h3>
                  <p className="mt-2 text-[0.875rem] leading-[1.6] text-ink-secondary">
                    {t(`facts.${key}.desc`)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* b) Ścieżka publikacji */}
      <section className="section-padding pt-0" aria-labelledby="wydawnictwo-sciezka-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-accent">
              {t("pathEyebrow")}
            </p>
            <h2
              id="wydawnictwo-sciezka-heading"
              className="mt-3 max-w-[24ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
            >
              {t("pathHeading")}
            </h2>
            <p className="prose-constrained mt-4 text-[1.0625rem] leading-[1.75] text-ink-secondary">
              {t("pathIntro")}
            </p>
          </ScrollReveal>

          <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {pathKeys.map((key, i) => (
              <motion.li
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.5, delay: Math.min(i, 4) * 0.05, ease: [0.16, 1, 0.3, 1] }
                }
                className="group relative flex gap-4 overflow-hidden rounded-xl border border-border-subtle bg-bg-surface p-6 transition-[transform,box-shadow,border-color] duration-200 hover:border-accent/40 hover:shadow-[0_16px_34px_-20px_rgba(15,23,42,0.5)] motion-safe:hover:-translate-y-1"
              >
                {/* Numer kroku podbity kolorem tła — czytelna kolejność bez
                    dodatkowego elementu w drzewie dostępności. */}
                <span
                  aria-hidden="true"
                  className="font-mono flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-glow text-[1rem] font-medium leading-none text-accent tabular-nums transition-transform duration-200 motion-safe:group-hover:scale-110"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-[1rem] font-semibold tracking-[-0.01em] text-ink-primary">
                    {t(`path.${key}.title`)}
                  </h3>
                  <p className="mt-2 text-[0.875rem] leading-[1.6] text-ink-secondary">
                    {t(`path.${key}.desc`)}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* c) SpineWall */}
      <section className="section-padding pt-0" aria-labelledby="wydawnictwo-mur-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-accent">
              {t("wallEyebrow")}
            </p>
            <h2
              id="wydawnictwo-mur-heading"
              className="mt-3 max-w-[24ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
            >
              {t("wallHeading")}
            </h2>
            <p className="prose-constrained mt-4 text-[1.0625rem] leading-[1.75] text-ink-secondary">
              {t("wallIntro")}
            </p>
          </ScrollReveal>

          <div className="mt-10">
            <EditionShelf
              editions={editions}
              publications={publications}
              labels={{
                emptyTitle: t("spineLabels.emptyTitle"),
                emptyDesc: t("spineLabels.emptyDesc"),
                circleLabel: t("spineLabels.circleLabel"),
                hint: t("spineLabels.hint"),
                editorsLabel: t("shelf.editorsLabel"),
                tocHeading: t("shelf.tocHeading"),
                pagesLabel: t("shelf.pagesLabel"),
                chapterCount: (count: number) => t("shelf.chapterCount", { count }),
                doiLabel: t("shelf.doiLabel"),
                scholarLabel: t("spineLabels.scholarLabel"),
                readerOpen: t("readerOpen"),
                readerClose: t("readerClose"),
                readerPrev: t("readerPrev"),
                readerNext: t("readerNext"),
                readerFull: t("readerFull"),
                readerPageOf: t("readerPageOf"),
                readerLicense: t("readerLicense"),
              }}
            />
          </div>
        </div>
      </section>

      {/* d) Wydawca serii */}
      <section className="section-padding pt-0" aria-labelledby="wydawnictwo-wydawca-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface">
              <div className="flex flex-col gap-8 p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
                <div className="max-w-[58ch]">
                  <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-accent">
                    {t("publisherEyebrow")}
                  </p>
                  <h2
                    id="wydawnictwo-wydawca-heading"
                    className="mt-3 font-display text-[clamp(1.375rem,2.6vw,1.875rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink-primary"
                  >
                    {publisher.name}
                  </h2>
                  <p className="mt-4 text-[1rem] leading-[1.7] text-ink-secondary">
                    {t("publisherBody")}
                  </p>
                  {/* Odnośnik pojawia się DOPIERO, gdy adres wydawcy jest
                      ustawiony w editions.ts. Lepiej brak przycisku niż
                      przycisk prowadzący donikąd. */}
                  {publisher.url ? (
                    <a
                      href={publisher.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-lg bg-accent px-6 text-base font-medium text-bg-base transition-colors hover:bg-accent-dim"
                    >
                      {t("publisherCta")}
                      <ArrowSquareOut size={16} weight="regular" aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
                {/* Znak wydawcy na jasnym polu w OBU motywach. Sygnet jest
                    granatowo-żółty; na ciemnym tle granat zlałby się z tłem,
                    a znaku firmowego nie wolno przebarwiać, żeby pasował do
                    motywu. Jasne pole to standardowy sposób prezentacji marki
                    i zgadza się z tym, jak znak stoi na okładce tomu. */}
                <div className="flex shrink-0 flex-col items-center gap-3">
                  <div className="flex h-[104px] w-[104px] items-center justify-center rounded-xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.12),0_10px_24px_-14px_rgba(15,23,42,0.4)]">
                    {/* `alt=""`: nazwa wydawcy stoi obok w nagłówku, więc opis
                        alternatywny tylko powtarzałby ją czytnikowi ekranu. */}
                    <Image
                      src={publisher.mark}
                      alt=""
                      width={1355}
                      height={1355}
                      sizes="104px"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p
                    aria-hidden="true"
                    className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-tertiary"
                  >
                    {t("publisherSinceLabel")} {publisher.since}
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* d) Jak cytować */}
      <section className="section-padding pt-0" aria-labelledby="wydawnictwo-cytowanie-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <h2
              id="wydawnictwo-cytowanie-heading"
              className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
            >
              {t("citeHeading")}
            </h2>
            <p className="prose-constrained mt-4 text-[1.0625rem] leading-[1.75] text-ink-secondary">
              {t("citeIntro")}
            </p>

            {seed ? (
              <CitationForge
                seed={{ author: seed.authors[0], title: seed.title, year: seed.year }}
                labels={{
                  authorLabel: t("forge.authorLabel"),
                  yearLabel: t("forge.yearLabel"),
                  titleLabel: t("forge.titleLabel"),
                  resultLabel: t("forge.resultLabel"),
                  note: t("forge.note"),
                  copyButton: t("copyButton"),
                  copiedConfirm: t("copiedConfirm"),
                  copyError: t("copyError"),
                }}
              />
            ) : (
              <p className="mt-8 text-[0.9375rem] text-ink-tertiary">{t("citeEmpty")}</p>
            )}
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
