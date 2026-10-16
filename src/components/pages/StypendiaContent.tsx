"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  ArrowSquareOut,
  CheckCircle,
  Coins,
  FileText,
  Lifebuoy,
  Question,
  Trophy,
  Wheelchair,
  type Icon,
} from "@phosphor-icons/react";
import { documents as docManifest } from "@/lib/documents";
import { DURATION, EASE } from "@/lib/motion";

type KindKey = "socjalne" | "rektora" | "niepelnosprawni" | "zapomoga";

interface Kind {
  key: KindKey;
  href: string;
  icon: Icon;
}

const kinds: Kind[] = [
  { key: "socjalne", href: "#socjalne", icon: Coins },
  { key: "rektora", href: "#rektora", icon: Trophy },
  { key: "niepelnosprawni", href: "#niepelnosprawni", icon: Wheelchair },
  { key: "zapomoga", href: "#zapomoga", icon: Lifebuoy },
];

const officialLinks = [
  {
    key: "news",
    href: "https://uew.pl/kandydaci/wsparcie-finansowe-dla-studentow/",
    external: true,
  },
  { key: "infopack", href: "#wsparcie", external: false },
  {
    key: "regulamin",
    href: "https://drive.google.com/file/d/18eMIfTCKHe2VkeNhqpbcnE2_dnEfzpv8/view?usp=drive_link",
    external: true,
  },
];

export function StypendiaContent() {
  const reduce = useReducedMotion();
  const t = useTranslations("stypendia");
  const documents = t.raw("documents") as string[];
  const [selected, setSelected] = useState<KindKey | null>(null);
  const activeKind = kinds.find((kind) => kind.key === selected) ?? null;

  return (
    <>
      <section className="section-padding" aria-labelledby="navigator-heading">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.7fr)] lg:items-end lg:justify-between lg:gap-20">
            <div>
              <h2
                id="navigator-heading"
                className="max-w-[18ch] text-balance font-display text-[clamp(2rem,4.6vw,4rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-ink-primary"
              >
                {t("navigator.heading")}
              </h2>
              <p className="mt-5 max-w-[62ch] text-pretty text-[1rem] leading-[1.75] text-ink-secondary">
                {t("navigator.lead")}
              </p>
            </div>
            <p className="border-t border-border-medium pt-4 text-[0.8125rem] leading-[1.6] text-ink-tertiary">
              {t("navigator.disclaimer")}
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(330px,0.88fr)] lg:gap-10">
            <fieldset className="border-y border-border-medium">
              <legend className="sr-only">{t("navigator.ariaLabel")}</legend>
              {kinds.map((kind, index) => {
                const Glyph = kind.icon;
                const isActive = selected === kind.key;

                return (
                  <button
                    key={kind.key}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setSelected(kind.key)}
                    className={`scholarship-choice scholarship-motion-control group grid min-h-[108px] w-full grid-cols-[34px_44px_minmax(0,1fr)_24px] items-center gap-4 border-b border-border-subtle px-2 py-5 text-left transition-colors last:border-b-0 sm:px-5 ${
                      isActive ? "bg-accent-glow" : "hover:bg-bg-elevated"
                    }`}
                  >
                    <span
                      className={`font-mono text-[0.75rem] font-medium tabular-nums ${
                        isActive ? "text-ink-secondary" : "text-ink-tertiary"
                      }`}
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-200 ${
                        isActive ? "bg-accent text-bg-base" : "bg-accent-glow text-accent"
                      }`}
                      aria-hidden="true"
                    >
                      <Glyph size={22} weight={isActive ? "fill" : "regular"} />
                    </span>
                    <span>
                      <span className="block text-[0.9375rem] font-semibold leading-[1.45] text-ink-primary">
                        {t(`navigator.options.${kind.key}`)}
                      </span>
                      <span
                        className={`mt-1 block text-[0.8125rem] leading-[1.5] ${
                          isActive ? "text-ink-secondary" : "text-ink-tertiary"
                        }`}
                      >
                        {t(`kinds.${kind.key}.title`)}
                      </span>
                    </span>
                    {isActive ? (
                      <CheckCircle size={22} weight="fill" className="text-accent" aria-hidden="true" />
                    ) : (
                      <ArrowRight
                        size={20}
                        className="text-ink-tertiary transition-transform duration-200 group-hover:translate-x-1 group-hover:text-accent"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </fieldset>

            <div className="min-h-[430px]" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                {activeKind ? (
                  <motion.div
                    key={activeKind.key}
                    initial={reduce ? false : { opacity: 0, x: 14, filter: "blur(3px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={reduce ? undefined : { opacity: 0, x: -8, filter: "blur(2px)" }}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { duration: DURATION.reveal, ease: EASE }
                    }
                    className="flex min-h-[430px] flex-col rounded-xl bg-[#1837c9] p-7 text-white sm:p-9 dark:bg-[#1d348f]"
                  >
                    <activeKind.icon size={34} weight="duotone" aria-hidden="true" />
                    <p className="mt-8 text-[0.8125rem] font-semibold text-white/75">
                      {t("navigator.matchLabel")}
                    </p>
                    <h3 className="mt-3 text-balance font-display text-[clamp(1.75rem,3vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.025em]">
                      {t(`kinds.${activeKind.key}.title`)}
                    </h3>
                    <p className="mt-4 text-pretty text-[0.9375rem] leading-[1.7] text-white/85">
                      {t(`kinds.${activeKind.key}.desc`)}
                    </p>
                    <a
                      href={activeKind.href}
                      className="scholarship-motion-control group mt-auto inline-flex min-h-12 items-center justify-between rounded-lg bg-white px-5 py-3 font-semibold text-[#10256f] transition-[background-color,transform] duration-150 hover:bg-[#eef2ff] active:scale-[0.985]"
                    >
                      {t("navigator.cta")}
                      <ArrowRight
                        size={19}
                        weight="bold"
                        className="transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </a>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={false}
                    exit={reduce ? undefined : { opacity: 0, scale: 0.985 }}
                    transition={reduce ? { duration: 0 } : { duration: 0.22, ease: EASE }}
                    className="flex min-h-[430px] flex-col justify-between rounded-xl border border-border-medium bg-bg-surface p-7 sm:p-9"
                  >
                    <Question size={34} weight="duotone" className="text-accent" aria-hidden="true" />
                    <div>
                      <h3 className="max-w-[16ch] text-balance font-display text-[1.75rem] font-semibold leading-[1.12] tracking-[-0.02em] text-ink-primary">
                        {t("navigator.emptyHeading")}
                      </h3>
                      <p className="mt-4 max-w-[42ch] text-pretty text-[0.9375rem] leading-[1.7] text-ink-secondary">
                        {t("navigator.emptyBody")}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <section
        className="section-padding border-t border-border-subtle bg-bg-surface"
        aria-labelledby="dokumenty-heading"
      >
        <div className="mx-auto grid max-w-[1200px] gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-20">
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2
                id="dokumenty-heading"
                className="text-balance font-display text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-ink-primary"
              >
                {t("documentsHeading")}
              </h2>
              <p className="font-mono text-[0.75rem] font-medium text-ink-tertiary tabular-nums">
                {t("documentsCount", { count: documents.length })}
              </p>
            </div>
            <ol className="mt-8 border-y border-border-medium">
              {documents.map((doc, index) => (
                <li
                  key={doc}
                  className="scholarship-document-row flex min-h-[68px] items-start gap-4 border-b border-border-subtle py-4 last:border-b-0"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 w-8 shrink-0 font-mono text-[0.75rem] font-medium tabular-nums text-accent"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[0.9375rem] leading-[1.55] text-ink-secondary">
                    {doc}
                  </span>
                </li>
              ))}
            </ol>
            {docManifest.stypendiaAll.href && (
              <a
                href={docManifest.stypendiaAll.href}
                {...(docManifest.stypendiaAll.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : { download: true })}
                className="scholarship-motion-control mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg border border-border-strong px-5 py-2.5 text-[0.9375rem] font-semibold text-ink-primary transition-[background-color,transform] duration-150 hover:bg-bg-elevated active:scale-[0.98]"
              >
                <FileText size={18} aria-hidden="true" />
                {t("downloadAll")}
              </a>
            )}
          </div>

          <div>
            <h2 className="text-balance font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary">
              {t("linksHeading")}
            </h2>
            <ul className="mt-8 border-y border-border-medium">
              {officialLinks.map((link) => {
                const OutIcon = link.external ? ArrowSquareOut : ArrowRight;
                return (
                  <li key={link.key} className="border-b border-border-subtle last:border-b-0">
                    <a
                      href={link.href}
                      {...(link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="scholarship-motion-control group flex min-h-[76px] items-center justify-between gap-4 py-4 transition-colors hover:text-accent"
                    >
                      <span className="text-[0.9375rem] font-semibold text-ink-primary transition-colors group-hover:text-accent">
                        {t(`officialLinks.${link.key}`)}
                      </span>
                      <OutIcon
                        size={20}
                        aria-hidden="true"
                        className="shrink-0 text-ink-tertiary transition-[color,transform] duration-200 group-hover:translate-x-1 group-hover:text-accent"
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
