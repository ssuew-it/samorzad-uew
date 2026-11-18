import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { Suspense } from "react";
import { Kaizen, TablicaSzkielet } from "@/components/strefa/Kaizen";
import { KaizenTablice } from "@/components/strefa/KaizenTablice";
import { requireAccess } from "@/lib/access";
import { KAIZEN_ODPOWIADAJA } from "@/lib/kaizen";
import { canSee } from "@/lib/roles-core";
import { ogMeta } from "@/lib/og";
import { withPageMessages } from "@/i18n/page-messages";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "kaizen" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    robots: { index: false, follow: false },
    ...ogMeta(t("metaTitle"), t("ogLabel"), { locale, path: "/strefa-dzialacza/kaizen" }),
  };
}

/**
 * Karteczki Kaizen - tylko dla zalogowanych Działaczy (jak cała Strefa).
 * Tablicę pobieramy dopiero po sprawdzeniu sesji: odpowiedzi Zarządu są
 * wewnętrzne i nie mogą trafić do niezalogowanego.
 */
async function KaizenPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const access = await requireAccess(locale);

  const t = await getTranslations({ locale, namespace: "kaizen" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const ts = await getTranslations({ locale, namespace: "strefaDzialacza" });
  // Zarząd (i superadmin) widzi wszystkie karteczki i odpowiada na stronie.
  // Pozostali nie dostają nawet zapytania o tę listę.
  const odpowiada = canSee(KAIZEN_ODPOWIADAJA, access);

  return (
    <>
      <PageHero
        title={t("heroTitle")}
        lead={t("heroLead")}
        breadcrumbs={[
          { label: tc("home"), href: "/" },
          { label: ts("metaTitle"), href: "/strefa-dzialacza" },
          { label: t("metaTitle") },
        ]}
      />
      <Kaizen>
        <Suspense fallback={<TablicaSzkielet />}>
          <KaizenTablice odpowiada={odpowiada} />
        </Suspense>
      </Kaizen>
    </>
  );
}

export default withPageMessages("/strefa-dzialacza/kaizen", KaizenPage);
