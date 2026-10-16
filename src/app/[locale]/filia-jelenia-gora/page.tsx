import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FiliaContent } from "@/components/pages/FiliaContent";
import { ogMeta } from "@/lib/og";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "filia" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    ...ogMeta(t("metaTitle"), t("ogLabel")),
  };
}

// Strona ma własny nagłówek (z portretem osoby od Filii), dlatego bez PageHero.
export default async function FiliaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <FiliaContent />;
}
