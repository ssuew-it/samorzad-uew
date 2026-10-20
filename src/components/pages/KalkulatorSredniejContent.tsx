"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Plus, Trash, ArrowCounterClockwise } from "@phosphor-icons/react";
import { computeAverage, GRADES, type CourseInput } from "@/lib/average";
import {
  loadPrograms,
  listPrograms,
  listLevels,
  listModes,
  listCohorts,
  listYears,
  getCoursesFor,
  type Program,
  type DegreeLevel,
  type StudyMode,
} from "@/lib/programs";
import { AverageResult } from "./kalkulator/AverageResult";

const STORAGE_KEY = "ssuew:kalkulator";

interface ManualRow {
  id: string;
  name: string;
  ects: number;
  grade: number | null;
}

interface FormState {
  programId: string;
  level: DegreeLevel;
  mode: StudyMode;
  rocznik: string;
  year: number;
  grades: Record<string, number>; // gradeKey -> grade
  manual: ManualRow[];
}

const firstOf = <T,>(arr: T[], fallback: T): T => (arr.length ? arr[0] : fallback);

/** Clamp a desired (program, level, mode, rocznik) to valid values + first year. */
function selectionFor(
  data: Program[],
  programId: string,
  level?: DegreeLevel,
  mode?: StudyMode,
  rocznik?: string,
) {
  const lv = level && listLevels(data, programId).includes(level) ? level : firstOf(listLevels(data, programId), "I" as DegreeLevel);
  const md = mode && listModes(data, programId, lv).includes(mode) ? mode : firstOf(listModes(data, programId, lv), "stacjonarne" as StudyMode);
  const rk = rocznik && listCohorts(data, programId, lv, md).includes(rocznik) ? rocznik : firstOf(listCohorts(data, programId, lv, md), "");
  const yr = firstOf(listYears(data, programId, lv, md, rk), 1);
  return { level: lv, mode: md, rocznik: rk, year: yr };
}

function gradeKey(programId: string, level: string, mode: string, rocznik: string, year: number, courseName: string) {
  return `${programId}|${level}|${mode}|${rocznik}|${year}|${courseName}`;
}

export function KalkulatorSredniejContent() {
  const t = useTranslations("kalkulator");
  const locale = useLocale();

  const [data, setData] = useState<Program[] | null>(null);
  const [form, setForm] = useState<FormState>({
    programId: "",
    level: "I",
    mode: "stacjonarne",
    rocznik: "",
    year: 1,
    grades: {},
    manual: [],
  });

  // Load dataset + restore saved state once. Async (.then) → not flagged by set-state-in-effect.
  useEffect(() => {
    let alive = true;
    loadPrograms()
      .then((d) => {
        if (!alive) return;
        let saved: Partial<FormState> = {};
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) saved = JSON.parse(raw) as Partial<FormState>;
        } catch {
          /* ignore corrupt storage */
        }
        const programId = saved.programId && d.some((p) => p.id === saved.programId) ? saved.programId : firstOf(d, { id: "" } as Program).id;
        const sel = selectionFor(d, programId, saved.level, saved.mode, saved.rocznik);
        const years = listYears(d, programId, sel.level, sel.mode, sel.rocznik);
        const year = saved.year != null && years.includes(saved.year) ? saved.year : sel.year;
        setData(d);
        setForm({
          programId,
          level: sel.level,
          mode: sel.mode,
          rocznik: sel.rocznik,
          year,
          grades: saved.grades ?? {},
          manual: Array.isArray(saved.manual) ? saved.manual : [],
        });
      })
      .catch(() => {
        if (alive) setData([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Persist on change (only localStorage.setItem - no setState - so not flagged).
  useEffect(() => {
    if (!data) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      /* ignore quota / private mode */
    }
  }, [data, form]);

  const programs = data ?? [];
  const { programId, level, mode, rocznik, year } = form;
  const courses = data ? getCoursesFor(programs, programId, level, mode, rocznik, year) : [];

  const inputs: CourseInput[] = useMemo(() => {
    const fromProgram: CourseInput[] = courses.map((c) => ({
      ects: c.ects,
      grade: c.pass === "zal" ? null : (form.grades[gradeKey(programId, level, mode, rocznik, year, c.name)] ?? null),
    }));
    const fromManual: CourseInput[] = form.manual.map((m) => ({ ects: m.ects, grade: m.grade }));
    return [...fromProgram, ...fromManual];
  }, [courses, form.grades, form.manual, programId, level, mode, rocznik, year]);

  const summary = computeAverage(inputs);

  function selectProgram(id: string) {
    setForm((f) => ({ ...f, programId: id, ...selectionFor(programs, id, f.level, f.mode, f.rocznik) }));
  }
  function selectLevel(lv: DegreeLevel) {
    setForm((f) => ({ ...f, ...selectionFor(programs, f.programId, lv, f.mode, f.rocznik) }));
  }
  function selectMode(md: StudyMode) {
    setForm((f) => ({ ...f, ...selectionFor(programs, f.programId, f.level, md, f.rocznik) }));
  }
  function selectRocznik(rk: string) {
    setForm((f) => ({ ...f, ...selectionFor(programs, f.programId, f.level, f.mode, rk) }));
  }
  function selectYear(y: number) {
    setForm((f) => ({ ...f, year: y }));
  }

  function setGrade(courseName: string, value: number | null) {
    const key = gradeKey(programId, level, mode, rocznik, year, courseName);
    setForm((f) => {
      const next = { ...f.grades };
      if (value === null) delete next[key];
      else next[key] = value;
      return { ...f, grades: next };
    });
  }

  function reset() {
    setForm((f) => ({ ...f, grades: {}, manual: [] }));
  }

  const selectCls = "h-10 rounded-md border border-border-strong bg-bg-surface px-3 text-[0.9375rem] text-ink-primary";
  const labelCls = "flex flex-col gap-1.5 text-[0.8125rem] text-ink-secondary";

  if (!data) {
    return (
      <section className="section-padding">
        <div className="mx-auto max-w-[1200px]">
          <p className="font-mono text-[0.875rem] text-ink-tertiary">{t("loading")}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding" aria-labelledby="kalk-heading">
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[1.4fr_1fr]">
        {/* LEFT: pickers + table */}
        <div>
          <h2 id="kalk-heading" className="sr-only">
            {t("pickerHeading")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className={labelCls}>
              {t("program")}
              <select value={programId} onChange={(e) => selectProgram(e.target.value)} className={selectCls}>
                {listPrograms(programs).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelCls}>
              {t("level")}
              <select value={level} onChange={(e) => selectLevel(e.target.value as DegreeLevel)} className={selectCls}>
                {listLevels(programs, programId).map((lv) => (
                  <option key={lv} value={lv}>
                    {t(`level${lv}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelCls}>
              {t("mode")}
              <select value={mode} onChange={(e) => selectMode(e.target.value as StudyMode)} className={selectCls}>
                {listModes(programs, programId, level).map((md) => (
                  <option key={md} value={md}>
                    {t(`mode_${md}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelCls}>
              {t("rocznik")}
              <select value={rocznik} onChange={(e) => selectRocznik(e.target.value)} className={selectCls}>
                {listCohorts(programs, programId, level, mode).map((rk) => (
                  <option key={rk} value={rk}>
                    {rk}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelCls}>
              {t("year")}
              <select value={year} onChange={(e) => selectYear(Number(e.target.value))} className={selectCls}>
                {listYears(programs, programId, level, mode, rocznik).map((y) => (
                  <option key={y} value={y}>
                    {t("yearLabel", { n: y })}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <h3 className="mt-10 font-display text-[1.125rem] font-semibold text-ink-primary">{t("tableHeading")}</h3>
          <div className="mt-4 overflow-hidden rounded-xl border border-border-subtle">
            <table className="w-full text-left text-[0.875rem]">
              <thead className="bg-bg-elevated text-[0.75rem] uppercase tracking-[0.06em] text-ink-tertiary">
                <tr>
                  <th className="px-4 py-3 font-medium">{t("colCourse")}</th>
                  <th className="w-20 px-4 py-3 font-medium">{t("colEcts")}</th>
                  <th className="w-40 px-4 py-3 font-medium">{t("colGrade")}</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c, i) => {
                  const displayName = locale === "en" && c.nameEn ? c.nameEn : c.name;
                  return (
                    <tr key={`${programId}|${level}|${mode}|${rocznik}|${year}|${i}|${c.name}`} className="border-t border-border-subtle">
                      <td className="px-4 py-3 text-ink-primary">{displayName}</td>
                      <td className="px-4 py-3 font-mono text-ink-secondary">{c.ects}</td>
                      <td className="px-4 py-3">
                        {c.pass === "zal" ? (
                          <span className="font-mono text-[0.8125rem] text-ink-tertiary">{t("passLabel")}</span>
                        ) : (
                          <select
                            aria-label={`${t("colGrade")}: ${displayName}`}
                            value={form.grades[gradeKey(programId, level, mode, rocznik, year, c.name)] ?? ""}
                            onChange={(e) => setGrade(c.name, e.target.value === "" ? null : Number(e.target.value))}
                            className="h-9 w-full rounded-md border border-border-strong bg-bg-surface px-2 text-ink-primary"
                          >
                            <option value="">{t("gradeNone")}</option>
                            {GRADES.map((g) => (
                              <option key={g} value={g}>
                                {g.toLocaleString("pl-PL", { minimumFractionDigits: 1 })}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {form.manual.map((m) => (
                  <tr key={m.id} className="border-t border-border-subtle">
                    <td className="px-4 py-3">
                      <input
                        aria-label={t("courseNamePlaceholder")}
                        value={m.name}
                        placeholder={t("courseNamePlaceholder")}
                        onChange={(e) => setForm((f) => ({ ...f, manual: f.manual.map((r) => (r.id === m.id ? { ...r, name: e.target.value } : r)) }))}
                        className="w-full rounded-md border border-border-strong bg-bg-surface px-2 py-1.5 text-ink-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={1}
                        aria-label={t("colEcts")}
                        value={m.ects || ""}
                        onChange={(e) => setForm((f) => ({ ...f, manual: f.manual.map((r) => (r.id === m.id ? { ...r, ects: Number(e.target.value) || 0 } : r)) }))}
                        className="w-16 rounded-md border border-border-strong bg-bg-surface px-2 py-1.5 font-mono text-ink-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          aria-label={t("colGrade")}
                          value={m.grade ?? ""}
                          onChange={(e) => setForm((f) => ({ ...f, manual: f.manual.map((r) => (r.id === m.id ? { ...r, grade: e.target.value === "" ? null : Number(e.target.value) } : r)) }))}
                          className="h-9 flex-1 rounded-md border border-border-strong bg-bg-surface px-2 text-ink-primary"
                        >
                          <option value="">{t("gradeNone")}</option>
                          {GRADES.map((g) => (
                            <option key={g} value={g}>
                              {g.toLocaleString("pl-PL", { minimumFractionDigits: 1 })}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          aria-label={t("removeRow")}
                          onClick={() => setForm((f) => ({ ...f, manual: f.manual.filter((r) => r.id !== m.id) }))}
                          className="flex h-11 w-11 shrink-0 items-center justify-center text-ink-tertiary transition-colors hover:text-accent"
                        >
                          <Trash size={18} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, manual: [...f.manual, { id: crypto.randomUUID(), name: "", ects: 0, grade: null }] }))}
              className="inline-flex items-center gap-2 rounded-full border border-border-strong px-4 py-2 text-[0.875rem] font-medium text-ink-primary transition-colors hover:border-accent hover:text-accent"
            >
              <Plus size={16} aria-hidden="true" />
              {t("addRow")}
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.875rem] font-medium text-ink-secondary transition-colors hover:text-ink-primary"
            >
              <ArrowCounterClockwise size={16} aria-hidden="true" />
              {t("reset")}
            </button>
          </div>
        </div>

        {/* RIGHT: result + notes */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <AverageResult
            average={summary.average}
            gradedEcts={summary.gradedEcts}
            totalEcts={summary.totalEcts}
            labels={{
              heading: t("resultHeading"),
              average: t("resultAverage"),
              empty: t("resultEmpty"),
              ects: t.raw("resultEcts") as string,
              announce: t.raw("announce") as string,
            }}
          />
          <p className="mt-4 text-[0.8125rem] leading-[1.6] text-ink-tertiary">{t("privacy")}</p>
          <p className="mt-3 text-[0.8125rem] leading-[1.6] text-ink-tertiary">{t("scholarshipNote")}</p>
        </aside>
      </div>
    </section>
  );
}
