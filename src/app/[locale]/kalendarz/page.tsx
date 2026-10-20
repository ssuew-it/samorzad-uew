import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { KalendarzContent } from "@/components/pages/KalendarzContent";
import { TerminyRoku } from "@/components/TerminyRoku";
import { getTerminyData } from "@/lib/tresci";
import { ogMeta } from "@/lib/og";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "kalendarz" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    ...ogMeta(t("metaTitle"), t("ogLabel")),
  };
}

export default async function KalendarzPage({ params }: Props) {
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
      <KalendarzContent />
    </>
  );
}
