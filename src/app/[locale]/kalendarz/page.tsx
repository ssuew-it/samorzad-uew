import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { KalendarzContent } from "@/components/pages/KalendarzContent";
import { TerminyRoku } from "@/components/TerminyRoku";
import { PlanZajecSection } from "@/components/PlanZajecSection";
import { getTerminyData } from "@/lib/tresci";
import { ogMeta } from "@/lib/og";
import { withPageMessages } from "@/i18n/page-messages";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "kalendarz" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    ...ogMeta(t("metaTitle"), t("ogLabel"), { locale, path: "/kalendarz" }),
  };
}

async function KalendarzPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "kalendarz" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const { data: terminy } = await getTerminyData();

  return (
    <>
      <PageHero
        photo={{ src: "/photos/hero/tedx_1.webp", alt: t("heroPhotoAlt") }}
        title={t("heroTitle")}
        lead={t("heroLead")}
        breadcrumbs={[
          { label: tc("home"), href: "/" },
          { label: t("heroTitle") },
        ]}
      />
      {/* Terminy przed wydarzeniami: po to student tu wchodzi. */}
      <TerminyRoku data={terminy} />
      <PlanZajecSection />
      <KalendarzContent />
    </>
  );
}

export default withPageMessages("/kalendarz", KalendarzPage);
