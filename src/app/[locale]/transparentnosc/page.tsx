import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { TransparentnoscContent } from "@/components/pages/TransparentnoscContent";
import { TransparentnoscHero } from "@/components/pages/TransparentnoscHero";
import { ogMeta } from "@/lib/og";
import { getRussData, getZarzadzeniaData } from "@/lib/tresci";
import { buildTransparency } from "@/lib/transparency";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "transparentnosc" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    ...ogMeta(t("metaTitle"), t("ogLabel"), { locale, path: "/transparentnosc" }),
  };
}

export default async function TransparentnoscPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Te same zakładki arkusza co rejestry zarządzeń i uchwał - liczby i
  // „ostatnio opublikowane” zmieniają się razem z nimi.
  const [{ items: orders }, { resolutions }] = await Promise.all([getZarzadzeniaData(), getRussData()]);
  const data = buildTransparency(orders, resolutions);

  return (
    <>
      <TransparentnoscHero counts={data.counts} />
      <TransparentnoscContent data={data} />
    </>
  );
}
