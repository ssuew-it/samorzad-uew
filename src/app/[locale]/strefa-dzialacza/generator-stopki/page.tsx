import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { GeneratorStopki } from "@/components/strefa/GeneratorStopki";
import { requireAccess } from "@/lib/access";
import { ogMeta } from "@/lib/og";
import { withPageMessages } from "@/i18n/page-messages";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "generatorStopki" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    // Narzędzie wewnętrzne - nie ma po co trafiać do wyszukiwarek.
    robots: { index: false, follow: false },
    ...ogMeta(t("metaTitle"), t("ogLabel"), { locale, path: "/strefa-dzialacza/generator-stopki" }),
  };
}

/**
 * Generator stopki - dostępny wyłącznie po zalogowaniu.
 *
 * Strażnik to ten sam mechanizm, co w całej Strefie Działacza: logowanie
 * Google z twardą walidacją domeny @samorzad.ue.wroc.pl w callbacku. Bez
 * sesji odsyłamy do Strefy, gdzie stoi przycisk logowania - nie pokazujemy
 * pustego narzędzia z komunikatem, bo to tylko myli.
 */
async function GeneratorStopkiPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { session } = await requireAccess(locale);

  const t = await getTranslations({ locale, namespace: "generatorStopki" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const tb = await getTranslations({ locale, namespace: "board" });
  const tp = await getTranslations({ locale, namespace: "przewodniczacy" });
  const ts = await getTranslations({ locale, namespace: "strefaDzialacza" });

  // Funkcje do wyboru pochodzą z tych samych tłumaczeń, co nazwy ról na
  // stronach Zarządu i Prezydium - jedna lista, bez rozjeżdżania się nazw.
  const funkcje = [
    tp("roles.strategy"),
    tp("roles.projects"),
    tp("roles.pr"),
    tb("roles.admin"),
    tb("roles.external"),
    tb("roles.teaching"),
    tb("roles.promo"),
    tb("roles.finance"),
    tb("roles.hr"),
    tb("roles.branch"),
  ];

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
      <GeneratorStopki
        sesja={{ name: session.name, email: session.email }}
        funkcje={funkcje}
        etykiety={{
          heading: t("heading"),
          intro: t("intro"),
          fieldName: t("fieldName"),
          fieldTitle: t("fieldTitle"),
          fieldTitleOther: t("fieldTitleOther"),
          fieldPhone: t("fieldPhone"),
          fieldEmail: t("fieldEmail"),
          fieldWeb: t("fieldWeb"),
          showInstagram: t("showInstagram"),
          showFacebook: t("showFacebook"),
          showLinkedin: t("showLinkedin"),
          previewHeading: t("previewHeading"),
          variantLabel: t("variantLabel"),
          variantDaily: t("variantDaily"),
          variantBulk: t("variantBulk"),
          variantBulkHint: t("variantBulkHint"),
          previewModes: {
            light: { title: t("preview.light.title"), note: t("preview.light.note") },
            darkPartial: { title: t("preview.darkPartial.title"), note: t("preview.darkPartial.note") },
            darkInvert: { title: t("preview.darkInvert.title"), note: t("preview.darkInvert.note") },
            phone: { title: t("preview.phone.title"), note: t("preview.phone.note") },
          },
          previewNote: t("previewNote"),
          copy: t("copy"),
          copied: t("copied"),
          copyError: t("copyError"),
          download: t("download"),
          howHeading: t("howHeading"),
          howGmail: t("howGmail"),
          howOutlook: t("howOutlook"),
          phoneHint: t("phoneHint"),
        }}
      />
    </>
  );
}

export default withPageMessages("/strefa-dzialacza/generator-stopki", GeneratorStopkiPage);
