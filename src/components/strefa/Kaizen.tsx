"use client";

import { useId, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle, PaperPlaneTilt, ShieldCheck } from "@phosphor-icons/react";
import { sendKaizen, type KaizenResult } from "@/app/actions/kaizen";
import { MAX_POLE, OBSZARY, STATUSY, type KarteczkaNaTablicy, type Obszar, type Status } from "@/lib/kaizen";
import styles from "./Kaizen.module.css";

/**
 * Karteczki Kaizen: formularz (anonimowy wobec Zarządu) i tablica karteczek,
 * które Zarząd omówił. Obieg i anonimowość - patrz src/lib/kaizen.ts.
 */
export function Kaizen({ tablica }: { tablica: { ok: true; karteczki: KarteczkaNaTablicy[] } | { ok: false } }) {
  const t = useTranslations("kaizen");
  return (
    <section className="section-padding">
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-14">
        <Formularz />
        <aside aria-labelledby="kaizen-how" className={styles.how}>
          <h2 id="kaizen-how" className={styles.howHeading}>
            {t("howHeading")}
          </h2>
          <ol className={styles.steps}>
            {(["1", "2", "3"] as const).map((n) => (
              <li key={n} className={styles.step}>
                <span className={styles.stepNo} aria-hidden="true">
                  {n}
                </span>
                <div>
                  <p className={styles.stepTitle}>{t(`how.${n}.title`)}</p>
                  <p className={styles.stepBody}>{t(`how.${n}.body`)}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className={styles.anon}>
            <ShieldCheck size={20} weight="duotone" aria-hidden="true" className="shrink-0 text-accent" />
            {t("anonNote")}
          </p>
        </aside>
      </div>
      <Tablica tablica={tablica} />
    </section>
  );
}

function Formularz() {
  const t = useTranslations("kaizen");
  const ids = useId();
  const [obszar, setObszar] = useState<Obszar | "">("");
  const [zauwazam, setZauwazam] = useState("");
  const [proponuje, setProponuje] = useState("");
  const [result, setResult] = useState<KaizenResult | null>(null);
  const [pending, startTransition] = useTransition();

  if (result?.status === "ok") {
    return (
      <div className={styles.card} role="status">
        <CheckCircle size={36} weight="duotone" aria-hidden="true" className="text-accent" />
        <p className="mt-4 max-w-[46ch] text-[1.0625rem] leading-[1.65] text-ink-primary">{t("sent")}</p>
        <button
          type="button"
          className={styles.secondary}
          onClick={() => {
            setResult(null);
            setObszar("");
            setZauwazam("");
            setProponuje("");
          }}
        >
          {t("another")}
        </button>
      </div>
    );
  }

  const error =
    result?.status === "invalid"
      ? t("errorInvalid")
      : result?.status === "unauthorized"
        ? t("errorUnauthorized")
        : result?.status === "not_configured"
          ? t("errorNotConfigured")
          : result?.status === "error"
            ? t("error")
            : "";

  return (
    <form
      className={styles.card}
      aria-labelledby={`${ids}-h`}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(async () => setResult(await sendKaizen(data)));
      }}
    >
      <p className={styles.label} aria-hidden="true">
        {t("formLabel")}
      </p>
      <h2 id={`${ids}-h`} className={styles.formHeading}>
        {t("formHeading")}
      </h2>

      <fieldset className="mt-6">
        <legend className={styles.fieldLabel}>{t("obszar")}</legend>
        <div className={styles.areas}>
          {OBSZARY.map((o) => (
            <label key={o} className={styles.area}>
              <input type="radio" name="obszar" value={o} checked={obszar === o} onChange={() => setObszar(o)} required className={styles.areaInput} />
              <span>{t(`obszary.${o}`)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Pole id={`${ids}-z`} name="zauwazam" label={t("zauwazam")} hint={t("zauwazamHint")} value={zauwazam} onChange={setZauwazam} />
      <Pole id={`${ids}-p`} name="proponuje" label={t("proponuje")} hint={t("proponujeHint")} value={proponuje} onChange={setProponuje} />

      {/* Pole-pułapka: ukryte przed ludźmi i czytnikami, boty je wypełniają. */}
      <input type="text" name="firma" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className={styles.submit}>
        <PaperPlaneTilt size={18} weight="bold" aria-hidden="true" />
        {pending ? t("sending") : t("send")}
      </button>
    </form>
  );
}

function Pole({
  id,
  name,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const t = useTranslations("kaizen");
  return (
    <div className="mt-5">
      <label htmlFor={id} className={styles.fieldLabel}>
        {label}
      </label>
      <p id={`${id}-hint`} className={styles.hint}>
        {hint}
      </p>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={MAX_POLE}
        minLength={5}
        required
        rows={3}
        aria-describedby={`${id}-hint ${id}-count`}
        className={styles.textarea}
      />
      <p id={`${id}-count`} className={styles.counter}>
        {t("counter", { n: value.length, max: MAX_POLE })}
      </p>
    </div>
  );
}

function Tablica({ tablica }: { tablica: { ok: true; karteczki: KarteczkaNaTablicy[] } | { ok: false } }) {
  const t = useTranslations("kaizen");
  const [filter, setFilter] = useState<Status | "">("");
  const karteczki = tablica.ok ? tablica.karteczki.filter((k) => !filter || k.status === filter) : [];

  return (
    <section className="mx-auto mt-20 max-w-[1200px]" aria-labelledby="kaizen-board">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="kaizen-board" className={styles.boardHeading}>
            {t("boardHeading")}
          </h2>
          <p className="mt-2 max-w-[60ch] text-[1rem] leading-[1.6] text-ink-secondary">{t("boardLead")}</p>
        </div>
        {tablica.ok && tablica.karteczki.length > 0 && (
          <div role="group" aria-label={t("boardHeading")} className={styles.filters}>
            {(["", ...STATUSY] as const).map((s) => (
              <button
                key={s || "all"}
                type="button"
                aria-pressed={filter === s}
                onClick={() => setFilter(s)}
                className={styles.filter}
              >
                {s ? t(`status.${s}`) : t("filterAll")}
              </button>
            ))}
          </div>
        )}
      </div>

      {!tablica.ok ? (
        <p className={styles.empty}>{t("boardError")}</p>
      ) : karteczki.length === 0 ? (
        <p className={styles.empty}>{tablica.karteczki.length ? t("boardEmptyFilter") : t("boardEmpty")}</p>
      ) : (
        <ul className={styles.board}>
          {karteczki.map((k, i) => (
            <li key={`${k.data}-${i}`} className={styles.note} data-status={k.status}>
              <div className={styles.noteHead}>
                <span className={styles.noteArea}>{t(`obszary.${k.obszar}`)}</span>
                <time dateTime={k.data} className={styles.noteDate}>
                  {k.data.split("-").reverse().join(".")}
                </time>
              </div>
              <p className={styles.noteLabel}>{t("seen")}</p>
              <p className={styles.noteText}>{k.zauwazam}</p>
              <p className={styles.noteLabel}>{t("proposed")}</p>
              <p className={styles.noteText}>{k.proponuje}</p>
              <div className={styles.answer}>
                <span className={styles.badge} data-status={k.status}>
                  {t(`status.${k.status}`)}
                </span>
                {k.odpowiedz && (
                  <p className="mt-2 text-[0.9375rem] leading-[1.6] text-ink-primary">
                    <span className="sr-only">{t("answer")}: </span>
                    {k.odpowiedz}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
