"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useLocale, useMessages, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { MagnifyingGlass, ArrowRight, ArrowLeft, Sparkle, CircleNotch } from "@phosphor-icons/react";
import { searchPages, highlightSegments } from "@/lib/searchIndex";
import { buildPassages, searchPassages, excerpt } from "@/lib/knowledge";

interface SearchCommandProps {
  open: boolean;
  onClose: () => void;
}

/** Query must look like an actual question before we offer to ask the assistant. */
const MIN_ASK_LENGTH = 8;

/** Mirrors the NDJSON event shape streamed by POST /api/asystent. */
type AssistantStreamEvent =
  | { type: "text"; text: string }
  | { type: "citation"; cited_text: string; title: string | null; context: string | null }
  | { type: "done" }
  | { type: "refusal" }
  | { type: "error"; code: string };

interface AssistantCitation {
  title: string | null;
  citedText: string;
  context: string | null;
}

type AssistantStatus = "idle" | "streaming" | "done" | "refusal" | "error" | "not_configured";

export function SearchCommand({ open, onClose }: SearchCommandProps) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const t = useTranslations("ui.search");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Locale-correct opening/closing quotes for the citation excerpts below —
  // mirrors messages/*.json (PL „…”, EN “…”).
  const [quoteOpen, quoteClose] = locale === "en" ? ["“", "”"] : ["„", "”"];

  const results = useMemo(() => searchPages(query, locale), [query, locale]);

  const messages = useMessages();
  const passages = useMemo(() => buildPassages(messages), [messages]);
  const contentHits = useMemo(() => searchPassages(passages, query, 5), [passages, query]);

  // "Ask the assistant" joins the SAME shared keyboard index as the last row —
  // it only appears once the query is long enough to look like a real question,
  // and it always comes after the free/instant page + content hits.
  const askEligible = query.trim().length >= MIN_ASK_LENGTH;
  const askIndex = results.length + contentHits.length;

  // Shared keyboard-navigation list: page results, then content hits, then
  // (optionally) the ask row — one active index spans all of it.
  const totalCount = results.length + contentHits.length + (askEligible ? 1 : 0);

  // Answer view state — replaces the results list inside the same panel.
  const [view, setView] = useState<"results" | "answer">("results");
  const [askedQuestion, setAskedQuestion] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [citations, setCitations] = useState<AssistantCitation[]>([]);
  const [assistantStatus, setAssistantStatus] = useState<AssistantStatus>("idle");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const resetAssistant = () => {
    abortRef.current?.abort();
    setView("results");
    setAssistantStatus("idle");
    setAnswerText("");
    setCitations([]);
    setAskedQuestion("");
  };

  const handleAssistantEvent = (event: AssistantStreamEvent) => {
    if (event.type === "text") {
      setAnswerText((prev) => prev + event.text);
    } else if (event.type === "citation") {
      setCitations((prev) => {
        const key = event.context ?? event.title ?? event.cited_text;
        if (prev.some((c) => (c.context ?? c.title ?? c.citedText) === key)) return prev;
        return [...prev, { title: event.title, citedText: event.cited_text, context: event.context }];
      });
    } else if (event.type === "done") {
      setAssistantStatus("done");
    } else if (event.type === "refusal") {
      setAssistantStatus("refusal");
    } else if (event.type === "error") {
      setAssistantStatus("error");
    }
  };

  const askAssistant = (question: string) => {
    abortRef.current?.abort();
    setView("answer");
    setAskedQuestion(question);
    setAnswerText("");
    setCitations([]);
    setAssistantStatus("streaming");

    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      try {
        const res = await fetch("/api/asystent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, locale }),
          signal: controller.signal,
        });

        if (res.status === 503) {
          setAssistantStatus("not_configured");
          return;
        }
        if (!res.ok || !res.body) {
          setAssistantStatus("error");
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? ""; // keep the partial trailing line for next chunk
          for (const line of lines) {
            if (!line.trim()) continue;
            handleAssistantEvent(JSON.parse(line) as AssistantStreamEvent);
          }
        }
        if (buffer.trim()) {
          try {
            handleAssistantEvent(JSON.parse(buffer) as AssistantStreamEvent);
          } catch {
            // Stream ended mid-line (e.g. aborted) — nothing sane to parse.
          }
        }
      } catch {
        if (controller.signal.aborted) return; // user closed/backed out — not a real error
        setAssistantStatus("error");
      }
    })();
  };

  // Focus input + lock body scroll while open; restore focus on close.
  useEffect(() => {
    if (!open) return;
    const prevFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
      prevFocused?.focus();
    };
  }, [open]);

  // Reset state on close (query only changes via onChange, which also resets
  // active to 0 — so the active index never goes out of range).
  const close = () => {
    abortRef.current?.abort();
    setQuery("");
    setActive(0);
    setView("results");
    setAssistantStatus("idle");
    setAnswerText("");
    setCitations([]);
    setAskedQuestion("");
    onClose();
  };

  const go = (href: string) => {
    close();
    router.push(href);
  };

  const backToResults = () => {
    resetAssistant();
    setActive(askEligible ? askIndex : 0);
    inputRef.current?.focus();
  };

  // Typing again while an answer is showing means the user wants to search
  // afresh — drop back to the results view instead of leaving a stale answer
  // behind an editable query box.
  const onQueryChange = (value: string) => {
    setQuery(value);
    setActive(0);
    if (view === "answer") resetAssistant();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      // First Escape backs out of the answer view; only a second press (once
      // we're already looking at results) closes the whole palette.
      if (view === "answer") {
        backToResults();
      } else {
        close();
      }
    } else if (e.key === "Tab") {
      // Focus trap: keep Tab/Shift+Tab cycling inside the dialog (mirrors
      // Nav.tsx's mobile-menu trap) since aria-modal claims a modal that
      // isn't otherwise inert.
      if (!dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    } else if (e.key === "ArrowDown") {
      if (view !== "results") return;
      e.preventDefault();
      setActive((a) => Math.min(a + 1, totalCount - 1));
    } else if (e.key === "ArrowUp") {
      if (view !== "results") return;
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      if (view !== "results") return;
      e.preventDefault();
      if (askEligible && active === askIndex) {
        askAssistant(query.trim());
        return;
      }
      const href =
        active < results.length
          ? results[active]?.href
          : contentHits[active - results.length]?.passage.href;
      if (href) go(href);
    }
  };

  // Keep the active option scrolled into view.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`#search-opt-${active}`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Scrim */}
          <button
            type="button"
            aria-label={t("close")}
            onClick={close}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={t("dialog")}
            initial={reduce ? false : { opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onKeyDown={onKeyDown}
            className="relative z-10 w-full max-w-[560px] overflow-hidden rounded-2xl border border-border-soft bg-bg-surface shadow-2xl shadow-black/20"
          >
            {/* Input row */}
            <div className="flex items-center gap-3 border-b border-border-subtle px-5">
              <MagnifyingGlass size={20} weight="regular" aria-hidden="true" className="shrink-0 text-ink-tertiary" />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={view === "results"}
                aria-controls={view === "results" ? "search-listbox" : undefined}
                aria-activedescendant={
                  view === "results" && active < totalCount ? `search-opt-${active}` : undefined
                }
                aria-label={t("inputLabel")}
                placeholder={t("placeholder")}
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                className="h-14 w-full bg-transparent text-[1rem] text-ink-primary placeholder:text-ink-tertiary focus:outline-none"
              />
              <kbd className="hidden shrink-0 rounded border border-border-medium px-1.5 py-0.5 text-[0.6875rem] font-medium text-ink-tertiary sm:block">
                ESC
              </kbd>
            </div>

            {/* Results */}
            {view === "results" && (results.length + contentHits.length === 0 && !askEligible ? (
              <p
                role="status"
                aria-live="polite"
                className="px-5 py-10 text-center text-[0.9375rem] text-ink-secondary"
              >
                {t("noResults", { query })}
              </p>
            ) : (
              <ul
                ref={listRef}
                id="search-listbox"
                role="listbox"
                aria-label={t("resultsLabel")}
                className="max-h-[50vh] overflow-y-auto p-2"
              >
                {results.map((item, i) => {
                  const isActive = i === active;
                  const showGroup = i === 0 || results[i - 1].group !== item.group;
                  return (
                    <li key={item.href}>
                      {showGroup && (
                        <p className="px-3 pb-1 pt-3 text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-ink-tertiary">
                          {item.group}
                        </p>
                      )}
                      <button
                        type="button"
                        id={`search-opt-${i}`}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => go(item.href)}
                        onMouseMove={() => setActive(i)}
                        className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                          isActive ? "bg-bg-elevated text-ink-primary" : "text-ink-secondary"
                        }`}
                      >
                        <span className="text-[0.9375rem]">
                          {highlightSegments(item.label, query).map((seg, k) =>
                            seg.hit ? (
                              <mark key={k} className="bg-transparent font-semibold text-accent">
                                {seg.text}
                              </mark>
                            ) : (
                              <span key={k}>{seg.text}</span>
                            ),
                          )}
                        </span>
                        <ArrowRight
                          size={16}
                          weight="bold"
                          aria-hidden="true"
                          className={`shrink-0 transition-opacity ${isActive ? "text-accent opacity-100" : "opacity-0"}`}
                        />
                      </button>
                    </li>
                  );
                })}
                {contentHits.length > 0 && (
                  <>
                    <p className="px-3 pb-1 pt-3 text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-ink-tertiary">
                      {t("inContent")}
                    </p>
                    {contentHits.map((hit, j) => {
                      const i = results.length + j;
                      const isActive = i === active;
                      return (
                        <li key={`${hit.passage.href}-${j}`}>
                          <button
                            type="button"
                            id={`search-opt-${i}`}
                            role="option"
                            aria-selected={isActive}
                            onClick={() => go(hit.passage.href)}
                            onMouseMove={() => setActive(i)}
                            className={`flex min-h-11 w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors ${
                              isActive ? "bg-bg-elevated text-ink-primary" : "text-ink-secondary"
                            }`}
                          >
                            <span className="text-[0.9375rem] text-ink-secondary">
                              {excerpt(hit.passage.text, hit.index)}
                            </span>
                            <span className="text-[0.6875rem] font-medium uppercase tracking-[0.05em] text-ink-tertiary">
                              {hit.passage.label}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </>
                )}
                {askEligible && (
                  <li className={results.length + contentHits.length > 0 ? "mt-1 border-t border-border-subtle pt-1" : undefined}>
                    <button
                      type="button"
                      id={`search-opt-${askIndex}`}
                      role="option"
                      aria-selected={askIndex === active}
                      onClick={() => askAssistant(query.trim())}
                      onMouseMove={() => setActive(askIndex)}
                      className={`flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-accent transition-colors ${
                        askIndex === active ? "bg-accent-glow" : ""
                      }`}
                    >
                      <Sparkle size={18} weight="fill" aria-hidden="true" className="shrink-0" />
                      <span className="text-[0.9375rem] font-medium">{t("ask", { query: query.trim() })}</span>
                    </button>
                  </li>
                )}
              </ul>
            ))}

            {/* Answer view — replaces the results list inside the same panel. */}
            {view === "answer" && (
              <div className="max-h-[50vh] overflow-y-auto p-5">
                <button
                  type="button"
                  onClick={backToResults}
                  className="mb-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-ink-secondary transition-colors hover:text-accent"
                >
                  <ArrowLeft size={14} weight="bold" aria-hidden="true" />
                  {t("answerBack")}
                </button>

                <p className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-ink-tertiary">
                  {t("answerQuestionLabel")}
                </p>
                <p className="mt-1 text-[0.9375rem] text-ink-secondary">{askedQuestion}</p>

                <div className="mt-5">
                  {assistantStatus === "not_configured" && (
                    <p role="status" aria-live="polite" className="text-[0.9375rem] leading-[1.6] text-ink-secondary">
                      {t.rich("answerNotConfigured", {
                        link: (chunks) => (
                          <Link href="/kontakt" className="text-accent underline underline-offset-2">
                            {chunks}
                          </Link>
                        ),
                      })}
                    </p>
                  )}

                  {assistantStatus === "refusal" && (
                    <p role="status" aria-live="polite" className="text-[0.9375rem] leading-[1.6] text-ink-secondary">
                      {t("answerRefusal")}
                    </p>
                  )}

                  {assistantStatus === "error" && (
                    <p role="status" aria-live="polite" className="text-[0.9375rem] leading-[1.6] text-ink-secondary">
                      {t("answerError")}
                    </p>
                  )}

                  {(assistantStatus === "streaming" || assistantStatus === "done") && (
                    <>
                      <p className="whitespace-pre-wrap text-[0.9375rem] leading-[1.6] text-ink-primary">
                        {answerText}
                      </p>
                      {assistantStatus === "streaming" && (
                        <div className="mt-3 flex items-center gap-2 text-[0.8125rem] text-ink-tertiary" aria-hidden="true">
                          <CircleNotch size={14} weight="bold" className={reduce ? undefined : "animate-spin"} />
                          {t("answerStreaming")}
                        </div>
                      )}
                    </>
                  )}

                  {/* Screen readers hear every state message above as it's set
                      (each is set once, not per-token). The one case that IS
                      built token-by-token — the streamed answer text — is
                      deliberately NOT itself aria-live (that would spam a
                      screen reader with every chunk); instead we announce it
                      once, in full, right here, the moment streaming finishes. */}
                  {assistantStatus === "done" && (
                    <div role="status" aria-live="polite" className="sr-only">
                      {answerText}
                    </div>
                  )}
                </div>

                {citations.length > 0 && (
                  <div className="mt-6">
                    <p className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-ink-tertiary">
                      {t("answerSourcesHeading")}
                    </p>
                    <ul className="mt-2 flex flex-col gap-2">
                      {citations.map((c, i) => {
                        const body = (
                          <>
                            <span className="block text-[0.8125rem] font-medium text-ink-primary">
                              {c.title ?? t("answerSourceFallback")}
                            </span>
                            <span className="mt-0.5 block text-[0.8125rem] italic text-ink-tertiary">
                              {quoteOpen}{c.citedText}{quoteClose}
                            </span>
                          </>
                        );
                        return (
                          <li key={c.context ?? `${c.title ?? "source"}-${i}`}>
                            {c.context ? (
                              <Link
                                href={c.context}
                                className="block rounded-lg border border-border-subtle px-3 py-2.5 transition-colors hover:border-accent hover:bg-bg-elevated"
                              >
                                {body}
                              </Link>
                            ) : (
                              <div className="block rounded-lg border border-border-subtle px-3 py-2.5">{body}</div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <p className="mt-6 border-t border-border-subtle pt-4 text-[0.75rem] leading-[1.5] text-ink-tertiary">
                  {t("answerDisclaimer")}
                </p>
              </div>
            )}

            {view === "results" && query.trim() && results.length > 0 && (
              <button
                type="button"
                onClick={() => go(`/szukaj?q=${encodeURIComponent(query.trim())}`)}
                className="flex min-h-11 w-full items-center justify-center gap-1.5 border-t border-border-subtle px-5 py-3 text-[0.8125rem] font-medium text-ink-secondary transition-colors hover:bg-bg-elevated hover:text-accent"
              >
                {t("showAll", { query: query.trim() })}
                <ArrowRight size={14} weight="bold" aria-hidden="true" />
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
