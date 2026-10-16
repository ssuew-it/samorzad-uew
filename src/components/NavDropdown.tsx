"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { CaretDown, ArrowSquareOut } from "@phosphor-icons/react";
import { EASE } from "@/lib/motion";

export interface NavChild {
  label: string;
  href?: string;
  external?: boolean;
  /** Nagłówek sekcji (nieklikalny) — do grupowania długiego dropdownu. */
  heading?: boolean;
}

/**
 * Chwila zamknięcia ostatniego menu — wspólna dla wszystkich dropdownów.
 *
 * Gdy użytkownik przesuwa kursor z „Dla studenta” na „Samorząd”, drugie menu
 * otwiera się BEZ animacji. Pierwsze otwarcie ma animację, bo sygnalizuje, skąd
 * wyrasta panel; każde kolejne w serii tylko by spowalniało przeglądanie
 * (ta sama zasada co przy podpowiedziach: pierwsza z opóźnieniem, następne
 * od razu).
 */
let lastClosedAt = 0;
const SERIES_WINDOW_MS = 300;

interface NavDropdownProps {
  label: string;
  items: NavChild[];
  active: boolean;
}

export function NavDropdown({ label, items, active }: NavDropdownProps) {
  const [open, setOpenState] = useState(false);
  const [instant, setInstant] = useState(false);
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLLIElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();

  // Stan otwarcia trzymamy też w ref, żeby decyzję „seria czy pierwsze
  // otwarcie” podjąć poza funkcją aktualizującą stan (React może ją wywołać
  // dwukrotnie, a ona ma być czysta).
  const openRef = useRef(false);
  const setOpen = (next: boolean | ((v: boolean) => boolean)) => {
    const prev = openRef.current;
    const value = typeof next === "function" ? next(prev) : next;
    if (value === prev) return;
    if (value) setInstant(performance.now() - lastClosedAt < SERIES_WINDOW_MS);
    else lastClosedAt = performance.now();
    openRef.current = value;
    setOpenState(value);
  };

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <li
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1 py-1 text-[0.75rem] font-medium uppercase tracking-[0.08em] transition-colors ${
          active ? "text-accent" : "text-ink-secondary hover:text-ink-primary"
        }`}
      >
        {label}
        <CaretDown
          size={12}
          weight="bold"
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {active && (
        <span
          aria-hidden="true"
          className="absolute -bottom-1 left-0 right-4 h-[2px] rounded-full bg-accent"
        />
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            // Panel opada OD przycisku (y ujemne) i rośnie z jego narożnika
            // (transform-origin), zamiast wjeżdżać od dołu, skąd nic nie przyszło.
            // Wyjście krótsze niż wejście: decyzja zapadła, nie ma na co czekać.
            initial={reduce || instant ? false : { opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: EASE } }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.11, ease: EASE } }}
            style={{ transformOrigin: "top left" }}
            className="absolute left-0 top-full z-50 mt-3 w-64 rounded-xl border border-border-soft bg-bg-surface p-2 shadow-xl shadow-black/10"
          >
            <ul className="flex flex-col">
              {items.map((item) => (
                <li key={item.href ?? item.label}>
                  {item.heading ? (
                    <p className="px-3 pb-1 pt-3 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-ink-tertiary first:pt-1">
                      {item.label}
                    </p>
                  ) : item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-[0.875rem] text-ink-secondary transition-colors hover:bg-bg-elevated hover:text-ink-primary"
                    >
                      {item.label}
                      <ArrowSquareOut
                        size={14}
                        weight="regular"
                        aria-hidden="true"
                        className="shrink-0 text-ink-tertiary"
                      />
                    </a>
                  ) : (
                    <Link
                      href={item.href ?? "/"}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-[0.875rem] text-ink-secondary transition-colors hover:bg-bg-elevated hover:text-ink-primary"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
