import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, ClockCountdown, EnvelopeSimple, Phone } from "@phosphor-icons/react/ssr";
import { partners, type PartnerEntry } from "@/lib/partners";
import { partnershipContact } from "@/lib/partnership-contact";
import { projectGalleryPhotos, projectLogo } from "@/lib/photos";
import { ATUTY, POTRZEBY, PROJEKTY_PARTNERSKIE, type ZdjecieProjektu } from "@/lib/wspolpraca";
import { ScrollReveal } from "../ScrollReveal";
import type { ContactFormField } from "../ContactForm";
import { WspolpracaAtuty, type Atut, type ZdjecieDane } from "../partners/WspolpracaAtuty";
import { ProjektyPartnerskie, type ProjektPartnerski } from "../partners/ProjektyPartnerskie";
import { PotrzebujeDopasowanie, type Potrzeba } from "../partners/PotrzebujeDopasowanie";
import { PartnerzyWspolpraca } from "./PartnerzyWspolpraca";
import styles from "../partners/Partners.module.css";
import w from "../partners/Wspolpraca.module.css";

/**
 * Współpraca (/partnerzy) - układ z rozpiski z 21.11.2026: atuty na kole,
 * projekty dla partnerów, dopasowanie „Potrzebuję:”, marki, które nas
 * wspierały, i kontakt z konkretną osobą. Zwrot do partnerów: „Państwo”
 * (decyzja z 21.11.2026). Teksty i opisy zdjęć przygotowuje serwer; wyspy
 * dostają gotowe dane, więc do przeglądarki nie trafia przestrzeń
 * `naszeProjekty`.
 */
const CONTACT_EMAIL = partnershipContact.email;
const pageCopy = {
  pl: { topicLabel: "Wybrany temat rozmowy", changeTopic: "Zmień", visit: "Poznaj partnera", nextBrand: "Miejsce na kolejny wspólny pomysł.", join: "Zapraszamy do rozmowy", contact: "Dobry początek? Rozmowa.", contactLead: "Nie potrzeba gotowej prezentacji. Wystarczy kilka zdań o tym, co mają Państwo na myśli.", steps: [["Państwa pomysł", "Marka, cel i kilka słów o planach."], ["Wspólny kierunek", "Rozmowa o możliwościach i dopasowaniu do studentów."], ["Konkretny plan", "Uzgodnienie zakresu, terminów i kolejnych kroków."]], form: "Kilka słów o pomyśle", refLabel: "Numer zgłoszenia", copy: "Kopiuj", copied: "Skopiowano", who: "Zgłoszeniem zajmie się", when: "Odpowiedź przyjdzie na podany adres e-mail w ciągu 48 godzin w dni robocze. Przy kolejnej wiadomości prosimy podać ten numer." },
  en: { topicLabel: "Your chosen topic", changeTopic: "Change", visit: "Meet the partner", nextBrand: "Room for our next shared idea.", join: "Let’s talk about your brand", contact: "A good start? A conversation.", contactLead: "You don’t need a polished presentation. A few sentences about what you have in mind are enough.", steps: [["Your idea", "Your brand, your goal and a few words about your plans."], ["A shared direction", "A conversation about possibilities and what works for students."], ["A concrete plan", "Agreeing on scope, timing and next steps."]], form: "Tell us about your idea", refLabel: "Enquiry number", copy: "Copy", copied: "Copied", who: "Your enquiry will be handled by", when: "You will get a reply at the email address you gave within 48 hours on working days. If you write again, please quote this number." },
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
  const tg = useTranslations("naszeProjekty.gallery");

  /** Zdjęcie z galerii projektu z wymiarami i opisem alternatywnym. */
  const zdjecie = ([projekt, plik]: ZdjecieProjektu): ZdjecieDane => {
    const photo = projectGalleryPhotos(projekt).find((p) => p.altKey === `${projekt}.${plik}`);
    if (!photo) throw new Error(`Brak zdjęcia ${projekt}/${plik} w galerii projektu`);
    return { src: photo.src, width: photo.width, height: photo.height, alt: tg(`${projekt}.${plik}`) };
  };
  const nazwa = (key: string) => projectLogo(key)?.name ?? key;

  const atuty: Atut[] = ATUTY.map(({ key, zdjecie: z }) => ({
    key,
    short: t(`atuty.items.${key}.short`),
    title: t(`atuty.items.${key}.title`),
    desc: t(`atuty.items.${key}.desc`),
    examples: t.raw(`atuty.items.${key}.examples`) as string[],
    photo: zdjecie(z),
    caption: t("atuty.photoFrom", { project: nazwa(z[0]) }),
  }));

  const projekty: ProjektPartnerski[] = PROJEKTY_PARTNERSKIE.map(({ key, zdjecie: z }) => ({
    key,
    name: nazwa(key),
    when: t(`projekty.items.${key}.when`),
    desc: t(`projekty.items.${key}.desc`),
    forms: t.raw(`projekty.items.${key}.forms`) as string[],
    photo: zdjecie(z),
    logo: projectLogo(key)!,
    draft: t("projekty.draft", { project: nazwa(key) }),
  }));

  const potrzeby: Potrzeba[] = POTRZEBY.map(({ key, projekty: keys }) => {
    const offers = t.raw(`dopasowanie.needs.${key}.offers`) as { title: string; desc: string }[];
    return {
      key,
      label: t(`dopasowanie.needs.${key}.label`),
      offers: offers.map((o, i) => {
        const p = keys[i];
        return { ...o, logo: p ? (projectLogo(p) ?? null) : null, projectName: p ? nazwa(p) : null };
      }),
    };
  });

  const fields: ContactFormField[] = [
    { key: "organisation", type: "text", label: t("labelOrganisation"), autoComplete: "organization", colSpan: 1, rule: { minLength: 2, message: t("errOrganisation") } },
    { key: "name", type: "text", label: t("labelContactPerson"), autoComplete: "name", colSpan: 1, rule: { minLength: 2, message: t("errContactPerson") } },
    { key: "email", type: "email", label: tk("labelEmail"), autoComplete: "email", colSpan: 2, rule: { email: true, message: t("formularz.errEmail") } },
    { key: "message", type: "textarea", label: tk("labelMessage"), colSpan: 2, rule: { minLength: 10, message: t("formularz.errMessage") } },
  ];

  const labels = {
    submitIdle: tk("submitIdle"),
    submitSending: tk("submitSending"),
    successHeading: tk("successHeading"),
    successBody: t("formularz.successBody"),
    successAgain: t("formularz.successAgain"),
    errServer: tk("errServer"),
    rodoIntro: t("formularz.rodoIntro"),
    rodoLink: tk("rodoLink"),
  };

  // UPM na początku siatki (rozpiska z 21.11.2026); BNY stoi osobno jako partner strategiczny.
  const strategic = partners.filter((partner) => partner.strategic);
  const other = partners.filter((partner) => !partner.strategic).sort((a, b) => Number(b.name === "UPM") - Number(a.name === "UPM"));
  const role = tb(`roles.${partnershipContact.roleKey}`);

  return (
    <>
      {/* ── Współpraca z nami: koło atutów ── */}
      <section id="atuty" className={w.section} aria-labelledby="atuty-heading">
        <div className={w.inner}>
          <ScrollReveal>
            <p className={w.eyebrow}>{t("atuty.eyebrow")}</p>
            <h2 id="atuty-heading" className={w.h2}>{t("atuty.heading")}</h2>
            <p className={w.lead}>{t("atuty.lead")}</p>
          </ScrollReveal>
          <WspolpracaAtuty center={t("atuty.center")} label={t("atuty.heading")} examplesLabel={t("atuty.examples")} items={atuty} />
        </div>
      </section>

      {/* ── Nasze projekty ── */}
      <section id="projekty" className={`${w.section} ${w.sectionAlt}`} aria-labelledby="projekty-heading">
        <div className={w.inner}>
          <ScrollReveal>
            <p className={w.eyebrow}>{t("projekty.eyebrow")}</p>
            <h2 id="projekty-heading" className={`${w.h2} ${w.h2Big}`}>{t("projekty.heading")}</h2>
            <p className={w.lead}>{t("projekty.lead")}</p>
          </ScrollReveal>
          <ProjektyPartnerskie
            items={projekty}
            labels={{ list: t("projekty.listLabel"), when: t("projekty.when"), forms: t("projekty.forms"), more: t("projekty.more"), ask: t("projekty.ask") }}
          />
        </div>
      </section>

      {/* ── Jak mogę skorzystać na współpracy? ── */}
      <section id="dopasowanie" className={w.section} aria-labelledby="dopasowanie-heading">
        <div className={w.inner}>
          <ScrollReveal className={w.fitHead}>
            <p className={w.eyebrow}>{t("dopasowanie.eyebrow")}</p>
            <h2 id="dopasowanie-heading" className={w.h2}>{t("dopasowanie.heading")}</h2>
          </ScrollReveal>
          <PotrzebujeDopasowanie
            items={potrzeby}
            labels={{ need: t("dopasowanie.need"), proposals: t("dopasowanie.proposals"), ask: t("dopasowanie.ask"), draft: t.raw("dopasowanie.draft") as string, note: t("dopasowanie.note") }}
          />
        </div>
      </section>

      {/* ── Marki, które nas wspierały ── */}
      <section id="marki" className="section-padding scroll-mt-40 border-t border-border-subtle" aria-labelledby="partnerzy-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <h2 id="partnerzy-heading" className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary">
              {partners.length ? t("wallHeadingReal") : t("wallHeading")}
            </h2>
            <p className="mt-4 max-w-[68ch] text-base leading-relaxed text-ink-secondary">
              {partners.length ? t("markiLead") : t("wallSub")}
            </p>
          </ScrollReveal>
          {strategic.length > 0 && (
            <ul className={styles.strategicList}>
              {strategic.map((partner) => <li key={partner.name} className={styles.strategicFeature}>
                <div className={styles.strategicIntro}>
                  <span>{t("strategicLabel")}</span>
                  <h3>{partner.name}</h3>
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
            <li><a href="#kontakt-partnerzy" className={styles.joinTile}><span aria-hidden="true">+</span><strong>{c.nextBrand}</strong><span>{c.join}<ArrowUpRight size={16} aria-hidden="true" /></span></a></li>
          </ul>
        </div>
      </section>

      {/* ── Kontakt: konkretna osoba, nie „machina” (rozpiska z 21.11.2026) ── */}
      <PartnerzyWspolpraca
        fields={fields}
        labels={labels}
        copy={c}
        role={role}
        contactEmail={CONTACT_EMAIL}
        intro={
          <div className={styles.contactIntro}>
            <p className={styles.eyebrow}>{t("formHeading")}</p>
            <h2 id="partnerzy-form-heading">{c.contact}</h2>
            <p className={styles.contactLead}>{c.contactLead}</p>
            <div className={w.person}>
              {partnershipContact.photo ? (
                <div className={w.personPhoto}>
                  <Image src={partnershipContact.photo} alt={partnershipContact.name} fill sizes="(min-width: 1024px) 440px, 260px" className="object-cover object-top" />
                </div>
              ) : null}
              <div className={w.personText}>
                <p className={w.personLabel}>{t("osoba.label")}</p>
                <p className={w.personName}>{partnershipContact.name}</p>
                <p className={w.personRole}>{role}</p>
                <p className={w.personDesc}>{t("osoba.desc")}</p>
                <div className={w.personLinks}>
                  <a href={`mailto:${CONTACT_EMAIL}`}><EnvelopeSimple size={18} aria-hidden="true" />{CONTACT_EMAIL}</a>
                  <a href={`tel:+48${partnershipContact.phone.replace(/\s/g, "")}`}><Phone size={18} aria-hidden="true" />{partnershipContact.phone}</a>
                </div>
                <p className={w.response}><ClockCountdown size={18} weight="bold" aria-hidden="true" />{t("osoba.response")}</p>
              </div>
            </div>
            <ol className={styles.contactSteps}>{c.steps.map(([title, body], i) => <li key={title}><span aria-hidden="true">0{i + 1}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol>
          </div>
        }
      />
    </>
  );
}
