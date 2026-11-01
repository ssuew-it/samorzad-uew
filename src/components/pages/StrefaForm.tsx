"use client";

import { useTranslations } from "next-intl";
import { ContactForm, type ContactFormField } from "../ContactForm";

const CONTACT_EMAIL = "kontakt@samorzad.ue.wroc.pl";

/**
 * Formularz na końcu Strefy studenta: sprawa, której nie ma na liście, albo
 * propozycja nowej sytuacji do opisania. Ten sam backend i etykiety co na
 * Kontakcie; temat podpowiada, skąd przyszła wiadomość.
 */
export function StrefaForm() {
  const t = useTranslations("kontakt");
  const ts = useTranslations("dlaStudenta");

  const fields: ContactFormField[] = [
    {
      key: "name",
      type: "text",
      label: t("labelName"),
      autoComplete: "name",
      colSpan: 1,
      validate: (v) => (v.trim().length < 2 ? t("errName") : undefined),
    },
    {
      key: "email",
      type: "email",
      label: t("labelEmail"),
      autoComplete: "email",
      colSpan: 1,
      validate: (v) => (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? t("errEmail") : undefined),
    },
    {
      key: "subject",
      type: "text",
      label: t("labelSubject"),
      colSpan: 2,
      validate: (v) => (v.trim().length < 2 ? t("errSubject") : undefined),
    },
    {
      key: "message",
      type: "textarea",
      label: t("labelMessage"),
      colSpan: 2,
      validate: (v) => (v.trim().length < 10 ? t("errMessage") : undefined),
    },
  ];

  return (
    <ContactForm
      kind="kontakt"
      fields={fields}
      labels={{
        submitIdle: t("submitIdle"),
        submitSending: t("submitSending"),
        successHeading: t("successHeading"),
        successBody: t("successBody"),
        successAgain: t("successAgain"),
        errServer: t("errServer"),
        rodoIntro: t("rodoIntro"),
        rodoLink: t("rodoLink"),
      }}
      contactEmail={CONTACT_EMAIL}
      prefill={{ subject: ts("ctaSubject") }}
    />
  );
}
