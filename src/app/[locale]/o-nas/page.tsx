import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ONasContent } from "@/components/pages/ONasContent";
import { ogMeta } from "@/lib/og";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "oNas" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    ...ogMeta(t("metaTitle"), t("ogLabel")),
  };
}

/**
 * „O nas” — jedna strona o Samorządzie zamiast dwóch.
 *
 * Wcześniej „O nas” i „Nasza działalność” w menu prowadziły pod ten sam adres,
 * a „Struktura Samorządu” była osobną stroną z samym schematem. Ta strona
 * zbiera wszystko, czego szuka ktoś, kto pyta „czym jest Samorząd”: kim
 * jesteśmy, co robimy, jak jesteśmy zbudowani, kto nas teraz prowadzi i gdzie
 * są nasze dokumenty. Stare adresy przekierowuje `next.config.ts`.
 */
export default async function ONasPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ONasContent />;
}
