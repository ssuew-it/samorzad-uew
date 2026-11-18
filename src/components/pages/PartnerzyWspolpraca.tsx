"use client";

import { useState, type ReactNode } from "react";
import { ArrowUpRight, Check, Copy } from "@phosphor-icons/react";
import { PartnershipPicker } from "../partners/PartnershipPicker";
import { partnershipContact } from "@/lib/partnership-contact";
import { ContactForm, type ContactFormField, type ContactFormLabels } from "../ContactForm";
import styles from "../partners/Partners.module.css";

/** Podpisy z pageCopy w PartnerzyContent, których potrzebuje wyspa. */
export interface PartnerzyCopy {
  topicLabel: string;
  changeTopic: string;
  form: string;
  refLabel: string;
  copy: string;
  copied: string;
  who: string;
  when: string;
}

/**
 * Potwierdzenie wysłania formularza partnerskiego: numer zgłoszenia (ten sam
 * jest w temacie maila w skrzynce Samorządu), kto się nim zajmie i kiedy.
 */
function PartnershipSuccess({ refNo, copy, role }: { refNo?: string; copy: PartnerzyCopy; role: string }) {
  const [copied, setCopied] = useState(false);
  const copyRef = async () => {
    if (!refNo) return;
    try {
      await navigator.clipboard.writeText(refNo);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* schowek zablokowany - numer i tak widać na ekranie */
    }
  };
  return (
    <div className={styles.successBox}>
      {refNo ? (
        <div className={styles.successRef}>
          <span>{copy.refLabel}</span>
          <strong>{refNo}</strong>
          <button type="button" onClick={copyRef} className={styles.successCopy}>
            {copied ? <Check size={16} weight="bold" aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
            <span aria-live="polite">{copied ? copy.copied : copy.copy}</span>
          </button>
        </div>
      ) : null}
      <div className={styles.successWho}>
        {partnershipContact.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={partnershipContact.photo} alt="" width={56} height={70} />
        ) : null}
        <p>
          <span>{copy.who}</span>
          <strong>{partnershipContact.name}</strong>
          <span>{role}</span>
        </p>
      </div>
      <p className={styles.successWhen}>{copy.when}</p>
    </div>
  );
}

/**
 * Wybór kierunku rozmowy i formularz - jedyna interaktywna część strony
 * Partnerzy; dzielą stan (wybrany kierunek wypełnia wiadomość). Lewa kolumna
 * sekcji kontaktu (wstęp, oferta, wizytówka) przychodzi z serwera jako `intro`.
 */
export function PartnerzyWspolpraca({
  intro,
  fields,
  labels,
  copy: c,
  role,
  contactEmail,
}: {
  intro: ReactNode;
  fields: ContactFormField[];
  labels: ContactFormLabels;
  copy: PartnerzyCopy;
  role: string;
  contactEmail: string;
}) {
  const [prefill, setPrefill] = useState<{ message: string }>();
  const [chosenTopic, setChosenTopic] = useState("");
  return (
    <>
      <PartnershipPicker onChoose={(message, topic) => { setPrefill({ message }); setChosenTopic(topic); }} />

      <section id="kontakt-partnerzy" className="section-padding scroll-mt-40 border-t border-border-subtle bg-bg-surface" aria-labelledby="partnerzy-form-heading">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 [&>*]:min-w-0 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          {intro}
          <div className={styles.formPanel}>
            <h3>{c.form}</h3>
            {chosenTopic && <div className={styles.chosenTopic}><p><span>{c.topicLabel}</span><strong>{chosenTopic}</strong></p><a href="#wspolpraca">{c.changeTopic}<ArrowUpRight size={16} aria-hidden="true" /></a></div>}
            <ContactForm kind="partnerzy" fields={fields} labels={labels} contactEmail={contactEmail} extraHiddenFields={{ source: "partnerzy" }} prefill={prefill} replaceUneditedPrefill renderSuccess={(ref) => <PartnershipSuccess refNo={ref} copy={c} role={role} />} />
          </div>
        </div>
      </section>
    </>
  );
}
