import { useTranslations } from "next-intl";
import { ArrowUpRight, FacebookLogo, InstagramLogo } from "@phosphor-icons/react/ssr";
import { ScrollReveal } from "../ScrollReveal";
import { DateLeaf, NajblizszeWydarzenia } from "./KalendarzWyspy";
import styles from "./KalendarzContent.module.css";

const channels = [
  { key: "facebook", icon: FacebookLogo, href: "https://www.facebook.com/samorzad.ue/events" },
  { key: "instagram", icon: InstagramLogo, href: "https://www.instagram.com/samorzad.ue" },
] as const;

export function KalendarzContent() {
  const t = useTranslations("kalendarz");
  const tc = useTranslations("common");

  return (
    <>
      <section className="section-padding" aria-labelledby="kalendarz-events-heading">
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[minmax(280px,4fr)_8fr] lg:gap-16">
          <div className="max-w-[360px] lg:sticky lg:top-28 lg:self-start">
            <DateLeaf />
          </div>

          <div>
            <h2
              id="kalendarz-events-heading"
              className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
            >
              {t("eventsHeading")}
            </h2>
            <NajblizszeWydarzenia />
            <ScrollReveal className="mt-12">
              <h3 className="text-[1.125rem] font-semibold tracking-[-0.01em] text-ink-primary">
                {t("followHeading")}
              </h3>
              <ul className="mt-4 list-none border-t border-border-medium">
                {channels.map((c) => (
                  <li key={c.key}>
                    <a href={c.href} target="_blank" rel="noopener noreferrer" className={styles.channel}>
                      <span className={styles.channelIcon} aria-hidden="true">
                        <c.icon size={22} weight="regular" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[1rem] font-semibold text-ink-primary">
                          {t(`channels.${c.key}.title`)}
                        </span>
                        <span className="mt-0.5 block text-[0.875rem] leading-[1.5] text-ink-secondary">
                          {t(`channels.${c.key}.meta`)}
                        </span>
                        <span className="sr-only"> ({tc("newTab")})</span>
                      </span>
                      <ArrowUpRight size={20} weight="bold" aria-hidden="true" className={styles.channelArrow} />
                    </a>
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          </div>
        </div>
      </section>

    </>
  );
}
