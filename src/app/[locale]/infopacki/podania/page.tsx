import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PodaniaContent } from "@/components/pages/PodaniaContent";
import { ogMeta } from "@/lib/og";

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

export default async function PodaniaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PodaniaContent />;
}
