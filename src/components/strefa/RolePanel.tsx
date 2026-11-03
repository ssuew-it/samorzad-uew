"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode, type Ref } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import {
  CheckCircle,
  Clock,
  PencilSimple,
  Plus,
  Prohibit,
  ShieldCheck,
  Trash,
  WarningCircle,
} from "@phosphor-icons/react";
import { deletePerson, savePersonRoles, setPersonBlocked, type RoleActionResult } from "@/app/actions/role";
import {
  ASSIGNABLE_ROLES,
  daysLeft,
  defaultUntil,
  isGrantActive,
  localPart,
  type AssignableRole,
  type PersonView,
} from "@/lib/roles-core";
import { ALLOWED_DOMAIN } from "@/lib/auth-core";
import { EASE } from "@/lib/motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/* ── Typy i drobne pomocniki ─────────────────────────────────────────────── */

type ErrorCode = Extract<RoleActionResult, { ok: false }>["error"] | "exists" | "noRole" | "network";
type SuccessCode = "saved" | "blocked" | "unblocked" | "removed";

/** Gdzie pokazać komunikat: przy formularzu, przy wierszu osoby albo nad
 *  listą. Komunikat stoi tam, gdzie padła akcja - przy długiej liście baner
 *  na górze strony byłby poza ekranem. */
type Scope = "list" | "add" | "block" | `row:${string}`;
type Feedback = { scope: Scope; kind: "ok"; code: SuccessCode; email: string } | { scope: Scope; kind: "error"; code: ErrorCode };

/** Szkic ról w edytorze. `until === ""` = bez daty. */
type Draft = Record<AssignableRole, { on: boolean; until: string }>;

const DOMAIN_SUFFIX = `@${ALLOWED_DOMAIN}`;
const SOON_DAYS = 30;

/** "2027-05-31" → "31.05.2027" bez Date - żadnych przesunięć stref czasowych. */
function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return d && m && y ? `${d}.${m}.${y}` : iso;
}

function draftFrom(person: PersonView | null): Draft {
  const draft = {} as Draft;
  for (const role of ASSIGNABLE_ROLES) {
    const grant = person?.grants.find((g) => g.role === role);
    draft[role] = { on: Boolean(grant), until: grant?.until ?? "" };
  }
  return draft;
}

function grantsFrom(draft: Draft): Partial<Record<AssignableRole, string | null>> {
  const grants: Partial<Record<AssignableRole, string | null>> = {};
  for (const role of ASSIGNABLE_ROLES) {
    if (draft[role].on) grants[role] = draft[role].until || null;
  }
  return grants;
}

/* ── Wspólne klasy przycisków (DESIGN.md §9) ─────────────────────────────── */

const BTN_BASE =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-[0.875rem] font-medium transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 motion-reduce:transition-none motion-reduce:active:scale-100";
const BTN_PRIMARY = `${BTN_BASE} bg-accent text-bg-base hover:bg-accent-dim disabled:hover:bg-accent`;
const BTN_OUTLINE = `${BTN_BASE} border border-border-strong text-ink-primary hover:border-border-soft hover:bg-bg-elevated disabled:hover:bg-transparent aria-expanded:bg-bg-elevated`;
const BTN_GHOST = `${BTN_BASE} text-ink-secondary hover:bg-bg-elevated hover:text-ink-primary`;
const BTN_DANGER = `${BTN_BASE} text-red-700 hover:bg-red-500/10 dark:text-red-400 disabled:hover:bg-transparent`;
const BTN_DANGER_SOLID = `${BTN_BASE} bg-red-700 text-white hover:bg-red-800 dark:bg-red-500 dark:text-[#0A0D14] dark:hover:bg-red-400`;

/* ── Komunikaty (role="status" / role="alert") ───────────────────────────── */

/**
 * Para regionów na żywo dla jednego miejsca w panelu. Kontenery stoją w DOM
 * cały czas, a zmienia się tylko ich treść - tak czytniki ekranu najpewniej
 * ogłaszają nowy komunikat (wstawienie świeżego elementu z rolą bywa
 * pomijane).
 */
function LiveFeedback({ scope, feedback, className = "" }: { scope: Scope; feedback: Feedback | null; className?: string }) {
  const t = useTranslations("rolePanel");
  const mine = feedback?.scope === scope ? feedback : null;
  return (
    <>
      <div role="status" className={mine?.kind === "ok" ? className : ""}>
        {mine?.kind === "ok" && (
          <p className="flex items-start gap-2 rounded-lg border border-accent/30 bg-accent-glow px-4 py-3 text-[0.9375rem] leading-[1.55] text-ink-primary">
            <CheckCircle size={20} weight="fill" aria-hidden="true" className="mt-px shrink-0 text-accent" />
            <span>{t(`success.${mine.code}`, { email: mine.email })}</span>
          </p>
        )}
      </div>
      <div role="alert" className={mine?.kind === "error" ? className : ""}>
        {mine?.kind === "error" && (
          <p className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-[0.9375rem] leading-[1.55] text-red-700 dark:text-red-400">
            <WarningCircle size={20} weight="fill" aria-hidden="true" className="mt-px shrink-0" />
            <span>{t(`errors.${mine.code}`)}</span>
          </p>
        )}
      </div>
    </>
  );
}

/* ── Chip roli ───────────────────────────────────────────────────────────── */

function RoleChip({ role, until, now }: { role: AssignableRole; until: string | null; now: Date }) {
  const t = useTranslations("rolePanel");
  const tr = useTranslations("roles");
  const active = isGrantActive(until, now);
  const left = until && active ? daysLeft(until, now) : null;
  const soon = left !== null && left <= SOON_DAYS;

  if (!active) {
    // Wygasła: wyszarzona i przerywana ramka - widać, że wpis jest, ale nie działa.
    return (
      <li className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border-strong px-2 py-1 font-mono text-[0.75rem] leading-none text-ink-tertiary">
        <span>{tr(role)}</span>{" "}
        <span>
          {t("expired")} {until && formatDate(until)}
        </span>
      </li>
    );
  }
  return (
    <li
      className={`inline-flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-md px-2 py-1 font-mono text-[0.75rem] leading-none ${
        soon ? "bg-amber-500/15 text-amber-900 dark:text-amber-200" : "bg-accent-glow text-accent"
      }`}
    >
      <span>{tr(role)}</span>{" "}
      <span className={soon ? "" : "text-ink-secondary"}>{until ? t("until", { date: formatDate(until) }) : t("noDate")}</span>
      {soon && (
        <>
          {" "}
          <span className="inline-flex items-center gap-1 font-semibold">
            <Clock size={12} weight="bold" aria-hidden="true" />
            {t("expiresIn", { days: left })}
          </span>
        </>
      )}
    </li>
  );
}

/* ── Edytor ról (te same pola przy dodawaniu i edycji) ───────────────────── */

function RoleEditor({
  draft,
  onChange,
  disabled,
  now,
}: {
  draft: Draft;
  onChange: (next: Draft) => void;
  disabled: boolean;
  now: Date;
}) {
  const t = useTranslations("rolePanel");
  const tr = useTranslations("roles");
  const baseId = useId();

  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-ink-tertiary">
        {t("editorLegend")}
      </legend>
      <ul className="mt-3 divide-y divide-border-subtle rounded-lg border border-border-subtle">
        {ASSIGNABLE_ROLES.map((role) => {
          const row = draft[role];
          const checkId = `${baseId}-${role}-on`;
          const dateId = `${baseId}-${role}-until`;
          const hintId = `${baseId}-${role}-hint`;
          const set = (patch: Partial<Draft[AssignableRole]>) => onChange({ ...draft, [role]: { ...row, ...patch } });
          return (
            <li key={role} className="grid grid-cols-[minmax(0,1fr)] gap-x-4 gap-y-2 px-3 py-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-4">
              <label htmlFor={checkId} className="flex min-h-11 cursor-pointer items-center gap-3 text-[0.9375rem] text-ink-primary">
                <input
                  id={checkId}
                  type="checkbox"
                  checked={row.on}
                  onChange={(e) =>
                    // Nowo zaznaczona rola dostaje domyślną datę (najbliższy
                    // 31 maja albo bez daty dla Komisji) - do poprawienia obok.
                    set(e.target.checked ? { on: true, until: row.until || (defaultUntil(role, now) ?? "") } : { on: false })
                  }
                  className="size-5 shrink-0 cursor-pointer accent-[var(--accent)]"
                />
                {tr(role)}
              </label>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <label htmlFor={dateId} className={`text-[0.8125rem] ${row.on ? "text-ink-secondary" : "text-ink-tertiary"}`}>
                  <span className="sr-only">{tr(role)} - </span>
                  {t("validUntil")}
                </label>
                <input
                  id={dateId}
                  type="date"
                  // Ten sam zakres lat, który przyjmuje serwer (isValidDate) -
                  // kalendarz nie podsunie daty, którą zapis i tak by odrzucił.
                  min="2000-01-01"
                  max="2100-12-31"
                  value={row.on ? row.until : ""}
                  disabled={!row.on}
                  aria-describedby={row.on && !row.until ? hintId : undefined}
                  onChange={(e) => set({ until: e.target.value })}
                  className="min-h-11 rounded-lg border border-border-strong bg-bg-surface px-3 font-mono text-[0.875rem] text-ink-primary [color-scheme:light] disabled:cursor-not-allowed disabled:opacity-50 dark:[color-scheme:dark]"
                />
                <button
                  type="button"
                  disabled={!row.on || !row.until}
                  onClick={() => set({ until: "" })}
                  aria-label={t("clearDateFor", { role: tr(role) })}
                  className={`${BTN_GHOST} px-3 text-[0.8125rem]`}
                >
                  {t("clearDate")}
                </button>
              </div>
              {row.on && !row.until && (
                <p id={hintId} className="text-[0.8125rem] leading-[1.5] text-ink-secondary sm:col-span-2">
                  {t("noDateHint")}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

/* ── Pole adresu z dopiskiem domeny ──────────────────────────────────────── */

function EmailField({
  id,
  value,
  onChange,
  disabled,
  inputRef,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  inputRef?: Ref<HTMLInputElement>;
}) {
  const t = useTranslations("rolePanel");
  const hintId = `${id}-hint`;
  return (
    <div>
      <label htmlFor={id} className="block text-[0.9375rem] font-medium text-ink-primary">
        {t("emailLabel")}
      </label>
      <p id={hintId} className="mt-1 text-[0.8125rem] leading-[1.5] text-ink-secondary">
        {t("emailHint")}
      </p>
      {/* Pierścień fokusu na całej ramce (pole + dopisek domeny), nie na samym
          polu - wtedy wygląda jak jedno pole, którym w praktyce jest. */}
      <div className="mt-2 flex min-h-12 max-w-[520px] items-stretch overflow-hidden rounded-lg border border-border-strong bg-bg-surface focus-within:[outline:3px_solid_var(--accent)] focus-within:[outline-offset:3px]">
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="email"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          value={value}
          disabled={disabled}
          aria-describedby={hintId}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent px-3 font-mono text-[0.9375rem] text-ink-primary focus-visible:[outline:none]"
        />
        {!value.includes("@") && (
          <span aria-hidden="true" className="hidden items-center border-l border-border-subtle bg-bg-elevated px-3 font-mono text-[0.8125rem] text-ink-secondary sm:flex">
            {DOMAIN_SUFFIX}
          </span>
        )}
      </div>
      {/* Na wąskim ekranie dopisek domeny w ramce zostawiałby na wpisywanie
          kilka znaków - pokazujemy go pod polem, razem z wpisaną częścią. */}
      {!value.includes("@") && (
        <p aria-hidden="true" className="mt-1.5 font-mono text-[0.75rem] text-ink-tertiary [overflow-wrap:anywhere] sm:hidden">
          {value.trim() || "…"}
          {DOMAIN_SUFFIX}
        </p>
      )}
    </div>
  );
}

/* ── Rozwijany obszar (edytor osoby, formularze) ─────────────────────────── */

/**
 * Wysuwa się w miejscu, w którym kliknięto - wysokość od zera, krótko, krzywą
 * strony (EASE). Przy ograniczonym ruchu pojawia się od razu. Wewnętrzny
 * odstęp chroni pierścień fokusu przed przycięciem przez `overflow: hidden`.
 */
function Reveal({ open, children }: { open: boolean; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={reduce ? { opacity: 1 } : { height: 0, opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1, transition: { duration: 0.28, ease: EASE } }}
          exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { height: 0, opacity: 0, transition: { duration: 0.18, ease: EASE } }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Panel ───────────────────────────────────────────────────────────────── */

type Confirm = { kind: "block" | "remove"; email: string; scope: Scope; focusAfter: () => HTMLElement | null };

export function RolePanel({
  people: initialPeople,
  canWrite,
  missing,
  readError,
  today,
}: {
  people: PersonView[];
  canWrite: boolean;
  missing: string[];
  readError: boolean;
  today: string;
}) {
  const t = useTranslations("rolePanel");
  // Południe UTC tego dnia: `warsawToday` zwróci dokładnie `today` niezależnie
  // od strefy przeglądarki, więc wyliczenia są takie same jak na serwerze.
  const now = new Date(`${today}T12:00:00Z`);

  const [people, setPeople] = useState(initialPeople);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [panel, setPanel] = useState<"add" | "block" | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(() => draftFrom(null));
  const [newEmail, setNewEmail] = useState("");
  const [blockEmail, setBlockEmail] = useState("");
  // Treść okna i jego otwarcie osobno: przy zamykaniu okno jeszcze chwilę
  // znika (przejście CSS) i nie może w tym czasie zrobić się puste.
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const ids = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const blockBtnRef = useRef<HTMLButtonElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);
  const blockInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  /** Przyciski w wierszach po adresie - po zamknięciu edytora czy okna fokus
   *  wraca dokładnie tam, skąd przyszedł. */
  const editBtns = useRef(new Map<string, HTMLButtonElement>());
  const blockBtns = useRef(new Map<string, HTMLButtonElement>());

  const focusLater = (get: () => HTMLElement | null) => requestAnimationFrame(() => get()?.focus());

  // Okno potwierdzenia: natywny <dialog> w trybie modalnym - przeglądarka sama
  // zamyka fokus w oknie, wyłącza resztę strony (inert) i obsługuje Escape.
  // Fokus startowy na „Anuluj”: Enter odruchowo wciśnięty po otwarciu nie
  // może zablokować komuś dostępu.
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (dialogOpen && !d.open) {
      d.showModal();
      cancelRef.current?.focus();
    } else if (!dialogOpen && d.open) {
      d.close();
    }
  }, [dialogOpen]);

  function openConfirm(next: Confirm) {
    setFeedback(null);
    setConfirm(next);
    setDialogOpen(true);
  }

  /** Wywołuje akcję serwera i rozkłada wynik na stan panelu. */
  async function run(scope: Scope, call: () => Promise<RoleActionResult>, success: SuccessCode, email: string, after?: { scope?: Scope; then?: () => void }) {
    setBusy(true);
    setFeedback(null);
    let result: RoleActionResult;
    try {
      result = await call();
    } catch {
      // Akcja nie doszła do serwera albo odpowiedź nie wróciła.
      setFeedback({ scope, kind: "error", code: "network" });
      setBusy(false);
      return false;
    }
    setBusy(false);
    if (!result.ok) {
      setFeedback({ scope, kind: "error", code: result.error });
      return false;
    }
    setPeople(result.people);
    setFeedback({ scope: after?.scope ?? scope, kind: "ok", code: success, email });
    after?.then?.();
    return true;
  }

  const fullEmail = (input: string) => {
    const local = localPart(input);
    return local ? `${local}${DOMAIN_SUFFIX}` : null;
  };

  /* ── Otwieranie / zamykanie ── */

  function togglePanel(which: "add" | "block") {
    setFeedback(null);
    setEditing(null);
    if (panel === which) {
      setPanel(null);
      return;
    }
    setPanel(which);
    if (which === "add") {
      setNewEmail("");
      setDraft(draftFrom(null));
      focusLater(() => addInputRef.current);
    } else {
      setBlockEmail("");
      focusLater(() => blockInputRef.current);
    }
  }

  function toggleEditor(person: PersonView) {
    setFeedback(null);
    setPanel(null);
    if (editing === person.email) {
      setEditing(null);
      return;
    }
    setEditing(person.email);
    setDraft(draftFrom(person));
  }

  function closeEditor(email: string) {
    setEditing(null);
    focusLater(() => editBtns.current.get(email) ?? null);
  }

  /* ── Akcje ── */

  async function submitAdd(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const email = fullEmail(newEmail);
    if (!email) return setFeedback({ scope: "add", kind: "error", code: "email" });
    if (people.some((p) => p.email === email)) return setFeedback({ scope: "add", kind: "error", code: "exists" });
    const grants = grantsFrom(draft);
    if (Object.keys(grants).length === 0) return setFeedback({ scope: "add", kind: "error", code: "noRole" });
    await run("add", () => savePersonRoles(email, grants), "saved", email, {
      scope: "list",
      then: () => {
        setPanel(null);
        focusLater(() => addBtnRef.current);
      },
    });
  }

  async function submitEdit(e: FormEvent, email: string) {
    e.preventDefault();
    if (busy) return;
    const scope: Scope = `row:${email}`;
    const grants = grantsFrom(draft);
    // Odebranie wszystkich ról osobie bez blokady usuwa ją z listy - wtedy
    // komunikat musi stanąć nad listą, bo wiersza już nie będzie.
    const person = people.find((p) => p.email === email);
    const vanishes = Object.keys(grants).length === 0 && !person?.blocked;
    await run(scope, () => savePersonRoles(email, grants), "saved", email, {
      scope: vanishes ? "list" : scope,
      then: () => {
        if (!vanishes) return closeEditor(email);
        setEditing(null);
        focusLater(() => headingRef.current);
      },
    });
  }

  async function unblock(email: string) {
    if (busy) return;
    const person = people.find((p) => p.email === email);
    const vanishes = (person?.grants.length ?? 0) === 0;
    await run(`row:${email}`, () => setPersonBlocked(email, false), "unblocked", email, {
      scope: vanishes ? "list" : `row:${email}`,
      then: () => focusLater(() => (vanishes ? headingRef.current : (blockBtns.current.get(email) ?? null))),
    });
  }

  function submitBlockAddress(e: FormEvent) {
    e.preventDefault();
    const email = fullEmail(blockEmail);
    if (!email) return setFeedback({ scope: "block", kind: "error", code: "email" });
    openConfirm({ kind: "block", email, scope: "block", focusAfter: () => blockInputRef.current });
  }

  async function confirmAction() {
    if (!confirm || !dialogOpen || busy) return;
    const { kind, email, scope } = confirm;
    const ok =
      kind === "block"
        ? await run("list", () => setPersonBlocked(email, true), "blocked", email, {
            scope: scope === "block" ? "list" : scope,
          })
        : await run("list", () => deletePerson(email), "removed", email);
    if (!ok) {
      // Błąd zostaje w oknie (role="alert" poniżej) - decyzja wciąż przed nami.
      return;
    }
    setDialogOpen(false);
    if (kind === "remove") {
      setEditing(null);
      focusLater(() => headingRef.current);
    } else if (scope === "block") {
      setPanel(null);
      focusLater(() => blockBtnRef.current);
    } else {
      focusLater(() => blockBtns.current.get(email) ?? null);
    }
  }

  const dialogError = dialogOpen && feedback?.kind === "error" && feedback.scope === "list" ? feedback : null;

  /* ── Render ── */

  const disabled = !canWrite || busy;
  const headingId = `${ids}-heading`;

  return (
    <section className="section-padding" aria-labelledby={headingId}>
      <div className="mx-auto max-w-[1200px]">
        {/* Stan magazynu: brak konfiguracji albo awaria odczytu. */}
        {readError ? (
          <div role="alert" className="mb-10 flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-500/10 p-5 sm:p-6">
            <WarningCircle size={22} weight="fill" aria-hidden="true" className="mt-0.5 shrink-0 text-red-700 dark:text-red-400" />
            <div>
              <p className="font-semibold text-ink-primary">{t("readErrorHeading")}</p>
              <p className="mt-1 text-[0.9375rem] leading-[1.6] text-ink-secondary">{t("readErrorBody")}</p>
            </div>
          </div>
        ) : (
          missing.length > 0 && (
            <div className="mb-10 rounded-xl border border-dashed border-border-medium bg-bg-surface p-5 sm:p-6">
              <p className="flex items-center gap-2 font-semibold text-ink-primary">
                <WarningCircle size={20} weight="fill" aria-hidden="true" className="shrink-0 text-ink-secondary" />
                {t("notConfiguredHeading")}
              </p>
              <p className="mt-2 max-w-[68ch] text-[0.9375rem] leading-[1.6] text-ink-secondary">{t("notConfiguredBody")}</p>
              <p className="mt-4 flex flex-wrap items-center gap-2 text-[0.875rem] text-ink-secondary">
                <span>{t("missing")}</span>
                {missing.map((name) => (
                  <code key={name} className="rounded-md bg-bg-elevated px-2 py-1 font-mono text-[0.8125rem] text-ink-primary">
                    {name}
                  </code>
                ))}
              </p>
            </div>
          )
        )}

        {/* Nagłówek listy i przyciski główne. */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-accent">
              {t("eyebrow")} <span className="text-ink-tertiary">· {t("count", { count: people.length })}</span>
            </p>
            <h2
              id={headingId}
              ref={headingRef}
              tabIndex={-1}
              className="mt-3 font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
            >
              {t("heading")}
            </h2>
            <p className="mt-3 max-w-[62ch] text-[1.0625rem] leading-[1.7] text-ink-secondary">{t("lead")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              ref={addBtnRef}
              type="button"
              disabled={disabled}
              aria-expanded={panel === "add"}
              aria-controls={`${ids}-add`}
              onClick={() => togglePanel("add")}
              className={`${BTN_PRIMARY} min-h-12 px-5 text-[0.9375rem]`}
            >
              <Plus size={18} weight="bold" aria-hidden="true" />
              {t("addPerson")}
            </button>
            <button
              ref={blockBtnRef}
              type="button"
              disabled={disabled}
              aria-expanded={panel === "block"}
              aria-controls={`${ids}-block`}
              onClick={() => togglePanel("block")}
              className={`${BTN_OUTLINE} min-h-12 px-5 text-[0.9375rem]`}
            >
              <Prohibit size={18} aria-hidden="true" />
              {t("blockAddress")}
            </button>
          </div>
        </div>

        {/* Formularz: nowa osoba. */}
        <div id={`${ids}-add`}>
          <Reveal open={panel === "add"}>
            <form
              onSubmit={submitAdd}
              aria-labelledby={`${ids}-add-h`}
              className="mt-8 rounded-xl border border-border-soft bg-bg-surface p-5 sm:p-6"
            >
              <h3 id={`${ids}-add-h`} className="text-[1.125rem] font-semibold tracking-[-0.01em] text-ink-primary">
                {t("addHeading")}
              </h3>
              {/* Kolumna minmax(0,1fr): bez tego najszersza zawartość (wiersz roli
                  z polem daty) rozpycha siatkę poza formularz na 320 px. */}
              <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-6">
                <EmailField id={`${ids}-add-email`} value={newEmail} onChange={setNewEmail} disabled={busy} inputRef={addInputRef} />
                <RoleEditor draft={draft} onChange={setDraft} disabled={busy} now={now} />
                <LiveFeedback scope="add" feedback={feedback} />
                <div className="flex flex-wrap gap-3">
                  <button type="submit" disabled={disabled} aria-busy={busy} className={BTN_PRIMARY}>
                    {busy ? t("pending") : t("save")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPanel(null);
                      focusLater(() => addBtnRef.current);
                    }}
                    className={BTN_GHOST}
                  >
                    {t("cancel")}
                  </button>
                </div>
              </div>
            </form>
          </Reveal>
        </div>

        {/* Formularz: blokada adresu spoza listy. */}
        <div id={`${ids}-block`}>
          <Reveal open={panel === "block"}>
            <form
              onSubmit={submitBlockAddress}
              aria-labelledby={`${ids}-block-h`}
              className="mt-8 rounded-xl border border-border-soft bg-bg-surface p-5 sm:p-6"
            >
              <h3 id={`${ids}-block-h`} className="text-[1.125rem] font-semibold tracking-[-0.01em] text-ink-primary">
                {t("blockHeading")}
              </h3>
              <p className="mt-1 max-w-[68ch] text-[0.9375rem] leading-[1.6] text-ink-secondary">{t("blockHint")}</p>
              <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-6">
                <EmailField id={`${ids}-block-email`} value={blockEmail} onChange={setBlockEmail} disabled={busy} inputRef={blockInputRef} />
                <LiveFeedback scope="block" feedback={feedback} />
                <div className="flex flex-wrap gap-3">
                  <button type="submit" disabled={disabled} className={`${BTN_DANGER_SOLID} disabled:opacity-50`}>
                    <Prohibit size={18} aria-hidden="true" />
                    {t("blockSubmit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPanel(null);
                      focusLater(() => blockBtnRef.current);
                    }}
                    className={BTN_GHOST}
                  >
                    {t("cancel")}
                  </button>
                </div>
              </div>
            </form>
          </Reveal>
        </div>

        <LiveFeedback scope="list" feedback={dialogOpen ? null : feedback} className="mt-8 block" />

        {/* Lista osób. */}
        {people.length === 0 ? (
          <p className="mt-10 rounded-xl border border-dashed border-border-medium p-6 text-[0.9375rem] leading-[1.6] text-ink-secondary">
            {t("empty")}
          </p>
        ) : (
          <ul className="mt-10 grid gap-4">
            {people.map((person, i) => {
              const open = editing === person.email;
              const scope: Scope = `row:${person.email}`;
              const editorId = `${ids}-edit-${i}`;
              const [local] = person.email.split("@");
              return (
                <li
                  key={person.email}
                  className={`rounded-xl border bg-bg-surface transition-colors duration-150 ${
                    person.blocked ? "border-red-500/40" : open ? "border-border-medium" : "border-border-subtle"
                  }`}
                >
                  <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 gap-4">
                      <span aria-hidden="true" className="hidden pt-0.5 font-mono text-[0.75rem] text-ink-tertiary sm:block">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <p className="font-mono text-[0.9375rem] leading-snug text-ink-primary [overflow-wrap:anywhere]">
                          {local}
                          <span className="text-ink-tertiary">{DOMAIN_SUFFIX}</span>
                        </p>
                        {person.blocked && (
                          <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-red-500/10 px-2 py-1 text-[0.8125rem] font-semibold text-red-700 dark:text-red-400">
                            <Prohibit size={14} weight="bold" aria-hidden="true" />
                            {t("blocked")}
                          </p>
                        )}
                        {person.grants.length > 0 ? (
                          <ul aria-label={t("rolesOf", { email: person.email })} className="mt-3 flex flex-wrap gap-1.5">
                            {person.grants.map((g) => (
                              <RoleChip key={g.role} role={g.role} until={g.until} now={now} />
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-3 font-mono text-[0.75rem] text-ink-tertiary">{t("noRoles")}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:shrink-0 lg:justify-end">
                      <button
                        ref={(el) => {
                          if (el) editBtns.current.set(person.email, el);
                          else editBtns.current.delete(person.email);
                        }}
                        type="button"
                        disabled={disabled}
                        aria-expanded={open}
                        aria-controls={editorId}
                        aria-label={t("editFor", { email: person.email })}
                        onClick={() => toggleEditor(person)}
                        className={BTN_OUTLINE}
                      >
                        <PencilSimple size={16} aria-hidden="true" />
                        {open ? t("close") : t("edit")}
                      </button>
                      <button
                        ref={(el) => {
                          if (el) blockBtns.current.set(person.email, el);
                          else blockBtns.current.delete(person.email);
                        }}
                        type="button"
                        disabled={disabled}
                        aria-label={person.blocked ? t("unblockFor", { email: person.email }) : t("blockFor", { email: person.email })}
                        onClick={() => {
                          if (person.blocked) return void unblock(person.email);
                          openConfirm({
                            kind: "block",
                            email: person.email,
                            scope,
                            focusAfter: () => blockBtns.current.get(person.email) ?? null,
                          });
                        }}
                        className={person.blocked ? BTN_OUTLINE : BTN_DANGER}
                      >
                        {person.blocked ? <ShieldCheck size={16} aria-hidden="true" /> : <Prohibit size={16} aria-hidden="true" />}
                        {person.blocked ? t("unblock") : t("block")}
                      </button>
                    </div>
                  </div>

                  <LiveFeedback scope={scope} feedback={feedback} className="block px-5 pb-5 sm:px-6" />

                  <div id={editorId}>
                    <Reveal open={open}>
                      <form
                        onSubmit={(e) => submitEdit(e, person.email)}
                        aria-label={t("editFor", { email: person.email })}
                        className="border-t border-border-subtle p-5 sm:p-6"
                      >
                        <RoleEditor draft={draft} onChange={setDraft} disabled={busy} now={now} />
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap gap-3">
                            <button type="submit" disabled={disabled} aria-busy={busy} className={BTN_PRIMARY}>
                              {busy ? t("pending") : t("save")}
                            </button>
                            <button type="button" onClick={() => closeEditor(person.email)} className={BTN_GHOST}>
                              {t("cancel")}
                            </button>
                          </div>
                          <button
                            type="button"
                            disabled={disabled}
                            aria-label={t("removeFor", { email: person.email })}
                            onClick={(e) => {
                              const trigger = e.currentTarget;
                              openConfirm({ kind: "remove", email: person.email, scope, focusAfter: () => trigger });
                            }}
                            className={BTN_DANGER}
                          >
                            <Trash size={16} aria-hidden="true" />
                            {t("remove")}
                          </button>
                        </div>
                      </form>
                    </Reveal>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Okno potwierdzenia blokady i usunięcia. */}
      <dialog
        ref={dialogRef}
        aria-labelledby={`${ids}-dlg-h`}
        aria-describedby={`${ids}-dlg-b`}
        onCancel={(e) => {
          // Escape w trakcie zapisu nie może „cofnąć” akcji, która już poszła.
          if (busy) e.preventDefault();
        }}
        onClose={() => {
          // Zamknięcie przez „Anuluj” albo Escape: fokus wraca do przycisku,
          // który otworzył okno. Po udanej akcji `confirmAction` sam decyduje,
          // dokąd go odesłać (przycisk mógł zniknąć razem z wierszem).
          if (!dialogOpen) return;
          setDialogOpen(false);
          // Błąd z okna już przeczytano - po rezygnacji nie powtarzamy go nad listą.
          setFeedback(null);
          const back = confirm?.focusAfter;
          if (back) focusLater(back);
        }}
        className="m-auto w-[min(440px,calc(100vw-2rem))] rounded-2xl border border-border-soft bg-bg-surface p-0 text-ink-primary opacity-100 shadow-2xl shadow-black/20 transition-[opacity,scale,display,overlay] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] transition-discrete backdrop:bg-[rgba(10,13,20,0.55)] not-open:scale-[0.97] not-open:opacity-0 starting:open:scale-[0.97] starting:open:opacity-0 motion-reduce:transition-none"
      >
        {confirm && (
          <div className="p-6">
            <span
              aria-hidden="true"
              className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-500/10 text-red-700 dark:text-red-400"
            >
              {confirm.kind === "block" ? <Prohibit size={22} /> : <Trash size={22} />}
            </span>
            <h2 id={`${ids}-dlg-h`} className="mt-4 font-display text-[1.375rem] font-semibold leading-[1.25] tracking-[-0.01em]">
              {confirm.kind === "block" ? t("dialogBlockTitle") : t("dialogRemoveTitle")}
            </h2>
            <p className="mt-2 font-mono text-[0.875rem] text-accent [overflow-wrap:anywhere]">{confirm.email}</p>
            <div id={`${ids}-dlg-b`} className="mt-3 grid gap-2 text-[0.9375rem] leading-[1.6] text-ink-secondary">
              <p>{confirm.kind === "block" ? t("dialogBlockBody") : t("dialogRemoveBody")}</p>
              {confirm.kind === "block" && <p>{t("dialogBlockRoles")}</p>}
            </div>
            <div role="alert" className={dialogError ? "mt-4" : ""}>
              {dialogError && (
                <p className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-[0.9375rem] leading-[1.55] text-red-700 dark:text-red-400">
                  <WarningCircle size={20} weight="fill" aria-hidden="true" className="mt-px shrink-0" />
                  <span>{t(`errors.${dialogError.code}`)}</span>
                </p>
              )}
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button ref={cancelRef} type="button" disabled={busy} onClick={() => dialogRef.current?.close()} className={BTN_OUTLINE}>
                {t("cancel")}
              </button>
              <button type="button" disabled={busy} aria-busy={busy} onClick={confirmAction} className={BTN_DANGER_SOLID}>
                {busy ? t("pending") : confirm.kind === "block" ? t("dialogBlockConfirm") : t("dialogRemoveConfirm")}
              </button>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
