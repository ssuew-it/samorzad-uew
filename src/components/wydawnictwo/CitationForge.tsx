"use client";

import { useEffect, useId, useState } from "react";
import { Copy, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { formatCitation } from "@/lib/publications";

export interface CitationForgeLabels {
  authorLabel: string;
  yearLabel: string;
  titleLabel: string;
  resultLabel: string;
  note: string;
  copyButton: string;
  copiedConfirm: string;
  copyError: string;
}

interface CitationForgeProps {
  /** Prawdziwy, opublikowany wpis - punkt wyjścia, nie atrapa. */
  seed: { author: string; title: string; year: number };
  labels: CitationForgeLabels;
}

type CopyState = "idle" | "copied" | "error";

/**
 * Cytowanie, w które student wpisuje SIEBIE.
 *
 * DESIGN.md wymaga, by widget podstrony wynikał z tego, po co ta strona jest
 * („per-page soul"): tu chodzi o przekonanie kogoś, że jego tekst z zajęć może
 * stać się realną, cytowalną publikacją. Statyczny przykład cytowania tego nie
 * robił - pokazywał cudzy dorobek. Ten sam blok, gdy da się w nim podmienić
 * nazwisko i tytuł, przestaje być instrukcją, a staje się dowodem.
 *
 * Pola startują z PRAWDZIWEGO wpisu z tomu, więc zanim ktokolwiek cokolwiek
 * wpisze, sekcja nadal pokazuje autentyczny wzór cytowania. Pusty formularz
 * musiałby udawać dane atrapami.
 */
export function CitationForge({ seed, labels }: CitationForgeProps) {
  const authorId = useId();
  const yearId = useId();
  const titleId = useId();
  const resultId = useId();

  const [author, setAuthor] = useState(seed.author);
  const [title, setTitle] = useState(seed.title);
  // Rok trzymamy jako TEKST, nie liczbę: przy `number` skasowanie zawartości
  // daje pusty string i tak, a stan liczbowy zmuszałby do zgadywania, czy
  // użytkownik kasuje pole, czy wpisał zero.
  const [year, setYear] = useState(String(seed.year));
  const [copyState, setCopyState] = useState<CopyState>("idle");

  useEffect(() => {
    if (copyState === "idle") return;
    const id = setTimeout(() => setCopyState("idle"), 4000);
    return () => clearTimeout(id);
  }, [copyState]);

  // Puste pole wraca do prawdziwego wpisu, żeby cytowanie nigdy nie pokazywało
  // dziury w środku zdania.
  const citation = formatCitation({
    authors: [author.trim() || seed.author],
    title: title.trim() || seed.title,
    // Dopóki rok nie jest pełną czterocyfrową liczbą, cytowanie pokazuje rok
    // wyjściowy - inaczej w połowie wpisywania stałoby tam „(20)".
    year: /^\d{4}$/.test(year.trim()) ? Number(year.trim()) : seed.year,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(citation);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  };

  const field =
    "min-h-12 w-full rounded-lg border border-border-medium bg-bg-base px-4 text-[0.9375rem] text-ink-primary transition-colors placeholder:text-ink-tertiary focus:border-accent focus:outline-2 focus:outline-offset-2 focus:outline-accent";

  return (
    <div className="mt-8 max-w-[760px] overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface">
      <div className="grid gap-4 p-6 sm:grid-cols-[1fr_7.5rem]">
        <div>
          <label htmlFor={authorId} className="block text-[0.8125rem] font-medium text-ink-secondary">
            {labels.authorLabel}
          </label>
          <input
            id={authorId}
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            className={`mt-2 ${field}`}
          />
        </div>
        <div>
          <label htmlFor={yearId} className="block text-[0.8125rem] font-medium text-ink-secondary">
            {labels.yearLabel}
          </label>
          <input
            id={yearId}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={year}
            onChange={(e) => setYear(e.target.value.replace(/[^0-9]/g, ""))}
            autoComplete="off"
            className={`mt-2 ${field} tabular-nums`}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={titleId} className="block text-[0.8125rem] font-medium text-ink-secondary">
            {labels.titleLabel}
          </label>
          <input
            id={titleId}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoComplete="off"
            className={`mt-2 ${field}`}
          />
        </div>
      </div>

      {/* Wynik na osobnym, ciemniejszym polu - to on jest tu treścią, a pola
          powyżej tylko narzędziem. */}
      <div className="border-t border-border-subtle bg-bg-elevated p-6">
        <p
          id={`${resultId}-label`}
          className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-tertiary"
        >
          {labels.resultLabel}
        </p>
        {/* Bez `aria-live`: tekst przebudowuje się przy każdym naciśnięciu
            klawisza, więc ogłaszanie go czytałoby cytowanie od nowa po każdej
            literze. Powiązanie przez `aria-labelledby` pozwala do niego przejść
            i przeczytać je wtedy, gdy użytkownik tego chce. */}
        <p
          aria-labelledby={`${resultId}-label`}
          tabIndex={-1}
          className="font-mono mt-3 text-[0.875rem] leading-[1.75] text-ink-primary"
        >
          {citation}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-border-strong px-6 text-[0.9375rem] font-medium text-ink-primary transition-colors hover:border-border-soft hover:bg-bg-surface"
          >
            {copyState === "copied" ? (
              <CheckCircle size={18} weight="regular" aria-hidden="true" className="text-accent" />
            ) : copyState === "error" ? (
              <WarningCircle size={18} weight="regular" aria-hidden="true" className="text-red-500" />
            ) : (
              <Copy size={18} weight="regular" aria-hidden="true" />
            )}
            {labels.copyButton}
          </button>
          <p aria-live="polite" className="text-[0.8125rem] text-ink-tertiary">
            {copyState === "copied" && labels.copiedConfirm}
            {copyState === "error" && (
              <span className="text-red-600 dark:text-red-400">{labels.copyError}</span>
            )}
          </p>
        </div>

        <p className="mt-4 text-[0.8125rem] leading-[1.6] text-ink-tertiary">{labels.note}</p>
      </div>
    </div>
  );
}
