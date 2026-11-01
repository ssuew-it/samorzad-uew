"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AppleLogo, CalendarPlus, Check, Copy } from "@phosphor-icons/react";
import { PROGRAM_NAMES } from "@/lib/plan-zajec/kierunki";

interface Tree {
  year: string;
  modes: { code: string; label: string; programs: { code: string; years: string[] }[] }[];
}

/**
 * Plan zajęć grupy w Kalendarzu Google (albo Apple/Outlook) jako subskrypcja.
 * Student wybiera tryb, kierunek, rok i grupę, a dostaje adres .ics, który
 * kalendarz sam odświeża - zmiany w planie trafiają do niego bez ponownego
 * importu. Dane z /api/plan-zajec (plan.ue.wroc.pl).
 */
export function PlanSubskrypcja() {
  const t = useTranslations("planZajec");
  const loc = useLocale() === "en" ? "en" : "pl";
  const [tree, setTree] = useState<Tree | null>(null);
  const [failed, setFailed] = useState(false);
  const [mode, setMode] = useState("");
  const [program, setProgram] = useState("");
  const [year, setYear] = useState("");
  const [groups, setGroups] = useState<string[] | null>(null);
  const [group, setGroup] = useState("");
  const [half, setHalf] = useState("");
  const [copied, setCopied] = useState(false);
  // Adres serwisu z przeglądarki (inny na podglądzie i na produkcji).
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  useEffect(() => {
    fetch("/api/plan-zajec/drzewo")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Tree) => setTree(d))
      .catch(() => setFailed(true));
  }, []);

  const programs = useMemo(() => tree?.modes.find((m) => m.code === mode)?.programs ?? [], [tree, mode]);
  const years = programs.find((p) => p.code === program)?.years ?? [];

  useEffect(() => {
    if (!mode || !program || !year) return;
    let alive = true;
    fetch(`/api/plan-zajec/grupy?tryb=${mode}&kierunek=${program}&rok=${year}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { groups: string[] }) => alive && setGroups(d.groups))
      .catch(() => alive && setGroups([]));
    return () => {
      alive = false;
    };
  }, [mode, program, year]);

  const programName = (code: string) => {
    const name = PROGRAM_NAMES[code]?.[loc];
    return name ? `${name} (${code})` : code;
  };

  const query = group
    ? `tryb=${encodeURIComponent(mode)}&kierunek=${encodeURIComponent(program)}&rok=${encodeURIComponent(year)}&grupa=${encodeURIComponent(group)}${half ? `&polowa=${half}` : ""}`
    : "";
  const httpsUrl = query && origin ? `${origin}/api/plan-zajec/kalendarz.ics?${query}` : "";
  const webcalUrl = httpsUrl.replace(/^https?:/, "webcal:");
  const googleUrl = webcalUrl ? `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcalUrl)}` : "";

  const select =
    "h-12 w-full rounded-lg border border-border-strong bg-bg-base px-3 text-[0.9375rem] text-ink-primary focus:border-accent disabled:opacity-50";

  if (failed) {
    return <p className="mt-6 text-[0.9375rem] text-ink-secondary">{t("unavailable")}</p>;
  }

  return (
    <div className="mt-8 rounded-2xl border border-border-subtle bg-bg-surface p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="mb-2 block text-[0.875rem] font-medium text-ink-primary">{t("mode")}</span>
          <select
            className={select}
            value={mode}
            disabled={!tree}
            onChange={(e) => {
              setMode(e.target.value);
              setProgram("");
              setYear("");
              setGroup("");
              setGroups(null);
            }}
          >
            <option value="">{tree ? t("choose") : t("loading")}</option>
            {tree?.modes.map((m) => (
              <option key={m.code} value={m.code}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-[0.875rem] font-medium text-ink-primary">{t("program")}</span>
          <select
            className={select}
            value={program}
            disabled={!mode}
            onChange={(e) => {
              setProgram(e.target.value);
              setYear("");
              setGroup("");
              setGroups(null);
            }}
          >
            <option value="">{t("choose")}</option>
            {programs.map((p) => (
              <option key={p.code} value={p.code}>
                {programName(p.code)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-[0.875rem] font-medium text-ink-primary">{t("year")}</span>
          <select
            className={select}
            value={year}
            disabled={!program}
            onChange={(e) => {
              setYear(e.target.value);
              setGroup("");
              setGroups(null);
            }}
          >
            <option value="">{t("choose")}</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {t("yearN", { n: y })}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-[0.875rem] font-medium text-ink-primary">{t("group")}</span>
          <select className={select} value={group} disabled={!year || !groups} onChange={(e) => setGroup(e.target.value)}>
            <option value="">{year && !groups ? t("loading") : t("choose")}</option>
            {groups?.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="mt-5">
        <legend className="text-[0.875rem] font-medium text-ink-primary">{t("half")}</legend>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
          {(["", "A", "B"] as const).map((h) => (
            <label key={h || "all"} className="inline-flex min-h-11 items-center gap-2 text-[0.9375rem] text-ink-secondary">
              <input type="radio" name="polowa" value={h} checked={half === h} onChange={() => setHalf(h)} className="h-4 w-4 accent-[var(--accent)]" />
              {h ? t("halfN", { h }) : t("halfAll")}
            </label>
          ))}
        </div>
        <p className="mt-1 text-[0.8125rem] leading-[1.5] text-ink-tertiary">{t("halfHint")}</p>
      </fieldset>

      {/* Główna droga: jeden klik, logowanie do Google i „Dodaj” - bez pobierania
          plików. Apple i reszta kalendarzy to dodatek pod spodem. */}
      <div className="mt-6 border-t border-border-subtle pt-6">
        <a
          href={googleUrl || undefined}
          aria-disabled={!googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex h-12 items-center gap-2 rounded-lg px-6 text-[0.9375rem] font-semibold transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] ${
            googleUrl ? "bg-accent text-bg-base hover:bg-accent-dim" : "pointer-events-none bg-bg-elevated text-ink-tertiary"
          }`}
        >
          <CalendarPlus size={20} aria-hidden="true" />
          {t("google")}
          <span className="sr-only"> ({t("newTab")})</span>
        </a>
        <p className="mt-3 max-w-[70ch] text-[0.875rem] leading-[1.6] text-ink-secondary">{t("googleHint")}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.875rem] text-ink-tertiary">
          <span>{t("other")}</span>
          <a
            href={webcalUrl || undefined}
            aria-disabled={!webcalUrl}
            className={`inline-flex min-h-11 items-center gap-1.5 px-2 font-semibold ${
              webcalUrl ? "text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent" : "pointer-events-none"
            }`}
          >
            <AppleLogo size={16} aria-hidden="true" />
            {t("apple")}
          </a>
          <button
            type="button"
            disabled={!httpsUrl}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(httpsUrl);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2400);
              } catch {
                setCopied(false);
              }
            }}
            className="inline-flex min-h-11 items-center gap-1.5 px-2 font-semibold text-accent disabled:text-ink-tertiary"
          >
            {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
            <span aria-live="polite">{copied ? t("copied") : t("copy")}</span>
          </button>
        </div>
      </div>
      <p className="mt-4 max-w-[70ch] text-[0.8125rem] leading-[1.6] text-ink-tertiary">{t("note", { year: tree?.year ?? "" })}</p>
    </div>
  );
}
