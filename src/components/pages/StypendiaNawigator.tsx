"use client";

import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { useTranslations } from "next-intl";
import { ArrowRight, CheckCircle, Coins, Lifebuoy, Medal, Question, Trophy, Wheelchair, type Icon } from "@phosphor-icons/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { DURATION, EASE } from "@/lib/motion";

type KindKey = "socjalne" | "rektora" | "fundusz" | "niepelnosprawni" | "zapomoga";

interface Kind {
  key: KindKey;
  href: string;
  icon: Icon;
}

const kinds: Kind[] = [
  { key: "socjalne", href: "#socjalne", icon: Coins },
  { key: "rektora", href: "#rektora", icon: Trophy },
  { key: "fundusz", href: "#fundusz", icon: Medal },
  { key: "niepelnosprawni", href: "#niepelnosprawni", icon: Wheelchair },
  { key: "zapomoga", href: "#zapomoga", icon: Lifebuoy },
];

/**
 * „Które świadczenie dla mnie?” - wybór sytuacji i panel z dopasowaniem.
 * Jedyna interaktywna część hubu Stypendiów; reszta strony renderuje się na
 * serwerze (StypendiaContent).
 */
export function StypendiaNawigator() {
  const reduce = useReducedMotion();
  const t = useTranslations("stypendia");
  const [selected, setSelected] = useState<KindKey | null>(null);
  const activeKind = kinds.find((kind) => kind.key === selected) ?? null;

  return (
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
        <m.div
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
        </m.div>
      ) : (
        <m.div
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
        </m.div>
      )}
    </AnimatePresence>
  </div>
</div>
  );
}
