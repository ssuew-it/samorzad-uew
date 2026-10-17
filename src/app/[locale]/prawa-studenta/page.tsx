import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { PrawaHeroArt } from "@/components/pages/PrawaHeroArt";
import { PrawaStudentaContent } from "@/components/pages/PrawaStudentaContent";
import { Faq, type QA } from "@/components/Faq";
import { ogMeta } from "@/lib/og";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "prawaStudenta" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    ...ogMeta(t("metaTitle"), t("ogLabel")),
  };
}

const FAQ_KEYS = ["source", "ios", "commission", "report"] as const;

export default async function PrawaStudentaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "prawaStudenta" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const faq: QA[] = FAQ_KEYS.map((k) => ({ q: t(`faq.${k}.q`), a: t(`faq.${k}.a`) }));

  return (
    <>
      <PageHero
        eyebrow={t("heroEyebrow")}
        title={t("heroTitle")}
        lead={t("heroLead")}
        visual={<PrawaHeroArt />}
        breadcrumbs={[
          { label: tc("home"), href: "/" },
          { label: t("crumbStudent"), href: "/dla-studenta" },
          { label: t("heroTitle") },
        ]}
      />
      <PrawaStudentaContent />
      <Faq items={faq} heading={t("faqHeading")} />
    </>
  );
}
