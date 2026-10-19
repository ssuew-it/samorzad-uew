import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { FuePsrpContent } from "@/components/pages/FuePsrpContent";
import { ogMeta } from "@/lib/og";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "fuePsrp" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    ...ogMeta(t("metaTitle"), t("ogLabel")),
  };
}

export default async function FuePsrpPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "fuePsrp" });
  const tc = await getTranslations({ locale, namespace: "common" });

  return (
    <>
      <PageHero
        photo={{ src: "/photos/projekty/mosty/cover.webp", alt: t("heroPhotoAlt") }}
        title={t("heroTitle")}
        lead={t("heroLead")}
        breadcrumbs={[
          { label: tc("home"), href: "/" },
          { label: t("metaTitle") },
        ]}
      />
      <FuePsrpContent />
    </>
  );
}
