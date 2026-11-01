import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { ZarzadContent } from "@/components/pages/ZarzadContent";
import { ogMeta } from "@/lib/og";
import { getZarzadzeniaData } from "@/lib/tresci";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "zarzad" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    ...ogMeta(t("metaTitle"), t("ogLabel")),
  };
}

export default async function ZarzadPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "zarzad" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const { items: orders } = await getZarzadzeniaData();

  return (
    <>
      <PageHero
        // Sesja Zarządu 2026/2027, schody przed budynkiem Z.
        photo={{ src: "/photos/zarzad/zespol.webp", alt: t("heroPhotoAlt"), position: "50% 30%" }}
        title={t("heroTitle")}
        lead={t("heroLead")}
        breadcrumbs={[
          { label: tc("home"), href: "/" },
          { label: t("crumbGov"), href: "/o-nas" },
          { label: t("heroTitle") },
        ]}
      />
      <ZarzadContent orders={orders} />
    </>
  );
}
