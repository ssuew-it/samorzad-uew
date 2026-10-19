import type { CSSProperties } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, ArrowUpRight, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { Link } from "@/i18n/navigation";
import { documents as docManifest, type DocSlot } from "@/lib/documents";
import { formatBytes } from "@/lib/docMeta";
import styles from "./Prawo.module.css";

/**
 * Prawo dla studenta jako HIERARCHIA ŹRÓDEŁ PRAWA, od ogółu do szczegółu.
 *
 * Dusza strony: student zwykle szuka „jakiegoś przepisu" i nie wie, który akt
 * jest ważniejszy. Poziomy I-IV ustawiają je w kolejności mocy, a pasek
 * zasięgu przy każdym poziomie kurczy się - od wszystkich uczelni w Polsce do
 * konkretnej sprawy. Paski rysują się przy przewijaniu (CSS, view()).
 *
 * Każdy akt ma jawne źródło (ISAP, BIP, kopia Samorządu), bo od źródła zależy,
 * czy czytasz wersję obowiązującą. Linki zewnętrzne otwierają się w nowej
 * karcie i mówią o tym także czytnikowi ekranu.
 */

type SourceKey = "isap" | "bip" | "ssuew";

interface Act {
  key: string;
  /** null = nie mamy jeszcze pewnego źródła (wiersz „w przygotowaniu"). */
  source: SourceKey | null;
  slot: DocSlot;
  /** Dodatkowy odnośnik wewnętrzny pod wierszem (np. omówienie w infopacku). */
  explainer?: { href: string; labelKey: string };
}

interface Level {
  key: "act" | "statute" | "regulations" | "executive";
  /** Zasięg jako ułamek szerokości paska. Maleje z każdym poziomem. */
  reach: number;
  acts: Act[];
}

const ISAP_ACT =
  "https://isap.sejm.gov.pl/isap.nsf/download.xsp/WDU20180001668/U/D20181668Lj.pdf";

const levels: Level[] = [
  {
    key: "act",
    reach: 1,
    acts: [{ key: "act", source: "isap", slot: { href: ISAP_ACT, external: true } }],
  },
  {
    key: "statute",
    reach: 0.72,
    acts: [{ key: "statute", source: "bip", slot: docManifest.prawo.statute }],
  },
  {
    key: "regulations",
    reach: 0.46,
    acts: [
      {
        key: "studyReg",
        source: "bip",
        slot: docManifest.prawo.studyReg,
        explainer: { href: "/infopacki/regulamin-studiow", labelKey: "studyRegExplainer" },
      },
      { key: "orgReg", source: "ssuew", slot: docManifest.prawo.orgReg },
    ],
  },
  {
    key: "executive",
    reach: 0.22,
    // Pisma Dziekana wrócą tu, gdy będzie pewne źródło; placeholder
    // „w przygotowaniu” na starcie wyglądał jak niedokończona strona.
    acts: [{ key: "orders", source: "bip", slot: docManifest.prawo.orders }],
  },
];

const ROMAN = ["I", "II", "III", "IV"];
const SOURCES: SourceKey[] = ["isap", "bip", "ssuew"];

/**
 * Grafika hero: cztery szklane stopnie w piramidzie (Higgsfield), czyli te
 * same poziomy I-IV, które strona rozpisuje niżej. Obiekt-symbol, bez ludzi;
 * jasna i ciemna wersja, lekki ruch od przewijania (CSS).
 */
export function PrawoHeroArt() {
  return (
    <div className={styles.art} aria-hidden="true">
      <Image
        src="/photos/prawo/stopnie.webp"
        alt=""
        width={900}
        height={1125}
        priority
        sizes="(max-width: 767px) 80vw, 420px"
        className={styles.artImg}
      />
    </div>
  );
}

export function PrawoContent() {
  const t = useTranslations("prawo");
  const tc = useTranslations("common");
  const locale = useLocale();

  const actRow = (act: Act) => {
    const { slot } = act;
    const href = slot?.href;
    const localFile = Boolean(href && !slot.external);
    const body = (
      <>
        {act.source ? (
          <span className={styles.source} data-source={act.source}>
            {t(`sources.${act.source}.name`)}
          </span>
        ) : (
          <span className={`${styles.source} ${styles.sourceNone}`} aria-hidden="true" />
        )}
        <span className={styles.actBody}>
          <span className={styles.actTitle}>{t(`acts.${act.key}.title`)}</span>
          <span className={styles.actRef}>
            {t(`acts.${act.key}.ref`)}
            {localFile && slot.pages ? ` · ${t("pages", { count: slot.pages })}` : null}
          </span>
        </span>
        {href ? (
          <span className={styles.action}>
            {localFile ? (
              <>
                {t("download")}
                {slot.bytes ? <span className={styles.size}>{formatBytes(slot.bytes, locale)}</span> : null}
                <DownloadSimple size={18} weight="bold" aria-hidden="true" className={styles.actionIcon} />
              </>
            ) : (
              <>
                {t("open")}
                <ArrowUpRight size={18} weight="bold" aria-hidden="true" className={styles.actionIconOut} />
                <span className="sr-only"> ({tc("newTab")})</span>
              </>
            )}
          </span>
        ) : (
          <span className={styles.pending}>{t("pending")}</span>
        )}
      </>
    );

    return (
      <li key={act.key} className={styles.actItem}>
        {href ? (
          <a
            href={href}
            className={styles.act}
            {...(slot.external ? { target: "_blank", rel: "noopener noreferrer" } : { download: true })}
          >
            {body}
          </a>
        ) : (
          <div className={`${styles.act} ${styles.actPending}`}>{body}</div>
        )}
        {act.explainer ? (
          <Link href={act.explainer.href} className={styles.explainer}>
            {t(act.explainer.labelKey)}
            <ArrowRight size={16} weight="bold" aria-hidden="true" />
          </Link>
        ) : null}
      </li>
    );
  };

  return (
    <section className="section-padding" aria-labelledby="prawo-heading">
      <div className="mx-auto max-w-[1200px]">
        <div className={styles.head}>
          <p className={styles.lead}>{t("lead")}</p>
          <div className={styles.legend}>
            <p className={styles.legendTitle}>{t("legendTitle")}</p>
            <dl className={styles.legendList}>
              {SOURCES.map((key) => (
                <div key={key} className={styles.legendItem}>
                  <dt>
                    <span className={styles.source} data-source={key}>
                      {t(`sources.${key}.name`)}
                    </span>
                  </dt>
                  <dd>{t(`sources.${key}.desc`)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <h2 id="prawo-heading" className="sr-only">
          {t("srHeading")}
        </h2>

        <ol className={styles.strata}>
          {levels.map((level, i) => (
            <li
              key={level.key}
              className={styles.stratum}
              style={{ "--reach": level.reach, "--depth": i } as CSSProperties}
            >
              <div className={styles.level}>
                <span className={styles.numeral} aria-hidden="true">
                  {ROMAN[i]}
                </span>
                <div className={styles.levelText}>
                  <p className={styles.levelNo}>{t("levelLabel", { n: i + 1 })}</p>
                  <h3 className={styles.levelName}>{t(`levels.${level.key}.name`)}</h3>
                  <div className={styles.scope}>
                    <span className={styles.scopeTrack} aria-hidden="true">
                      <span className={styles.scopeBar} />
                    </span>
                    <p className={styles.scopeText}>
                      <span className="sr-only">{t("scopeLabel")}: </span>
                      {t(`levels.${level.key}.scope`)}
                    </p>
                  </div>
                </div>
              </div>
              <ul className={styles.acts}>{level.acts.map(actRow)}</ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
