import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { StrefaDzialaczaContent } from "@/components/pages/StrefaDzialaczaContent";
import { getSession, isAuthConfigured } from "@/lib/auth";
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

  const session = await getSession();
  const configured = isAuthConfigured();
  const err = Array.isArray(error) ? error[0] : error;

  return (
    <>
      <PageHero
        eyebrow={t("heroEyebrow")}
        title={session ? t("panelTitle") : t("heroTitle")}
        lead={session ? t("panelLead") : t("heroLead")}
        breadcrumbs={[
          { label: tc("home"), href: "/" },
          { label: t("metaTitle") },
        ]}
      />
      <StrefaDzialaczaContent
        user={session ? { name: session.name } : null}
        // Kafelki (z adresami narzędzi) wyłącznie po sprawdzeniu sesji —
        // niezalogowany nie dostaje ich ani w HTML, ani w danych RSC.
        tiles={session ? panelTiles : []}
        configured={configured}
        error={err}
      />
    </>
  );
}
