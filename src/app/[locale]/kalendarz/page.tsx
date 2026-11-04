import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { KalendarzContent } from "@/components/pages/KalendarzContent";
import { TerminyRoku } from "@/components/TerminyRoku";
import { PlanZajecSection } from "@/components/PlanZajecSection";
import { getTerminyData, getWydarzeniaData } from "@/lib/tresci";
import type { SheetEvent } from "@/lib/tresci/parse-wydarzenia";
import { ogMeta, pageUrl, SITE_URL } from "@/lib/og";
import { withPageMessages } from "@/i18n/page-messages";

type Props = { params: Promise<{ locale: string }> };

/**
 * Dane dla Google o nadchodzących wydarzeniach (wynik z datą i miejscem).
 * Google wymaga miejsca, więc wydarzenie bez kolumny „miejsce” pomijamy,
 * zamiast zgadywać adres.
 */
/** „+01:00” zimą, „+02:00” latem - przesunięcie czasu w Polsce danego dnia. */
function warsawOffset(date: string): string {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Warsaw", timeZoneName: "longOffset" })
    .formatToParts(new Date(`${date}T12:00:00Z`))
    .find((p) => p.type === "timeZoneName")?.value;
  return name?.replace("GMT", "") || "+01:00";
}

function eventsLd(events: SheetEvent[], locale: string) {
  const today = new Date().toISOString().slice(0, 10);
  return events
    .filter((e) => e.date >= today && e.place)
    .slice(0, 20)
    .map((e) => ({
      "@context": "https://schema.org",
      "@type": "Event",
      name: (locale === "en" && e.nameEn) || e.name,
      startDate: e.time ? `${e.date}T${e.time}:00${warsawOffset(e.date)}` : e.date,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: { "@type": "Place", name: e.place, address: { "@type": "PostalAddress", addressLocality: "Wrocław", addressCountry: "PL" } },
      organizer: { "@type": "Organization", name: "Samorząd Studentów Uniwersytetu Ekonomicznego we Wrocławiu", url: SITE_URL },
      url: e.href ?? pageUrl(locale, "/kalendarz"),
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "kalendarz" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    ...ogMeta(t("metaTitle"), t("ogLabel"), { locale, path: "/kalendarz" }),
  };
}

async function KalendarzPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "kalendarz" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const [{ data: terminy }, { items: wydarzenia }] = await Promise.all([getTerminyData(), getWydarzeniaData()]);
  const ld = eventsLd(wydarzenia, locale);

  return (
    <>
      {ld.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      )}
      <PageHero
        photo={{ src: "/photos/hero/tedx_1.webp", alt: t("heroPhotoAlt") }}
        title={t("heroTitle")}
        lead={t("heroLead")}
        breadcrumbs={[
          { label: tc("home"), href: "/" },
          { label: t("heroTitle") },
        ]}
      />
      {/* Terminy przed wydarzeniami: po to student tu wchodzi. */}
      <TerminyRoku data={terminy} />
      <PlanZajecSection />
      <KalendarzContent />
    </>
  );
}

export default withPageMessages("/kalendarz", KalendarzPage);
