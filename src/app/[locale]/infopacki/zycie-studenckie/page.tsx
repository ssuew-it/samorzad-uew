import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ZycieStudenckieContent } from "@/components/pages/ZycieStudenckieContent";
import { ogMeta } from "@/lib/og";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "studentLifeLive" });
  return { title: t("metaTitle"), description: t("metaDesc"), ...ogMeta(t("metaTitle"), t("ogLabel"), { locale, path: "/infopacki/zycie-studenckie" }) };
}

export default async function ZycieStudenckiePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ZycieStudenckieContent />;
}
