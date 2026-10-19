import { CaretDown } from "@phosphor-icons/react/dist/ssr";

export interface QA {
  q: string;
  a: string;
}

interface FaqProps {
  items: QA[];
  eyebrow?: string;
  heading?: string;
}

/**
 * FAQ na natywnym <details> - dostępne z klawiatury, progresywne ujawnianie,
 * treść w DOM (czytelna dla Google). Emituje FAQPage JSON-LD → szansa na
 * rozszerzony wynik wyszukiwania z rozwijanymi pytaniami.
 */
export function Faq({ items, eyebrow = "FAQ", heading = "Najczęstsze pytania" }: FaqProps) {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <section className="section-padding pt-0" aria-labelledby="faq-heading">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <div className="mx-auto max-w-[760px]">
        <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-accent">
          {eyebrow}
        </p>
        <h2
          id="faq-heading"
          className="mt-3 font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
        >
          {heading}
        </h2>

        <div className="mt-8 flex flex-col gap-3">
          {items.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-border-subtle bg-bg-surface px-6 transition-colors duration-150 open:border-border-soft hover:border-border-soft"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[1rem] font-semibold tracking-[-0.01em] text-ink-primary [&::-webkit-details-marker]:hidden">
                {item.q}
                <CaretDown
                  size={18}
                  weight="bold"
                  aria-hidden="true"
                  className="shrink-0 text-ink-tertiary transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <p className="prose-constrained pb-5 text-[0.9375rem] leading-[1.7] text-ink-secondary">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
