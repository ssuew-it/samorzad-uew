import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { KomisjaWyborczaContent } from "@/components/pages/KomisjaWyborczaContent";
import { ogMeta } from "@/lib/og";
import { getSkwData } from "@/lib/tresci";
import { withPageMessages } from "@/i18n/page-messages";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "skw" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    ...ogMeta(t("metaTitle"), t("ogLabel"), { locale, path: "/studencka-komisja-wyborcza" }),
  };
}

async function KomisjaWyborczaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "skw" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const { resolutions } = await getSkwData();

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
      <KomisjaWyborczaContent resolutions={resolutions} />
    </>
  );
}

export default withPageMessages("/studencka-komisja-wyborcza", KomisjaWyborczaPage);
