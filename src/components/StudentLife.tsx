"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "@phosphor-icons/react";
import { TextParallaxContent } from "./TextParallax";
import { studentLifePhotos } from "@/lib/photos";

interface PanelCopy {
  lead: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}

function PanelBody({ lead, body, ctaLabel, ctaHref }: PanelCopy) {
  return (
    <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 px-6 pb-20 pt-12 md:grid-cols-12">
      <h3 className="col-span-1 font-display text-[clamp(1.5rem,2.6vw,2.25rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink-primary md:col-span-4">
        {lead}
      </h3>
      <div className="col-span-1 md:col-span-8">
        <p className="text-[1.0625rem] leading-[1.75] text-ink-secondary md:text-[1.25rem]">
          {body}
        </p>
        <Link
          href={ctaHref}
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-lg bg-accent px-7 text-base font-medium text-bg-base transition-[background-color,transform] duration-150 ease-out hover:bg-accent-dim active:scale-[0.97]"
        >
          {ctaLabel}
          <ArrowUpRight size={20} weight="regular" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

export function StudentLife() {
  const t = useTranslations("studentlife");
  const ta = useTranslations("ui.aria");

  return (
    <section aria-label={ta("life")}>
      <TextParallaxContent
        imgUrl={studentLifePhotos.integracja}
        subheading={t("p1.subheading")}
        heading={t("p1.heading")}
        caption={t("p1.caption")}
      >
        <PanelBody
          lead={t("p1.lead")}
          body={t("p1.body")}
          ctaLabel={t("p1.cta")}
          ctaHref="/nasze-projekty"
        />
      </TextParallaxContent>

      <TextParallaxContent
        imgUrl={studentLifePhotos.wsparcie}
        subheading={t("p2.subheading")}
        heading={t("p2.heading")}
        caption={t("p2.caption")}
      >
        <PanelBody
          lead={t("p2.lead")}
          body={t("p2.body")}
          ctaLabel={t("p2.cta")}
          ctaHref="/dla-studenta"
        />
      </TextParallaxContent>
    </section>
  );
}
