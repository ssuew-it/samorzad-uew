"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { InfopackCoverImage } from "../InfopackCover";
import styles from "./InfopackiContent.module.css";

interface Pack {
  key: string;
  href: string;
  cover: string;
}

const packs: Pack[] = [
  { key: "studyReg", href: "/infopacki/regulamin-studiow", cover: "/photos/infopacki/regulamin-cover.jpg" },
  { key: "usos", href: "/infopacki/usos", cover: "/photos/infopacki/usos-cover.jpg" },
  { key: "semester", href: "/infopacki/zaliczenie-semestru", cover: "/photos/infopacki/semestr-cover.jpg" },
  { key: "deanInfo", href: "/infopacki/sprawy-studenckie", cover: "/photos/infopacki/sprawy-cover.jpg" },
  { key: "applications", href: "/infopacki/podania", cover: "/photos/infopacki/podania-cover.jpg" },
  { key: "library", href: "/infopacki/biblioteka", cover: "/photos/infopacki/biblioteka-cover.jpg" },
  { key: "life", href: "/infopacki/zycie-studenckie", cover: "/photos/infopacki/zycie-cover.jpg" },
  { key: "diploma", href: "/infopacki/dyplomowanie", cover: "/photos/infopacki/dyplomowanie-cover.jpg" },
];

export function InfopackiContent() {
  const t = useTranslations("infopacki");
  // Wierzchnia okładka i ta, która właśnie zeszła w głąb stosu.
  const [shelf, setShelf] = useState({ active: 0, behind: -1 });

  const pull = (index: number) =>
    setShelf((s) => (s.active === index ? s : { active: index, behind: s.active }));

  const activePack = packs[shelf.active];

  return (
    <section className="section-padding" aria-labelledby="infopacki-heading">
      <div className="mx-auto max-w-[1200px]">
        <h2
          id="infopacki-heading"
          className="max-w-[18ch] text-balance font-display text-[clamp(2.1rem,4.5vw,3.75rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-ink-primary"
        >
          {t("libraryHeading")}
        </h2>
        <p className="mt-5 max-w-[68ch] text-pretty text-[1.0625rem] leading-[1.75] text-ink-secondary">
          {t("intro")}
        </p>

        <div className={`${styles.layout} mt-14`}>
          <ol className={styles.list}>
            {packs.map((pack, index) => (
              <li key={pack.key} className={styles.item}>
                <Link
                  href={pack.href}
                  className={`${styles.link} group`}
                  data-active={shelf.active === index}
                  onPointerEnter={() => pull(index)}
                  onFocus={() => pull(index)}
                >
                  <span className={styles.thumb}>
                    <InfopackCoverImage src={pack.cover} sizes="92px" />
                  </span>
                  <span className="min-w-0">
                    <span className={`${styles.question} block`}>{t(`packs.${pack.key}`)}</span>
                    <span className={`${styles.source} block`}>
                      <span className="hidden lg:inline">{t("previewCaption")}: </span>
                      {t(`sources.${pack.key}`)}
                    </span>
                  </span>
                  <ArrowRight size={22} weight="bold" aria-hidden="true" className={styles.arrow} />
                </Link>
              </li>
            ))}
          </ol>

          <div className={styles.shelf} aria-hidden="true">
            <div className={styles.stack}>
              {packs.map((pack, index) => (
                <span
                  key={pack.key}
                  className={styles.cover}
                  data-state={
                    index === shelf.active ? "active" : index === shelf.behind ? "behind" : "idle"
                  }
                >
                  <InfopackCoverImage
                    src={pack.cover}
                    priority={index === 0}
                    sizes="(max-width: 1024px) 1px, 460px"
                  />
                </span>
              ))}
            </div>
            <p className={styles.caption}>
              {t("previewCaption")}
              <span className={`${styles.captionTitle} block`}>{t(`sources.${activePack.key}`)}</span>
            </p>
          </div>
        </div>

        <p className="mt-10 text-[0.9375rem] text-ink-secondary">
          {t("notFoundText")}
          <a
            href="mailto:kontakt@samorzad.ue.wroc.pl"
            className="font-medium text-accent transition-colors hover:text-accent-dim"
          >
            {t("notFoundLink")}
          </a>
          .
        </p>
      </div>
    </section>
  );
}
