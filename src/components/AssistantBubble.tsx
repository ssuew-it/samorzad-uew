"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { CircleNotch, PaperPlaneRight, Sparkle, X } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import {
  addCitation,
  runAssistant,
  type AssistantCitation,
  type AssistantStatus,
} from "@/lib/assistant-client";
import { DURATION, EASE } from "@/lib/motion";
import { readConsent, subscribeConsent } from "@/lib/consent";

/** Krótkie pytania startowe - bez nich nikt nie wie, o co można zapytać. */
const EXAMPLE_KEYS = ["stypendium", "odwolanie", "rzecznik", "kolo"] as const;

/**
 * Asystent jako dymek - jest na każdej podstronie, nie zabiera własnego adresu.
 *
 * Świadome decyzje układu:
 * - siedzi w prawym dolnym rogu, więc nigdy nie zasłania górnej nawigacji;
 * - `BackToTop` przesunięto wyżej, żeby oba przyciski nie nachodziły na siebie;
 * - baner zgody ma wyższy `z-index` i wygrywa, dopóki użytkownik go nie zamknie
 *   - zgoda jest ważniejsza niż zachęta do rozmowy;
 * - panel jest zakotwiczony do dołu i ograniczony wysokością, więc nawet na
 *   niskim ekranie nie sięga paska nawigacji.
 */
export function AssistantBubble() {
  const t = useTranslations("asystent");
  const locale = useLocale();
  const reduce = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState("");
  const [answer, setAnswer] = useState("");
  const [citations, setCitations] = useState<AssistantCitation[]>([]);
  const [status, setStatus] = useState<AssistantStatus>("idle");

  const abortRef = useRef<AbortController | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Dopóki baner zgody wisi, dymek się nie pokazuje: baner jest przyklejony do
  // dołu i na telefonie zajmuje całą szerokość, więc przykryłby przycisk i
  // uczyniłby go nieklikalnym. Najpierw decyzja o zgodzie, potem rozmowa.
  const [consentSettled, setConsentSettled] = useState(false);
  useEffect(() => {
    const sync = () => setConsentSettled(readConsent() !== null);
    sync();
    return subscribeConsent(sync);
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Esc zamyka, focus wraca na dymek. Świadomie NIE blokujemy przewijania
  // strony - dymek jest dodatkiem do treści, a nie modalem, który ją przejmuje.
  useEffect(() => {
    if (!open) return;
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const ask = (raw: string) => {
    const q = raw.trim();
    if (q.length < 3) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setAsked(q);
    setAnswer("");
    setCitations([]);
    setStatus("streaming");

    void runAssistant({
      question: q,
      locale,
      signal: controller.signal,
      onStatus: setStatus,
      onEvent: (event) => {
        if (event.type === "text") setAnswer((prev) => prev + event.text);
        else if (event.type === "citation") setCitations((prev) => addCitation(prev, event));
        else if (event.type === "done") setStatus("done");
        else if (event.type === "refusal") setStatus("refusal");
        else if (event.type === "error") setStatus("error");
      },
    });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(question);
  };

  const busy = status === "streaming";

  if (!consentSettled) return null;

  return (
    <>
      {/* Dymek */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={open ? t("close") : t("open")}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-bg-base shadow-lg shadow-black/20 transition-colors hover:bg-accent-dim"
      >
        {open ? (
          <X size={24} weight="bold" aria-hidden="true" />
        ) : (
          <Sparkle size={24} weight="fill" aria-hidden="true" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="false"
            aria-label={t("heading")}
            initial={reduce ? false : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={reduce ? { duration: 0 } : { duration: DURATION.reveal, ease: EASE }}
            className="fixed bottom-24 right-3 left-3 z-40 flex max-h-[70vh] flex-col overflow-hidden rounded-2xl border border-border-medium bg-bg-surface shadow-2xl shadow-black/25 sm:left-auto sm:w-[400px]"
          >
            {/* Nagłówek */}
            <div className="flex items-start justify-between gap-3 border-b border-border-subtle px-5 py-4">
              <div>
                <p className="font-display text-[1.0625rem] font-semibold text-ink-primary">
                  {t("heading")}
                </p>
                <p className="mt-0.5 text-[0.8125rem] leading-[1.5] text-ink-tertiary">
                  {t("bubbleLead")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                aria-label={t("close")}
                className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-bg-elevated hover:text-ink-primary"
              >
                <X size={18} weight="bold" aria-hidden="true" />
              </button>
            </div>

            {/* Treść */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {status === "idle" ? (
                <>
                  <p className="text-[0.8125rem] font-medium uppercase tracking-[0.08em] text-ink-tertiary">
                    {t("examplesLabel")}
                  </p>
                  <ul className="mt-3 flex flex-col gap-2">
                    {EXAMPLE_KEYS.map((key) => {
                      const example = t(`examples.${key}`);
                      return (
                        <li key={key}>
                          <button
                            type="button"
                            onClick={() => {
                              setQuestion(example);
                              ask(example);
                            }}
                            className="w-full rounded-lg border border-border-subtle px-3 py-2.5 text-left text-[0.875rem] text-ink-secondary transition-colors hover:border-border-soft hover:bg-bg-elevated hover:text-ink-primary"
                          >
                            {example}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : (
                <>
                  <p className="flex items-start gap-2 text-[0.8125rem] text-ink-tertiary">
                    <Sparkle size={14} weight="fill" aria-hidden="true" className="mt-1 shrink-0 text-accent" />
                    <span>{asked}</span>
                  </p>

                  {status === "not_configured" ? (
                    <p role="status" className="mt-3 text-[0.9375rem] leading-[1.65] text-ink-secondary">
                      {t.rich("notConfigured", {
                        link: (chunks) => (
                          <Link
                            href="/kontakt"
                            onClick={() => setOpen(false)}
                            className="font-medium text-accent hover:text-accent-dim"
                          >
                            {chunks}
                          </Link>
                        ),
                      })}
                    </p>
                  ) : status === "refusal" ? (
                    <p role="status" className="mt-3 text-[0.9375rem] leading-[1.65] text-ink-secondary">
                      {t("refusal")}
                    </p>
                  ) : status === "error" ? (
                    <p role="status" className="mt-3 text-[0.9375rem] leading-[1.65] text-ink-secondary">
                      {t("error")}
                    </p>
                  ) : (
                    <>
                      {answer && (
                        <p className="mt-3 whitespace-pre-wrap text-[0.9375rem] leading-[1.7] text-ink-primary">
                          {answer}
                        </p>
                      )}
                      {busy && (
                        <p className="mt-3 flex items-center gap-2 text-[0.8125rem] text-ink-tertiary">
                          <CircleNotch
                            size={14}
                            weight="bold"
                            aria-hidden="true"
                            className={reduce ? "" : "animate-spin"}
                          />
                          {t("thinking")}
                        </p>
                      )}
                      {citations.length > 0 && (
                        <div className="mt-4 border-t border-border-subtle pt-3">
                          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-ink-tertiary">
                            {t("sourcesHeading")}
                          </p>
                          <ul className="mt-2 flex flex-col gap-2">
                            {citations.map((c, i) => (
                              <li key={`${c.context ?? c.title ?? i}`}>
                                {c.context ? (
                                  <Link
                                    href={c.context}
                                    onClick={() => setOpen(false)}
                                    className="block rounded-lg border border-border-subtle p-2.5 transition-colors hover:border-border-soft hover:bg-bg-elevated"
                                  >
                                    <span className="block text-[0.8125rem] font-medium text-accent">
                                      {c.title ?? t("sourceFallback")}
                                    </span>
                                    <span className="mt-0.5 block text-[0.75rem] leading-[1.55] text-ink-tertiary">
                                      „{c.citedText}”
                                    </span>
                                  </Link>
                                ) : (
                                  <div className="rounded-lg border border-border-subtle p-2.5">
                                    <span className="block text-[0.8125rem] font-medium text-ink-secondary">
                                      {c.title ?? t("sourceFallback")}
                                    </span>
                                    <span className="mt-0.5 block text-[0.75rem] leading-[1.55] text-ink-tertiary">
                                      „{c.citedText}”
                                    </span>
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {/* Pełna odpowiedź ogłaszana raz, po zakończeniu - czytnik
                          ekranu nie powtarza akapitu przy każdym tokenie. */}
                      {status === "done" && (
                        <div role="status" aria-live="polite" className="sr-only">
                          {answer}
                        </div>
                      )}
                    </>
                  )}

                  <p className="mt-4 border-t border-border-subtle pt-3 text-[0.75rem] leading-[1.55] text-ink-tertiary">
                    {t("disclaimer")}
                  </p>
                </>
              )}
            </div>

            {/* Pytanie */}
            <form onSubmit={onSubmit} className="border-t border-border-subtle p-3">
              <label htmlFor="asystent-bubble-input" className="sr-only">
                {t("inputLabel")}
              </label>
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  id="asystent-bubble-input"
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={t("placeholder")}
                  autoComplete="off"
                  className="h-11 w-full min-w-0 rounded-lg border border-border-strong bg-bg-base px-3 text-[0.9375rem] text-ink-primary placeholder:text-ink-tertiary focus:border-accent focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={busy || question.trim().length < 3}
                  aria-label={t("askButton")}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-bg-base transition-colors hover:bg-accent-dim disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <PaperPlaneRight size={18} weight="regular" aria-hidden="true" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
