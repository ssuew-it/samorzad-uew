import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BibliotekaContent } from "@/components/pages/BibliotekaContent";
import { ogMeta } from "@/lib/og";
import { withPageMessages } from "@/i18n/page-messages";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "libraryLive" });
  return { title: t("metaTitle"), description: t("metaDesc"), ...ogMeta(t("metaTitle"), t("ogLabel"), { locale, path: "/infopacki/biblioteka" }) };
}

async function BibliotekaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <BibliotekaContent />;
}

export default withPageMessages("/infopacki/biblioteka", BibliotekaPage);
