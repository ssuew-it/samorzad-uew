import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, ArrowUpRight, DownloadSimple } from "@phosphor-icons/react/ssr";
import { formatBytes } from "@/lib/docMeta";
import { partners, type PartnerEntry } from "@/lib/partners";
import { partnershipContact, partnershipOffer } from "@/lib/partnership-contact";
import { ContactCard } from "../ContactCard";
import { ScrollReveal } from "../ScrollReveal";
import type { ContactFormField } from "../ContactForm";
import { PartnerzyWspolpraca } from "./PartnerzyWspolpraca";
import styles from "../partners/Partners.module.css";

const CONTACT_EMAIL = partnershipContact.email;
const benefits = ["reach", "events", "image", "talent"] as const;
const pageCopy = {
  pl: { topicLabel: "Wybrany kierunek rozmowy", changeTopic: "Zmień", visit: "Poznaj partnera", nextBrand: "Miejsce na kolejny wspólny pomysł.", join: "Porozmawiajmy o Twojej marce", contact: "Dobry początek? Rozmowa.", contactLead: "Nie potrzebujesz gotowej prezentacji. Opisz, co masz na myśli - to wystarczy, żeby zacząć.", steps: [["Twój pomysł", "Marka, cel i kilka słów o planach."], ["Wspólny kierunek", "Rozmowa o możliwościach i dopasowaniu do studentów."], ["Konkretny plan", "Uzgodnienie zakresu, terminów i kolejnych kroków."]], direct: "Wolisz napisać bezpośrednio?", form: "Opowiedz nam o pomyśle", offerTitle: "Oferta współpracy", offerBody: "Ogólna oferta do przekazania dalej w Twojej firmie. Napisz do nas, a przygotujemy ofertę dopasowaną do Twoich potrzeb.", offerCta: "Pobierz PDF", refLabel: "Numer zgłoszenia", copy: "Kopiuj", copied: "Skopiowano", who: "Zgłoszeniem zajmie się", when: "Odpowiedź przyjdzie na podany adres e-mail, zwykle w ciągu 3 dni roboczych. Jeśli będziesz pisać ponownie, podaj ten numer." },
  en: { topicLabel: "Your chosen direction", changeTopic: "Change", visit: "Meet the partner", nextBrand: "Room for our next shared idea.", join: "Let’s talk about your brand", contact: "A good start? A conversation.", contactLead: "You don’t need a polished presentation. Tell us what you have in mind - that’s enough to get started.", steps: [["Your idea", "Your brand, your goal and a few words about your plans."], ["A shared direction", "A conversation about possibilities and what works for students."], ["A concrete plan", "Agreeing on scope, timing and next steps."]], direct: "Prefer to email us directly?", form: "Tell us about your idea", offerTitle: "Partnership offer", offerBody: "A general overview to share within your company. Write to us and we will prepare an offer tailored to your needs.", offerCta: "Download PDF", refLabel: "Enquiry number", copy: "Copy", copied: "Copied", who: "Your enquiry will be handled by", when: "You will get a reply at the email address you gave, usually within 3 working days. If you write again, please quote this number." },
};

function PartnerLogo({ partner }: { partner: PartnerEntry }) {
  const content = partner.logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={partner.logo} alt={partner.name} width={160} height={64} loading="lazy" className="h-auto max-h-16 w-auto max-w-full object-contain" />
  ) : <span>{partner.name}</span>;
  const className = `${styles.logoCard}${partner.name === "BNY" ? ` ${styles.logoCardPrimary}` : ""}`;
  return partner.href ? (
    <a href={partner.href} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
      <span className={styles.logoCaption} aria-hidden="true">{partner.name}<ArrowUpRight size={14} className="shrink-0" /></span>
    </a>
  ) : <div className={className}>{content}</div>;
}

export function PartnerzyContent() {
  const loc = useLocale() === "en" ? "en" : "pl";
  const c = pageCopy[loc];
  const t = useTranslations("partnerzy");
  const tk = useTranslations("kontakt");
  const tb = useTranslations("board");
  const fields: ContactFormField[] = [
    {
      key: "organisation",
      type: "text",
      label: t("labelOrganisation"),
      autoComplete: "organization",
      colSpan: 1,
      rule: { minLength: 2, message: t("errOrganisation") },
    },
    {
      key: "name",
      type: "text",
      label: t("labelContactPerson"),
      autoComplete: "name",
      colSpan: 1,
      rule: { minLength: 2, message: t("errContactPerson") },
    },
    {
      key: "email",
      type: "email",
      label: tk("labelEmail"),
      autoComplete: "email",
      colSpan: 2,
      rule: { email: true, message: tk("errEmail") },
    },
    {
      key: "message",
      type: "textarea",
      label: tk("labelMessage"),
      colSpan: 2,
      rule: { minLength: 10, message: tk("errMessage") },
    },
  ];

  const labels = {
    submitIdle: tk("submitIdle"),
    submitSending: tk("submitSending"),
    successHeading: tk("successHeading"),
    successBody: tk("successBody"),
    successAgain: tk("successAgain"),
    errServer: tk("errServer"),
    rodoIntro: tk("rodoIntro"),
    rodoLink: tk("rodoLink"),
  };

  const strategic = partners.filter((partner) => partner.strategic);
  const other = partners.filter((partner) => !partner.strategic);

  return (
    <>
      <section id="marki" className="section-padding scroll-mt-40" aria-labelledby="partnerzy-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <h2 id="partnerzy-heading" className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary">
              {partners.length ? t("wallHeadingReal") : t("wallHeading")}
            </h2>
            <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-ink-secondary">
              {partners.length ? t("modalRealDesc") : t("wallSub")}
            </p>
          </ScrollReveal>
          {strategic.length > 0 && (
            <ul className={styles.strategicList}>
              {strategic.map((partner) => <li key={partner.name} className={styles.strategicFeature}>
                <div className={styles.strategicIntro}>
                  <span>{t("strategicLabel")}</span>
                  <h3>{partner.name}</h3>
                  {/* Case study: co zrobiliśmy razem (partners.ts → story). */}
                  {partner.story ? <p className={styles.strategicStory}>{partner.story[loc]}</p> : null}
                  {partner.story?.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={partner.story.photo} alt={partner.story.photoAlt?.[loc] ?? ""} width={440} height={275} loading="lazy" className={styles.strategicPhoto} />
                  ) : null}
                  {partner.href && <a href={partner.href} target="_blank" rel="noopener noreferrer">{c.visit}<ArrowUpRight size={20} aria-hidden="true" /><span className="sr-only"> - {partner.name}</span></a>}
                  <span className={styles.featureLines} aria-hidden="true" />
                </div>
                <div className={styles.strategicLogo}>
                  {partner.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={partner.logo} alt={partner.name} width={390} height={160} loading="lazy" />
                  ) : <span>{partner.name}</span>}
                </div>
              </li>)}
            </ul>
          )}
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {other.map((partner) => <li key={partner.name}><PartnerLogo partner={partner} /></li>)}
            <li><a href="#wspolpraca" className={styles.joinTile}><span aria-hidden="true">+</span><strong>{c.nextBrand}</strong><span>{c.join}<ArrowUpRight size={16} aria-hidden="true" /></span></a></li>
          </ul>
        </div>
      </section>

      <section id="korzysci" className="section-padding scroll-mt-40 border-t border-border-subtle" aria-labelledby="korzysci-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <h2 id="korzysci-heading" className="max-w-[24ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary">{t("benefitsHeading")}</h2>
          </ScrollReveal>
          <dl className="mt-10 grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((key, index) => (
              <div key={key} className={styles.benefit}>
                <dt className="text-lg font-semibold text-ink-primary"><span className={styles.benefitNumber} aria-hidden="true">0{index + 1}</span>{t(`benefits.${key}.title`)}</dt>
                <dd className="mt-2 max-w-[55ch] text-base leading-relaxed text-ink-secondary">{t(`benefits.${key}.desc`)}</dd>
              </div>
            ))}
          </dl>
          <a href="#wspolpraca" className="mt-8 inline-flex min-h-11 items-center gap-2 text-base font-medium text-accent underline underline-offset-4">
            {t("offerLink")}<ArrowRight size={20} aria-hidden="true" />
          </a>
          {partnershipOffer.published ? (
            <a href={partnershipOffer[loc].href} download className="mt-8 ml-8 inline-flex min-h-11 items-center gap-2 text-base font-medium text-ink-secondary underline underline-offset-4 hover:text-accent">
              <DownloadSimple size={20} aria-hidden="true" />{c.offerTitle} (PDF)
            </a>
          ) : null}
        </div>
      </section>

      <PartnerzyWspolpraca
        fields={fields}
        labels={labels}
        copy={c}
        role={tb(`roles.${partnershipContact.roleKey}`)}
        contactEmail={CONTACT_EMAIL}
        intro={
            <div className={styles.contactIntro}>
              <p className={styles.eyebrow}>{t("formHeading")}</p>
              <h2 id="partnerzy-form-heading">{c.contact}</h2>
              <p className={styles.contactLead}>{c.contactLead}</p>
              <ol className={styles.contactSteps}>{c.steps.map(([title, body], i) => <li key={title}><span aria-hidden="true">0{i + 1}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol>
              {/* Oferta PDF (scripts/build-oferta.mjs) - bez cen, zaprasza do oferty indywidualnej. */}
              {partnershipOffer.published ? (
                <a href={partnershipOffer[loc].href} download className={styles.offerCard}>
                  <span className={styles.offerCardIcon} aria-hidden="true"><DownloadSimple size={22} /></span>
                  <span className="min-w-0">
                    <strong>{c.offerTitle}</strong>
                    <span>{c.offerBody}</span>
                    <em>{c.offerCta} · {formatBytes(partnershipOffer[loc].bytes, loc)}</em>
                  </span>
                </a>
              ) : null}
              <p className={styles.directLabel}>{c.direct}</p>
              {/* Ta sama wizytówka co na innych stronach, w większym wariancie -
                  to jedyny kontakt do współpracy, więc ma być widoczny. */}
              <ContactCard
                size="lg"
                name={partnershipContact.name}
                role={tb(`roles.${partnershipContact.roleKey}`)}
                email={CONTACT_EMAIL}
                phone={partnershipContact.phone}
                photo={partnershipContact.photo ?? undefined}
                className="mt-4"
              />
            </div>
        }
      />
    </>
  );
}
