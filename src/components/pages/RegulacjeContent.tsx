import { useLocale, useTranslations } from "next-intl";
import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { documents as docManifest, type DocSlot } from "@/lib/documents";
import { formatActDate, formatBytes } from "@/lib/docMeta";
import styles from "./Regulacje.module.css";

/**
 * Regulacje wewnętrzne jako DRZEWO AKTÓW, nie lista plików.
 *
 * Dusza strony: tu ważne jest nie tylko „co pobrać", ale „co z czego wynika".
 * Regulamin Samorządu jest aktem nadrzędnym; załączniki 1 i 2 przyjęto tą samą
 * uchwałą, a regulaminy organów uchwala RUSS na jego podstawie (§ 12 ust. 2
 * pkt 6). Linie drzewa rysują się przy przewijaniu, a najechanie na akt
 * podświetla jego drogę do aktu nadrzędnego. Księga znaku nie jest aktem
 * prawnym, więc stoi poza drzewem — inaczej sugerowalibyśmy hierarchię,
 * której nie ma.
 *
 * Komponent serwerowy: nic tu nie wymaga JavaScriptu w przeglądarce, a ruch
 * robi CSS (animation-timeline: view()).
 */

type ActKey = "government" | "russ" | "electoral" | "ros" | "residents" | "visual";

const annexes: ActKey[] = ["russ", "electoral"];
const bodies: ActKey[] = ["ros", "residents"];

export function RegulacjeContent() {
  const t = useTranslations("regulacje");
  const tc = useTranslations("common");
  const locale = useLocale();
  const docs = docManifest.regulacje;
  const root = docs.government;

  /** Metryczka aktu: uchwała, data i liczba stron — wyłącznie z manifestu. */
  const metaLine = (slot: DocSlot) => {
    const parts: string[] = [];
    if (slot.adopted) {
      const date = formatActDate(slot.adopted, locale);
      parts.push(
        slot.resolution
          ? t("resolution", { number: slot.resolution, date })
          : t("resolutionDateOnly", { date }),
      );
    }
    if (slot.pages) parts.push(t("pages", { count: slot.pages }));
    return parts.join(" · ");
  };

  const fileChip = (slot: DocSlot) =>
    slot.href ? (
      <span className={styles.file}>
        <span className={styles.fileType}>PDF</span>
        {slot.bytes ? <span className={styles.fileSize}>{formatBytes(slot.bytes, locale)}</span> : null}
        <DownloadSimple size={18} weight="regular" aria-hidden="true" className={styles.fileIcon} />
        <span className="sr-only">, {t("downloadSr")}</span>
      </span>
    ) : (
      <span className={styles.soon}>{tc("comingSoon")}</span>
    );

  const row = (key: ActKey, ref?: string) => {
    const slot = docs[key] ?? {};
    const inner = (
      <>
        {ref ? <span className={styles.ref}>{ref}</span> : null}
        <span className={styles.rowBody}>
          <span className={styles.rowTitle}>{t(`acts.${key}.title`)}</span>
          <span className={styles.rowDesc}>{t(`acts.${key}.desc`)}</span>
          {metaLine(slot) ? <span className={styles.rowMeta}>{metaLine(slot)}</span> : null}
        </span>
        {fileChip(slot)}
      </>
    );
    const cls = `${styles.row} ${ref ? styles.rowWithRef : ""}`;
    return slot.href ? (
      <a href={slot.href} download className={cls}>
        {inner}
      </a>
    ) : (
      <div className={cls}>{inner}</div>
    );
  };

  return (
    <section className="section-padding" aria-labelledby="regulacje-heading">
      <div className="mx-auto max-w-[1200px]">
        <div className={styles.head}>
          <p className={styles.lead}>{t("lead")}</p>
          {root?.resolution && root.adopted ? (
            <dl className={styles.state}>
              <dt>{t("stateLabel")}</dt>
              <dd>
                {t("stateValue", {
                  number: root.resolution,
                  date: formatActDate(root.adopted, locale),
                })}
              </dd>
            </dl>
          ) : null}
        </div>

        <h2 id="regulacje-heading" className="sr-only">
          {t("srHeading")}
        </h2>

        <div className={styles.tree}>
          {/* Akt nadrzędny — „okładka" drzewa. Z jego lewej krawędzi wychodzi pień. */}
          <article className={styles.root} aria-labelledby="regulacje-root-title">
            <span className={styles.rootMark} aria-hidden="true">
              §
            </span>
            <div className={styles.rootBody}>
              <p className={styles.kicker}>{t("rootKicker")}</p>
              <h3 id="regulacje-root-title" className={styles.rootTitle}>
                {t("acts.government.title")}
              </h3>
              <p className={styles.rootDesc}>{t("acts.government.desc")}</p>
              {metaLine(root) ? <p className={styles.rootMeta}>{metaLine(root)}</p> : null}
            </div>
            {root?.href ? (
              <a href={root.href} download className={styles.rootDownload}>
                <DownloadSimple size={20} weight="bold" aria-hidden="true" />
                {t("download")}
                {root.bytes ? <span className={styles.rootSize}>{formatBytes(root.bytes, locale)}</span> : null}
                <span className="sr-only">, {t("acts.government.title")}</span>
              </a>
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
