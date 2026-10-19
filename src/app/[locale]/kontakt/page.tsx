import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { KontaktContent } from "@/components/pages/KontaktContent";
import { ogMeta } from "@/lib/og";
import { formsConfigured } from "@/app/actions/formularze";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "kontakt" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    ...ogMeta(t("metaTitle"), t("ogLabel")),
  };
}

export default async function KontaktPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const formsReady = await formsConfigured();
  const t = await getTranslations({ locale, namespace: "kontakt" });
  const tc = await getTranslations({ locale, namespace: "common" });

  return (
    <>
      <PageHero
        photo={{ src: "/photos/hero/inne_1.webp", alt: t("heroPhotoAlt"), position: "60% center" }}
        title={t("heroTitle")}
        lead={t("heroLead")}
        breadcrumbs={[
          { label: tc("home"), href: "/" },
          { label: t("heroTitle") },
        ]}
      />
      <KontaktContent formsReady={formsReady} />
    </>
  );
}
