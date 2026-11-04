import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { RekrutacjaContent } from "@/components/pages/RekrutacjaContent";
import { ogMeta } from "@/lib/og";
import { getRekrutacjeData } from "@/lib/tresci";
import { todayInWarsaw } from "@/lib/russ";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "rekrutacja" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    ...ogMeta(t("metaTitle"), t("ogLabel"), { locale, path: "/rekrutacja" }),
  };
}

export default async function RekrutacjaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "rekrutacja" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const { items } = await getRekrutacjeData();

  return (
    <>
      <PageHero
        photo={{ src: "/photos/hero/da_1.webp", alt: t("heroPhotoAlt") }}
        title={t("heroTitle")}
        lead={t("heroLead")}
        breadcrumbs={[
          { label: tc("home"), href: "/" },
          { label: t("heroTitle") },
        ]}
      />
      <RekrutacjaContent items={items} serverToday={todayInWarsaw()} />
    </>
  );
}
