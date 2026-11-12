import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { Kaizen } from "@/components/strefa/Kaizen";
import { requireAccess } from "@/lib/access";
import { getTablicaKaizen } from "@/lib/kaizen-tablica";
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
  await requireAccess(locale);

  const t = await getTranslations({ locale, namespace: "kaizen" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const ts = await getTranslations({ locale, namespace: "strefaDzialacza" });
  const tablica = await getTablicaKaizen();

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
      <Kaizen tablica={tablica} />
    </>
  );
}

export default withPageMessages("/strefa-dzialacza/kaizen", KaizenPage);
