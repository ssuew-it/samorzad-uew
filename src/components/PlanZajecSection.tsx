import { useTranslations } from "next-intl";
import { PlanSubskrypcja } from "./PlanSubskrypcja";

/** Sekcja na /kalendarz: plan zajęć grupy jako subskrypcja kalendarza. */
export function PlanZajecSection() {
  const t = useTranslations("planZajec");
  return (
    <section id="plan-zajec" className="section-padding scroll-mt-24 pt-0" aria-labelledby="plan-zajec-heading">
      <div className="mx-auto max-w-[1200px]">
        <h2
          id="plan-zajec-heading"
          className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
        >
          {t("heading")}
        </h2>
        <p className="mt-4 max-w-[64ch] text-[1.0625rem] leading-[1.7] text-ink-secondary">{t("lead")}</p>
        <PlanSubskrypcja />
      </div>
    </section>
  );
}
