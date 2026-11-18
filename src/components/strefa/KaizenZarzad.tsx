"use client";

import { useId, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { FloppyDisk, UserCircleGear } from "@phosphor-icons/react";
import { odpowiedzNaKarteczke, type OdpowiedzResult } from "@/app/actions/kaizen";
import { MAX_ODPOWIEDZ, STATUSY, type KarteczkaZarzadu, type Status } from "@/lib/kaizen";
import type { KarteczkiZarzadu } from "@/lib/kaizen-tablica";
import styles from "./Kaizen.module.css";

/**
 * Widok Zarządu na stronie Kaizen: wszystkie karteczki (także nieomówione
 * i niewystawione) z formularzem odpowiedzi przy każdej. Zapis idzie przez
 * akcję serwera, która sprawdza rolę - ten komponent tylko ją wywołuje.
 */
export function KaizenZarzad({ zarzad }: { zarzad: KarteczkiZarzadu }) {
  const t = useTranslations("kaizen.zarzad");
  const [tylkoNowe, setTylkoNowe] = useState(false);
  const karteczki = zarzad.ok ? zarzad.karteczki.filter((k) => !tylkoNowe || !k.status) : [];
  const noweIle = zarzad.ok ? zarzad.karteczki.filter((k) => !k.status).length : 0;

  return (
    <section className={`mx-auto mt-20 max-w-[1200px] ${styles.zarzad}`} aria-labelledby="kaizen-zarzad">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={styles.zarzadLabel}>
            <UserCircleGear size={18} weight="duotone" aria-hidden="true" />
            {t("label")}
          </p>
          <h2 id="kaizen-zarzad" className={styles.boardHeading}>
            {t("heading")}
          </h2>
          <p className="mt-2 max-w-[64ch] text-[1rem] leading-[1.6] text-ink-secondary">{t("lead")}</p>
        </div>
        {zarzad.ok && zarzad.karteczki.length > 0 && (
          <div role="group" aria-label={t("heading")} className={styles.filters}>
            <button type="button" aria-pressed={tylkoNowe} onClick={() => setTylkoNowe(true)} className={styles.filter}>
              {t("filterNew", { n: noweIle })}
            </button>
            <button type="button" aria-pressed={!tylkoNowe} onClick={() => setTylkoNowe(false)} className={styles.filter}>
              {t("filterAll")}
            </button>
          </div>
        )}
      </div>

      {!zarzad.ok ? (
        <p className={styles.empty}>{zarzad.powod === "stary-skrypt" ? t("oldScript") : t("loadError")}</p>
      ) : karteczki.length === 0 ? (
        <p className={styles.empty}>{zarzad.karteczki.length ? t("emptyNew") : t("empty")}</p>
      ) : (
        <ul className={styles.zarzadList}>
          {karteczki.map((k) => (
            <li key={k.id}>
              <KarteczkaDoOdpowiedzi k={k} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function KarteczkaDoOdpowiedzi({ k }: { k: KarteczkaZarzadu }) {
  const t = useTranslations("kaizen");
  const tz = useTranslations("kaizen.zarzad");
  const ids = useId();
  const [status, setStatus] = useState<Status | "">(k.status ?? "");
  const [odpowiedz, setOdpowiedz] = useState(k.odpowiedz);
  const [pokaz, setPokaz] = useState(k.pokaz);
  const [result, setResult] = useState<OdpowiedzResult | null>(null);
  const [pending, startTransition] = useTransition();

  const komunikat =
    result?.status === "ok"
      ? tz("saved")
      : result?.status === "forbidden"
        ? tz("errorForbidden")
        : result?.status === "invalid"
          ? tz("errorInvalid")
          : result?.status === "not_configured"
            ? tz("errorNotConfigured")
            : result?.status === "error"
              ? tz("error")
              : "";

  return (
    <article className={styles.zNote} data-status={k.status ?? "nowa"} aria-labelledby={`${ids}-h`}>
      <div>
        <div className={styles.noteHead}>
          <span className={styles.noteArea} id={`${ids}-h`}>
            {t(`obszary.${k.obszar}`)}
          </span>
          <time dateTime={k.data} className={styles.noteDate}>
            {k.data.split("-").reverse().join(".")}
          </time>
        </div>
        <p className={styles.zBadges}>
          {!k.status && <span className={styles.zNew}>{tz("newBadge")}</span>}
          <span className={styles.zVisibility}>{k.pokaz ? tz("shown") : tz("hidden")}</span>
        </p>
        <p className={styles.noteLabel}>{t("seen")}</p>
        <p className={styles.noteText}>{k.zauwazam}</p>
        <p className={styles.noteLabel}>{t("proposed")}</p>
        <p className={styles.noteText}>{k.proponuje}</p>
      </div>

      <form
        className={styles.zForm}
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          startTransition(async () => setResult(await odpowiedzNaKarteczke(data)));
        }}
      >
        <input type="hidden" name="id" value={k.id} />
        <label htmlFor={`${ids}-s`} className={styles.fieldLabel}>
          {tz("status")}
        </label>
        <select
          id={`${ids}-s`}
          name="status"
          value={status}
          onChange={(e) => {
            const s = e.target.value as Status | "";
            setStatus(s);
            if (!s) setPokaz(false);
          }}
          className={styles.select}
        >
          <option value="">{tz("statusNone")}</option>
          {STATUSY.map((s) => (
            <option key={s} value={s}>
              {t(`status.${s}`)}
            </option>
          ))}
        </select>

        <label htmlFor={`${ids}-o`} className={`${styles.fieldLabel} mt-4 block`}>
          {tz("answer")}
        </label>
        <p id={`${ids}-oh`} className={styles.hint}>
          {tz("answerHint")}
        </p>
        <textarea
          id={`${ids}-o`}
          name="odpowiedz"
          value={odpowiedz}
          onChange={(e) => setOdpowiedz(e.target.value)}
          maxLength={MAX_ODPOWIEDZ}
          rows={3}
          aria-describedby={`${ids}-oh`}
          className={styles.textarea}
        />

        <label className={styles.check}>
          <input type="checkbox" name="pokaz" checked={pokaz} disabled={!status} onChange={(e) => setPokaz(e.target.checked)} aria-describedby={`${ids}-ph`} />
          <span>{tz("show")}</span>
        </label>
        <p id={`${ids}-ph`} className={styles.hint}>
          {tz("showHint")}
        </p>

        <button type="submit" disabled={pending} className={styles.zSave}>
          <FloppyDisk size={18} weight="bold" aria-hidden="true" />
          {pending ? tz("saving") : tz("save")}
        </button>
        <p role={result && result.status !== "ok" ? "alert" : "status"} className={result?.status === "ok" ? styles.zSaved : result ? styles.error : styles.zMsgEmpty}>
          {komunikat}
        </p>
      </form>
    </article>
  );
}
