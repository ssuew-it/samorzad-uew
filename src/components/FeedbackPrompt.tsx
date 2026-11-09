"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle, Star, X } from "@phosphor-icons/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { DURATION, EASE } from "@/lib/motion";
import { sendFeedback } from "@/app/actions/opinia";
import { markFeedbackDone } from "@/lib/feedback-flag";

type Krok = "ocena" | "szczegoly" | "wysylam" | "dzieki" | "blad";

/**
 * Okienko „Jak oceniasz nową stronę?” - 1-5 gwiazdek, potem dwa pytania
 * opcjonalne. Pokazuje je LazyFeedbackPrompt (po minucie na stronie, raz).
 *
 * Dostępność: nie przejmuje fokusu i nie blokuje strony (dialog niemodalny
 * w rogu), gwiazdki to zwykłe pola radio (strzałki działają), Esc zamyka.
 * Zamknięcie i wysłanie zapisują w przeglądarce, że już odpowiedziano -
 * dopiero po ruchu użytkownika, nigdy wcześniej.
 */
/**
 * `bottom` - odległość od dołu ekranu w px, gdy pod spodem stoi baner cookies
 * (bez tego okienko siedzi 24 px nad dołem).
 */
export function FeedbackPrompt({ onClose, bottom }: { onClose: () => void; bottom?: number }) {
  const t = useTranslations("opinia");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const id = useId();
  const [krok, setKrok] = useState<Krok>("ocena");
  const [ocena, setOcena] = useState(0);
  const [podglad, setPodglad] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  const zamknij = () => {
    markFeedbackDone();
    onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") zamknij();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- zamknij jest stały w obrębie okienka
  }, []);

  useEffect(() => {
    if (krok !== "dzieki") return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [krok, onClose]);

  const wyslij = async (e: FormEvent) => {
    e.preventDefault();
    const dane = new FormData(e.currentTarget as HTMLFormElement);
    dane.set("ocena", String(ocena));
    dane.set("strona", window.location.pathname);
    dane.set("jezyk", locale);
    setKrok("wysylam");
    const wynik = await sendFeedback(dane);
    markFeedbackDone();
    setKrok(wynik.status === "ok" ? "dzieki" : "blad");
  };

  const aktywna = podglad || ocena;

  return (
    <motion.section
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${id}-t`}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
      transition={reduce ? { duration: 0 } : { duration: DURATION.reveal, ease: EASE }}
      style={bottom !== undefined ? { bottom } : undefined}
      className="fixed bottom-6 left-3 z-40 w-[min(360px,calc(100vw-96px))] rounded-2xl border border-border-medium bg-bg-surface p-4 shadow-2xl shadow-black/20 sm:left-6"
    >
      <div className="flex items-start justify-between gap-3">
        <p id={`${id}-t`} className="font-display text-[0.9375rem] font-semibold leading-[1.35] text-ink-primary">
          {krok === "dzieki" ? t("thanksTitle") : t("title")}
        </p>
        <button
          type="button"
          onClick={zamknij}
          aria-label={t("close")}
          className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-bg-elevated hover:text-ink-primary"
        >
          <X size={16} weight="bold" aria-hidden="true" />
        </button>
      </div>

      {krok === "dzieki" ? (
        <p role="status" className="mt-2 flex items-start gap-2 text-[0.875rem] leading-[1.55] text-ink-secondary">
          <CheckCircle size={18} weight="fill" aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
          {t("thanks")}
        </p>
      ) : krok === "blad" ? (
        <p role="status" className="mt-2 text-[0.875rem] leading-[1.55] text-ink-secondary">
          {t("error")}
        </p>
      ) : (
        <form ref={formRef} onSubmit={wyslij} className="mt-2">
          {/* Honeypot - pole niewidoczne dla człowieka, kuszące dla bota. */}
          <input type="text" name="firma" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
          <fieldset>
            <legend className="sr-only">{t("title")}</legend>
            <div className="flex gap-1" onMouseLeave={() => setPodglad(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n} className="cursor-pointer" onMouseEnter={() => setPodglad(n)}>
                  <input
                    type="radio"
                    name="ocena-gwiazdki"
                    value={n}
                    checked={ocena === n}
                    onChange={() => {
                      setOcena(n);
                      setKrok("szczegoly");
                    }}
                    className="peer sr-only"
                  />
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                    <Star
                      size={26}
                      weight={n <= aktywna ? "fill" : "regular"}
                      aria-hidden="true"
                      className={n <= aktywna ? "text-[#f5a524]" : "text-ink-tertiary"}
                    />
                  </span>
                  <span className="sr-only">{t("stars", { n })}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {(krok === "szczegoly" || krok === "wysylam") && (
            <div className="mt-3 grid gap-3">
              <fieldset>
                <legend className="text-[0.8125rem] font-medium text-ink-secondary">{t("foundLabel")}</legend>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {(["tak", "czesciowo", "nie"] as const).map((v) => (
                    <label key={v} className="cursor-pointer">
                      <input type="radio" name="znalezione" value={v} className="peer sr-only" />
                      <span className="inline-flex min-h-9 items-center rounded-full border border-border-subtle px-3 text-[0.8125rem] text-ink-secondary transition-colors peer-checked:border-accent peer-checked:bg-accent peer-checked:text-bg-base peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                        {t(`found.${v}`)}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div>
                <label htmlFor={`${id}-k`} className="text-[0.8125rem] font-medium text-ink-secondary">
                  {t("commentLabel")}
                </label>
                <textarea
                  id={`${id}-k`}
                  name="komentarz"
                  rows={3}
                  maxLength={1000}
                  aria-describedby={`${id}-h`}
                  className="mt-1.5 w-full resize-none rounded-lg border border-border-strong bg-bg-base px-3 py-2 text-[0.875rem] text-ink-primary placeholder:text-ink-tertiary focus:border-accent focus:outline-none"
                />
                <p id={`${id}-h`} className="mt-1 text-[0.75rem] text-ink-tertiary">
                  {t("commentHint")}
                </p>
              </div>
              <button
                type="submit"
                disabled={krok === "wysylam"}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-5 text-[0.875rem] font-medium text-bg-base transition-colors hover:bg-accent-dim disabled:opacity-60"
              >
                {krok === "wysylam" ? t("sending") : t("send")}
              </button>
            </div>
          )}
        </form>
      )}
    </motion.section>
  );
}

/** AnimatePresence wokół okienka - osobno, żeby LazyFeedbackPrompt był lekki. */
export function FeedbackPromptPresence({ open, onClose, bottom }: { open: boolean; onClose: () => void; bottom?: number }) {
  return <AnimatePresence>{open && <FeedbackPrompt onClose={onClose} bottom={bottom} />}</AnimatePresence>;
}
