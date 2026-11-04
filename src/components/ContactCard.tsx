import Image from "next/image";
import { EnvelopeSimple, Phone } from "@phosphor-icons/react/dist/ssr";

/**
 * Wizytówka osoby do kontaktu (Rekrutacja, Nasze projekty, Stypendia).
 *
 * Zdjęcia w public/photos/zarzad to portrety 4:5 do pasa. Kadr ma te same
 * proporcje i pokazuje całe zdjęcie, bez przybliżania na twarz (uwaga z 3.11.2026:
 * przybliżone kadry wyglądały źle). `sizes` dwa razy większe od kadru,
 * żeby na ekranach o wysokiej gęstości zdjęcie było ostre.
 */
export function ContactCard({
  label,
  name,
  role,
  email,
  phone,
  photo,
  tone = "light",
  size = "md",
  bare = false,
  className = "",
}: {
  label?: string;
  name: string;
  role: string;
  email?: string;
  /** Numer w zapisie do wyświetlenia, np. „791 876 121” (link tel: z +48). */
  phone?: string;
  photo?: string;
  tone?: "light" | "dark";
  /** Bez własnej ramki - gdy karta stoi już w obramowanym bloku. */
  bare?: boolean;
  /** „lg” - główny kontakt strony (np. Współpraca): większy portret i nazwisko. */
  size?: "md" | "lg";
  className?: string;
}) {
  const dark = tone === "dark";
  const lg = size === "lg";
  // flex + w-fit: e-mail i telefon jeden pod drugim, każdy klikalny tylko na swojej długości.
  const linkCls = `mt-1 flex w-fit min-h-11 max-w-full items-center gap-1.5 text-[0.875rem] font-semibold underline underline-offset-4 ${
    dark ? "text-white decoration-white/40 hover:decoration-white" : "text-accent decoration-accent/30 hover:decoration-accent"
  }`;
  return (
    <div
      className={`flex items-center gap-5 sm:gap-6 ${
        bare ? "" : `rounded-2xl border p-4 sm:p-5 ${dark ? "border-white/15 bg-white/[0.06]" : "border-border-medium bg-bg-surface"}`
      } ${dark ? "text-white" : "text-ink-primary"} ${className}`}
    >
      {photo ? (
        <span
          className={`relative shrink-0 overflow-hidden rounded-xl ${lg ? "h-[125px] w-[100px] sm:h-[200px] sm:w-[160px]" : "h-[125px] w-[100px] sm:h-[170px] sm:w-[136px]"} ${
            dark ? "bg-white/10" : "bg-bg-elevated"
          }`}
        >
          <Image
            src={photo}
            alt={`${name} - ${role}`}
            fill
            sizes={lg ? "(min-width: 640px) 320px, 240px" : "(min-width: 640px) 272px, 200px"}
            quality={90}
            className="object-cover object-top"
          />
        </span>
      ) : null}
      <div className="min-w-0">
        {label ? (
          <p className={`text-[0.8125rem] font-semibold ${dark ? "text-[#9eb1ff]" : "text-accent"}`}>{label}</p>
        ) : null}
        <p className={`font-display font-semibold leading-[1.2] ${lg ? "text-[1.375rem] sm:text-[1.625rem]" : "text-[1.25rem] sm:text-[1.375rem]"} ${label ? "mt-1.5" : ""}`}>{name}</p>
        <p className={`mt-1 text-[0.875rem] leading-[1.45] ${dark ? "text-white/72" : "text-ink-secondary"}`}>{role}</p>
        {email ? (
          <a href={`mailto:${email}`} className={linkCls}>
            <EnvelopeSimple size={16} aria-hidden="true" className="shrink-0" />
            {/* Łamanie najpierw po „@”. `anywhere` tnie w środku słowa tylko
                wtedy, gdy sama część przed „@” nie mieści się obok zdjęcia
                (np. 320 px) - inaczej cała strona przewijała się w bok. */}
            <span className="min-w-0 [overflow-wrap:anywhere]">
              {email.split("@")[0]}@<wbr />
              {email.split("@")[1]}
            </span>
          </a>
        ) : null}
        {phone ? (
          <a href={`tel:+48${phone.replace(/\s/g, "")}`} className={linkCls}>
            <Phone size={16} aria-hidden="true" className="shrink-0" />
            <span className="whitespace-nowrap">{phone}</span>
          </a>
        ) : null}
      </div>
    </div>
  );
}
