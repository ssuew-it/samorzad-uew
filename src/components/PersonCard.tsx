"use client";

import Image from "next/image";
import { ArrowRight, EnvelopeSimple } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { InitialsAvatar } from "./InitialsAvatar";
import { TERM } from "@/lib/term";

export interface PersonCardProps {
  name: string;
  role: string;
  /** Zdjęcie - gdy brak, slot pokazuje inicjały. */
  photo?: string;
  email?: string;
  /** Dodatkowe wiersze (np. kierunki prodziekana) - lista pod legitymacją. */
  meta?: string[];
  /** Numer na legitymacji (np. pozycja w składzie). */
  no?: number;
  /** Etykieta paska u góry. */
  org?: string;
  /** Większy nagłówek (np. Przewodnicząca). */
  featured?: boolean;
  /** Czysta karta bez chromu legitymacji - dla organów spoza Samorządu (władze Uczelni, dziekani, RUSS). */
  plain?: boolean;
  /** Odnośnik do podstrony obszaru tej osoby (np. Filia). Tylko wariant legitymacji. */
  link?: { href: string; label: string };
  className?: string;
}

/**
 * Sygnatura strony: karta osoby jako wyrafinowana „legitymacja" -
 * pasek mono u góry, zdjęcie/inicjały, numer i dane w monospace, hologram
 * (jedyny błysk - animuje się tylko na hover) oraz pasek-kod na dole.
 */
export function PersonCard({
  name,
  role,
  photo,
  email,
  meta,
  no,
  org = "Samorząd Studentów UEW",
  featured,
  plain,
  link,
  className,
}: PersonCardProps) {
  // Wariant czysty - organy spoza Samorządu (władze Uczelni, dziekani, RUSS).
  if (plain) {
    return (
      <div
        className={`flex min-w-0 flex-col rounded-xl border border-border-subtle bg-bg-surface p-5 transition-colors duration-150 hover:border-border-soft ${className ?? ""}`}
      >
        <div className="flex items-center gap-4">
          {photo ? (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border-subtle">
              <Image src={photo} alt={`${name} - ${role}`} fill sizes="64px" className="object-cover" />
            </div>
          ) : (
            <InitialsAvatar name={name} size={56} />
          )}
          <div className="min-w-0">
            <h3 className="font-display text-[1.0625rem] font-semibold tracking-[-0.01em] text-ink-primary">
              {name}
            </h3>
            <p className="mt-1 text-[0.875rem] leading-[1.5] text-ink-secondary">{role}</p>
            {email && (
              <a
                href={`mailto:${email}`}
                className="mt-1.5 inline-flex items-center gap-1.5 break-all text-[0.8125rem] text-ink-secondary transition-colors hover:text-accent"
              >
                <EnvelopeSimple size={14} weight="regular" aria-hidden="true" />
                {email}
              </a>
            )}
          </div>
        </div>
        {meta && meta.length > 0 && (
          <ul className="mt-4 flex flex-col gap-0.5 border-t border-border-subtle pt-4">
            {meta.map((m) => (
              <li key={m} className="text-[0.8125rem] leading-[1.4] text-ink-secondary">
                {m}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <article
      className={`group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 motion-reduce:transform-none ${className ?? ""}`}
    >
      {/* Pasek mono */}
      <div className="flex items-center justify-between gap-3 bg-accent px-4 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-bg-base">
        <span className="truncate">{org}</span>
        <span className="shrink-0">{TERM}</span>
      </div>

      {/* Korpus */}
      <div className="relative flex items-center gap-4 p-4">
        <div className="relative h-[104px] w-[84px] shrink-0 overflow-hidden rounded-lg border border-border-subtle bg-bg-elevated">
          {photo ? (
            <Image src={photo} alt={`${name} - ${role}`} fill sizes="84px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <InitialsAvatar name={name} size={52} />
            </div>
          )}
        </div>

        <div className="min-w-0">
          {no != null && (
            <p className="font-mono text-[11px] tracking-[0.04em] text-accent">
              Nº {String(no).padStart(2, "0")}
            </p>
          )}
          <h3
            className={`mt-0.5 font-display ${featured ? "text-[1.6rem]" : "text-[1.25rem]"} font-extrabold leading-[1.05] tracking-[-0.03em] text-ink-primary`}
          >
            {name}
          </h3>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-secondary">
            {role}
          </p>
          {email && (
            <a
              href={`mailto:${email}`}
              className="mt-2 inline-flex items-center gap-1.5 break-all text-[0.8125rem] text-ink-secondary transition-colors hover:text-accent"
            >
              <EnvelopeSimple size={14} weight="regular" aria-hidden="true" />
              {email}
            </a>
          )}
        </div>

        {/* Hologram - jedyny błysk, animuje się tylko na hover */}
        <span
          aria-hidden="true"
          className="pc-holo absolute right-4 top-4 h-8 w-8 rounded-md border border-white/40"
        />
      </div>

      {/* Meta (np. kierunki) */}
      {meta && meta.length > 0 && (
        <ul className="flex flex-col gap-0.5 border-t border-border-subtle px-4 py-3">
          {meta.map((m) => (
            <li key={m} className="text-[0.8125rem] leading-[1.4] text-ink-secondary">
              {m}
            </li>
          ))}
        </ul>
      )}

      {link && (
        <div className="border-t border-border-subtle px-4 py-2">
          <Link
            href={link.href}
            className="group/link inline-flex min-h-8 items-center gap-1.5 text-[0.8125rem] font-medium text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
          >
            {link.label}
            <ArrowRight
              size={14}
              weight="bold"
              aria-hidden="true"
              className="transition-transform duration-200 group-hover/link:translate-x-0.5"
            />
          </Link>
        </div>
      )}

      {/* Pasek-kod */}
      <div className="mt-auto border-t border-dashed border-border-subtle px-4 py-2 font-mono text-[10px] tracking-[0.16em] text-ink-tertiary">
        ||||·||·|||·|··||·· UEW·WROC·§
      </div>
    </article>
  );
}
