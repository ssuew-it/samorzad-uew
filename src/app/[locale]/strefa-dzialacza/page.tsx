import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { StrefaHero } from "@/components/strefa/StrefaHero";
import { StrefaDzialaczaContent } from "@/components/pages/StrefaDzialaczaContent";
import { isAuthConfigured } from "@/lib/auth";
import { getAccess } from "@/lib/access";
import { canSee } from "@/lib/roles-core";
import { ogMeta } from "@/lib/og";
import { panelTiles } from "@/lib/panel";
import { getRejestrZarzadzen } from "@/lib/tresci";
import { withPageMessages } from "@/i18n/page-messages";

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
    ...ogMeta(t("metaTitle"), t("ogLabel"), { locale, path: "/strefa-dzialacza" }),
  };
}

async function StrefaDzialaczaPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { error } = await searchParams;
  const t = await getTranslations({ locale, namespace: "strefaDzialacza" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const tr = await getTranslations({ locale, namespace: "roles" });

  const access = await getAccess();
  const configured = isAuthConfigured();
  // Rejestr zarządzeń tylko po sprawdzeniu sesji - zarządzenia wewnętrzne nie
  // mogą trafić do HTML ani danych RSC niezalogowanego.
  const rejestr = access ? (await getRejestrZarzadzen()).items : [];
  const err = Array.isArray(error) ? error[0] : error;

  return (
    <>
      <StrefaHero
        eyebrow={t("heroEyebrow")}
        title={access ? t("panelTitle") : t("heroTitle")}
        lead={access ? t("panelLead") : t("heroLead")}
        lit={Boolean(access)}
        breadcrumbs={[
          { label: tc("home"), href: "/" },
          { label: t("metaTitle") },
        ]}
      />
      <StrefaDzialaczaContent
        user={
          access
            ? {
                name: access.session.name,
                picture: access.session.picture,
                // Nazwy ról i daty liczone tu - przestrzeń „roles” nie jedzie do klienta.
                roles: access.roles.map((r) => ({
                  label: tr(r.role),
                  until: r.until ? t("roleUntil", { date: r.until.slice(0, 10).split("-").reverse().join(".") }) : t("roleNoEnd"),
                })),
              }
            : null
        }
        // Kafelki (z adresami narzędzi) wyłącznie po sprawdzeniu sesji i roli -
        // niezalogowany nie dostaje ich ani w HTML, ani w danych RSC, a kafelki
        // wymagające roli nie trafiają do osób bez niej.
        tiles={access ? panelTiles.filter((t) => canSee(t.roles, access)) : []}
        rejestr={rejestr}
        configured={configured}
        error={err}
      />
    </>
  );
}

export default withPageMessages("/strefa-dzialacza", StrefaDzialaczaPage);
