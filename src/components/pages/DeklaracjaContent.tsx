import { useTranslations } from "next-intl";
import { ScrollReveal } from "../ScrollReveal";
import { LegalSections, LegalSummary, formatLegal, type LegalSection } from "./LegalSections";

/**
 * Deklaracja dostępności w układzie ustawowego wzoru: zakres i daty, status,
 * treści niedostępne, ułatwienia, kontakt, procedura, budynek, aplikacje.
 * Opis budynku L i procedura za deklaracją Uczelni (uew.pl, 4.11.2026).
 *
 * Przy każdym przeglądzie: uruchom `npm run test:a11y` i zaktualizuj daty
 * w `deklaracja.facts` - data przeglądu ma odpowiadać faktycznemu testowi.
 */
export function DeklaracjaContent() {
  const t = useTranslations("deklaracja");
  const facts = t.raw("facts") as string[];

  return (
    <section className="section-padding" aria-label={t("metaTitle")}>
      <div className="mx-auto flex max-w-[760px] flex-col gap-10">
        <ScrollReveal>
          <LegalSummary title={t("factsTitle")}>
            {facts.map((f) => (
              <p key={f}>{formatLegal(f)}</p>
            ))}
          </LegalSummary>
        </ScrollReveal>
        <LegalSections sections={t.raw("sections") as LegalSection[]} />
      </div>
    </section>
  );
}
