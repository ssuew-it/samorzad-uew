import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DyplomowanieContent } from "@/components/pages/DyplomowanieContent";
import { ogMeta } from "@/lib/og";
import { withPageMessages } from "@/i18n/page-messages";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "diplomaLive" });
  return { title: t("metaTitle"), description: t("metaDesc"), ...ogMeta(t("metaTitle"), t("ogLabel"), { locale, path: "/infopacki/dyplomowanie" }) };
}

async function DyplomowaniePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DyplomowanieContent />;
}

export default withPageMessages("/infopacki/dyplomowanie", DyplomowaniePage);
