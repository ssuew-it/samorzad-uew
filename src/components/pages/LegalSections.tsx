import type { ReactNode } from "react";
import { ScrollReveal } from "../ScrollReveal";

/**
 * Wspólny skład stron formalnych (Polityka prywatności, Deklaracja dostępności).
 * Treść leży w messages jako bloki: akapit, podtytuł, lista. W tekście działa
 * `**pogrubienie**`, a adresy e-mail same stają się odnośnikami.
 */
export type LegalBlock = { p: string } | { ul: string[] } | { h3: string };
export type LegalSection = { title: string; blocks: LegalBlock[] };

const EMAIL = /([^\s@()]+@[^\s@()]+\.[a-z]{2,})/gi;

export function formatLegal(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-ink-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part.split(EMAIL).map((seg, j) =>
      /^[^\s@()]+@[^\s@()]+\.[a-z]{2,}$/i.test(seg) ? (
        <a
          key={`${i}-${j}`}
          href={`mailto:${seg}`}
          className="font-medium text-accent underline underline-offset-2 hover:text-accent-dim"
        >
          {seg}
        </a>
      ) : (
        <span key={`${i}-${j}`}>{seg}</span>
      ),
    );
  });
}

/** Ramka z najważniejszym w skrócie (wersja skrócona, daty deklaracji). */
export function LegalSummary({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-l-2 border-accent bg-bg-surface px-6 py-5 sm:px-7">
      <h2 className="font-display text-[1.125rem] font-semibold text-ink-primary">{title}</h2>
      <div className="mt-2 flex flex-col gap-2 text-[0.9375rem] leading-[1.7] text-ink-secondary">{children}</div>
    </div>
  );
}

export function LegalSections({ sections }: { sections: LegalSection[] }) {
  return (
    <>
      {sections.map((s, i) => (
        <ScrollReveal key={s.title} delay={Math.min(i, 5) * 0.04}>
          <h2 className="font-display text-[1.375rem] font-semibold tracking-[-0.01em] text-ink-primary">
            {s.title}
          </h2>
          <div className="mt-3 flex flex-col gap-3 text-[1rem] leading-[1.75] text-ink-secondary">
            {s.blocks.map((b, j) => {
              if ("h3" in b) {
                return (
                  <h3 key={j} className="pt-2 text-[1rem] font-semibold text-ink-primary">
                    {b.h3}
                  </h3>
                );
              }
              if ("ul" in b) {
                return (
                  <ul key={j} className="flex flex-col gap-2">
                    {b.ul.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span aria-hidden="true" className="mt-[0.7em] h-1.5 w-1.5 shrink-0 bg-accent" />
                        <span>{formatLegal(item)}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              return <p key={j}>{formatLegal(b.p)}</p>;
            })}
          </div>
        </ScrollReveal>
      ))}
    </>
  );
}
