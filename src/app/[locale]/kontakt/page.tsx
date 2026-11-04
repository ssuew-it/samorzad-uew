import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { KontaktContent } from "@/components/pages/KontaktContent";
import { ogMeta } from "@/lib/og";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "kontakt" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    ...ogMeta(t("metaTitle"), t("ogLabel"), { locale, path: "/kontakt" }),
  };
}

export default async function KontaktPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "kontakt" });
  const tc = await getTranslations({ locale, namespace: "common" });

  return (
    <>
      <PageHero
        // Nie stoisko ze strefą relaksu: na jego banerze jest dawny adres
        // (Budynek J, pok. 9), a strona obok podaje Budynek L, pok. 110.
        photo={{ src: "/photos/kontakt/zespol.webp", alt: t("heroPhotoAlt"), position: "50% 35%" }}
        title={t("heroTitle")}
        lead={t("heroLead")}
        breadcrumbs={[
          { label: tc("home"), href: "/" },
          { label: t("heroTitle") },
        ]}
      />
      <KontaktContent />
    </>
  );
}
