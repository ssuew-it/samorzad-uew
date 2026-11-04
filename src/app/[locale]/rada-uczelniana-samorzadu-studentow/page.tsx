import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { RUSSContent } from "@/components/pages/RUSSContent";
import { ogMeta } from "@/lib/og";
import { getRussData } from "@/lib/tresci";
import { todayInWarsaw } from "@/lib/russ";
import { withPageMessages } from "@/i18n/page-messages";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "russ" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    ...ogMeta(t("metaTitle"), t("ogLabel"), { locale, path: "/rada-uczelniana-samorzadu-studentow" }),
  };
}

async function RUSSPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "russ" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const { meetings, resolutions } = await getRussData();

  return (
    <>
      <PageHero
        title={t("heroTitle")}
        lead={t("heroLead")}
        breadcrumbs={[
          { label: tc("home"), href: "/" },
          { label: t("crumbActivities"), href: "/o-nas" },
          { label: t("crumbSelf") },
        ]}
      />
      <RUSSContent meetings={meetings} resolutions={resolutions} serverToday={todayInWarsaw()} />
    </>
  );
}

export default withPageMessages("/rada-uczelniana-samorzadu-studentow", RUSSPage);
