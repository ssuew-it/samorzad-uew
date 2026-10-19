"use client";

import { useState } from "react";
import { useLocale, createTranslator } from "next-intl";
import { Link } from "@/i18n/navigation";
import { financialReports, financialReportBip, reportTotals, type FinancialReport as Report } from "@/lib/financial-reports";
import { FinancialReportTables } from "./FinancialReportTables";
import reportMessages from "@/lib/financial-report-messages.json";
import styles from "./FinancialReport.module.css";

export function FinancialReport({ reports = financialReports }: { reports?: Report[] }) {
  const language = useLocale() === "en" ? "en" : "pl";
  const t = createTranslator({ locale: language, messages: reportMessages[language] });
  const locale = language === "pl" ? "pl-PL" : "en-GB";
  const [selected, setSelected] = useState(reports[0]?.id ?? "");
  const report = reports.find((item) => item.id === selected) ?? reports[0];
  const money = (grosze: number) => new Intl.NumberFormat(locale, { style: "currency", currency: "PLN" }).format(grosze / 100);
  const date = (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
  const totals = report ? reportTotals(report) : null;

  return (
    <section id="sprawozdanie-finansowe" className={styles.section} aria-labelledby="financial-report-heading">
      <div className={styles.inner}>
        <h2 id="financial-report-heading">{t("heading")}</h2>
        <p className={styles.lead}>{t("lead")}</p>
        {!report || !totals ? (
          <div className={styles.empty}>
            <p className={styles.status}>{t("unpublished")}</p>
            <h3>{t("emptyTitle")}</h3>
            <p>{t("emptyBody")}</p>
            <Link href="/kontakt">{t("contact")} <span aria-hidden="true">↗</span></Link>
          </div>
        ) : (
          <>
            <div className={styles.toolbar}>
              <label>{t("period")}
                <select value={report.id} onChange={(event) => { setSelected(event.target.value); }}>
                  {reports.map((item) => <option key={item.id} value={item.id}>{date(item.from)} - {date(item.to)}</option>)}
                </select>
              </label>
              <div><p>{t("verified", { date: date(report.verifiedAt) })}</p><a href={report.source.href}>{report.source.label} ↗</a><br /><a href={financialReportBip}>{t("bipArchive")} ↗</a></div>
            </div>
            <dl className={styles.totals}>
              {([ ["allocated", totals.allocated], ["expense", totals.expense], ["remainder", totals.remainder] ] as const).map(([key, value]) => (
                <div key={key}><dt>{t(key)}</dt><dd>{money(value)}</dd></div>
              ))}
            </dl>
            <p className={styles.note}>{t("balanceNote")}</p>
            <FinancialReportTables key={report.id} report={report} />
          </>
        )}
      </div>
    </section>
  );
}
