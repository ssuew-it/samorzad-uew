/** Transcribed from the UEW BIP report, pages 3–5. Amounts in integer grosze.
 * These are annual aggregates, not individual transactions or bank balances.
 */
import reportDetails from "./financial-report-details.json";
export const financialReportDetails = reportDetails;

export interface FinancialEntry {
  id: string;
  title: { pl: string; en: string };
  category: { pl: string; en: string };
  allocatedGrosze: number;
  amountGrosze: number;
  description: { pl: string; en: string };
  source: { label: string; href: string };
}
export interface FinancialReport {
  id: string;
  from: string;
  to: string;
  verifiedAt: string;
  allocatedGrosze: number;
  reportedExpenseGrosze: number;
  reportedRemainderGrosze?: number;
  expectedDiscrepancyGrosze?: number;
  source: { label: string; href: string };
  entries: FinancialEntry[];
}
export const financialReportBip = "https://bip.ue.wroc.pl/258/sprawozdanie-finansowe-samorzadu-studentow.html";
const pdf = "https://bip.ue.wroc.pl/download/attachment/3523/sprawozdanie-finansowe-samorzadu-studentow-za-2024-rok.pdf";
export const financialReports: FinancialReport[] = [{
  id: "2024", from: "2024-01-01", to: "2024-12-31", verifiedAt: "2026-10-18",
  allocatedGrosze: 35000000, reportedExpenseGrosze: 30425700,
  source: { label: "PDF · 2024 · BIP UEW", href: pdf },
  entries: [
    { id: "samorzad", title: { pl: "Samorząd Studentów", en: "Student Government" }, category: { pl: "Samorząd", en: "Student Government" }, allocatedGrosze: 24217000, amountGrosze: 21945788,
      description: { pl: "Wydatki obejmują działalność projektową (161 456,35 zł), działalność ogólną (30 200,37 zł) oraz rezerwy (27 801,16 zł). Kwoty szczegółowe i zestawienie projektów znajdują się na stronach 3–4 PDF.", en: "Expenditure comprises projects (PLN 161,456.35), general activities (PLN 30,200.37) and reserves (PLN 27,801.16). Detailed figures and projects are listed on PDF pages 3–4." }, source: { label: "PDF · 3–4", href: pdf + "#page=3" } },
    { id: "filia", title: { pl: "Filia w Jeleniej Górze", en: "Jelenia Góra branch" }, category: { pl: "Filia", en: "Branch" }, allocatedGrosze: 2000000, amountGrosze: 1539522,
      description: { pl: "Roczne wydatki Filii wykazane w tabeli sprawozdania. Różnica między kwotą przyznaną a wydatkowaną wynosi 4 604,78 zł.", en: "Annual branch expenditure as reported in the statement. The difference between the allocation and expenditure is PLN 4,604.78." }, source: { label: "PDF · 4", href: pdf + "#page=4" } },
    { id: "jednostki", title: { pl: "Jednostki Organizacyjne Samorządu Studentów", en: "Student Government organisational units" }, category: { pl: "Jednostki organizacyjne", en: "Organisational units" }, allocatedGrosze: 4329500, amountGrosze: 3254075,
      description: { pl: "Informacja Kulturalno-Sportowa Studentów: 15 008,35 zł. Klub Podróżników Because I Travel: 17 532,40 zł. Są to składowe tej pozycji, nie dodatkowe wydatki.", en: "Student Cultural and Sports Information: PLN 15,008.35. Because I Travel club: PLN 17,532.40. These amounts are included in this entry, not additional expenditure." }, source: { label: "PDF · 4", href: pdf + "#page=4" } },
    { id: "organizacje", title: { pl: "Organizacje studenckie", en: "Student organisations" }, category: { pl: "Organizacje", en: "Organisations" }, allocatedGrosze: 4453500, amountGrosze: 3686315,
      description: { pl: "Chór Ars Cantandi: 4 000,00 zł; Niezależne Zrzeszenie Studentów: 13 180,32 zł; Zrzeszenie Studentów Polskich: 19 682,83 zł. Studenckie Forum Business Centre Club, WIGGOR i rezerwa: po 0,00 zł wydatków.", en: "Ars Cantandi choir: PLN 4,000.00; Independent Students’ Association: PLN 13,180.32; Polish Students’ Association: PLN 19,682.83. Student Business Centre Club, WIGGOR and reserve: PLN 0.00 expenditure each." }, source: { label: "PDF · 4", href: pdf + "#page=4" } },
  ],
}, ...(["2023", "2022"] as const).map((year): FinancialReport => {
  const rows = reportDetails[year].rows;
  const href = `https://bip.ue.wroc.pl/download/attachment/${year === "2023" ? "3522" : "3521"}/sprawozdanie-finansowe-samorzadu-studentow-za-${year}-rok.pdf`;
  return {
    id: year, from: `${year}-01-01`, to: `${year}-12-31`, verifiedAt: "2026-10-18",
    allocatedGrosze: Math.round(Number(rows[0].allocated) * 100),
    reportedExpenseGrosze: Math.round(Number(rows[0].spent) * 100),
    reportedRemainderGrosze: Math.round(Number(rows[0].difference) * 100),
    expectedDiscrepancyGrosze: year === "2023" ? 2711085 : -7000,
    source: { label: `PDF · ${year} · BIP UEW`, href },
    entries: rows.filter(row => row.depth === 1).map(row => ({
      id: row.id, title: { pl: row.label, en: row.label }, category: { pl: row.label, en: row.label },
      allocatedGrosze: Math.round(Number(row.allocated) * 100), amountGrosze: Math.round(Number(row.spent) * 100),
      description: { pl: "Pozycja ze sprawozdania źródłowego.", en: "Entry from the source report." },
      source: { label: `PDF · ${row.page}`, href: `${href}#page=${row.page}` },
    })),
  };
})];
export function reportTotals(report: FinancialReport) {
  let expense = 0;
  for (const entry of report.entries) {
    if (!Number.isSafeInteger(entry.amountGrosze) || entry.amountGrosze < 0) throw new Error(`Invalid amount in financial entry ${entry.id}`);
    expense += entry.amountGrosze;
  }
  // The PDF is authoritative. Some years contain discrepancies between
  // the headline total and unit rows. Preserve both, never silently repair.
  if (expense - report.reportedExpenseGrosze !== (report.expectedDiscrepancyGrosze ?? 0)) {
    throw new Error("Entries do not reconcile with the documented source discrepancy");
  }
  return { allocated: report.allocatedGrosze, expense: report.reportedExpenseGrosze,
    remainder: report.reportedRemainderGrosze ?? report.allocatedGrosze - report.reportedExpenseGrosze,
    discrepancy: expense - report.reportedExpenseGrosze };
}
