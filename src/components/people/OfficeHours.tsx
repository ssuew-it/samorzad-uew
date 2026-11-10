"use client";

/**
 * Wspólne klocki kart osób spoza Samorządu (Dziekan i Prodziekani, Władze
 * Uczelni): portret 4:5, kontakt i dyżur z plakietką „dziś / trwa / najbliższy”.
 */
import Image from "next/image";
import { useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { EnvelopeSimple, MapPin, Phone, VideoCamera } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { InitialsAvatar } from "../InitialsAvatar";
import { campusMapHref } from "@/lib/campus";
import { dutyStatus, shortTime, type DutyStatus, type Dyzur } from "@/lib/dyzury";

/**
 * Minuta jako liczba: stabilna migawka dla useSyncExternalStore. Na serwerze
 * i przy hydratacji `null`, więc plakietka dyżuru pojawia się dopiero
 * w przeglądarce, w czasie polskim (bez rozjazdu HTML-a z serwera).
 */
function subscribeMinute(onChange: () => void) {
  const id = window.setInterval(onChange, 20_000);
  return () => window.clearInterval(id);
}
const minuteStamp = () => Math.floor(Date.now() / 60_000);
export function useNow(): Date | null {
  const stamp = useSyncExternalStore(subscribeMinute, minuteStamp, () => null);
  return stamp === null ? null : new Date(stamp * 60_000);
}

export function Portrait({ photo, name, role, className, sizes }: { photo?: string; name: string; role: string; className: string; sizes: string }) {
  return (
    <div className={`relative aspect-[4/5] shrink-0 overflow-hidden rounded-xl border border-border-subtle bg-bg-elevated ${className}`}>
      {photo ? (
        <Image src={photo} alt={`${name} - ${role}`} fill sizes={sizes} className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <InitialsAvatar name={name} size={56} />
        </div>
      )}
    </div>
  );
}

export function EmailLink({ email, small }: { email: string; small?: boolean }) {
  return (
    <a
      href={`mailto:${email}`}
      className={`mt-2 inline-flex min-h-8 items-center gap-1.5 break-all text-ink-secondary transition-colors hover:text-accent ${small ? "text-[0.8125rem]" : "text-[0.9375rem]"}`}
    >
      <EnvelopeSimple size={small ? 14 : 16} aria-hidden="true" className="shrink-0" />
      {email}
    </a>
  );
}

export function PhoneLink({ phone, small }: { phone: string; small?: boolean }) {
  return (
    <a
      href={`tel:+48${phone.replace(/\s/g, "")}`}
      className={`inline-flex min-h-8 items-center gap-1.5 text-ink-secondary transition-colors hover:text-accent ${small ? "text-[0.8125rem]" : "text-[0.9375rem]"}`}
    >
      <Phone size={small ? 14 : 16} aria-hidden="true" className="shrink-0" />
      {phone}
    </a>
  );
}

/** Godziny dyżuru, miejsce z linkiem do mapy i plakietka „dziś / trwa / najbliższy”. */
export function Duty({ slots, now, compact }: { slots: Dyzur[]; now: Date | null; compact?: boolean }) {
  const t = useTranslations("dziekani.duty");
  const locale = useLocale();
  const days = t.raw("days") as string[];
  const status = now ? dutyStatus(slots, now) : null;

  if (slots.length === 0) {
    return <p className="mt-5 text-[0.875rem] text-ink-secondary">{t("none")}</p>;
  }

  return (
    <div className={compact ? "mt-5" : "mt-6"}>
      {/* Miejsce zarezerwowane, żeby plakietka nie przesuwała treści po załadowaniu. */}
      <div className="min-h-7">{status && <StatusBadge status={status} days={days} locale={locale} />}</div>
      <dl className="mt-3 grid gap-3">
        {slots.map((s, i) => {
          const place = s.building && s.room ? t("place", { building: s.building, room: s.room }) : s.building ? t("building", { building: s.building }) : s.room ? t("room", { room: s.room }) : null;
          const mapHref = campusMapHref(s.building, s.room);
          return (
            <div key={`${s.weekday}-${s.from}-${i}`}>
              <dt className={i === 0 ? "text-[0.8125rem] font-semibold text-ink-primary" : "sr-only"}>{t("label")}</dt>
              <dd className={`${compact ? "text-[0.9375rem]" : "text-[1.0625rem]"} text-ink-primary`}>
                {days[s.weekday - 1]}, {shortTime(s.from)}-{shortTime(s.to)}
              </dd>
              {(place || s.teams) && (
                <dd className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.875rem] text-ink-secondary">
                  {place &&
                    (mapHref ? (
                      <Link
                        href={mapHref}
                        aria-label={`${place}. ${t("mapLink", { building: s.building ?? "" })}`}
                        className="group/map inline-flex min-h-8 items-center gap-1.5 font-medium text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
                      >
                        <MapPin size={15} weight="fill" aria-hidden="true" className="transition-transform duration-200 ease-out group-hover/map:-translate-y-0.5 motion-reduce:transform-none" />
                        {place}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={15} aria-hidden="true" />
                        {place}
                      </span>
                    ))}
                  {s.teams && (
                    <span className="inline-flex items-center gap-1.5">
                      <VideoCamera size={15} aria-hidden="true" />
                      {t("teams")}
                    </span>
                  )}
                </dd>
              )}
              {s.note && (
                <dd className="mt-2 max-w-[44ch] text-pretty text-[0.875rem] leading-[1.6] text-ink-secondary">
                  {locale === "en" ? s.note.en : s.note.pl}
                </dd>
              )}
            </div>
          );
        })}
      </dl>
    </div>
  );
}

function StatusBadge({ status, days, locale }: { status: DutyStatus; days: string[]; locale: string }) {
  const t = useTranslations("dziekani.duty.status");
  const nextText = (n: { slot: Dyzur; date: string; inDays: number }) => {
    if (n.inDays === 1) return t("tomorrow", { from: shortTime(n.slot.from) });
    // Za ponad tydzień (np. po odwołanym dyżurze) dopisujemy datę, żeby
    // „wtorek” nie znaczył tego najbliższego.
    const day = n.inDays >= 7
      ? `${days[n.slot.weekday - 1]} ${new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "pl-PL", { day: "numeric", month: "numeric", timeZone: "UTC" }).format(new Date(`${n.date}T12:00:00Z`))}`
      : days[n.slot.weekday - 1];
    return t("next", { day, from: shortTime(n.slot.from) });
  };

  const base = "inline-flex min-h-7 items-center gap-2 rounded-full px-3 text-[0.8125rem] font-medium leading-none animate-[duty-in_320ms_cubic-bezier(0.16,1,0.3,1)_both] motion-reduce:animate-none";

  if (status.kind === "now") {
    return (
      <span className={`${base} bg-accent text-bg-base`}>
        <span aria-hidden="true" className="relative flex h-2 w-2">
          {/* Trzy fale przy pojawieniu się, potem spokój - stan „trwa” niesie kropka i tekst,
              nie niekończący się puls (audyt antislop nr 001, pkt 14). */}
          <span className="absolute inline-flex h-full w-full animate-[ping_1s_cubic-bezier(0,0,0.2,1)_3] rounded-full bg-bg-base/70 opacity-0 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-bg-base" />
        </span>
        {t("now", { to: shortTime(status.slot.to) })}
      </span>
    );
  }
  if (status.kind === "today") {
    return (
      <span className={`${base} border border-accent/50 bg-accent-glow text-accent`}>
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
        {t("today", { from: shortTime(status.slot.from), to: shortTime(status.slot.to) })}
      </span>
    );
  }
  if (status.kind === "cancelledToday") {
    return (
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className={`${base} border border-border-strong text-ink-primary`}>{t("cancelled")}</span>
        {status.next && <span className="text-[0.8125rem] text-ink-secondary">{nextText(status.next)}</span>}
      </span>
    );
  }
  return <span className={`${base} bg-bg-elevated text-ink-secondary`}>{nextText(status)}</span>;
}
