import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { StrefaDzialaczaContent } from "@/components/pages/StrefaDzialaczaContent";
import { isAuthConfigured } from "@/lib/auth";
import { getAccess } from "@/lib/access";
import { canSee } from "@/lib/roles-core";
import { ogMeta } from "@/lib/og";
import { panelTiles } from "@/lib/panel";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "strefaDzialacza" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    robots: { index: false, follow: false },
    ...ogMeta(t("metaTitle"), t("ogLabel")),
  };
}

export default async function StrefaDzialaczaPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { error } = await searchParams;
  const t = await getTranslations({ locale, namespace: "strefaDzialacza" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const access = await getAccess();
  const configured = isAuthConfigured();
  const err = Array.isArray(error) ? error[0] : error;

  return (
    <>
      <PageHero
        title={access ? t("panelTitle") : t("heroTitle")}
        lead={access ? t("panelLead") : t("heroLead")}
        breadcrumbs={[
          { label: tc("home"), href: "/" },
          { label: t("metaTitle") },
        ]}
      />
      <StrefaDzialaczaContent
        user={access ? { name: access.session.name, picture: access.session.picture } : null}
        // Kafelki (z adresami narzędzi) wyłącznie po sprawdzeniu sesji i roli -
        // niezalogowany nie dostaje ich ani w HTML, ani w danych RSC, a kafelki
        // wymagające roli nie trafiają do osób bez niej.
        tiles={access ? panelTiles.filter((t) => canSee(t.roles, access)) : []}
        configured={configured}
        error={err}
      />
    </>
  );
}
