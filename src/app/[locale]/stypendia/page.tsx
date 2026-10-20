import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HubNav } from "@/components/HubNav";
import { StypendiaContent } from "@/components/pages/StypendiaContent";
import { StypendiaHero } from "@/components/pages/StypendiaHero";
import { StypendiumDetailContent, type DetailNote } from "@/components/pages/StypendiumDetailContent";
import { WsparcieContent } from "@/components/pages/WsparcieContent";
import { KalkulatorSredniejContent } from "@/components/pages/KalkulatorSredniejContent";
import { KalkulatorZwijany } from "@/components/pages/KalkulatorZwijany";
import { ProcesWniosku } from "@/components/pages/ProcesWniosku";
import { MiernikProgu } from "@/components/pages/MiernikProgu";
import { VideoEmbed } from "@/components/VideoEmbed";
import { Faq, type QA } from "@/components/Faq";
import { videos } from "@/lib/videos";
import { WFS_BIP_PAGE, WFS_REGULAMIN_PDF } from "@/lib/stypendia-dokumenty";
import { ogMeta } from "@/lib/og";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "stypendia" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    ...ogMeta(t("metaTitle"), t("ogLabel")),
  };
}

const FAQ_KEYS = ["where", "when", "multiple", "firstTime", "diff"] as const;

export default async function StypendiaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "stypendia" });
  const tr = await getTranslations({ locale, namespace: "stypRektora" });
  const ts = await getTranslations({ locale, namespace: "stypSocjalne" });
  const tn = await getTranslations({ locale, namespace: "stypNiepelnosprawni" });
  const tz = await getTranslations({ locale, namespace: "zapomoga" });
  const tf = await getTranslations({ locale, namespace: "stypFundusz" });

  const faq: QA[] = FAQ_KEYS.map((k) => ({ q: t(`faq.${k}.q`), a: t(`faq.${k}.a`) }));

  const video = videos["stypendia-wniosek"];

  const navItems = [
    { id: "przeglad", label: t("hub.przeglad") },
    { id: "jak-zlozyc", label: t("hub.proces") },
    { id: "rektora", label: t("hub.rektora") },
    { id: "fundusz", label: t("hub.fundusz") },
    { id: "socjalne", label: t("hub.socjalne") },
    { id: "niepelnosprawni", label: t("hub.niepelnosprawni") },
    { id: "zapomoga", label: t("hub.zapomoga") },
    { id: "wsparcie", label: t("hub.wsparcie") },
    ...(video ? [{ id: "wideo", label: t("hub.wideo") }] : []),
    { id: "faq", label: t("hub.faq") },
  ];

  return (
    <>
      <StypendiaHero />

      <HubNav items={navItems} label={t("hub.nav")} />

      <div id="przeglad" className="scroll-mt-24">
        <StypendiaContent />
      </div>

      {/* Wspólny proces wniosku - raz, zamiast przy każdym świadczeniu. */}
      <ProcesWniosku />

      <StypendiumDetailContent
        sectionId="rektora"
        eyebrow={tr("eyebrow")}
        heading={tr("heading")}
        intro={tr("intro")}
        notes={tr.raw("notes") as DetailNote[]}
      />

      <KalkulatorZwijany>
        <KalkulatorSredniejContent />
      </KalkulatorZwijany>

      {/* Własny Fundusz Stypendialny ma osobny regulamin i osobną drogę
          wniosku (e-mail z uczelnianej skrzynki, nie USOSweb), więc dostaje
          własne kroki zamiast odesłania do wspólnego procesu. */}
      <StypendiumDetailContent
        sectionId="fundusz"
        eyebrow={tf("eyebrow")}
        heading={tf("heading")}
        intro={tf("intro")}
        steps={tf.raw("steps") as DetailNote[]}
        notes={tf.raw("notes") as DetailNote[]}
        regulaminHref={WFS_REGULAMIN_PDF}
        regulaminLabel={tf("regulaminButton")}
        extraLinks={[{ label: tf("bipLink"), href: WFS_BIP_PAGE }]}
      />

      <StypendiumDetailContent
        sectionId="socjalne"
        eyebrow={ts("eyebrow")}
        heading={ts("heading")}
        intro={ts("intro")}
        notes={ts.raw("notes") as DetailNote[]}
      >
        <div id="miernik-progu" className="scroll-mt-24">
          <MiernikProgu />
        </div>
      </StypendiumDetailContent>

      <StypendiumDetailContent
        sectionId="niepelnosprawni"
        eyebrow={tn("eyebrow")}
        heading={tn("heading")}
        intro={tn("intro")}
        notes={tn.raw("notes") as DetailNote[]}
        extraLinks={[
          {
            label: tn("extraLink"),
            href: "https://www.ue.wroc.pl/studenci/9745/biuro_ds_osob_z_niepelnosprawnosciami.html",
          },
        ]}
      />

      <StypendiumDetailContent
        sectionId="zapomoga"
        eyebrow={tz("eyebrow")}
        heading={tz("heading")}
        intro={tz("intro")}
        notes={tz.raw("notes") as DetailNote[]}
      />

      <div id="wsparcie" className="scroll-mt-24">
        <WsparcieContent />
      </div>

      {video && (
        <section id="wideo" className="section-padding scroll-mt-24" aria-labelledby="wideo-heading">
          <div className="mx-auto max-w-[1200px]">
            <h2 id="wideo-heading" className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold tracking-[-0.02em] text-ink-primary">
              {t("hub.wideoHeading")}
            </h2>
            <div className="mt-8 max-w-[800px]">
              <VideoEmbed youtubeId={video.youtubeId} title={t(video.titleKey)} />
            </div>
          </div>
        </section>
      )}

      <div id="faq" className="scroll-mt-24">
        <Faq items={faq} heading={t("faqHeading")} />
      </div>
    </>
  );
}
