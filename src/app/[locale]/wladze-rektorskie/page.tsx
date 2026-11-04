import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { WladzeRektorskieContent } from "@/components/pages/WladzeRektorskieContent";
import { getDyzuryData } from "@/lib/tresci";
import { ogMeta } from "@/lib/og";
import { withPageMessages } from "@/i18n/page-messages";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "wladze" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    ...ogMeta(t("metaTitle"), t("ogLabel"), { locale, path: "/wladze-rektorskie" }),
  };
}

async function WladzeRektorskiePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "wladze" });
  const tc = await getTranslations({ locale, namespace: "common" });
  // Dyżury Prorektora ds. Studenckich i Kształcenia z zakładki „Dyżury” w arkuszu.
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
      <WladzeRektorskieContent dyzury={dyzury} />
    </>
  );
}

export default withPageMessages("/wladze-rektorskie", WladzeRektorskiePage);
