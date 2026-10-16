"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function ConsentBanner({
  onAccept,
  onReject,
}: {
  onAccept: () => void;
  onReject: () => void;
}) {
  const t = useTranslations("consent");
  const reduce = useReducedMotion();

  return (
    <motion.div
      role="dialog"
      aria-label={t("aria")}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[90] mx-auto max-w-[620px] rounded-xl border border-border-medium bg-bg-surface p-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:p-5"
    >
      <p className="text-[0.8125rem] leading-[1.55] text-ink-secondary sm:text-[0.875rem] sm:leading-[1.6]">
        {t("message")}{" "}
        <Link href="/prywatnosc" className="font-medium text-accent transition-colors hover:text-accent-dim">
          {t("more")}
        </Link>
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:flex sm:flex-wrap sm:gap-3">
        <button
          type="button"
          onClick={onAccept}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-accent px-4 text-center text-[0.8125rem] font-medium text-bg-base transition-[background-color,transform] duration-150 ease-out hover:bg-accent-dim active:scale-[0.97] sm:px-6 sm:text-[0.875rem]"
        >
          {t("accept")}
        </button>
        <button
          type="button"
          onClick={onReject}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-border-strong px-4 text-center text-[0.8125rem] font-medium text-ink-primary transition-colors hover:bg-bg-elevated sm:px-6 sm:text-[0.875rem]"
        >
          {t("reject")}
        </button>
      </div>
    </motion.div>
  );
}
