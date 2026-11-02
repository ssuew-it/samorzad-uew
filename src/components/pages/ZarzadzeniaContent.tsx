"use client";

import type { CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, FolderOpen } from "@phosphor-icons/react";
import { TERM } from "@/lib/term";
import { documents as docManifest } from "@/lib/documents";
import type { Zarzadzenie } from "@/lib/zarzadzenia";
import { TypedTitle } from "./TypedTitle";
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
 * Archiwum na prośbę usunięte 1.11.2026 (decyzja Samorządu) - strona pokazuje
 * tylko rejestr bieżącej kadencji. Część zarządzeń ma też PDF po angielsku (plakietka EN).
 */

export function ZarzadzeniaContent({ orders }: { orders: Zarzadzenie[] }) {
  const locale = useLocale() === "en" ? "en" : "pl";
  const dateFmt = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "pl-PL", { day: "numeric", month: "short", year: "numeric" });
  const t = useTranslations("zarzadzenia");
  const tc = useTranslations("common");
  const folder = docManifest.zarzadzenia;
  // Wpisy z zakładki „Zarządzenia” w arkuszu Treści strony. Gdy są, rejestr
  // pokazuje je wiersz po wierszu; folder zostaje drogą do kompletu.
  const hasOrders = orders.length > 0;
  const published = hasOrders || Boolean(folder?.href);

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
                {hasOrders ? t("statusCount", { count: orders.length }) : published ? t("statusLive") : t("statusPending")}
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
                {orders.map((order, i) => (
                  <tr key={order.number} className={styles.orderRow}>
                    <td className={styles.orderNo}>{order.number}</td>
                    <td className={styles.orderDate}>
                      <time dateTime={order.date}>{dateFmt.format(new Date(`${order.date}T12:00:00`))}</time>
                    </td>
                    <td>
                      {/* Najnowsze zarządzenie „wpisuje się” raz, przy pierwszym wyświetleniu. */}
                      {i === 0 ? <TypedTitle text={order.title[locale]} id={order.number} /> : order.title[locale]}
                    </td>
                    <td>
                      {order.href ? (
                        <span className={styles.orderFiles}>
                          <a href={(locale === "en" && order.hrefEn) || order.href} target="_blank" rel="noopener noreferrer" className={styles.orderFile}>
                            {t("openFile")}
                            <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                            <span className="sr-only"> {order.number} ({tc("newTab")})</span>
                          </a>
                          {/* Druga wersja językowa jako plakietka: na /pl angielska, na /en polski oryginał. */}
                          {order.hrefEn ? (
                            <a
                              href={locale === "en" ? order.href : order.hrefEn}
                              target="_blank"
                              rel="noopener noreferrer"
                              lang={locale === "en" ? "pl" : "en"}
                              className={styles.langBadge}
                            >
                              {locale === "en" ? "PL" : "EN"}
                              <span className="sr-only">
                                {" "}
                                {t(locale === "en" ? "otherLangPl" : "otherLangEn", { number: order.number })} ({tc("newTab")})
                              </span>
                            </a>
                          ) : null}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))}
                {(!hasOrders || folder?.href) && (
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
                      </div>
                    )}
                  </td>
                </tr>
                )}
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

    </>
  );
}
