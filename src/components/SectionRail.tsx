"use client";

import { useEffect, useState } from "react";

/**
 * Pływający indeks paragrafów (§) dla długich stron prawnych. Śledzi aktywną
 * sekcję przez IntersectionObserver i pozwala do niej przeskoczyć. Widoczny od
 * XL w górę, by nie nachodzić na treść; sygnatura mono + §.
 */
export function SectionRail({ ids, label }: { ids: string[]; label: string }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const idx = ids.indexOf(visible[0].target.id);
          if (idx >= 0) setActive(idx);
        }
      },
      { rootMargin: "-30% 0px -55% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [ids]);

  const go = (id: string) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <nav
      aria-label={label}
      className="fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-1.5 xl:flex"
    >
      {ids.map((id, i) => (
        <button
          key={id}
          type="button"
          onClick={() => go(id)}
          aria-current={active === i ? "true" : undefined}
          className={`group flex h-7 items-center justify-end gap-2.5 font-mono text-[0.75rem] tabular-nums transition-colors ${
            active === i ? "text-accent" : "text-ink-tertiary hover:text-ink-secondary"
          }`}
        >
          §{i + 1}
          <span
            aria-hidden="true"
            className={`h-px shrink-0 rounded-full transition-[width,background-color] duration-300 ease-out ${
              active === i ? "w-7 bg-accent" : "w-3.5 bg-border-strong group-hover:w-5"
            }`}
          />
        </button>
      ))}
    </nav>
  );
}
