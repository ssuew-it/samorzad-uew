import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { DziekaniContent } from "@/components/pages/DziekaniContent";
import { getDyzuryData } from "@/lib/tresci";
import { ogMeta } from "@/lib/og";
import { withPageMessages } from "@/i18n/page-messages";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dziekani" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    ...ogMeta(t("metaTitle"), t("ogLabel"), { locale, path: "/dziekan-i-prodziekani" }),
  };
}

async function DziekaniPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "dziekani" });
  const tc = await getTranslations({ locale, namespace: "common" });
  // Dyżury z zakładki „Dyżury” w arkuszu „Treści strony” (kopia w kodzie, gdy arkusz nie działa).
  const { items: dyzury } = await getDyzuryData();

  return (
    <>
      <PageHero
        title={t("heroTitle")}
        lead={t("heroLead")}
        breadcrumbs={[
          { label: tc("home"), href: "/" },
          { label: t("crumbStudent"), href: "/dla-studenta" },
          { label: t("heroTitle") },
        ]}
      />
      <DziekaniContent dyzury={dyzury} />
    </>
  );
}

export default withPageMessages("/dziekan-i-prodziekani", DziekaniPage);
