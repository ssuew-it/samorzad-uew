"use client";

import { useEffect, useState } from "react";

/**
 * Etykietowany spis sekcji dla długich hubów (scroll-spy). Reużywa wzorca
 * IntersectionObserver z SectionRail, ale pokazuje etykiety zamiast §N i ma
 * wariant mobilny (przyklejony pasek chipów). SectionRail (§) zostaje osobno.
 */
export function HubNav({
  items,
  label,
}: {
  items: { id: string; label: string }[];
  label: string;
}) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px" },
    );
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [items]);

  const go = (id: string) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <>
      {/* Pływający spis po lewej — dopiero od 1600 px. Treść ma 1200 px
          szerokości, więc węższy ekran nie ma obok niej miejsca na ~180 px
          spisu i spis leżał na tekście (np. przy 1280 px). */}
      <nav
        aria-label={label}
        className="fixed left-6 top-1/2 z-30 hidden max-w-[200px] -translate-y-1/2 flex-col gap-1 min-[1600px]:flex"
      >
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            onClick={() => go(it.id)}
            aria-current={active === it.id ? "true" : undefined}
            className={`group flex items-center gap-2.5 py-1 text-left font-mono text-[0.75rem] uppercase tracking-[0.06em] transition-colors ${
              active === it.id ? "text-accent" : "text-ink-tertiary hover:text-ink-secondary"
            }`}
          >
            <span
              aria-hidden="true"
              className={`h-px shrink-0 rounded-full transition-all duration-300 ${
                active === it.id ? "w-7 bg-accent" : "w-3.5 bg-border-strong group-hover:w-5"
              }`}
            />
            {it.label}
          </button>
        ))}
      </nav>

      {/* Poniżej 1600 px: przyklejony pasek pod 72-pikselowym nagłówkiem */}
      <nav
        aria-label={label}
        className="sticky top-[72px] z-30 mb-4 overflow-x-auto border-b border-border-subtle bg-bg-base/90 px-6 py-3 backdrop-blur min-[1600px]:hidden"
      >
        <ul className="flex gap-2 whitespace-nowrap">
          {items.map((it) => (
            <li key={it.id}>
              <button
                type="button"
                onClick={() => go(it.id)}
                aria-current={active === it.id ? "true" : undefined}
                className={`rounded-full border px-3 py-1.5 text-[0.8125rem] font-medium transition-colors ${
                  active === it.id
                    ? "border-accent text-accent"
                    : "border-border-strong text-ink-secondary hover:text-ink-primary"
                }`}
              >
                {it.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
