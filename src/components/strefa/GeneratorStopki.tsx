"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Copy, CheckCircle, WarningCircle, DownloadSimple } from "@phosphor-icons/react";
import {
  buildSignature,
  buildSignaturePlain,
  signatureCardWidth,
  signatureDocument,
  SIGNATURE_DEFAULTS,
  type PreviewMode,
  type SignatureData,
  type SignatureVariant,
} from "@/lib/signature";
import { SignaturePreviews } from "./SignaturePreviews";

/**
 * Generator stopki mailowej dla działaczy.
 *
 * Podgląd stoi w <iframe>, a nie w zwykłym kontenerze: stopka ma własne style
 * wpisane w atrybuty i musi wyglądać dokładnie tak, jak w skrzynce. W drzewie
 * strony przejęłyby ją nasze reguły globalne i podgląd zacząłby kłamać.
 */

interface Props {
  /** Dane z sesji - wstępnie wypełniają formularz. */
  sesja: { name: string; email: string };
  etykiety: {
    heading: string;
    intro: string;
    fieldName: string;
    fieldTitle: string;
    fieldTitleOther: string;
    fieldPhone: string;
    fieldEmail: string;
    fieldWeb: string;
    showInstagram: string;
    showFacebook: string;
    showLinkedin: string;
    previewHeading: string;
    variantLabel: string;
    variantDaily: string;
    variantBulk: string;
    variantBulkHint: string;
    previewModes: Record<PreviewMode, { title: string; note: string }>;
    previewNote: string;
    copy: string;
    copied: string;
    copyError: string;
    download: string;
    howHeading: string;
    howGmail: string;
    howOutlook: string;
    phoneHint: string;
  };
  /** Funkcje do wyboru - przekazane z serwera, żeby nie dublować listy ról. */
  funkcje: string[];
}

type StanKopiowania = "idle" | "copied" | "error";

const WARIANTY: SignatureVariant[] = ["daily", "bulk"];

export function GeneratorStopki({ sesja, etykiety, funkcje }: Props) {
  const id = useId();
  const [dane, setDane] = useState<SignatureData>({
    name: sesja.name,
    title: funkcje[0] ?? "",
    phone: "",
    email: sesja.email,
    web: SIGNATURE_DEFAULTS.web,
    instagram: SIGNATURE_DEFAULTS.instagram,
    facebook: SIGNATURE_DEFAULTS.facebook,
    linkedin: undefined,
  });
  const [wariant, setWariant] = useState<SignatureVariant>("daily");
  const wariantRefs = useRef<Record<SignatureVariant, HTMLButtonElement | null>>({ daily: null, bulk: null });
  const [wlasnaFunkcja, setWlasnaFunkcja] = useState(false);
  const [stan, setStan] = useState<StanKopiowania>("idle");

  useEffect(() => {
    if (stan === "idle") return;
    const t = setTimeout(() => setStan("idle"), 4000);
    return () => clearTimeout(t);
  }, [stan]);

  const html = useMemo(() => buildSignature(dane, wariant), [dane, wariant]);

  // Grupa radiowa: strzałki przełączają wersję i przenoszą fokus (wzorzec ARIA radiogroup).
  const naKlawisz = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    e.preventDefault();
    const nast = WARIANTY[(WARIANTY.indexOf(wariant) + 1) % WARIANTY.length]!;
    setWariant(nast);
    wariantRefs.current[nast]?.focus();
  };

  const ustaw = <K extends keyof SignatureData>(klucz: K, wartosc: SignatureData[K]) =>
    setDane((d) => ({ ...d, [klucz]: wartosc }));

  const przelacz = (klucz: "instagram" | "facebook" | "linkedin", wlacz: boolean) =>
    ustaw(klucz, wlacz ? SIGNATURE_DEFAULTS[klucz] : undefined);

  const kopiuj = async () => {
    try {
      // Dwa formaty naraz: klient pocztowy bierze text/html i zachowuje układ
      // z obrazkami, a edytor tekstu sięga po text/plain - czytelną stopkę
      // tekstem, a nie kod HTML (tak było do 11.2026).
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([buildSignaturePlain(dane)], { type: "text/plain" }),
        }),
      ]);
      setStan("copied");
    } catch {
      // Starsze przeglądarki i każdy kontekst bez uprawnienia do schowka:
      // zaznaczamy treść w ukrytym elemencie i kopiujemy po staremu.
      try {
        const pom = document.createElement("div");
        pom.contentEditable = "true";
        pom.innerHTML = html;
        pom.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0;";
        document.body.appendChild(pom);
        const zakres = document.createRange();
        zakres.selectNodeContents(pom);
        const zazn = window.getSelection();
        zazn?.removeAllRanges();
        zazn?.addRange(zakres);
        const ok = document.execCommand("copy");
        zazn?.removeAllRanges();
        pom.remove();
        setStan(ok ? "copied" : "error");
      } catch {
        setStan("error");
      }
    }
  };

  const pobierz = () => {
    const blob = new Blob([signatureDocument(html)], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = wariant === "bulk" ? "stopka-masowki.html" : "stopka.html";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const pole =
    "min-h-12 w-full rounded-lg border border-border-medium bg-bg-base px-4 text-[0.9375rem] text-ink-primary transition-colors placeholder:text-ink-tertiary focus:border-accent focus:outline-2 focus:outline-offset-2 focus:outline-accent";
  const etykieta = "block text-[0.8125rem] font-medium text-ink-secondary";

  return (
    <section className="section-padding" aria-labelledby={`${id}-h`}>
      <div className="mx-auto max-w-[1200px]">
        <h2
          id={`${id}-h`}
          className="font-display text-[clamp(1.75rem,3.4vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
        >
          {etykiety.heading}
        </h2>
        <p className="prose-constrained mt-4 text-[1.0625rem] leading-[1.75] text-ink-secondary">
          {etykiety.intro}
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-start">
          {/* - formularz - */}
          <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6">
            <div className="grid gap-4">
              <div>
                <label htmlFor={`${id}-n`} className={etykieta}>
                  {etykiety.fieldName}
                </label>
                <input
                  id={`${id}-n`}
                  type="text"
                  value={dane.name}
                  onChange={(e) => ustaw("name", e.target.value)}
                  className={`mt-2 ${pole}`}
                />
              </div>

              <div>
                <label htmlFor={`${id}-f`} className={etykieta}>
                  {etykiety.fieldTitle}
                </label>
                <select
                  id={`${id}-f`}
                  value={wlasnaFunkcja ? "__inna" : dane.title}
                  onChange={(e) => {
                    if (e.target.value === "__inna") {
                      setWlasnaFunkcja(true);
                      ustaw("title", "");
                    } else {
                      setWlasnaFunkcja(false);
                      ustaw("title", e.target.value);
                    }
                  }}
                  className={`mt-2 ${pole}`}
                >
                  {funkcje.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                  <option value="__inna">{etykiety.fieldTitleOther}</option>
                </select>
                {wlasnaFunkcja && (
                  <input
                    type="text"
                    value={dane.title}
                    onChange={(e) => ustaw("title", e.target.value)}
                    autoFocus
                    aria-label={etykiety.fieldTitle}
                    className={`mt-2 ${pole}`}
                  />
                )}
              </div>

              <div>
                <label htmlFor={`${id}-t`} className={etykieta}>
                  {etykiety.fieldPhone}
                </label>
                <input
                  id={`${id}-t`}
                  type="tel"
                  inputMode="tel"
                  value={dane.phone}
                  onChange={(e) => ustaw("phone", e.target.value)}
                  placeholder="500 600 700"
                  className={`mt-2 ${pole}`}
                />
                <p className="mt-1.5 text-[0.75rem] text-ink-tertiary">{etykiety.phoneHint}</p>
              </div>

              <div>
                <label htmlFor={`${id}-e`} className={etykieta}>
                  {etykiety.fieldEmail}
                </label>
                <input
                  id={`${id}-e`}
                  type="email"
                  value={dane.email}
                  onChange={(e) => ustaw("email", e.target.value)}
                  className={`mt-2 ${pole}`}
                />
              </div>

              <div>
                <label htmlFor={`${id}-w`} className={etykieta}>
                  {etykiety.fieldWeb}
                </label>
                <input
                  id={`${id}-w`}
                  type="text"
                  value={dane.web}
                  onChange={(e) => ustaw("web", e.target.value)}
                  className={`mt-2 ${pole}`}
                />
              </div>

              <fieldset className="mt-1 border-t border-border-subtle pt-4">
                <legend className="sr-only">{etykiety.previewHeading}</legend>
                <div className="grid gap-2.5">
                  {(
                    [
                      ["instagram", etykiety.showInstagram, !!dane.instagram],
                      ["facebook", etykiety.showFacebook, !!dane.facebook],
                      ["linkedin", etykiety.showLinkedin, !!dane.linkedin],
                    ] as const
                  ).map(([klucz, tekst, zazn]) => (
                    <label
                      key={klucz}
                      className="flex min-h-11 items-center gap-3 text-[0.875rem] text-ink-secondary"
                    >
                      <input
                        type="checkbox"
                        checked={zazn}
                        onChange={(e) => przelacz(klucz, e.target.checked)}
                        className="h-4 w-4 shrink-0 accent-accent"
                      />
                      {tekst}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>

          {/* - podgląd i działania - */}
          <div>
            <p id={`${id}-v`} className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-tertiary">
              {etykiety.variantLabel}
            </p>
            <div
              role="radiogroup"
              aria-labelledby={`${id}-v`}
              className="mt-3 inline-flex rounded-lg border border-border-medium p-1"
            >
              {WARIANTY.map((w) => (
                <button
                  key={w}
                  ref={(el) => {
                    wariantRefs.current[w] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={wariant === w}
                  tabIndex={wariant === w ? 0 : -1}
                  onClick={() => setWariant(w)}
                  onKeyDown={naKlawisz}
                  className={`min-h-11 rounded-md px-4 text-[0.875rem] font-medium transition-colors ${
                    wariant === w ? "bg-accent text-bg-base" : "text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  {w === "daily" ? etykiety.variantDaily : etykiety.variantBulk}
                </button>
              ))}
            </div>
            {wariant === "bulk" && (
              <p className="mt-3 max-w-[60ch] text-[0.8125rem] leading-[1.55] text-ink-secondary">{etykiety.variantBulkHint}</p>
            )}

            <p className="mt-8 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-tertiary">
              {etykiety.previewHeading}
            </p>
            <SignaturePreviews html={html} labels={etykiety.previewModes} cardWidth={signatureCardWidth(wariant)} />
            <p className="mt-3 text-[0.8125rem] leading-[1.55] text-ink-tertiary">{etykiety.previewNote}</p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={kopiuj}
                className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-accent px-6 text-[0.9375rem] font-medium text-bg-base transition-colors hover:bg-accent-dim"
              >
                {stan === "copied" ? (
                  <CheckCircle size={18} weight="regular" aria-hidden="true" />
                ) : stan === "error" ? (
                  <WarningCircle size={18} weight="regular" aria-hidden="true" />
                ) : (
                  <Copy size={18} weight="regular" aria-hidden="true" />
                )}
                {etykiety.copy}
              </button>
              <button
                type="button"
                onClick={pobierz}
                className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-border-strong px-6 text-[0.9375rem] font-medium text-ink-primary transition-colors hover:border-border-soft hover:bg-bg-surface"
              >
                <DownloadSimple size={18} weight="regular" aria-hidden="true" />
                {etykiety.download}
              </button>
              <p aria-live="polite" className="text-[0.8125rem] text-ink-tertiary">
                {stan === "copied" && etykiety.copied}
                {stan === "error" && (
                  <span className="text-red-600 dark:text-red-400">{etykiety.copyError}</span>
                )}
              </p>
            </div>

            <div className="mt-8 rounded-xl border border-border-subtle bg-bg-surface p-5">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-tertiary">
                {etykiety.howHeading}
              </p>
              <ul className="mt-3 grid gap-2 text-[0.875rem] leading-[1.6] text-ink-secondary">
                <li>{etykiety.howGmail}</li>
                <li>{etykiety.howOutlook}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
