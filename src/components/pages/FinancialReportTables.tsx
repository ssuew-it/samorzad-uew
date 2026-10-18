"use client";

import { useState } from "react";
import { useLocale, createTranslator } from "next-intl";
import { financialReportDetails, type FinancialReport } from "@/lib/financial-reports";
import reportMessages from "@/lib/financial-report-messages.json";
import styles from "./FinancialReport.module.css";

export function FinancialReportTables({ report }: { report: FinancialReport }) {
  const language = useLocale() === "en" ? "en" : "pl";
  const locale = language === "en" ? "en-GB" : "pl-PL";
  const t = createTranslator({ locale: language, messages: reportMessages[language].detail });
  const [view, setView] = useState<"execution" | "comparison" | "projects">("execution");
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("");
  const data = financialReportDetails[report.id as keyof typeof financialReportDetails];
  if (!data) return null;
  const money = (value: string) => new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: Math.max(2, value.split(".")[1]?.length ?? 0) }).format(Number(value));
  const percent = (value: string) => new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value)) + "%";
  const matches = (value: string) => value.toLocaleLowerCase(locale).includes(query.trim().toLocaleLowerCase(locale));
  const execution = data.rows.filter(row => (!group || row.group === group) && matches(`${row.label} ${row.path}`));
  const comparison = data.comparison.filter(row => matches(row.label));
  const projects = data.projects.filter(row => matches(row.label));
  const count = view === "execution" ? execution.length : view === "comparison" ? comparison.length : projects.length;
  const source = (page: number) => <a href={`${report.source.href}#page=${page}`} aria-label={t("sourcePage", { page })}>{page} ↗</a>;

  return (
    <div className={styles.reportTables}>
      <h3>{t("heading")}</h3>
      <div className={styles.viewButtons} role="group" aria-label={t("view")}>
        {(["execution", "comparison", "projects"] as const).map(key => <button key={key} type="button" aria-pressed={view === key} onClick={() => { setView(key); setQuery(""); setGroup(""); }}>{t(key)}</button>)}
      </div>
      <p className={styles.note}>{t("sourceColumns")}</p>
      <div className={styles.tableFilters}>
        <label>{t("search")}<input type="search" value={query} onChange={event => setQuery(event.target.value)} /></label>
        {view === "execution" && <label>{t("unit")}<select value={group} onChange={event => setGroup(event.target.value)}><option value="">{t("all")}</option>{data.rows.filter(row => row.depth === 1).map(row => <option key={row.id} value={row.label}>{row.label}</option>)}</select></label>}
      </div>
      {(query || group) && <button type="button" className={styles.clearFilters} onClick={() => { setQuery(""); setGroup(""); }}>{t("clear")}</button>}
      <p className={styles.note} role="status">{t("results", { count })}</p>
      <div className={styles.tableScroll} tabIndex={0} role="region" aria-label={t(view)}>
        <table className={styles.sourceTable}>
          <caption>{t(view)} · {report.id}{view !== "projects" && ` · ${t("currency")}`}</caption>
          <thead><tr><th scope="col">{t("item")}</th>
            {view === "projects" ? <th scope="col">{t("projectCount")}</th> : <>
              <th scope="col">{t("allocated")} {report.id}</th>
              <th scope="col">{view === "execution" ? t("spent") : `${t("allocated")} ${Number(report.id) - 1}`}</th>
              <th scope="col">{t("difference")}</th><th scope="col">{t("percentage")}</th>
            </>}<th scope="col">{t("page")}</th></tr></thead>
          <tbody>
            {view === "execution" && execution.map(row => <tr key={row.id} data-level={row.depth}>
              <th scope="row" style={{ paddingInlineStart: `${12 + Math.max(0, row.depth - 1) * 16}px` }}>{row.label}{row.path && <span className="sr-only"> · {row.path}</span>}</th>
              <td>{money(row.allocated)}</td><td>{money(row.spent)}</td><td data-negative={Number(row.difference) < 0}>{money(row.difference)}</td><td>{percent(row.percent)}</td><td>{source(row.page)}</td>
            </tr>)}
            {view === "comparison" && comparison.map(row => <tr key={row.label}><th scope="row">{row.label}</th><td>{money(row.allocated)}</td><td>{money(row.previous)}</td><td data-negative={Number(row.difference) < 0}>{money(row.difference)}</td><td>{percent(row.percent)}</td><td>{source(row.page)}</td></tr>)}
            {view === "projects" && projects.map(row => <tr key={row.label}><th scope="row">{row.label}</th><td>{row.count}</td><td>{source(row.page)}</td></tr>)}
          </tbody>
        </table>
      </div>
      {count === 0 && <p className={styles.emptyResults}>{t("empty")}</p>}
      <aside className={styles.sourceNotes} aria-label={t("notesHeading")}>
        <h4>{t("notesHeading")}</h4>
        <p>{t("transfers")}</p>
        <p>{t(`notes${report.id as "2024" | "2023" | "2022"}`)}</p>
        <a href={`${report.source.href}#page=${report.id === "2022" ? 5 : 4}`}>{t("readNotes")} ↗</a>
      </aside>
    </div>
  );
}
