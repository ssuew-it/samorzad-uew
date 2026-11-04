import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PartnerHero } from "@/components/partners/PartnerHero";
import { PartnerSectionNav } from "@/components/partners/PartnerSectionNav";
import { PartnerzyContent } from "@/components/pages/PartnerzyContent";
import type { QA } from "@/components/Faq";
import { PartnerFaq } from "@/components/partners/PartnerFaq";
import { ogMeta } from "@/lib/og";
import { partnershipContact } from "@/lib/partnership-contact";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "partnerzy" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    ...ogMeta(t("metaTitle"), t("ogLabel"), { locale, path: "/partnerzy" }),
  };
}

const FAQ_KEYS = ["start", "forms", "reach", "tailored"] as const;

export default async function PartnerzyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "partnerzy" });

  const faq: QA[] = FAQ_KEYS.map((k) => ({
    q: t(`faq.${k}.q`),
    a: t(`faq.${k}.a`, { contactName: partnershipContact.name, contactEmail: partnershipContact.email }),
  }));

  return (
    <>
      <PartnerHero />
      <PartnerSectionNav />
      <PartnerzyContent />
      <PartnerFaq items={faq} locale={locale} />
    </>
  );
}
