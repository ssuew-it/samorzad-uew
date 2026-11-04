import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PodaniaContent } from "@/components/pages/PodaniaContent";
import { ogMeta } from "@/lib/og";
import { withPageMessages } from "@/i18n/page-messages";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "applicationsLive" });

  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    ...ogMeta(t("metaTitle"), t("ogLabel"), { locale, path: "/infopacki/podania" }),
  };
}

async function PodaniaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PodaniaContent />;
}

export default withPageMessages("/infopacki/podania", PodaniaPage);
