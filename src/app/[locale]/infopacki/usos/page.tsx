import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { UsosContent } from "@/components/pages/UsosContent";
import { ogMeta } from "@/lib/og";
import { withPageMessages } from "@/i18n/page-messages";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "usosLive" });
  return { title: t("metaTitle"), description: t("metaDesc"), ...ogMeta(t("metaTitle"), t("ogLabel"), { locale, path: "/infopacki/usos" }) };
}

async function UsosPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <UsosContent />;
}

export default withPageMessages("/infopacki/usos", UsosPage);
