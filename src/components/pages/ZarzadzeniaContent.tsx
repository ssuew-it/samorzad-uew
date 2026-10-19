"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight, Check, Copy, EnvelopeSimple, FolderOpen } from "@phosphor-icons/react";
import { TERM } from "@/lib/term";
import { chair } from "@/lib/people";
import { documents as docManifest } from "@/lib/documents";
import styles from "./Zarzadzenia.module.css";

/**
 * Zarządzenia Przewodniczącego jako REJESTR, który czeka na pierwszy wpis.
 *
 * Dusza strony: folder bieżącej kadencji jest jeszcze pusty i strona mówi to
 * wprost - pokazuje pustą księgę z nagłówkami kolumn i kursorem w pierwszym
 * wierszu, zamiast szarej plakietki „Wkrótce". Linie księgi rysują się przy
 * przewijaniu, kursor mignie kilka razy i zastyga (WCAG 2.2.2: nic nie miga
 * dłużej niż 5 s). Gdy w `documents.ts` pojawi się link do folderu, ten sam
 * rejestr zmienia stan na „Opublikowany" i prowadzi do folderu.
 *
 * Druga połowa to droga do archiwum. Regulamin daje każdemu studentowi prawo
 * do informacji bez podawania powodu (§ 76) i 14 dni na odpowiedź (§ 77), a
 * wniosek składa się na ręce przewodniczącego organu - stąd gotowy wzór
 * wiadomości do Przewodniczącego, do wysłania albo skopiowania (webmail często
 * nie obsługuje linków mailto).
 */

/** Gdyby w people.ts zabrakło adresu, wniosek idzie na ogólną skrzynkę. */
const FALLBACK_EMAIL = "kontakt@samorzad.ue.wroc.pl";

type CopyState = "idle" | "copied" | "failed";

export function ZarzadzeniaContent() {
  const t = useTranslations("zarzadzenia");
  const tc = useTranslations("common");
  const folder = docManifest.zarzadzenia;
  const published = Boolean(folder?.href);

  const to = chair.email ?? FALLBACK_EMAIL;
  const subject = t("archive.subject");
  const message = t("archive.message");
  const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

  const [copy, setCopy] = useState<CopyState>("idle");
  const resetRef = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(resetRef.current), []);

  const copyMessage = async () => {
    window.clearTimeout(resetRef.current);
    try {
      await navigator.clipboard.writeText(message);
      setCopy("copied");
    } catch {
      setCopy("failed");
    }
    resetRef.current = window.setTimeout(() => setCopy("idle"), 2400);
  };

  // Wiersze wzoru: te kończące się dwukropkiem dostają puste pole do
  // uzupełnienia - wzór wygląda jak formularz, który student wypełnia.
  const lines = message.replace(/\n+$/, "").split("\n");

  return (
    <>
      <section className="section-padding" aria-labelledby="zarz-register-heading">
        <div className="mx-auto max-w-[1200px]">
          <p className={styles.lead}>{t("lead")}</p>

          <div className={styles.ledger} data-state={published ? "live" : "pending"}>
            <div className={styles.ledgerHead}>
              <div>
                <h2 id="zarz-register-heading" className={styles.ledgerTitle}>
                  {t("registerTitle")}
                </h2>
                <p className={styles.ledgerTerm}>{t("registerTerm", { term: TERM })}</p>
              </div>
              <p className={styles.status}>
                <span className={styles.statusDot} aria-hidden="true" />
                {published ? t("statusLive") : t("statusPending")}
              </p>
            </div>

            <table className={styles.table}>
              <caption className="sr-only">{t("caption", { term: TERM })}</caption>
              <colgroup>
                <col className={styles.colNo} />
                <col className={styles.colDate} />
                <col />
                <col className={styles.colFile} />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">{t("cols.no")}</th>
                  <th scope="col">{t("cols.date")}</th>
                  <th scope="col">{t("cols.subject")}</th>
                  <th scope="col">{t("cols.file")}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className={styles.emptyCell}>
                    {published ? (
                      <div className={styles.live}>
                        <p className={styles.emptyBody}>{t("liveBody", { term: TERM })}</p>
                        <a
                          href={folder.href}
                          {...(folder.external
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : { download: true })}
                          className={styles.primary}
                        >
                          <FolderOpen size={20} weight="regular" aria-hidden="true" />
                          {t("openButton")}
                          {folder.external ? (
                            <>
                              <ArrowUpRight size={16} weight="bold" aria-hidden="true" />
                              <span className="sr-only"> ({tc("newTab")})</span>
                            </>
                          ) : null}
                        </a>
                      </div>
                    ) : (
                      <div className={styles.empty}>
                        <p className={styles.emptyTitle}>
                          <span className={styles.caret} aria-hidden="true" />
                          {t("emptyTitle", { term: TERM })}
                        </p>
                        <p className={styles.emptyBody}>{t("emptyBody")}</p>
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Puste, zliniowane wiersze księgi - czysto graficzne. Te same
                proporcje kolumn co tabela, więc linie podziału trafiają w
                nagłówki. */}
            {!published ? (
              <div className={styles.ruled} aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={styles.ruledRow} style={{ "--i": i } as CSSProperties}>
                    <span />
                    <span />
                    <span />
                    <span />
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section
        className={`section-padding ${styles.archiveSection}`}
        aria-labelledby="zarz-archive-heading"
      >
        <div className={`mx-auto max-w-[1200px] ${styles.archive}`}>
          <div>
            <h2 id="zarz-archive-heading" className={styles.archiveHeading}>
              {t("archive.heading")}
            </h2>
            <p className={styles.archiveBody}>{t("archive.body")}</p>
            <div className={styles.actions}>
              <a href={mailto} className={styles.primary}>
                <EnvelopeSimple size={20} weight="regular" aria-hidden="true" />
                {t("archive.write")}
              </a>
              <button type="button" onClick={copyMessage} className={styles.secondary}>
                <span className={styles.copyIcon} data-state={copy} aria-hidden="true">
                  {copy === "copied" ? <Check size={18} weight="bold" /> : <Copy size={18} weight="regular" />}
                </span>
                {t("archive.copy")}
              </button>
            </div>
            <p className={styles.copyStatus} role="status" aria-live="polite">
              {copy === "copied" ? t("archive.copied") : copy === "failed" ? t("archive.copyFailed") : ""}
            </p>
          </div>

          <figure className={styles.letter} aria-labelledby="zarz-letter-label">
            <figcaption id="zarz-letter-label" className={styles.letterLabel}>
              {t("archive.letterLabel")}
            </figcaption>
            <dl className={styles.letterHead}>
              <div>
                <dt>{t("archive.to")}</dt>
                <dd>{to}</dd>
              </div>
              <div>
                <dt>{t("archive.subjectLabel")}</dt>
                <dd>{subject}</dd>
              </div>
            </dl>
            <div className={styles.letterBody}>
              {lines.map((line, i) =>
                line.trim() === "" ? (
                  <span key={i} className={styles.letterGap} aria-hidden="true" />
                ) : /:\s*$/.test(line) ? (
                  <p key={i} className={styles.letterField}>
                    {line.trim()}
                    <span className={styles.blank} aria-hidden="true" />
                  </p>
                ) : (
                  <p key={i}>{line}</p>
                ),
              )}
            </div>
            <p className={styles.letterHint}>{t("archive.hint")}</p>
          </figure>
        </div>
      </section>
    </>
  );
}
