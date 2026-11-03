"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, CaretDown, ShieldCheck, SignOut } from "@phosphor-icons/react";
import { Link, usePathname } from "@/i18n/navigation";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { EASE } from "@/lib/motion";
import { ACCOUNT_HINT_ATTR, ACCOUNT_HINT_KEY } from "@/lib/account-hint";
// Sam typ: access.ts działa tylko na serwerze (czyta magazyn ról), a `import
// type` znika przy kompilacji, więc nic z niego nie trafia do paczki klienta.
import type { MeResponse } from "@/lib/access";

/* ── Stan konta: jeden na całą stronę ─────────────────────────────────────
 *
 * Przycisk stoi w nawigacji dwa razy (desktop i pasek mobilny). Gdyby każdy
 * egzemplarz trzymał własny stan, pytałyby /api/auth/me dwa razy i mogłyby
 * się rozjechać. Dlatego stan żyje w module, a komponenty go subskrybują.
 */

/** Ostatnio znane konto - tyle, ile trzeba, żeby narysować przycisk. */
type Hint = { name: string; picture?: string };
type AccountState = { hint: Hint | null; me: MeResponse | null };

const HINT_KEY = ACCOUNT_HINT_KEY;
const SERVER_STATE: AccountState = { hint: null, me: null };

/** null = localStorage jeszcze nieprzeczytany (czytamy leniwie, tylko w przeglądarce). */
let state: AccountState | null = null;
const listeners = new Set<() => void>();
let inflight: Promise<void> | null = null;

function readHint(): Hint | null {
  try {
    const raw = localStorage.getItem(HINT_KEY);
    if (!raw) return null;
    const v: unknown = JSON.parse(raw);
    if (typeof v !== "object" || v === null) return null;
    const { name, picture } = v as Record<string, unknown>;
    if (typeof name !== "string" || !name.trim()) return null;
    return { name, picture: typeof picture === "string" ? picture : undefined };
  } catch {
    // Tryb prywatny, zablokowane dane witryny albo śmieci w kluczu - bez
    // podpowiedzi przycisk po prostu poczeka na odpowiedź serwera.
    return null;
  }
}

/**
 * Atrybut na <html>, który skrypt w <head> ustawia przed pierwszym malowaniem
 * (src/lib/account-hint.ts). Musi iść w parze z podpowiedzią: gdy zostałby
 * po wylogowaniu, CSS dalej chowałby link „Zaloguj się”.
 */
function markHint(on: boolean) {
  document.documentElement.toggleAttribute(ACCOUNT_HINT_ATTR, on);
}

function writeHint(hint: Hint | null) {
  markHint(Boolean(hint));
  try {
    if (hint) localStorage.setItem(HINT_KEY, JSON.stringify(hint));
    else localStorage.removeItem(HINT_KEY);
  } catch {
    // Jak wyżej - podpowiedź to wygoda, nie warunek działania.
  }
}

/**
 * Do formularzy wylogowania (menu konta i przycisk w panelu Strefy).
 * Podpowiedź kasujemy już przy wysłaniu: po przekierowaniu strona ładuje się
 * od nowa i bez tego przez chwilę - do odpowiedzi /api/auth/me - pokazałaby
 * avatar z zieloną kropką komuś, kto właśnie się wylogował.
 */
export function clearAccountHint() {
  writeHint(null);
}

function getSnapshot(): AccountState {
  if (state === null) state = { hint: readHint(), me: null };
  return state;
}

function setState(next: AccountState) {
  state = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Pyta serwer o konto. Oba egzemplarze montują się w tym samym kroku, więc
 * wspólna obietnica „w locie” wystarcza, żeby poszło jedno żądanie. Po jego
 * zakończeniu cache znika: ponowne zamontowanie nawigacji (pełne wejście na
 * stronę) ma zapytać jeszcze raz, bo to zapytanie przedłuża sesję.
 */
function refresh(): Promise<void> {
  if (inflight) return inflight;
  inflight = fetch("/api/auth/me", { cache: "no-store", credentials: "same-origin" })
    .then(async (res) => {
      // Treść czytamy ZAWSZE, także przy 401/503. Nieodczytana odpowiedź
      // zostaje w Chromium „w toku” - strona nigdy nie osiąga bezczynności
      // sieci (zmierzone: żądanie wisiało 15 s+, testy a11y czekające na
      // `networkidle` padały na limicie czasu).
      const text = await res.text();
      // 204 = brak ciasteczka sesji (gość), 401 = zły/wygasły token albo
      // blokada. Dla przycisku to jedno i to samo: nikt nie jest zalogowany.
      if (res.status === 401 || res.status === 204) {
        // Podpowiedź kłamałaby przy następnym wejściu.
        writeHint(null);
        setState({ hint: null, me: null });
        return;
      }
      // 503 (magazyn ról chwilowo niedostępny) i inne błędy: nie wiemy nic
      // nowego, więc zostawiamy to, co już widać. Wylogowanie z powodu awarii
      // byłoby gorsze niż chwilowo nieaktualne role.
      if (!res.ok) return;
      const me = JSON.parse(text) as MeResponse;
      if (typeof me?.name !== "string" || !Array.isArray(me.roles)) return;
      const hint: Hint = { name: me.name, picture: me.picture };
      writeHint(hint);
      setState({ hint, me });
    })
    .catch(() => {
      // Brak sieci - jak przy 503.
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/**
 * Zasiewa stan konta danymi, które serwer już zna - wołane przez stronę
 * Strefy Działacza (tam ląduje callback logowania Google), PODCZAS jej
 * renderu w przeglądarce.
 *
 * Po co: przy pierwszym logowaniu na danym urządzeniu nie ma podpowiedzi
 * w localStorage, więc bez tego w rogu stałby „Zaloguj się” aż do odpowiedzi
 * /api/auth/me, a potem skok do szerszego przycisku konta.
 *
 * Dlaczego w renderze, a nie w efekcie: to najwcześniejszy moment, w którym
 * strona ma te dane w przeglądarce. Nawigacja hydratuje się z wariantem
 * serwerowym (więc HTML się zgadza - bez błędu hydratacji), a zaraz potem
 * `useSyncExternalStore` porównuje go z `getSnapshot()`. Gdy nawigacja i treść
 * hydratują się w jednym przebiegu, stan jest zasiany już przed tym
 * porównaniem i przycisk konta wchodzi w tym samym cyklu co podpowiedź
 * z localStorage. Gdy treść hydratuje się później (osobna granica Suspense),
 * nawigację budzi powiadomienie z mikrozadania - i tak bez czekania na sieć.
 *
 * Zasady:
 * - na serwerze nic nie robi (stan modułu byłby wspólny dla wszystkich
 *   odwiedzających - wyciek cudzego konta);
 * - działa tylko, gdy stan jest jeszcze pusty: wiedza z /api/auth/me
 *   (w tym role) ma pierwszeństwo, a ponowny render strony niczego nie psuje;
 * - słuchaczy powiadamia dopiero w mikrozadaniu: wywołanie setState innego
 *   komponentu w trakcie renderu to błąd Reacta (przy przejściu klienckim
 *   nawigacja już subskrybuje magazyn).
 */
export function primeAccount(user: { name: string; picture?: string }) {
  if (typeof window === "undefined") return;
  const current = getSnapshot();
  if (current.hint || current.me) return;
  const hint: Hint = { name: user.name, picture: user.picture };
  writeHint(hint);
  state = { hint, me: null };
  queueMicrotask(() => listeners.forEach((l) => l()));
}

/**
 * Sam odczyt „czy ktoś jest zalogowany” - dla rozwijanego menu na telefonie.
 * Bez pytania serwera: robi to już przycisk konta w pasku, a menu montuje się
 * przy każdym otwarciu i każde otwarcie wysyłałoby nowe żądanie.
 */
export function useSignedIn(): boolean {
  const s = useSyncExternalStore(subscribe, getSnapshot, () => SERVER_STATE);
  return Boolean(s.me ?? s.hint);
}

function useAccount(): AccountState {
  // Serwer nie zna localStorage ani ciasteczka sesji (strony są statyczne),
  // więc renderuje wariant „niezalogowany” - razem ze szkieletem przycisku
  // konta, który CSS pokazuje zamiast „Zaloguj się”, gdy skrypt w <head>
  // znalazł podpowiedź. Zaraz po hydratacji React przełącza się na podpowiedź
  // z localStorage (prawdziwy przycisk w miejscu szkieletu) - bez czekania na
  // sieć, więc przycisk nie skacze drugi raz, gdy przyjdzie odpowiedź.
  const s = useSyncExternalStore(subscribe, getSnapshot, () => SERVER_STATE);
  useEffect(() => {
    // Skrypt w <head> i readHint sprawdzają podpowiedź tak samo, ale gdyby
    // się rozjechały (np. ktoś ręcznie zmienił localStorage między nimi),
    // atrybut bez podpowiedzi zostawiłby szkielet zamiast „Zaloguj się” aż do
    // odpowiedzi serwera - a przy awarii sieci na zawsze.
    const now = getSnapshot();
    if (!now.hint && !now.me) markHint(false);
    void refresh();
  }, []);
  return s;
}

/* ── Avatar ─────────────────────────────────────────────────────────────── */

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? "")
    .join("")
    .toUpperCase();
}

function Avatar({ name, picture, size }: { name: string; picture?: string; size: 32 | 44 }) {
  const [failed, setFailed] = useState(false);
  const showImage = picture && !failed;
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#2C4BFF,#0E1F7A)] font-semibold text-white"
    >
      {showImage ? (
        // Zwykły <img>, nie next/image: zdjęcie leży na serwerach Google, a
        // optymalizator Next musiałby je pobierać i trzymać u nas. `no-referrer`,
        // bo Google odrzuca część takich żądań z obcym nagłówkiem Referer.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={picture}
          alt=""
          width={size}
          height={size}
          referrerPolicy="no-referrer"
          decoding="async"
          draggable={false}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className={size === 44 ? "text-[0.9375rem]" : "text-[0.75rem]"}>{initials(name)}</span>
      )}
      {/* Cienka wewnętrzna obwódka: jasne zdjęcie nie zlewa się z białym tłem. */}
      <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/10" />
    </span>
  );
}

/** Avatar 32 px z zieloną kropką „zalogowano”. Obwódka kropki ma kolor tła przycisku. */
function AvatarWithDot({ name, picture }: { name: string; picture?: string }) {
  return (
    <span className="relative shrink-0">
      <Avatar key={picture ?? ""} name={name} picture={picture} size={32} />
      <span
        aria-hidden="true"
        className="absolute -bottom-px -right-px h-2 w-2 rounded-full bg-[#16A34A] ring-2 ring-bg-surface transition-shadow duration-150 group-hover:ring-bg-elevated group-aria-expanded:ring-bg-elevated"
      />
    </span>
  );
}

/** "2027-05-31" → "31.05.2027" bez Date - żadnych przesunięć stref czasowych. */
function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return d && m && y ? `${d}.${m}.${y}` : iso;
}

/* ── Przycisk i menu ────────────────────────────────────────────────────── */

export function AccountMenu({ variant }: { variant: "desktop" | "mobile" }) {
  const { hint, me } = useAccount();
  const t = useTranslations("account");
  const tr = useTranslations("roles");
  const tn = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const panelId = useId();
  const rolesId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Menu pamięta trasę, na której je otwarto. Po przejściu gdzie indziej
  // `open` samo staje się fałszem - bez efektu, który ustawiałby stan po
  // renderze.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const close = () => setOpenOn(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpenOn(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenOn(null);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const name = me?.name ?? hint?.name;
  const picture = me ? me.picture : hint?.picture;

  if (!name) {
    // Niezalogowany: na desktopie dokładnie dotychczasowy przycisk, na
    // telefonie nic - link logowania jest w rozwijanym menu.
    //
    // Obok stoi szkielet przycisku konta, domyślnie ukryty. Gdy skrypt
    // w <head> znalazł podpowiedź (atrybut `data-konto` na <html>), CSS
    // w globals.css chowa link i pokazuje szkielet - zalogowany działacz nie
    // widzi „Zaloguj się” ani skoku szerokości przed hydratacją. Szkielet ma
    // te same klasy i zawartość co prawdziwy przycisk (krąg 32 px zamiast
    // avatara), więc zajmuje co do piksela to samo miejsce. Bez animacji:
    // stoi tylko chwilę, a pulsowanie przy ograniczonym ruchu i tak by znikło.
    // Ukryty przed czytnikiem - to obraz zastępczy, nie kontrolka.
    if (variant === "mobile") {
      return (
        <span
          aria-hidden="true"
          data-konto-szkielet="mobile"
          className="konto-szkielet h-11 w-11 shrink-0 items-center justify-center"
        >
          <span className="h-8 w-8 rounded-full bg-bg-elevated" />
        </span>
      );
    }
    return (
      <>
        <Link
          href="/strefa-dzialacza"
          className="konto-login hidden h-11 items-center rounded-md border border-border-strong bg-transparent px-5 text-[0.875rem] font-medium text-ink-primary transition-colors hover:border-border-soft hover:bg-bg-elevated xl:flex"
        >
          {tn("login")}
        </Link>
        <span
          aria-hidden="true"
          data-konto-szkielet="desktop"
          className="konto-szkielet h-11 items-center gap-2.5 rounded-md border border-border-strong pl-1.5 pr-3 text-[0.875rem] font-medium text-ink-primary"
        >
          <span className="h-8 w-8 shrink-0 rounded-full bg-bg-elevated" />
          <span className="whitespace-nowrap">{t("strefa")}</span>
          <CaretDown size={12} weight="bold" className="text-ink-tertiary" />
        </span>
      </>
    );
  }

  const label = t("buttonLabel", { name });
  const desktop = variant === "desktop";

  return (
    <div
      ref={wrapRef}
      // Desktop: menu wisi pod przyciskiem. Mobile: wrapper celowo BEZ
      // `relative`, więc menu ustawia się względem całego paska (header jest
      // `fixed`) i trzyma 16 px od prawej krawędzi ekranu - pod samym
      // avatarem 300 px panelu wyszłoby za lewą krawędź na 320 px.
      className={desktop ? "relative hidden xl:block" : "xl:hidden"}
      onBlur={(e) => {
        // Zamykamy dopiero, gdy fokus przeszedł na INNY element strony.
        // Klik w tekst wewnątrz menu też zdejmuje fokus (relatedTarget = null),
        // a to nie powód, żeby menu znikało - kliknięcia poza obsługuje mousedown.
        const next = e.relatedTarget as Node | null;
        if (next && !wrapRef.current?.contains(next)) close();
      }}
    >
      <button
        ref={btnRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        // Na desktopie widoczny napis musi być częścią nazwy dostępnej (WCAG
        // 2.5.3) - ktoś sterujący głosem powie „kliknij Strefa Działacza”.
        aria-label={desktop ? `${t("strefa")} - ${label}` : label}
        onClick={() => setOpenOn(open ? null : pathname)}
        className={
          desktop
            ? "group flex h-11 cursor-pointer items-center gap-2.5 rounded-md border border-border-strong bg-transparent pl-1.5 pr-3 text-[0.875rem] font-medium text-ink-primary transition-colors hover:border-border-soft hover:bg-bg-elevated aria-expanded:border-border-soft aria-expanded:bg-bg-elevated"
            : "group flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-bg-elevated aria-expanded:bg-bg-elevated"
        }
      >
        <AvatarWithDot name={name} picture={picture} />
        {desktop && (
          <>
            <span className="whitespace-nowrap">{t("strefa")}</span>
            <CaretDown
              size={12}
              weight="bold"
              aria-hidden="true"
              className="text-ink-tertiary transition-transform duration-200 ease-out group-aria-expanded:rotate-180"
            />
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            // Panel rośnie z prawego górnego rogu - od strony przycisku - i
            // tylko odrobinę (0,97), bo skala od zera wygląda jak wyskakujące
            // okienko. Wyjście krótsze: decyzja zapadła, nie ma na co czekać.
            // Przy ograniczonym ruchu zostaje samo przenikanie.
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.16, ease: EASE } }}
            exit={
              reduce
                ? { opacity: 0, transition: { duration: 0.1 } }
                : { opacity: 0, scale: 0.97, transition: { duration: 0.11, ease: EASE } }
            }
            style={{ transformOrigin: "top right" }}
            className={`absolute top-full z-50 mt-2 overflow-hidden rounded-xl border border-border-soft bg-bg-surface shadow-xl shadow-black/10 ${
              desktop ? "right-0 w-[300px]" : "right-4 w-[min(300px,calc(100vw-2rem))]"
            }`}
          >
            <div className="flex items-center gap-3 border-b border-border-subtle p-4">
              <Avatar key={picture ?? ""} name={name} picture={picture} size={44} />
              <div className="min-w-0">
                <p className="text-[0.9375rem] font-semibold leading-snug text-ink-primary [overflow-wrap:anywhere]">
                  {name}
                </p>
                {me?.email && (
                  <p className="mt-0.5 font-mono text-[0.71875rem] leading-snug text-ink-tertiary [overflow-wrap:anywhere]">
                    {me.email}
                  </p>
                )}
              </div>
            </div>

            {me && me.roles.length > 0 && (
              <div className="border-b border-border-subtle px-4 py-3">
                <p
                  id={rolesId}
                  className="font-mono text-[0.65625rem] uppercase tracking-[0.08em] text-ink-tertiary"
                >
                  {t("yourRoles")}
                </p>
                <ul aria-labelledby={rolesId} className="mt-2 flex flex-wrap gap-1.5">
                  {me.roles.map(({ role, until }) => (
                    <li
                      key={role}
                      className="rounded-md bg-accent-glow px-2 py-1 font-mono text-[0.6875rem] leading-none text-accent"
                    >
                      <span>{tr(role)}</span>
                      {/* Prawdziwa spacja, nie sam margines - inaczej czytnik
                          ekranu skleja „Zarząddo 31.05.2027”. */}
                      {until && (
                        <>
                          {" "}
                          <span className="ml-0.5 text-ink-secondary">
                            {t("until", { date: formatDate(until) })}
                          </span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <ul className="p-1.5">
              <li>
                <Link
                  href="/strefa-dzialacza"
                  onClick={close}
                  className="flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 text-[0.875rem] text-ink-primary transition-colors hover:bg-bg-elevated"
                >
                  {t("panel")}
                  <ArrowRight size={14} weight="regular" aria-hidden="true" className="text-ink-tertiary" />
                </Link>
              </li>
              {me?.isSuperadmin && (
                <li>
                  <Link
                    href="/strefa-dzialacza/role"
                    onClick={close}
                    className="flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 text-[0.875rem] text-accent transition-colors hover:bg-bg-elevated"
                  >
                    {t("rolesAccess")}
                    <ShieldCheck size={16} weight="regular" aria-hidden="true" />
                  </Link>
                </li>
              )}
              <li className="mt-1.5 border-t border-border-subtle pt-1.5">
                {/* POST, nie link: GET-em dałoby się wylogować kogoś obcą stroną. */}
                <form
                  method="post"
                  action={`/api/auth/logout?locale=${locale}`}
                  // Podpowiedź kasujemy od razu - po przekierowaniu strona
                  // nie może choćby przez chwilę pokazać konta.
                  onSubmit={clearAccountHint}
                >
                  <button
                    type="submit"
                    className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 text-left text-[0.875rem] text-red-700 transition-colors hover:bg-bg-elevated dark:text-red-400"
                  >
                    {t("logout")}
                    <SignOut size={16} weight="regular" aria-hidden="true" />
                  </button>
                </form>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
