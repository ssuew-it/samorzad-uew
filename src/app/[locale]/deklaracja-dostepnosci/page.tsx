import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { DeklaracjaContent } from "@/components/pages/DeklaracjaContent";
import { ogMeta } from "@/lib/og";
import { withPageMessages } from "@/i18n/page-messages";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "deklaracja" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    ...ogMeta(t("metaTitle"), t("ogLabel"), { locale, path: "/deklaracja-dostepnosci" }),
  };
}

async function DeklaracjaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "deklaracja" });
  const tc = await getTranslations({ locale, namespace: "common" });

  return (
    <>
      <PageHero
        title={t("heroTitle")}
        lead={t("heroLead")}
        breadcrumbs={[
          { label: tc("home"), href: "/" },
          { label: t("metaTitle") },
        ]}
      />
      <DeklaracjaContent />
    </>
  );
}

export default withPageMessages("/deklaracja-dostepnosci", DeklaracjaPage);
