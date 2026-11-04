import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RegulaminStudiowContent } from "@/components/pages/RegulaminStudiowContent";
import { ogMeta } from "@/lib/og";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "studyRegLive" });

  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    ...ogMeta(t("metaTitle"), t("ogLabel"), { locale, path: "/infopacki/regulamin-studiow" }),
  };
}

export default async function RegulaminStudiowPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <RegulaminStudiowContent />;
}
