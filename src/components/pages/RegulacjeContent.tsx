import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { ArrowUpRight, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { documents as docManifest, type DocSlot } from "@/lib/documents";
import { formatActDateLong, formatBytes } from "@/lib/docMeta";
import styles from "./Regulacje.module.css";

/**
 * Regulacje wewnętrzne jako DRZEWO AKTÓW, nie lista plików.
 *
 * Dusza strony: tu ważne jest nie tylko „co pobrać", ale „co z czego wynika".
 * Regulamin Samorządu jest aktem nadrzędnym; załączniki 1 i 2 przyjęto tą samą
 * uchwałą, a regulaminy organów uchwala RUSS na jego podstawie (§ 12 ust. 2
 * pkt 6). Linie drzewa rysują się przy przewijaniu, a najechanie na akt
 * podświetla jego drogę do aktu nadrzędnego. Księga znaku nie jest aktem
 * prawnym, więc stoi poza drzewem - inaczej sugerowalibyśmy hierarchię,
 * której nie ma.
 *
 * Każdy akt można OTWORZYĆ (PDF w nowej karcie - cały wiersz jest linkiem)
 * albo POBRAĆ (osobny przycisk). Najechanie na okładkę pokazuje podgląd
 * pierwszej strony.
 *
 * Komponent serwerowy: nic tu nie wymaga JavaScriptu w przeglądarce, a ruch
 * robi CSS (animation-timeline: view()).
 */

type ActKey = "government" | "russ" | "electoral" | "ros" | "residents" | "visual";

const annexes: ActKey[] = ["russ", "electoral"];
const bodies: ActKey[] = ["ros", "residents"];

/**
 * Okładka aktu: pierwsza strona PDF-a (public/dokumenty/okladki, wyrenderowane
 * 1.11.2026). Grubość stosu kartek pod nią rośnie z liczbą stron, więc od razu
 * widać, który akt jest obszerny. Przy podmianie PDF-a wyrenderuj okładkę na nowo.
 */
/** Numer uchwały bez łamania na łączniku („45/2024-” | „25”): łącznik między znakami WORD JOINER. */
const unbreakable = (n: string) => n.replace(/-/g, "\u2060-\u2060");

const depth = (pages?: number) => (!pages ? 1 : pages >= 30 ? 3 : pages >= 10 ? 2 : 1);

/**
 * Okładka z podglądem. Gdy akt ma plik, okładka jest osobnym linkiem do PDF-a
 * (poza kolejnością tabulacji - ten sam cel ma tytuł wiersza), położonym nad
 * linkiem całego wiersza: dzięki temu można na nią najechać i zobaczyć
 * powiększoną pierwszą stronę.
 */
function Sheet({ actKey, pages, large, href }: { actKey: ActKey; pages?: number; large?: boolean; href?: string }) {
  const src = `/dokumenty/okladki/${actKey}.webp`;
  const fit = actKey === "visual" ? "object-contain" : "object-cover object-top";
  const sheet = (
    <>
      <Image src={src} alt="" fill sizes={large ? "120px" : "56px"} className={fit} />
      {href ? (
        <span className={`${styles.preview} ${actKey === "visual" ? styles.previewWide : ""}`}>
          <Image src={src} alt="" fill sizes="280px" className="object-contain" />
        </span>
      ) : null}
    </>
  );
  const cls = `${styles.sheet} ${large ? styles.sheetLarge : ""}`;
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true" className={cls} data-depth={depth(pages)}>
      {sheet}
    </a>
  ) : (
    <span className={cls} data-depth={depth(pages)} aria-hidden="true">
      {sheet}
    </span>
  );
}

export function RegulacjeContent() {
  const t = useTranslations("regulacje");
  const tc = useTranslations("common");
  const locale = useLocale();
  const docs = docManifest.regulacje;
  const root = docs.government;

  /** Metryczka aktu: uchwała, data i liczba stron - wyłącznie z manifestu. */
  const metaLine = (slot: DocSlot, prefix?: string) => {
    const parts: string[] = prefix ? [prefix] : [];
    if (slot.adopted) {
      const date = formatActDateLong(slot.adopted, locale);
      parts.push(
        slot.resolution
          ? t("resolution", { number: unbreakable(slot.resolution), date })
          : t("resolutionDateOnly", { date }),
      );
    }
    if (slot.pages) parts.push(t("pages", { count: slot.pages }));
    return parts.join(" · ");
  };

  const row = (key: ActKey, ref?: string) => {
    const slot = docs[key] ?? {};
    const title = t(`acts.${key}.title`);
    const meta = metaLine(slot);
    return (
      <div className={`${styles.row} ${ref ? styles.rowWithRef : ""} ${slot.href ? styles.rowLive : ""}`}>
        {ref ? <span className={styles.ref}>{ref}</span> : null}
        <Sheet actKey={key} pages={slot.pages} href={slot.href} />
        <span className={styles.rowBody}>
          {slot.href ? (
            <a href={slot.href} target="_blank" rel="noopener noreferrer" className={`${styles.rowTitle} ${styles.rowOpen}`}>
              {title}
              <span className="sr-only">, {t("openSr")}</span>
            </a>
          ) : (
            <span className={styles.rowTitle}>{title}</span>
          )}
          <span className={styles.rowDesc}>{t(`acts.${key}.desc`)}</span>
          {meta ? <span className={styles.rowMeta}>{meta}</span> : null}
        </span>
        {slot.href ? (
          <span className={styles.actions}>
            <span className={styles.file}>
              <span className={styles.fileType}>PDF</span>
              {slot.bytes ? <span className={styles.fileSize}>{formatBytes(slot.bytes, locale)}</span> : null}
            </span>
            <span className={styles.openHint} aria-hidden="true">
              {t("open")}
              <ArrowUpRight size={14} weight="bold" />
            </span>
            <a href={slot.href} download className={styles.download} aria-label={t("downloadAria", { title })} title={t("download")}>
              <DownloadSimple size={18} weight="regular" aria-hidden="true" />
            </a>
          </span>
        ) : (
          <span className={styles.soon}>{tc("comingSoon")}</span>
        )}
      </div>
    );
  };

  return (
    <section className="section-padding" aria-labelledby="regulacje-heading">
      <div className="mx-auto max-w-[1200px]">
        <p className={styles.lead}>{t("lead")}</p>

        <h2 id="regulacje-heading" className="sr-only">
          {t("srHeading")}
        </h2>

        <div className={styles.tree}>
          {/* Akt nadrzędny - „okładka" drzewa. Z jego lewej krawędzi wychodzi pień. */}
          <article className={styles.root} aria-labelledby="regulacje-root-title">
            <span className={styles.rootCover}>
              <Sheet actKey="government" pages={root?.pages} href={root?.href} large />
              <span className={styles.rootMark} aria-hidden="true">
                §
              </span>
            </span>
            <div className={styles.rootBody}>
              <p className={styles.kicker}>{t("rootKicker")}</p>
              <h3 id="regulacje-root-title" className={styles.rootTitle}>
                {t("acts.government.title")}
              </h3>
              <p className={styles.rootDesc}>{t("acts.government.desc")}</p>
              {metaLine(root, t("consolidated")) ? <p className={styles.rootMeta}>{metaLine(root, t("consolidated"))}</p> : null}
            </div>
            {root?.href ? (
              <div className={styles.rootActions}>
                <a href={root.href} target="_blank" rel="noopener noreferrer" className={styles.rootOpen}>
                  {t("openPdf")}
                  <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
                  <span className="sr-only">: {t("acts.government.title")}, {tc("newTab")}</span>
                </a>
                <a href={root.href} download className={styles.rootDownload}>
                  <DownloadSimple size={18} weight="bold" aria-hidden="true" />
                  {t("download")}
                  {root.bytes ? <span className={styles.rootSize}>{formatBytes(root.bytes, locale)}</span> : null}
                  <span className="sr-only">: {t("acts.government.title")}</span>
                </a>
              </div>
            ) : (
              <span className={styles.soon}>{tc("comingSoon")}</span>
            )}
          </article>

          <ul className={styles.groups}>
            <li className={styles.group}>
              <h4 id="regulacje-annexes" className={styles.groupLabel}>
                {t("groups.annexes")}
              </h4>
              <ol className={styles.nodes} aria-labelledby="regulacje-annexes">
                {annexes.map((key) => (
                  <li key={key} className={styles.node}>
                    {row(key, t(`acts.${key}.ref`))}
                  </li>
                ))}
              </ol>
            </li>
            <li className={styles.group}>
              <h4 id="regulacje-bodies" className={styles.groupLabel}>
                {t("groups.bodies")}
              </h4>
              <p className={styles.groupNote}>{t("groups.bodiesNote")}</p>
              <ul className={styles.nodes} aria-labelledby="regulacje-bodies">
                {bodies.map((key) => (
                  <li key={key} className={styles.node}>
                    {row(key)}
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </div>

        <div className={styles.outside}>
          <h3 className={styles.outsideLabel}>{t("groups.outside")}</h3>
          {row("visual")}
        </div>
      </div>
    </section>
  );
}
