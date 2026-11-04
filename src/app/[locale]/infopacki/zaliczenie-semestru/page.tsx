import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ZaliczenieSemestruContent } from "@/components/pages/ZaliczenieSemestruContent";
import { ogMeta } from "@/lib/og";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "semesterLive" });
  return { title: t("metaTitle"), description: t("metaDesc"), ...ogMeta(t("metaTitle"), t("ogLabel"), { locale, path: "/infopacki/zaliczenie-semestru" }) };
}

export default async function ZaliczenieSemestruPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ZaliczenieSemestruContent />;
}
