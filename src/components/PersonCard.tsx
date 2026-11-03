"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, EnvelopeSimple } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { InitialsAvatar } from "./InitialsAvatar";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export interface PersonCardProps {
  name: string;
  role: string;
  /** Zdjęcie - gdy brak, slot pokazuje inicjały. */
  photo?: string;
  email?: string;
  /** Dodatkowe wiersze (np. kierunki prodziekana) - lista pod legitymacją. */
  meta?: string[];
  /** Większy podpis (np. Przewodniczący). */
  featured?: boolean;
  /** Czysta karta bez chromu legitymacji - dla organów spoza Samorządu (władze Uczelni, dziekani, RUSS). */
  plain?: boolean;
  /** Odnośnik do podstrony obszaru tej osoby (np. Filia). Tylko wariant ze zdjęciem. */
  link?: { href: string; label: string };
  className?: string;
}

/**
 * Karta osoby z Samorządu: portret 4:5 na całą kartę, podpis (funkcja mono
 * i nazwisko) na granatowym gradiencie u dołu, jak w magazynie. Zastąpiła
 * „legitymację” z paskiem, hologramem i kodem kreskowym (feedback 3.11.2026).
 *
 * E-mail na urządzeniach z kursorem wysuwa się po najechaniu albo po wejściu
 * klawiaturą (focus-within); na dotykowych jest widoczny od razu. Osoba bez
 * zdjęcia dostaje to samo pole z inicjałami na granatowym tle - siatka się
 * nie rozjeżdża. Tekst zawsze na ciemnym tle, więc kontrast nie zależy od zdjęcia.
 */
export function PersonCard({
  name,
  role,
  photo,
  email,
  meta,
  featured,
  plain,
  link,
  className,
}: PersonCardProps) {
  const reduce = useReducedMotion();
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

  const reveal = "grid grid-rows-[1fr] opacity-100 transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)]:grid-rows-[0fr] [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:grid-rows-[1fr] [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:grid-rows-[1fr] [@media(hover:hover)]:group-focus-within:opacity-100 motion-reduce:transition-none";

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={reduce ? { duration: 0 } : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative isolate aspect-[4/5] min-w-0 overflow-hidden rounded-2xl bg-[#0d1633] ${className ?? ""}`}
    >
      {photo ? (
        <Image
          src={photo}
          alt=""
          fill
          sizes={featured ? "(min-width: 1024px) 420px, 100vw" : "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"}
          className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] motion-reduce:transform-none"
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 flex items-start justify-end bg-[radial-gradient(120%_90%_at_100%_0%,#2c4bff_0%,#16246b_55%,#0d1633_100%)] p-6">
          <span className="font-display text-[clamp(3.5rem,9vw,6rem)] font-semibold leading-none tracking-[-0.04em] text-white/20">{initials(name)}</span>
        </div>
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[64%] bg-[linear-gradient(to_top,rgba(7,12,30,0.94)_0%,rgba(9,16,40,0.62)_42%,rgba(9,16,40,0)_100%)]"
      />
      <div className="absolute inset-x-0 bottom-0 p-5 text-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 motion-reduce:transform-none sm:p-6">
        <p className="font-mono text-[0.6875rem] uppercase leading-[1.45] tracking-[0.08em] text-white/80">{role}</p>
        <h3 className={`mt-1.5 text-balance font-display font-semibold leading-[1.12] tracking-[-0.02em] ${featured ? "text-[clamp(1.75rem,3vw,2.25rem)]" : "text-[1.5rem]"}`}>
          {name}
        </h3>
        {(email || link) && (
          <div className={reveal}>
            <div className="min-h-0 overflow-hidden">
              <div className="flex flex-col items-start gap-1 pt-3">
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex min-h-8 max-w-full items-center gap-1.5 text-[0.8125rem] font-medium text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white"
                  >
                    <EnvelopeSimple size={14} aria-hidden="true" className="shrink-0" />
                    <span className="min-w-0">
                      {email.split("@")[0]}@<wbr />
                      {email.split("@")[1]}
                    </span>
                  </a>
                )}
                {link && (
                  <Link
                    href={link.href}
                    className="group/link inline-flex min-h-8 items-center gap-1.5 text-[0.8125rem] font-medium text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white"
                  >
                    {link.label}
                    <ArrowRight size={14} weight="bold" aria-hidden="true" className="transition-transform duration-200 group-hover/link:translate-x-0.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.article>
  );
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}
