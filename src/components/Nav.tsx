"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Sun, Moon, List, X, CaretDown, ArrowSquareOut, MagnifyingGlass } from "@phosphor-icons/react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { NavDropdown, type NavChild } from "./NavDropdown";
import { SearchCommand } from "./SearchCommand";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { recruitments } from "@/lib/recruitment";

export function Nav() {
  const { setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();
  const t = useTranslations("nav");
  const ta = useTranslations("ui.aria");
  const tm = useTranslations("navMenu");

  const dlaStudenta: NavChild[] = [
    { label: tm("strefa"), href: "/dla-studenta" },
    { label: tm("prawa"), href: "/prawa-studenta" },
    { label: tm("stypendia"), href: "/stypendia" },
    { label: tm("prawo"), href: "/prawo-dla-studenta" },
    { label: tm("infopacki"), href: "/infopacki" },
    { label: tm("rzecznik"), href: "/rzecznik-praw-studenta" },
    { label: tm("mapa"), href: "/mapa-kampusu" },
    { label: tm("pomoc"), href: "/pomoc-psychologiczna" },
    { label: tm("organizacje"), href: "/organizacje-studenckie" },
    { label: tm("wydawnictwo"), href: "/wydawnictwo" },
    { label: tm("kalendarz"), href: "/kalendarz" },
  ];

  // „O nas” zbiera dawną „Naszą działalność” i „Strukturę Samorządu” - wcześniej
  // dwie pozycje menu prowadziły pod ten sam adres. Rekrutacja pojawia się
  // tylko wtedy, gdy trwa nabór: bez niego strona to sam komunikat „brak”.
  const samorzad: NavChild[] = [
    { label: tm("onas"), href: "/o-nas" },
    { label: tm("groupOrgans"), heading: true },
    { label: tm("przewodniczacy"), href: "/zarzad" },
    { label: tm("russ"), href: "/rada-uczelniana-samorzadu-studentow" },
    { label: tm("skw"), href: "/studencka-komisja-wyborcza" },
    { label: tm("filia"), href: "/filia-jelenia-gora" },
    { label: tm("groupDocs"), heading: true },
    { label: tm("transparentnosc"), href: "/transparentnosc" },
    { label: tm("regulacje"), href: "/regulacje-wewnetrzne" },
    { label: tm("zarzadzenia"), href: "/zarzadzenia-przewodniczacego" },
    { label: tm("groupActivity"), heading: true },
    { label: tm("projekty"), href: "/nasze-projekty" },
    { label: tm("fuePsrp"), href: "/fue-i-psrp" },
    ...(recruitments.length > 0 ? [{ label: tm("rekrutacja"), href: "/rekrutacja" }] : []),
  ];

  // „Współpraca” to jedna strona (Partnerzy razem z formami współpracy),
  // więc zwykły link zamiast rozwijanej listy z jedną pozycją.
  const directLinks = [
    { label: t("wspolpraca"), href: "/partnerzy" },
    { label: t("kontakt"), href: "/kontakt" },
  ];
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();

  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // SSR-safe theme guard (next-themes): render theme-dependent UI only after mount.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // Po przejściu na układ desktopowy ukryte menu nie może blokować strony.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const closeOnDesktop = () => {
      if (desktop.matches) {
        setMobileOpen(false);
        setMobileSection(null);
      }
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

  // Global ⌘K / Ctrl+K opens site search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Mobile menu: scroll lock, Esc to close, focus trap, focus restore.
  useEffect(() => {
    if (!mobileOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        return;
      }
      if (e.key !== "Tab" || !menuRef.current) return;
      const focusable = menuRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        toggleRef.current?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        toggleRef.current?.focus();
      } else if (document.activeElement === toggleRef.current) {
        e.preventDefault();
        if (e.shiftKey) last.focus();
        else first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused?.getClientRects().length) previouslyFocused.focus();
    };
  }, [mobileOpen]);

  const toggleTheme = () =>
    setTheme(resolvedTheme === "dark" ? "light" : "dark");

  const matchesAny = (items: NavChild[]) =>
    items.some(
      (it) =>
        !it.external &&
        !!it.href &&
        it.href.startsWith("/") &&
        !it.href.startsWith("/#") &&
        it.href !== "/" &&
        pathname.startsWith(it.href),
    );

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileSection(null);
  };

  const mobileGroups = [
    { label: t("student"), items: dlaStudenta },
    { label: t("samorzad"), items: samorzad },
  ];

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300"
      // Pasek ma pełne tło także przed przewinięciem. Wcześniej był u góry
      // przezroczysty, co zakładało, że pod nim zawsze jest jasna strona - a
      // wystarczyła podstrona z ciemnym hero, żeby linki (pomalowane pod jasne
      // tło) wylądowały na granacie z kontrastem 1,88:1 przy wymaganych 4,5:1.
      //
      // Półprzezroczystość tego nie ratuje: kolor akcentu ma na czystej bieli
      // 4,6:1, czyli ledwie przechodzi, więc każde domieszanie ciemnego tła
      // spycha go poniżej progu (przy 82% wychodziło 4,12:1). Zmienia się
      // tylko obramowanie - pojawia się po przewinięciu.
      style={{
        backgroundColor: "var(--bg-surface)",
        backdropFilter: "blur(12px)",
        borderBottom: scrolled
          ? "1px solid var(--border-subtle)"
          : "1px solid transparent",
      }}
    >
      <nav
        aria-label={ta("mainNav")}
        className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-6"
      >
        <Link
          href="/"
          aria-label={ta("brandHome")}
          className="relative h-10 w-40 shrink-0"
        >
            <Image
              src="/logo-dark.svg"
              alt={ta("brandAlt")}
              fill
              sizes="160px"
              className="object-contain object-left dark:hidden"
              priority
            />
            <Image
              src="/logo-light.svg"
              alt=""
              aria-hidden="true"
              fill
              sizes="160px"
              className="hidden object-contain object-left dark:block"
            />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-7 xl:flex">
          <NavDropdown label={t("student")} items={dlaStudenta} active={matchesAny(dlaStudenta)} />
          <NavDropdown label={t("samorzad")} items={samorzad} active={matchesAny(samorzad)} />
          {directLinks.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <li key={link.href} className="relative">
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-block py-1 text-[0.75rem] font-medium uppercase tracking-[0.08em] transition-colors ${
                    active ? "text-accent" : "text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  {link.label}
                </Link>
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-accent"
                  />
                )}
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1 sm:gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden h-11 items-center gap-2 rounded-lg border border-border-strong px-3 text-[0.8125rem] font-medium text-ink-secondary transition-colors hover:border-border-soft hover:bg-bg-elevated xl:flex"
            aria-label={t("search")}
          >
            <MagnifyingGlass size={16} weight="regular" aria-hidden="true" />
            {t("search")}
            <kbd className="rounded border border-border-soft px-1 py-0.5 text-[0.625rem] text-ink-tertiary">⌘K</kbd>
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-secondary xl:hidden"
            aria-label={t("search")}
          >
            <MagnifyingGlass size={20} weight="regular" aria-hidden="true" />
          </button>

          {/*
            Przełącznik pojawia się dopiero po zamontowaniu, bo przed nim nie
            wiadomo, który motyw jest wybrany - inaczej byłby błąd hydracji albo
            mignięcie złej ikony.

            Miejsce na niego jest jednak REZERWOWANE od pierwszej klatki.
            Wcześniej `{mounted && <button/>}` nie zajmowało nic, a po
            zamontowaniu 44 px plus odstęp - zmierzone: cała prawa grupa paska
            przeskakiwała o 56 px w poziomie w trakcie ładowania.
          */}
          <div className="hidden items-center gap-3 xl:flex">
          {mounted ? (
            <button
              onClick={toggleTheme}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-bg-elevated hover:text-ink-primary"
              aria-label={
                resolvedTheme === "dark" ? ta("themeLight") : ta("themeDark")
              }
            >
              {resolvedTheme === "dark" ? (
                <Sun size={20} weight="regular" aria-hidden="true" />
              ) : (
                <Moon size={20} weight="regular" aria-hidden="true" />
              )}
            </button>
          ) : (
            <span className="h-11 w-11 shrink-0" aria-hidden="true" />
          )}

          <LanguageSwitcher />
          </div>

          <Link
            href="/strefa-dzialacza"
            className="hidden h-11 items-center rounded-md border border-border-strong bg-transparent px-5 text-[0.875rem] font-medium text-ink-primary transition-colors hover:border-border-soft hover:bg-bg-elevated xl:flex"
          >
            {t("login")}
          </Link>

          <button
            ref={toggleRef}
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-secondary xl:hidden"
            aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? (
              <X size={24} weight="regular" aria-hidden="true" />
            ) : (
              <List size={24} weight="regular" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            ref={menuRef}
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-border-subtle bg-bg-surface px-6 pb-8 pt-4 xl:hidden"
          >
            <nav aria-label={ta("mobileNav")}>
              <ul className="flex flex-col gap-1">
                {mobileGroups.map((group) => {
                  const isOpen = mobileSection === group.label;
                  return (
                    <li key={group.label} className="border-b border-border-subtle py-1">
                      <button
                        type="button"
                        onClick={() =>
                          setMobileSection(isOpen ? null : group.label)
                        }
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between py-3 text-[0.9375rem] font-semibold text-ink-primary"
                      >
                        {group.label}
                        <CaretDown
                          size={16}
                          weight="bold"
                          aria-hidden="true"
                          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.ul
                            initial={reduce ? false : { height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            {group.items.map((item) => (
                              <li key={item.href ?? item.label}>
                                {item.heading ? (
                                  <p className="px-3 pb-1 pt-3 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">
                                    {item.label}
                                  </p>
                                ) : item.external ? (
                                  <a
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={closeMobile}
                                    className="flex items-center justify-between gap-2 py-2.5 pl-3 text-[0.875rem] text-ink-secondary transition-colors hover:text-ink-primary"
                                  >
                                    {item.label}
                                    <ArrowSquareOut size={14} weight="regular" aria-hidden="true" className="text-ink-tertiary" />
                                  </a>
                                ) : (
                                  <Link
                                    href={item.href ?? "/"}
                                    onClick={closeMobile}
                                    className="block py-2.5 pl-3 text-[0.875rem] text-ink-secondary transition-colors hover:text-ink-primary"
                                  >
                                    {item.label}
                                  </Link>
                                )}
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}

                {directLinks.map((link) => (
                  <li key={link.href} className="border-b border-border-subtle">
                    <Link
                      href={link.href}
                      onClick={closeMobile}
                      aria-current={pathname.startsWith(link.href) ? "page" : undefined}
                      className={`block py-3.5 text-[0.9375rem] font-semibold transition-colors ${
                        pathname.startsWith(link.href)
                          ? "text-accent"
                          : "text-ink-primary hover:text-accent"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}

                <li className="pt-4">
                  <Link
                    href="/strefa-dzialacza"
                    onClick={closeMobile}
                    className="inline-flex h-11 items-center rounded-md border border-border-strong px-5 text-[0.875rem] font-medium text-ink-primary"
                  >
                    {t("login")}
                  </Link>
                </li>
              </ul>
              <div className="mt-6 flex items-center gap-4 border-t border-border-subtle pt-4">
          {mounted ? (
            <button
              onClick={toggleTheme}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-bg-elevated hover:text-ink-primary"
              aria-label={
                resolvedTheme === "dark" ? ta("themeLight") : ta("themeDark")
              }
            >
              {resolvedTheme === "dark" ? (
                <Sun size={20} weight="regular" aria-hidden="true" />
              ) : (
                <Moon size={20} weight="regular" aria-hidden="true" />
              )}
            </button>
          ) : (
            <span className="h-11 w-11 shrink-0" aria-hidden="true" />
          )}

          <LanguageSwitcher />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchCommand open={searchOpen} onClose={() => setSearchOpen(false)} />
    </motion.header>
  );
}
