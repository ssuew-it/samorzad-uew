# DESIGN.md — SSUEW Website

> Design brief for Claude Code. Every decision here is final unless overridden in conversation.
> Last updated: 2026-06-18

---

## 1. Product context

**What it is:** Official website of Samorząd Studentów Uniwersytetu Ekonomicznego we Wrocławiu (SSUEW) — the student government of Wrocław University of Economics.

**What it replaces:** A flat, no-design Wix site at samorzad.ue.wroc.pl — structurally adequate, visually nonexistent.

**Two layers:**
- **Public site** — marketing + informational. Audience: current students, incoming freshmen, university administration, external partners and recruiters.
- **Internal panel** — authenticated area for student government members (Zarząd + komisje). Auth via Google Workspace OAuth, restricted to the Samorząd domain.

**Register:** Brand (design IS the product). The site must stand out in a sea of generic Polish university pages.

---

## 2. Design dials

```
DESIGN_VARIANCE:  7   (distinctive but legible — not agency chaos)
MOTION_INTENSITY: 6   (purposeful reveals + hero animation; not decoration-everywhere)
VISUAL_DENSITY:   4   (generous whitespace, editorial rhythm)
```

---

## 3. Aesthetic direction

**One-line read:** Premium-institutional editorial — the confidence of a law firm's annual report, the motion of a well-funded European NGO's launch site, built on a clean blue-and-white identity with a precise typographic hierarchy (dark mode available).

**The "wow" is in restraint executed perfectly, not in effects stacked on effects.**

**North-star principle — "per-page soul":** Every subpage must have a *soul* — its motion and any interactive widget must arise from what that page is *for*, never decoration bolted on top. The test for any animation or tool: does it come from the function of this page? If it would work just as well on any other page, it is decoration — cut it. Examples: the szczegóły of a person morph (not fade) into their detail view; legal pages get a `§` scroll-spy that aids reading; the scholarship page gets a threshold meter the student drives; the psychological-support page *slows down* with an ambient breathing pacer. Substance is the wow.

What this means in practice:
- Blue & white (light) as default — the institution's identity, matching the logo. Dark mode available via toggle. Both must feel intentional, not inverted.
- Large, slow, precise typography in the hero. The headline is a statement, not a tagline.
- One animated signature element per section — not scattered micro-interactions.
- Generous vertical rhythm. Sections breathe. Content earns its space.
- Institutional seriousness without bureaucratic coldness.

**Anti-references (do not default to these):**
- Generic SaaS purple gradient + card grid
- Glassmorphism everywhere
- Warm cream + terracotta serif (AI-generated default)
- Student union clipart / flat icons everywhere
- Confetti / celebration animations

**Positive references:**
- 21st.dev/community/components — especially Shaders, Scroll Areas, Text effects, Heroes
- Editorial typography of high-end European university redesigns
- Linear.app (motion timing, whitespace)
- Stripe (institutional credibility + technical precision)

---

## 4. Color tokens

> Identity: **blue & white**, matching the Samorząd logo. Accent = institutional blue. Neutrals are cool-shifted (slate) to pair with blue. `src/app/globals.css` is the live source of exact values.

### Light mode (default)

```css
--bg-base:       #F6F8FC   /* Cool near-white */
--bg-surface:    #FFFFFF
--bg-elevated:   #EDF2FA
--bg-subtle:     #DEE6F2

--ink-primary:   #0B1322   /* Slate-near-black */
--ink-secondary: #475467
--ink-tertiary:  #98A2B3

--accent:        #2C4BFF   /* Electric institutional blue (de-generic, 2026-06 — away from Tailwind blue-700). ~5.9:1 on white. */
--accent-dim:    #1F3AE0   /* Hover state for accent elements */
--accent-glow:   rgba(44, 75, 255, 0.10)

--border-subtle: rgba(11, 19, 34, 0.06)
--border-soft:   rgba(11, 19, 34, 0.10)
--border-medium: rgba(11, 19, 34, 0.16)
```

### Dark mode

```css
--bg-base:       #0A0D14   /* Cool near-black */
--bg-surface:    #111623
--bg-elevated:   #19202F
--bg-subtle:     #232C3E

--ink-primary:   #EEF2F8
--ink-secondary: #9BA6B7
--ink-tertiary:  #5C6678

--accent:        #6C84FF   /* Lighter electric blue for contrast on dark */
--accent-dim:    #6578F2   /* (2026-07: rozjaśnione z #4D63F0 — kontrast WCAG 1.4.3 dla tekstu na hover) */
--accent-glow:   rgba(108, 132, 255, 0.14)

--border-subtle: rgba(255, 255, 255, 0.06)
--border-soft:   rgba(255, 255, 255, 0.10)
--border-medium: rgba(255, 255, 255, 0.16)
```

**Color rule:** Blue (`--accent`) is used exactly where authority and identity need to land — logo mark, active nav indicator, section eyebrows, CTA, key stat callouts, aurora hero. Nowhere else.

---

## 5. Typography

> **Direction shifted 2026-06 (de-generic audit, frontend-design skill):** away from the templated Playfair+Inter pairing toward a **technical/digital** system. Display & body are now **Archivo** (engineered grotesk, heavy weights for headings); **JetBrains Mono** carries data, metadata and `§`-markers. Inter/Playfair retired.

### Typeface stack

```css
/* Display — large headlines, hero, section titles. Heavy weights: 600 / 700 / 800 */
font-family: 'Archivo', system-ui, sans-serif;

/* Body — all prose, nav, cards, UI copy. Weight 400 / 500 */
font-family: 'Archivo', system-ui, sans-serif;

/* Mono — data, metadata, §-markers, small labels */
font-family: 'JetBrains Mono', 'Fira Code', monospace;
```

Load via `next/font` (vars `--font-archivo`, `--font-jbm`) — never a `<link>` to Google Fonts in production.

### Type scale

```
display-xl:  clamp(3rem, 6vw, 5.25rem)   / Archivo 800 — hero title only (tracking -0.045em)
display-lg:  clamp(2.5rem, 5vw, 4rem)    / Archivo 600 — section heroes
display-md:  clamp(1.75rem, 3vw, 2.5rem) / Archivo 600 — card / subsection titles
heading-md:  1.125rem / Archivo 600       — card headings
body-lg:     1.0625rem / Archivo 400      — lead paragraphs, line-height 1.75
body-md:     0.9375rem / Archivo 400      — standard body, line-height 1.7
body-sm:     0.8125rem / Archivo 400      — captions, metadata
label:       0.75rem / Archivo 500        — nav items, tags, uppercase labels
data:        0.8125rem / JetBrains Mono   — stats, codes, §-markers
```

**Caps:** `text-transform: uppercase` only on `label` class items ≤ 4 words (nav, section eyebrows, badges). Never on body copy.

**Letter-spacing:**
- Display: `letter-spacing: -0.02em`
- Headings: `letter-spacing: -0.01em`
- Labels (uppercase): `letter-spacing: 0.08em`

**Line length cap:** `max-width: 68ch` on all prose blocks.

---

## 6. Spacing scale

Based on 4px base unit. Use only these values:

```
2px  4px  8px  12px  16px  24px  32px  48px  64px  96px  128px  192px
```

Section padding (vertical): `96px` desktop, `64px` tablet, `48px` mobile.
Section padding (horizontal): `max(24px, calc((100vw - 1200px) / 2))` — content maxes at 1200px.

---

## 7. Layout

**Max content width:** `1200px` centered.
**Grid:** CSS Grid, 12-column at desktop, 4-column at mobile.
**Breakpoints:**

```
sm:  640px
md:  768px
lg:  1024px
xl:  1200px
```

**Nav:** Sticky, transparent on scroll-top, transitions to `--bg-surface` with `backdrop-filter: blur(12px)` on scroll. Logo left, navigation center (desktop) / hamburger (mobile), dark/light toggle + "Zaloguj się" button right.

**No sidebar layout** on public site. Single-column editorial flow with varying section widths for rhythm.

---

## 8. Motion

**Library:** `motion` (formerly Framer Motion) — import from `motion/react`.

**Global timing:**
```
ease-out: cubic-bezier(0.16, 1, 0.3, 1)   /* All entrance animations */
ease-in:  cubic-bezier(0.7, 0, 0.84, 0)   /* Exit animations */
```

**Animation budget per section:**
- One entrance animation (content fades/slides up on scroll entry)
- One ambient animation (hero only — particle field, shader, or slow text morph)
- Hover micro-interactions on interactive elements

**Rules:**
- Animate only `transform` and `opacity` unless there's a strong reason
- `@media (prefers-reduced-motion: reduce)` — all animations off, instant transitions
- No bounce, no elastic easing
- Stagger delays on lists: `0.05s` per item, max 5 items staggered (rest instant)
- Scroll-triggered reveals: threshold `0.15` (element 15% visible before triggering)

**Hero animation (signature element):**
A slow, subtle animated background — either a WebGL shader (via 21st.dev shader components) or a CSS-driven gradient orb system. Must work without JS (CSS fallback). Moves at `~0.3x` parallax speed on scroll. Ambient only — does not react to mouse.

---

## 9. Component conventions

### Buttons

```
Primary:   bg --accent, text --bg-base, border none
           hover: bg --accent-dim, slight scale(0.98)

Outline:   bg transparent, border 1px --border-medium, text --ink-primary
           hover: bg --bg-elevated, border --border-soft

Ghost:     no bg, no border, text --ink-secondary
           hover: text --ink-primary

Size-md:   height 40px, padding 0 20px, border-radius 6px, font-size 0.875rem
Size-lg:   height 48px, padding 0 28px, border-radius 8px, font-size 1rem
```

### Cards

```
bg: --bg-surface
border: 1px solid --border-subtle
border-radius: 12px
padding: 24px
hover: border-color --border-soft, bg --bg-elevated
transition: all 150ms ease-out
```

No drop shadows. Depth via border opacity, not shadow.

### Section eyebrows

Small uppercase label above a section heading:

```
font-size: 0.75rem
font-weight: 500
letter-spacing: 0.08em
text-transform: uppercase
color: --accent
margin-bottom: 12px
```

### Dark/light toggle

Animated sun/moon icon swap. Position: top-right nav area. Use `next-themes` for SSR-safe persistence. System preference detected on first visit; user override stored in `localStorage`.

---

## 10. Page structure — public site

### `/` — Strona główna

```
[Nav — sticky, transparent → solid on scroll]

[Hero]
  Background: animated shader or gradient orbs (see motion §8)
  Headline: display-xl Playfair Display — "Reprezentujemy studentów UEW"
  Subheadline: body-lg Inter — mission statement 1–2 sentences
  CTA row: Primary "Poznaj nas" + Ghost "Strefa studenta →"
  Scroll indicator: animated chevron

[O nas — 2-column]
  Left: large display-lg number stat block (e.g. 3000+ studentów, 12 komisji)
  Right: prose description of SSUEW role, gold accent left-border on pull quote

[Wyróżnione projekty — horizontal scroll or 3-col grid]
  3–5 cards: project name, komisja tag, 1-line description, status badge

[Zarząd / Władze]
  Asymmetric grid of member cards: photo, name, role
  Section eyebrow: "Zarząd SSUEW"

[Kalendarz wydarzeń]
  Simple upcoming events list — date, name, type tag
  CTA to full calendar or social media

[Kontakt + Stopka]
  Address: ul. Kamienna 44, Budynek L, pok. 110, 53-307 Wrocław
  Email: kontakt@samorzad.ue.wroc.pl
  Social: TikTok, Facebook, LinkedIn, Instagram
  Links: Regulaminy, Polityka prywatności, Strefa działacza
```

### `/dla-studenta` — Strefa studenta

Informational hub: Prawa studenta, Stypendia, Mapa kampusu, Władze, Rzecznik, Infopacki.

### `/nasza-dzialalnosc` — Samorząd

Struktura, RUSS, Regulacje wewnętrzne, Nasze projekty, Filia Jelenia Góra.

### `/partnerzy` — Współprace

Partnerzy, Kontakt dla firm/organizacji.

### `/kontakt`

Formularz + mapa + dane.

### `/strefa-dzialacza` (authenticated)

Panel wewnętrzny — dostęp tylko dla zalogowanych działaczy. Auth: Google Workspace OAuth.
**Status: panel zaimplementowany; konfiguracja Google OAuth i odbiór opisane w docs/PRZED-STARTEM.md.**

---

## 11. Brand assets

- **Logo:** SVG dostarczone przez Mikołaja. Wersja: pozioma czarna + pozioma biała (do dark mode). Nie modyfikować proporcji, nie dodawać efektów.
- **Kolory brandowe:** Niebieski (#2C4BFF light / #5B9DF9 dark) jako główny kolor identyfikacyjny — zgodny z logo. Biel jako tło. (Wcześniej złoto — zmienione na życzenie.)
- **Nie ma:** oficjalnej palety rozszerzonej, firmowych czcionek narzuconych przez uczelnię.

---

## 12. Tech stack

```
Framework:    Next.js 15 (App Router, Server Components)
Styling:      Tailwind CSS v4
Animation:    motion/react (Framer Motion)
Auth:         Google Workspace OAuth (panel wewnętrzny)
DB:           No dedicated database; Google Workspace integrations
Fonts:        next/font (Archivo display+body + JetBrains Mono data)
Icons:        @phosphor-icons/react (outline, strokeWidth 1.5)
Theme:        next-themes (dark/light toggle, SSR-safe)
Hosting:      TBD — Vercel (preferowane) lub uczelniany ssFTP (zależy od odpowiedzi IT)
Components:   Własne + inspiracja z 21st.dev/community/components (copy-paste, NIE instalować jako pakiet)
```

**Nie używać:** lucide-react, @mui/material, Bootstrap, Wix, any drag-and-drop builder.

---

## 13. Content (PL)

Cała treść w języku polskim. Brak wersji angielskiej w MVP.

**Ton:** Instytucjonalny ale nie urzędowy. Bezpośredni. Bez corporate-speak ("działamy na rzecz", "wspieramy", "realizujemy" — OK; "synergistycznie rozwijamy ekosystem" — nie). Głos organizacji, nie głos korporacji.

**Forma zwrotu:** "Ty" do studenta (nie "Wy" i nie "Państwo"). Ustalone 15.10.2026: tak była już napisana zdecydowana większość tekstów, a pojedyncza osoba szukająca pomocy czyta bezpośredni zwrot naturalniej.

---

## 14. Co jest POZA scopem MVP

- CMS / edytor treści dla działaczy (faza 2)
- Panel wewnętrzny / auth (faza 2, po odpowiedzi IT)
- Galeria zdjęć (faza 2)
- Blog / newsy (faza 2)
- Social media embed (faza 2)
- Wersja angielska (faza 3)
- Aplikacja mobilna (nie planowana)
