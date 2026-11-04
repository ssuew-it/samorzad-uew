import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { RegulacjeContent } from "@/components/pages/RegulacjeContent";
import { ogMeta } from "@/lib/og";
import { withPageMessages } from "@/i18n/page-messages";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "regulacje" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    ...ogMeta(t("metaTitle"), t("ogLabel"), { locale, path: "/regulacje-wewnetrzne" }),
  };
}

async function RegulacjePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "regulacje" });
  const tc = await getTranslations({ locale, namespace: "common" });

  return (
    <>
      <PageHero
        title={t("heroTitle")}
        lead={t("heroLead")}
        breadcrumbs={[
          { label: tc("home"), href: "/" },
          { label: t("crumbActivities"), href: "/o-nas" },
          { label: t("heroTitle") },
        ]}
      />
      <RegulacjeContent />
    </>
  );
}

export default withPageMessages("/regulacje-wewnetrzne", RegulacjePage);
