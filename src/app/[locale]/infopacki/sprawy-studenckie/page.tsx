import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SprawyStudenckieContent } from "@/components/pages/SprawyStudenckieContent";
import { ogMeta } from "@/lib/og";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "studentMattersLive" });
  return { title: t("metaTitle"), description: t("metaDesc"), ...ogMeta(t("metaTitle"), t("ogLabel"), { locale, path: "/infopacki/sprawy-studenckie" }) };
}

export default async function SprawyStudenckiePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SprawyStudenckieContent />;
}
