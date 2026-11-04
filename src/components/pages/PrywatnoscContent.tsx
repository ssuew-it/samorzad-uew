import { useTranslations } from "next-intl";
import { ScrollReveal } from "../ScrollReveal";
import { LegalSections, LegalSummary, formatLegal, type LegalSection } from "./LegalSections";

/**
 * Polityka prywatności. Komponent serwerowy: tekst jest statyczny, więc nie
 * musi trafiać do przeglądarki jako tłumaczenia.
 *
 * Układ i technikalia (administrator, IOD, podstawy prawne, okresy) za wzorem
 * zaakceptowanym przez IOD Uczelni dla serwisu Dni Adaptacyjnych; fakty
 * (formularze, logowanie, asystent, pamięć przeglądarki) opisują ten serwis.
 */
export function PrywatnoscContent() {
  const t = useTranslations("prywatnosc");

  return (
    <section className="section-padding" aria-label={t("metaTitle")}>
      <div className="mx-auto flex max-w-[760px] flex-col gap-10">
        <ScrollReveal>
          <p className="mb-5 font-mono text-[0.8125rem] text-ink-tertiary">{t("updated")}</p>
          <LegalSummary title={t("summaryTitle")}>
            <p>{formatLegal(t("summary"))}</p>
          </LegalSummary>
        </ScrollReveal>
        <LegalSections sections={t.raw("sections") as LegalSection[]} />
      </div>
    </section>
  );
}
