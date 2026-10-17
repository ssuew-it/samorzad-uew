"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { ArrowSquareOut } from "@phosphor-icons/react";
import type { Publication } from "@/lib/publications";
import { pagesOf, scholarSearchUrl, type Edition } from "@/lib/editions";
import { EditionReader } from "./EditionReader";

export interface EditionShelfLabels {
  emptyTitle: string;
  emptyDesc: string;
  hint: string;
  editorsLabel: string;
  tocHeading: string;
  /** Wzorzec „s. {from}–{to}". */
  pagesLabel: string;
  /**
   * Liczba rozdziałów jako FUNKCJA, nie gotowy napis: polski ma trzy formy
   * liczebnika (1 rozdział, 2 rozdziały, 5 rozdziałów), więc podstawienie
   * `{count}` w gotowym tekście dałoby „5 rozdział".
   */
  chapterCount: (count: number) => string;
  circleLabel: string;
  doiLabel: string;
  /** Etykieta odnośnika do Google Scholar, z „{title}" na tytuł rozdziału. */
  scholarLabel: string;
  readerOpen: string;
  readerClose: string;
  readerPrev: string;
  readerNext: string;
  readerFull: string;
  readerPageOf: string;
  readerLicense: string;
}

interface EditionShelfProps {
  editions: Edition[];
  /** Rozdziały WSZYSTKICH wydań; filtrujemy je po slugu wybranego tomu. */
  publications: Publication[];
  labels: EditionShelfLabels;
}

/**
 * Barwy zastępczej okładki — dla tomów, których jeszcze nie zdigitalizowano.
 *
 * Tomy ze skanem pokazują PRAWDZIWĄ okładkę (pierwsza strona z `edition-pages`),
 * więc te odcienie są tylko awaryjne. Wzorowane na realnej serii: jasny pas
 * z nazwą u góry, ciemne pole tytułowe pod spodem.
 *
 * Każdy sprawdzony z bielą tekstu (#F6F8FC), próg 4.5:1 dla tekstu zwykłego —
 * najsłabszy daje 8.41:1.
 */
const COVER_TONES = ["#4A3350", "#1E2A5A", "#14484C", "#2B3440", "#5A2733", "#2E3D9E"];

/** Kość słoniowa pasa serii i szarość napisu na nim — 5.31:1. */
const BAND_BG = "#EDEAE3";
const BAND_FG = "#5F5F5F";

/** Deterministyczny hash djb2 — stały odcień dla danego tomu, bez losowania. */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  return Math.abs(h);
}

function authorSurnames(authors: string[]): string {
  // „Kowalski, J." -> „Kowalski"; wielu autorów łączymy kropką środkową.
  return authors.map((a) => a.split(",")[0].trim()).join(" · ");
}

export function EditionShelf({ editions, publications, labels }: EditionShelfProps) {
  const reduce = useReducedMotion();
  const panelId = useId();
  const hintId = useId();
  const [selected, setSelected] = useState(0);
  const [readerOpen, setReaderOpen] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);

  // `#czytaj` (przycisk w hero albo link z zewnątrz) otwiera czytnik
  // najnowszego tomu. Kotwicę od razu zdejmujemy z adresu, żeby kolejne
  // kliknięcie znów zadziałało, a odświeżenie nie otwierało czytnika.
  useEffect(() => {
    const sync = () => {
      if (window.location.hash !== "#czytaj") return;
      history.replaceState(null, "", window.location.pathname + window.location.search);
      if (editions.length === 0 || pagesOf(editions[0].slug).length === 0) return;
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setSelected(0);
      setReaderOpen(true);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [editions]);

  if (editions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border-medium bg-bg-surface p-10 text-center">
        <p className="font-display text-[1.125rem] font-semibold text-ink-primary">{labels.emptyTitle}</p>
        <p className="mx-auto mt-2 max-w-[46ch] text-[0.9375rem] leading-[1.6] text-ink-secondary">
          {labels.emptyDesc}
        </p>
      </div>
    );
  }

  const active = editions[selected];
  const activePages = pagesOf(active.slug);
  const hasPages = activePages.length > 0;
  // Rozdziały należą do TOMU. Wcześniej każdy z nich stał na półce jako osobna
  // pozycja, co przy dwunastu wydaniach rocznie dałoby setki kafli opisujących
  // kilkanaście książek.
  const chapters = publications.filter((p) => p.edition === active.slug);

  return (
    <div>
      <p className="sr-only" id={hintId}>
        {labels.hint}
      </p>

      {/* Półka tomów.
          `inert` gdy czytnik jest otwarty: to on jest wtedy jedyną treścią
          strony — okładki pod spodem muszą zniknąć z drzewa dostępności i
          z kolejności Tab, inaczej czytnik ekranu w trybie przeglądania (nie
          Tab) nadal je znajdzie mimo nakładki na wierzchu. */}
      <ul
        className="grid grid-cols-[repeat(auto-fill,minmax(148px,1fr))] gap-5 sm:gap-6"
        inert={readerOpen || undefined}
      >
        {editions.map((e, i) => {
          const cover = pagesOf(e.slug)[0];
          const tone = COVER_TONES[hashString(e.slug) % COVER_TONES.length];
          const isActive = i === selected;
          return (
            <li key={e.slug} className="flex">
              <motion.button
                type="button"
                aria-expanded={isActive}
                aria-controls={panelId}
                aria-describedby={hintId}
                aria-label={`${e.title}${e.subtitle ? `. ${e.subtitle}` : ""}, ${e.year}`}
                onClick={() => setSelected(i)}
                /* Wybrany tom zostaje WYSUNIĘTY, nie tylko obrysowany — sam
                   cienki obrys ginął wśród sąsiadek i nie było widać, który
                   tom jest otwarty w panelu poniżej. */
                animate={reduce ? undefined : { y: isActive ? -12 : 0 }}
                whileHover={reduce ? undefined : { y: isActive ? -12 : -6 }}
                whileFocus={reduce ? undefined : { y: isActive ? -12 : -6 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                style={{
                  outlineColor: isActive ? "var(--accent)" : "transparent",
                  outlineWidth: isActive ? 3 : 0,
                }}
                className={`group relative flex aspect-[0.706] w-full flex-col overflow-hidden rounded-[3px] text-left outline-offset-[3px] transition-shadow duration-150 focus-visible:outline-2 focus-visible:outline-accent ${
                  isActive
                    ? "shadow-[0_4px_8px_rgba(15,23,42,0.2),0_26px_44px_-16px_rgba(44,75,255,0.55)]"
                    : "shadow-[0_1px_2px_rgba(15,23,42,0.14),0_8px_18px_-10px_rgba(15,23,42,0.45)] hover:shadow-[0_2px_4px_rgba(15,23,42,0.16),0_16px_28px_-12px_rgba(15,23,42,0.5)]"
                }`}
              >
                {cover ? (
                  /* Prawdziwa okładka tomu — pierwsza strona skanu. Proporcja
                     karty jest proporcją skanu, więc nic się nie przycina. */
                  <Image
                    src={cover.src}
                    alt=""
                    width={cover.width}
                    height={cover.height}
                    sizes="(max-width: 640px) 45vw, 180px"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  /* Tom bez skanu — okładka zastępcza w języku serii. */
                  <>
                    <span
                      aria-hidden="true"
                      style={{ backgroundColor: BAND_BG, color: BAND_FG }}
                      className="block shrink-0 px-3 pt-3 pb-2"
                    >
                      <span className="font-mono block text-[0.5rem] leading-[1.1] tracking-[0.24em] uppercase">
                        Debiuty
                      </span>
                      <span className="font-mono mt-0.5 block text-[0.5rem] leading-[1.1] tracking-[0.24em] uppercase">
                        Studenckie
                      </span>
                      <span className="font-mono mt-1.5 block text-right text-[0.6875rem] leading-none tracking-[0.18em]">
                        {e.year}
                      </span>
                    </span>
                    <span aria-hidden="true" className="block h-[3px] shrink-0 bg-black/25" />
                    <span
                      aria-hidden="true"
                      style={{ backgroundColor: tone, color: "#F6F8FC" }}
                      className="flex min-h-0 flex-1 flex-col justify-between p-3"
                    >
                      <span className="font-display line-clamp-5 text-[0.8125rem] leading-[1.25] font-bold tracking-[-0.01em] uppercase">
                        {e.title}
                      </span>
                      <span className="font-mono mt-2 line-clamp-2 text-[0.5625rem] leading-[1.35] tracking-[0.04em] uppercase">
                        {authorSurnames(e.editors)}
                      </span>
                    </span>
                  </>
                )}

                {/* Pasek wyboru — drugi, niezależny od koloru okładki sygnał.
                    Sam obrys akcentu na ciemnej okładce byłby ledwie widoczny. */}
                {isActive && (
                  <span aria-hidden="true" className="absolute inset-x-0 bottom-0 z-10 h-1.5 bg-accent" />
                )}
              </motion.button>
            </li>
          );
        })}
      </ul>

      {/* Panel tomu — JEDEN dla wszystkich szerokości. Wcześniej istniał osobny
          panel dla desktopu i osobne karty dla telefonu, przez co przycisk
          otwierający czytnik musiał być powielony. */}
      <div
        id={panelId}
        role="region"
        aria-live="polite"
        style={{ borderColor: "var(--accent)" }}
        className="mt-10 rounded-2xl border-l-4 bg-bg-surface p-6 sm:p-8"
        inert={readerOpen || undefined}
      >
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-accent">
          {active.year} · {labels.chapterCount(chapters.length)}
        </p>
        <h3 className="mt-3 font-display text-[1.5rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ink-primary">
          {active.title}
        </h3>
        {active.subtitle && (
          <p className="mt-1 font-display text-[1.0625rem] leading-[1.35] text-ink-secondary">
            {active.subtitle}
          </p>
        )}
        <p className="mt-3 text-[0.9375rem] leading-[1.6] text-ink-secondary">
          {labels.editorsLabel}: {active.editors.join(", ")}
        </p>
        <p className="mt-1 font-mono text-[0.75rem] leading-[1.7] text-ink-tertiary">
          ISBN {active.isbn} · {labels.doiLabel} {active.doi} · {active.license}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          {hasPages && (
            <button
              type="button"
              onClick={(ev) => {
                openerRef.current = ev.currentTarget;
                setReaderOpen(true);
              }}
              className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-accent px-6 text-base font-medium text-bg-base transition-colors hover:bg-accent-dim"
            >
              {labels.readerOpen}
            </button>
          )}
          <a
            href={active.pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center gap-1.5 text-[0.9375rem] font-medium text-accent transition-colors hover:text-accent-dim"
          >
            {labels.readerFull}
            <ArrowSquareOut size={16} weight="regular" aria-hidden="true" />
          </a>
        </div>

        {chapters.length > 0 && (
          <>
            <h4 className="mt-8 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-tertiary">
              {labels.tocHeading}
            </h4>
            <ol className="mt-4 divide-y divide-border-subtle border-t border-border-subtle">
              {chapters.map((c, idx) => (
                <li key={`${c.title}-${idx}`} className="py-4">
                  <div className="flex gap-4">
                    <span
                      aria-hidden="true"
                      className="font-mono shrink-0 pt-0.5 text-[0.8125rem] tabular-nums text-ink-tertiary"
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-[1rem] font-semibold leading-[1.35] text-ink-primary">
                        {c.title}
                      </p>
                      <p className="mt-1 font-mono text-[0.8125rem] text-ink-secondary">
                        {c.authors.join(", ")}
                      </p>
                      {c.circle && (
                        <p className="mt-1 text-[0.8125rem] text-ink-tertiary">
                          {labels.circleLabel}: {c.circle}
                        </p>
                      )}
                      <p className="mt-1 font-mono text-[0.75rem] leading-[1.6] text-ink-tertiary">
                        {c.pages
                          ? labels.pagesLabel
                              .replace("{from}", String(c.pages.from))
                              .replace("{to}", String(c.pages.to))
                          : null}
                        {c.pages && c.doi ? " · " : null}
                        {c.doi ? `${labels.doiLabel} ${c.doi}` : null}
                      </p>
                      {/* Poza naszym PDF-em te teksty są indeksowane w Google
                          Scholar — stąd wyszukanie po tytule. Etykieta niesie
                          tytuł rozdziału, żeby dziesięć odnośników w spisie nie
                          nazywało się dla czytnika ekranu tak samo. */}
                      <a
                        href={scholarSearchUrl(c.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={labels.scholarLabel.replace("{title}", c.title)}
                        className="mt-2 inline-flex min-h-8 items-center gap-1.5 text-[0.8125rem] font-medium text-accent transition-colors hover:text-accent-dim"
                      >
                        Google Scholar
                        <ArrowSquareOut size={14} weight="regular" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>

      {readerOpen && (
        <EditionReader
          edition={active}
          onClose={() => {
            setReaderOpen(false);
            // Fokus wraca tam, skąd otwarto — inaczej użytkownik klawiatury
            // ląduje na początku strony i musi przejść ją całą od nowa.
            requestAnimationFrame(() => openerRef.current?.focus());
          }}
          labels={{
            close: labels.readerClose,
            prev: labels.readerPrev,
            next: labels.readerNext,
            readFull: labels.readerFull,
            pageOf: labels.readerPageOf,
            licenseNote: labels.readerLicense,
          }}
        />
      )}
    </div>
  );
}
