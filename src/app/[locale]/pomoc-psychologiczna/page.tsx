import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PomocPsychologicznaContent } from "@/components/pages/PomocPsychologicznaContent";
import { ogMeta } from "@/lib/og";
import { withPageMessages } from "@/i18n/page-messages";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pomoc" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    ...ogMeta(t("metaTitle"), t("ogLabel"), { locale, path: "/pomoc-psychologiczna" }),
  };
}

async function PomocPsychologicznaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PomocPsychologicznaContent />;
}

export default withPageMessages("/pomoc-psychologiczna", PomocPsychologicznaPage);
