import { describe, expect, it } from "vitest";
import { financialReports, financialReportDetails, reportTotals } from "./financial-reports";
const report = financialReports[0];
describe("BIP financial report 2024", () => {
 it("reconciles expenditure with the published total (PDF p. 3)", () => {
  expect(reportTotals(report)).toEqual({allocated:35000000,expense:30425700,remainder:4574300,discrepancy:0});
 });
 it("reconciles the four allocated amounts without counting subgroups twice", () => {
  expect(report.entries.reduce((sum,e)=>sum+e.allocatedGrosze,0)).toBe(35000000);
 });
 it("rejects a transcription discrepancy", () => {
  expect(()=>reportTotals({...report,entries:report.entries.slice(1)})).toThrow("reconcile");
 });
 it.each([-1,1.5,NaN,Infinity])("rejects invalid amount %s", amountGrosze=>{
  expect(()=>reportTotals({...report,entries:[{...report.entries[0],amountGrosze}]})).toThrow();
 });
});
describe("archival reports preserve source values", () => {
 it("keeps published totals and separately records source inconsistencies", () => {
  expect(reportTotals(financialReports[1])).toEqual({allocated:44000000,expense:34801504,remainder:9198496,discrepancy:2711085});
  expect(reportTotals(financialReports[2])).toEqual({allocated:50000000,expense:43876669,remainder:6173331,discrepancy:-7000});
 });
 it("includes every numeric execution row and reconciles project counts", () => {
  expect(financialReportDetails["2024"].rows).toHaveLength(49);
  expect(financialReportDetails["2023"].rows).toHaveLength(50);
  expect(financialReportDetails["2022"].rows).toHaveLength(54);
  expect(Object.values(financialReportDetails).map(r=>r.projects.reduce((sum,p)=>sum+p.count,0))).toEqual([116,112,115]);
 });
 it("does not round away a three-decimal value printed in the source", () => {
  expect(financialReportDetails["2023"].rows.find(r=>r.label === "Organizacje studenckie")?.difference).toBe("15792.452");
 });
});
