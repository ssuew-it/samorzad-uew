import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { TresciStatus } from "@/components/strefa/TresciStatus";
import { requireAccess } from "@/lib/access";
import { TRESCI_ROLES } from "@/lib/panel";
import {
  getDyzuryData,
  getWydarzeniaData,
  getRekrutacjeData,
  getRussData,
  getSkwData,
  getTerminyData,
  getZarzadzeniaData,
  isSheetConfigured,
} from "@/lib/tresci";
import { sheetId } from "@/lib/tresci/arkusz";
import { withPageMessages } from "@/i18n/page-messages";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tresciStrony" });
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

/**
 * Stan treści z arkusza „Treści strony” - tylko po zalogowaniu. Pokazuje,
 * skąd strona bierze dane (arkusz czy kopia z kodu), które wiersze odrzuciła
 * i dlaczego, oraz pozwala odświeżyć stronę od razu.
 */
async function TresciPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Zarząd i Projekty (superadmin przechodzi zawsze) - patrz TRESCI_ROLES.
  await requireAccess(locale, TRESCI_ROLES);

  const t = await getTranslations({ locale, namespace: "tresciStrony" });
  const ts = await getTranslations({ locale, namespace: "strefaDzialacza" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const [{ status: terminyStatus }, { status: zarzadzeniaStatus }, { status: russStatus }, { status: skwStatus }, { status: rekStatus }, { status: dyzuryStatus }, { status: wydarzeniaStatus }] =
    await Promise.all([getTerminyData(), getZarzadzeniaData(), getRussData(), getSkwData(), getRekrutacjeData(), getDyzuryData(), getWydarzeniaData()]);
  const status = [...terminyStatus, zarzadzeniaStatus, ...russStatus, skwStatus, rekStatus, dyzuryStatus, wydarzeniaStatus];
  const id = sheetId();

  return (
    <>
      <PageHero
        title={t("heroTitle")}
        lead={t("heroLead")}
        breadcrumbs={[
          { label: tc("home"), href: "/" },
          { label: ts("metaTitle"), href: "/strefa-dzialacza" },
          { label: t("heroTitle") },
        ]}
      />
      <TresciStatus
        status={status}
        configured={isSheetConfigured()}
        sheetUrl={id ? `https://docs.google.com/spreadsheets/d/${id}/edit` : null}
      />
    </>
  );
}

export default withPageMessages("/strefa-dzialacza/tresci", TresciPage);
