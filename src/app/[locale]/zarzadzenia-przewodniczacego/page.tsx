import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { ZarzadzeniaContent } from "@/components/pages/ZarzadzeniaContent";
import { ogMeta } from "@/lib/og";
import { getZarzadzeniaData } from "@/lib/tresci";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "zarzadzenia" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    ...ogMeta(t("metaTitle"), t("ogLabel"), { locale, path: "/zarzadzenia-przewodniczacego" }),
  };
}

export default async function ZarzadzeniaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "zarzadzenia" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const { items: orders } = await getZarzadzeniaData();

  return (
    <>
      <PageHero
        title={t("heroTitle")}
        lead={t("heroLead")}
        breadcrumbs={[
          { label: tc("home"), href: "/" },
          { label: t("crumbGov"), href: "/o-nas" },
          { label: t("heroTitle") },
        ]}
      />
      <ZarzadzeniaContent orders={orders} />
    </>
  );
}
