"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowSquareOut } from "@phosphor-icons/react";
import { ScrollReveal } from "../ScrollReveal";
import { ScrollSteps } from "../ScrollSteps";
import { EditionShelf } from "../wydawnictwo/EditionShelf";
import { CitationForge } from "../wydawnictwo/CitationForge";
import { publications } from "@/lib/publications";
import { editions, publisher } from "@/lib/editions";

const factKeys = ["years", "license", "circles"] as const;

const pathKeys = ["draft", "mentor", "submit", "review", "layout", "publish"] as const;

export function WydawnictwoContent() {
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
            <h2
              id="wydawnictwo-o-heading"
              className="max-w-[24ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
            >
              {t("aboutHeading")}
            </h2>
            <p className="prose-constrained mt-4 text-[1.0625rem] leading-[1.75] text-ink-secondary">
              {t("aboutIntro")}
            </p>
          </ScrollReveal>

          {/* Trzy fakty jako jeden zwarty pasek zamiast trzech kart z ikonami. */}
          <dl className="mt-10 grid border-y border-border-medium md:grid-cols-3">
            {factKeys.map((key) => (
              <div
                key={key}
                className="border-t border-border-subtle py-6 first:border-t-0 md:border-l md:border-t-0 md:px-6 md:first:border-l-0 md:first:pl-0"
              >
                <dt className="text-[1.0625rem] font-semibold tracking-[-0.01em] text-ink-primary">
                  {t(`facts.${key}.title`)}
                </dt>
                <dd className="m-0 mt-2 text-[0.9375rem] leading-[1.6] text-ink-secondary">
                  {t(`facts.${key}.desc`)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* b) Zobacz siebie w serii - generator cytowania jako haczyk, zaraz
          po tym, czym jest seria: najpierw „to może być Twoje nazwisko”,
          potem droga, jak do tego dojść. */}
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

      {/* c) Ścieżka publikacji */}
      <section className="section-padding pt-0" aria-labelledby="wydawnictwo-sciezka-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <h2
              id="wydawnictwo-sciezka-heading"
              className="max-w-[24ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
            >
              {t("pathHeading")}
            </h2>
            <p className="prose-constrained mt-4 text-[1.0625rem] leading-[1.75] text-ink-secondary">
              {t("pathIntro")}
            </p>
          </ScrollReveal>

          <div className="max-w-[860px]">
            <ScrollSteps
              steps={pathKeys.map((key) => ({
                key,
                title: t(`path.${key}.title`),
                desc: t(`path.${key}.desc`),
              }))}
            />
          </div>
        </div>
      </section>

      {/* d) Półka tomów; `#czytaj` z hero otwiera tu czytnik. */}
      <section id="tomy" className="section-padding scroll-mt-24 pt-0" aria-labelledby="wydawnictwo-mur-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <h2
              id="wydawnictwo-mur-heading"
              className="max-w-[24ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
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

    </>
  );
}
