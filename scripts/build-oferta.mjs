/**
 * Oferta współpracy dla partnerów (PDF, PL i EN) - `npm run build:oferta`.
 *
 * Składa 6 stron A4 z HTML-a w kolorach i krojach strony (Archivo, JetBrains
 * Mono, #2C4BFF) i drukuje je Chromium z Playwrighta do
 * public/dokumenty/oferta-wspolpracy-ssuew-{pl,en}.pdf.
 *
 * ZASADY TREŚCI (ustalone z Samorządem 2.11.2026):
 * - NIGDY żadnych cen ani pakietów - oferta kończy się zaproszeniem do
 *   rozmowy o ofercie indywidualnej;
 * - liczba studentów: ok. 9600 (2025);
 * - fakty o projektach te same co na stronie „Nasze projekty”.
 *
 * Po zmianie partnerów, projektów albo osoby kontaktowej uruchom skrypt
 * ponownie i zacommituj oba PDF-y.
 */
import { chromium } from "playwright";
// sharp przychodzi z Next.js (optymalizacja obrazów) - tu tylko zmniejsza grafiki przed drukiem.
import sharp from "sharp";
import { mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
/**
 * Grafiki do PDF-a. Chromium wkleja webp do PDF-a praktycznie bez kompresji
 * (pierwsza wersja ważyła 31 MB), więc zdjęcia idą jako JPEG w rozdzielczości
 * wystarczającej do druku, a logotypy jako małe PNG z przezroczystością.
 * Mapa wypełnia się w `prepareAssets()`; SVG zostają bez zmian.
 */
const assets = new Map();
const pub = (p) => assets.get(p) ?? pathToFileURL(join(root, "public", p)).href;
const font = (pkg, file) => pathToFileURL(join(root, "node_modules", "@fontsource-variable", pkg, "files", file)).href;

const partners = [
  ["BNY", "bny.webp"],
  ["Starbucks Chilled Coffee", "starbucks-chilled-coffee.webp"],
  ["UPS", "ups.webp"],
  ["PwC", "pwc.webp"],
  ["Kaufland", "kaufland.webp"],
  ["mBank", "mbank.webp"],
  ["BNP Paribas", "bnp-paribas.webp"],
  ["Pyszne.pl", "pyszne.webp"],
  ["Burn", "burn.webp"],
  ["Bielenda", "bielenda.webp"],
  ["Techland", "techland.webp"],
  ["Raben", "raben.webp"],
  ["UPM", "upm.webp"],
  ["Pasibus", "pasibus.webp"],
  ["iStudies", "istudies.webp"],
  ["Phinance", "phinance.webp"],
  ["Śniadaniowi", "sniadaniowi.webp"],
  ["Slice of Heaven", "slice-of-heaven.webp"],
  ["Drukarnia Mad Unicorns", "mad-unicorns.webp"],
  ["Fundacja Rozwoju Uniwersytetu Ekonomicznego we Wrocławiu", "fundacja-rozwoju-uew.webp"],
];

const contact = {
  name: "Zuzanna Bąk",
  email: "zuzanna.bak@samorzad.ue.wroc.pl",
  photo: "photos/zarzad/zuzanna-bak.webp",
};

const copy = {
  pl: {
    lang: "pl",
    file: "oferta-wspolpracy-ssuew-pl.pdf",
    title: "Oferta współpracy - Samorząd Studentów Uniwersytetu Ekonomicznego we Wrocławiu",
    cover: {
      kicker: "Oferta współpracy · 2026/2027",
      h1: ["Dobre pomysły.", "Większe możliwości."],
      org: "Samorząd Studentów Uniwersytetu Ekonomicznego we Wrocławiu",
      sub: "Wydarzenia, wspólne projekty i bezpośredni kontakt ze studentami Uczelni.",
    },
    about: {
      kicker: "01 · Kim jesteśmy",
      h: "Głos prawie 10 tysięcy studentów",
      body: "Samorząd Studentów reprezentuje wszystkich studentów Uniwersytetu Ekonomicznego we Wrocławiu wobec Władz Uczelni. Dbamy o prawa studentów, a przez cały rok akademicki organizujemy projekty, które tworzą studenckie życie na Uczelni: od obozu dla pierwszego roku po uroczystość dla absolwentów.",
      stats: [
        ["ok. 9600", "studentów Uczelni (2025)"],
        ["10", "projektów w roku akademickim"],
        ["20", "marek, które wspierały nasze projekty"],
        ["4", "kanały w mediach społecznościowych: Instagram, TikTok, Facebook, LinkedIn"],
      ],
      photoAlt: "Stoisko Samorządu Studentów na kampusie",
    },
    year: {
      kicker: "02 · Rok z Samorządem",
      h: "10 projektów, od września do czerwca",
      lead: "Każdy projekt to inna grupa studentów i inny moment roku. Razem wybierzemy ten, który pasuje do Twojej marki.",
      items: [
        ["Wrzesień", "Adapciak", "Ośmiodniowy obóz dla pierwszego roku przed startem roku akademickiego.", "adapciak"],
        ["Październik", "Dni Adaptacyjne", "Dwa dni prelekcji i szkoleń dla pierwszego roku, także studiów niestacjonarnych.", "dni"],
        ["Listopad", "Test Wiedzy Ekonomicznej", "Konkurs pięciu uczelni ekonomicznych, ok. 100 uczestników na każdej z nich.", "test"],
        ["Marzec", "Mosty Ekonomiczne", "Cztery dni wymiany studentów pięciu uczelni ekonomicznych, od 2005 roku.", "mosty"],
        ["Kwiecień", "TEDxUEW", "7. edycja 9 kwietnia 2027. Między prelekcjami warsztaty z firmami partnerskimi.", "tedx"],
        ["Maj", "Bal UEW", "Wieczór dla studentów, kadry, absolwentów i przyjaciół Uczelni.", "bal"],
        ["Wiosna", "Juwenalia Wrocławskie", "Dwa dni koncertów na Polach Osobowickich dla studentów wszystkich wrocławskich uczelni.", null],
        ["Czerwiec", "Animalia", "Projekt charytatywny z Fundacją DODO przy wrocławskim ZOO.", "animalia"],
        ["Czerwiec", "GradUEtion", "Uroczystość absolwentów w togach i biretach.", "graduetion"],
        ["Cały rok", "UE Party", "Cykl imprez dla studentów Uczelni i całego studenckiego Wrocławia.", "party"],
      ],
    },
    forms: {
      kicker: "03 · Formy współpracy",
      h: "Od czego możemy zacząć",
      cols: [
        ["Wydarzenia", "Twoja marka tam, gdzie studenci naprawdę bywają.", ["Strefa marki podczas wydarzenia", "Aktywacja lub konkurs dla uczestników", "Wsparcie organizacyjne i rzeczowe"]],
        ["Wspólne projekty", "Studencka inicjatywa i doświadczenie Twojej organizacji.", ["Warsztaty i spotkania z ekspertami", "Wsparcie inicjatywy studenckiej", "Projekt tworzony wspólnie od podstaw"]],
        ["Kontakt ze studentami", "Przedstaw studentom swoją organizację i podziel się wiedzą.", ["Spotkanie z zespołem Twojej organizacji", "Prezentacja ścieżek rozwoju i kariery", "Promocja w mediach społecznościowych Samorządu"]],
      ],
      pairsH: "Przykładowe połączenia",
      pairs: [
        ["Strefa marki", "Juwenalia Wrocławskie, Dni Adaptacyjne"],
        ["Warsztaty", "TEDxUEW, Mosty Ekonomiczne"],
        ["Konkurs dla uczestników", "Adapciak, Test Wiedzy Ekonomicznej"],
        ["Ścieżki kariery", "spotkania z zespołem na kampusie"],
      ],
      note: "To punkt wyjścia. Zakres i terminy ustalamy wspólnie.",
      photoCap: "TEDxUEW, kwiecień",
    },
    partners: {
      kicker: "04 · Zaufali nam",
      h: "Marki, które wspierały projekty Samorządu",
      strategic: "Partner strategiczny",
    },
    close: {
      kicker: "05 · Oferta dla Ciebie",
      h: "Napisz, a przygotujemy ofertę pod Twoje potrzeby",
      body: "Nie mamy gotowych pakietów. Opowiedz nam o marce, o tym, kogo chcesz zainteresować i w jakim terminie, a przygotujemy indywidualną ofertę dopasowaną do Twoich celów.",
      steps: [
        ["Twój pomysł", "Marka, cel i kilka słów o planach."],
        ["Wspólny kierunek", "Rozmowa o możliwościach i dopasowaniu do studentów."],
        ["Konkretny plan", "Uzgodnienie zakresu, terminów i kolejnych kroków."],
      ],
      role: "Członkini Zarządu ds. Kontaktów Zewnętrznych",
      formLabel: "Formularz współpracy",
      generalLabel: "Kontakt ogólny",
      address: "ul. Kamienna 44, budynek L, pok. 110, 53-307 Wrocław",
      photoCap: "Dni Adaptacyjne, październik",
    },
    footer: "Samorząd Studentów Uniwersytetu Ekonomicznego we Wrocławiu",
  },
  en: {
    lang: "en",
    file: "oferta-wspolpracy-ssuew-en.pdf",
    title: "Partnership offer - Student Government of Wroclaw University of Economics and Business",
    cover: {
      kicker: "Partnership offer · 2026/2027",
      h1: ["Great ideas.", "Bigger possibilities."],
      org: "Student Government of Wroclaw University of Economics and Business",
      sub: "Events, joint projects and direct contact with the University's students.",
    },
    about: {
      kicker: "01 · Who we are",
      h: "The voice of nearly 10,000 students",
      body: "The Student Government represents all students of Wroclaw University of Economics and Business before the University authorities. We look after students' rights and, throughout the academic year, run the projects that make up student life at the University: from a camp for first-year students to a ceremony for graduates.",
      stats: [
        ["~9,600", "students at the University (2025)"],
        ["10", "projects every academic year"],
        ["20", "brands that have supported our projects"],
        ["4", "social media channels: Instagram, TikTok, Facebook, LinkedIn"],
      ],
      photoAlt: "Student Government stand on campus",
    },
    year: {
      kicker: "02 · A year with the Student Government",
      h: "10 projects, from September to June",
      lead: "Each project reaches a different group of students at a different time of year. Together we will choose the one that fits your brand.",
      items: [
        ["September", "Adapciak", "An eight-day camp for first-year students before the academic year starts.", "adapciak"],
        ["October", "Adaptation Days", "Two days of talks and training for first-year students, including part-time students.", "dni"],
        ["November", "Economics Knowledge Test", "A competition of five universities of economics, around 100 participants at each.", "test"],
        ["March", "Economic Bridges", "Four days of student exchange between five universities of economics, since 2005.", "mosty"],
        ["April", "TEDxUEW", "7th edition on 9 April 2027. Workshops with partner companies between the talks.", "tedx"],
        ["May", "UEW Ball", "An evening for students, staff, graduates and friends of the University.", "bal"],
        ["Spring", "Wrocław Juwenalia", "Two days of concerts at Pola Osobowickie for students of all Wrocław universities.", null],
        ["June", "Animalia", "A charity project with the DODO Foundation at Wrocław Zoo.", "animalia"],
        ["June", "GradUEtion", "A graduation ceremony in gowns and mortarboards.", "graduetion"],
        ["All year", "UE Party", "A series of parties for the University's students and student Wrocław.", "party"],
      ],
    },
    forms: {
      kicker: "03 · Partnership formats",
      h: "Where we can start",
      cols: [
        ["Events", "Your brand where students actually go.", ["A brand space at an event", "An activity or competition for participants", "Organisational and in-kind support"]],
        ["Joint projects", "Student initiative meets your organisation's experience.", ["Workshops and expert sessions", "Support for a student initiative", "A project developed together from scratch"]],
        ["Student connections", "Introduce your organisation to students and share your knowledge.", ["A session with your organisation's team", "Career and development opportunities", "Promotion on the Student Government's social media"]],
      ],
      pairsH: "Example combinations",
      pairs: [
        ["Brand space", "Wrocław Juwenalia, Adaptation Days"],
        ["Workshops", "TEDxUEW, Economic Bridges"],
        ["Competition for participants", "Adapciak, Economics Knowledge Test"],
        ["Career paths", "team sessions on campus"],
      ],
      note: "A starting point. We agree on scope and timing together.",
      photoCap: "TEDxUEW, April",
    },
    partners: {
      kicker: "04 · They trusted us",
      h: "Brands that have supported Student Government projects",
      strategic: "Strategic partner",
    },
    close: {
      kicker: "05 · An offer for you",
      h: "Write to us and we will tailor an offer to your needs",
      body: "We do not have ready-made packages. Tell us about your brand, who you want to reach and when, and we will prepare an individual offer that fits your goals.",
      steps: [
        ["Your idea", "Your brand, your goal and a few words about your plans."],
        ["A shared direction", "A conversation about possibilities and what works for students."],
        ["A concrete plan", "Agreeing on scope, timing and next steps."],
      ],
      role: "Board Member for External Relations",
      formLabel: "Partnership form",
      generalLabel: "General contact",
      address: "ul. Kamienna 44, building L, room 110, 53-307 Wrocław, Poland",
      photoCap: "Adaptation Days, October",
    },
    footer: "Student Government of Wroclaw University of Economics and Business",
  },
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// Twarde spacje po jednoliterowych spójnikach i przyimkach - bez „sierotek” na końcu linii.
const nbsp = (s, lang) => (lang === "pl" ? esc(s).replace(/(^|\s)([aiouwzAIOUWZ])\s/g, "$1$2 ") : esc(s));

function html(c) {
  const t = (s) => nbsp(s, c.lang);
  const formUrl = `https://samorzad.ue.wroc.pl/${c.lang}/partnerzy#kontakt-partnerzy`;
  const pageFoot = (n) => `<footer class="foot"><span>${t(c.footer)}</span><span>samorzad.ue.wroc.pl</span><span class="num">0${n} / 06</span></footer>`;
  return `<!doctype html><html lang="${c.lang}"><head><meta charset="utf-8"><title>${esc(c.title)}</title><style>
@font-face{font-family:Archivo;src:url(${font("archivo", "archivo-latin-wght-normal.woff2")}) format("woff2");font-weight:100 900;unicode-range:U+0000-00FF,U+2000-206F,U+20AC,U+2122}
@font-face{font-family:Archivo;src:url(${font("archivo", "archivo-latin-ext-wght-normal.woff2")}) format("woff2");font-weight:100 900;unicode-range:U+0100-024F,U+1E00-1EFF}
@font-face{font-family:JBM;src:url(${font("jetbrains-mono", "jetbrains-mono-latin-wght-normal.woff2")}) format("woff2");font-weight:100 800;unicode-range:U+0000-00FF,U+2000-206F}
@font-face{font-family:JBM;src:url(${font("jetbrains-mono", "jetbrains-mono-latin-ext-wght-normal.woff2")}) format("woff2");font-weight:100 800;unicode-range:U+0100-024F}
@page{size:A4;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
:root{--accent:#2c4bff;--ink:#0b1322;--ink2:#475467;--ink3:#667085;--bg:#f6f8fc;--line:rgba(11,19,34,.12);--glow:#e8ecff}
html,body{font-family:Archivo,system-ui,sans-serif;color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{position:relative;width:210mm;height:297mm;overflow:hidden;page-break-after:always;background:#fff;padding:22mm 18mm 26mm}
.page:last-child{page-break-after:auto}
.kicker{font-family:JBM,monospace;font-size:8.5pt;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}
h2{margin-top:5mm;font-size:30pt;line-height:1.04;letter-spacing:-.035em;font-weight:650;max-width:150mm;text-wrap:balance}
.lead{margin-top:5mm;max-width:140mm;font-size:11.5pt;line-height:1.6;color:var(--ink2)}
.foot{position:absolute;left:18mm;right:18mm;bottom:11mm;display:flex;justify-content:space-between;gap:6mm;padding-top:3mm;border-top:1px solid var(--line);font-family:JBM,monospace;font-size:7pt;color:var(--ink3)}
.foot .num{color:var(--accent);font-weight:600}
/* okładka */
.cover{padding:0;background:#0b1735;color:#fff}
.cover img.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.05)}
.cover .shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,23,53,.15) 0%,rgba(11,23,53,.35) 38%,rgba(20,38,140,.92) 72%,#1c33d6 100%)}
.cover .in{position:absolute;left:18mm;right:18mm;bottom:22mm}
.cover .sig{position:absolute;top:18mm;left:18mm;display:flex;align-items:center;gap:4mm;font-size:10pt;font-weight:600;line-height:1.25}
.cover .sig img{width:13mm;height:auto}
.cover .kicker{color:#c9d2ff}
.cover h1{margin-top:6mm;font-size:46pt;line-height:.98;letter-spacing:-.045em;font-weight:700}
.cover h1 span{display:block;color:#aebcff}
.cover .org{margin-top:8mm;max-width:120mm;font-size:12pt;line-height:1.45;color:#e3e8ff}
/* kim jesteśmy */
.about .photo{margin-top:9mm;width:100%;height:78mm;border-radius:5mm;object-fit:cover}
.stats{display:grid;grid-template-columns:repeat(4,1fr);margin-top:9mm;border-top:1px solid var(--line)}
.stats div{padding:5mm 4mm 0 0}
.stats div+div{padding-left:4mm;border-left:1px solid var(--line)}
.stats b{display:block;font-size:22pt;font-weight:650;letter-spacing:-.03em;color:var(--accent)}
.stats span{display:block;margin-top:1.5mm;font-size:8.5pt;line-height:1.45;color:var(--ink2)}
/* kalendarz */
.months{display:grid;grid-template-columns:1fr 1fr;gap:3.2mm;margin-top:8mm}
.m{display:grid;grid-template-columns:24mm 1fr;gap:3.5mm;align-items:center;padding:2.6mm;border:1px solid var(--line);border-radius:3.5mm;background:#fff}
.m img,.m .ph{width:24mm;height:19mm;border-radius:2.5mm;object-fit:cover;background:var(--glow)}
.m .ph{display:grid;place-items:center;background:var(--accent)}
.m .ph img.phSig{width:8mm;height:auto;border-radius:0;background:none}
.m small{font-family:JBM,monospace;font-size:7pt;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--accent)}
.m b{display:block;margin-top:.6mm;font-size:11pt;letter-spacing:-.01em}
.m p{margin-top:.8mm;font-size:8pt;line-height:1.4;color:var(--ink2)}
/* formy */
.cols{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm;margin-top:9mm}
.col{padding:6mm 5mm;border:1px solid var(--line);border-radius:4mm;background:var(--bg)}
.col .n{font-family:JBM,monospace;font-size:8pt;color:var(--accent);font-weight:600}
.col h3{margin-top:3mm;font-size:14pt;letter-spacing:-.02em}
.col p{margin-top:2mm;font-size:9pt;line-height:1.5;color:var(--ink2);min-height:13mm}
.col ul{margin-top:4mm;list-style:none;display:grid;gap:2.2mm}
.col li{position:relative;padding-left:4.5mm;font-size:9pt;line-height:1.45}
.col li::before{content:"";position:absolute;left:0;top:1.9mm;width:2mm;height:2mm;border-radius:50%;background:var(--accent)}
.pairs{margin-top:10mm;padding:6mm;border-radius:4mm;background:#0b1735;color:#fff}
.pairs h3{font-family:JBM,monospace;font-size:8pt;letter-spacing:.14em;text-transform:uppercase;color:#aebcff}
.pairs dl{display:grid;grid-template-columns:1fr 1fr;gap:4mm 8mm;margin-top:4mm}
.pairs dt{font-size:11pt;font-weight:600}
.pairs dd{margin-top:.8mm;font-size:9pt;color:#c9d2ff}
.note{margin-top:5mm;font-size:9pt;color:var(--ink3)}
/* partnerzy */
.strategic{display:grid;grid-template-columns:1fr 1.3fr;margin-top:9mm;border-radius:4mm;overflow:hidden;border:1px solid var(--line)}
.strategic div{padding:9mm 7mm;background:#13244f;color:#fff}
.strategic small{font-family:JBM,monospace;font-size:7.5pt;letter-spacing:.14em;text-transform:uppercase;color:#aebcff}
.strategic b{display:block;margin-top:2mm;font-size:24pt;letter-spacing:-.03em}
.strategic figure{display:grid;place-items:center;padding:6mm;background:#fff}
.strategic img{max-width:70mm;max-height:22mm;object-fit:contain}
.logos{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm;margin-top:4mm}
.logos figure{display:grid;place-items:center;height:31mm;padding:5mm;border:1px solid var(--line);border-radius:3mm;background:#fff}
.logos img{max-width:100%;max-height:18mm;object-fit:contain}
.band{position:absolute;left:18mm;right:18mm;bottom:22mm;height:62mm;margin:0;border-radius:4mm;overflow:hidden}
.band img{width:100%;height:100%;object-fit:cover}
.close .band{height:46mm}
.band figcaption{position:absolute;left:4mm;bottom:3.5mm;padding:1.2mm 2.6mm;border-radius:2mm;background:rgba(11,19,34,.72);color:#fff;font-family:JBM,monospace;font-size:7pt;letter-spacing:.06em}
/* zakończenie */
.close{background:var(--bg)}
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm;margin-top:9mm}
.steps div{padding:5mm;border-top:2px solid var(--accent);background:#fff;border-radius:0 0 3mm 3mm}
.steps .n{font-family:JBM,monospace;font-size:8pt;color:var(--accent);font-weight:600}
.steps b{display:block;margin-top:2mm;font-size:12pt}
.steps p{margin-top:1.5mm;font-size:9pt;line-height:1.5;color:var(--ink2)}
.person{display:grid;grid-template-columns:34mm 1fr;gap:7mm;align-items:center;margin-top:11mm;padding:6mm;border-radius:5mm;background:#fff;border:1px solid var(--line)}
.person img{width:34mm;height:42.5mm;border-radius:3.5mm;object-fit:cover}
.person b{display:block;font-size:17pt;letter-spacing:-.02em}
.person .role{margin-top:1mm;font-size:10pt;color:var(--ink2)}
.person a{display:inline-block;margin-top:4mm;font-size:11pt;font-weight:600;color:var(--accent);text-decoration:none}
.links{display:grid;grid-template-columns:1fr 1fr;gap:4mm;margin-top:6mm}
.links div{padding:4.5mm 5mm;border-radius:3.5mm;background:#fff;border:1px solid var(--line)}
.links small{display:block;font-family:JBM,monospace;font-size:7pt;letter-spacing:.12em;text-transform:uppercase;color:var(--ink3)}
.links a{display:block;margin-top:1.5mm;font-size:10pt;font-weight:600;color:var(--accent);text-decoration:none;word-break:break-all}
.address{margin-top:5mm;font-size:9pt;color:var(--ink3)}
</style></head><body>

<section class="page cover">
  <img class="bg" src="${pub("photos/hero/grad_1.webp")}" alt="">
  <div class="shade"></div>
  <div class="sig"><img src="${pub("sygnet-white.svg")}" alt=""><span>${t(c.cover.org)}</span></div>
  <div class="in">
    <p class="kicker">${t(c.cover.kicker)}</p>
    <h1>${t(c.cover.h1[0])}<span>${t(c.cover.h1[1])}</span></h1>
    <p class="org">${t(c.cover.sub)}</p>
  </div>
</section>

<section class="page about">
  <p class="kicker">${t(c.about.kicker)}</p>
  <h2>${t(c.about.h)}</h2>
  <p class="lead">${t(c.about.body)}</p>
  <img class="photo" src="${pub("photos/hero/inne_1.webp")}" alt="${esc(c.about.photoAlt)}">
  <div class="stats">${c.about.stats.map(([v, l]) => `<div><b>${t(v)}</b><span>${t(l)}</span></div>`).join("")}</div>
  ${pageFoot(2)}
</section>

<section class="page year">
  <p class="kicker">${t(c.year.kicker)}</p>
  <h2>${t(c.year.h)}</h2>
  <p class="lead">${t(c.year.lead)}</p>
  <div class="months">${c.year.items
    .map(([when, name, desc, img]) => `<div class="m">${img ? `<img src="${pub(`photos/projekty/${img}/cover.webp`)}" alt="">` : `<span class="ph"><img class="phSig" src="${pub("sygnet-white.svg")}" alt=""></span>`}<div><small>${t(when)}</small><b>${t(name)}</b><p>${t(desc)}</p></div></div>`)
    .join("")}</div>
  ${pageFoot(3)}
</section>

<section class="page forms">
  <p class="kicker">${t(c.forms.kicker)}</p>
  <h2>${t(c.forms.h)}</h2>
  <div class="cols">${c.forms.cols
    .map(([h, p, items], i) => `<div class="col"><span class="n">0${i + 1}</span><h3>${t(h)}</h3><p>${t(p)}</p><ul>${items.map((x) => `<li>${t(x)}</li>`).join("")}</ul></div>`)
    .join("")}</div>
  <div class="pairs"><h3>${t(c.forms.pairsH)}</h3><dl>${c.forms.pairs.map(([a, b]) => `<div><dt>${t(a)}</dt><dd>${t(b)}</dd></div>`).join("")}</dl></div>
  <p class="note">${t(c.forms.note)}</p>
  <figure class="band"><img src="${pub("photos/hero/tedx_2.webp")}" alt=""><figcaption>${t(c.forms.photoCap)}</figcaption></figure>
  ${pageFoot(4)}
</section>

<section class="page partners">
  <p class="kicker">${t(c.partners.kicker)}</p>
  <h2>${t(c.partners.h)}</h2>
  <div class="strategic"><div><small>${t(c.partners.strategic)}</small><b>BNY</b></div><figure><img src="${pub(`partnerzy/${partners[0][1]}`)}" alt="BNY"></figure></div>
  <div class="logos">${partners
    .slice(1)
    .map(([name, file]) => `<figure><img src="${pub(`partnerzy/${file}`)}" alt="${esc(name)}"></figure>`)
    .join("")}</div>
  ${pageFoot(5)}
</section>

<section class="page close">
  <p class="kicker">${t(c.close.kicker)}</p>
  <h2>${t(c.close.h)}</h2>
  <p class="lead">${t(c.close.body)}</p>
  <div class="steps">${c.close.steps.map(([h, p], i) => `<div><span class="n">0${i + 1}</span><b>${t(h)}</b><p>${t(p)}</p></div>`).join("")}</div>
  <div class="person"><img src="${pub(contact.photo)}" alt=""><div><b>${esc(contact.name)}</b><p class="role">${t(c.close.role)}</p><a href="mailto:${contact.email}">${contact.email}</a></div></div>
  <div class="links">
    <div><small>${t(c.close.formLabel)}</small><a href="${formUrl}">samorzad.ue.wroc.pl/${c.lang}/partnerzy</a></div>
    <div><small>${t(c.close.generalLabel)}</small><a href="mailto:kontakt@samorzad.ue.wroc.pl">kontakt@samorzad.ue.wroc.pl</a></div>
  </div>
  <p class="address">${t(c.close.address)}</p>
  <figure class="band"><img src="${pub("photos/hero/da_1.webp")}" alt=""><figcaption>${t(c.close.photoCap)}</figcaption></figure>
  ${pageFoot(6)}
</section>
</body></html>`;
}

const outDir = join(root, "public", "dokumenty");
const tmpDir = join(root, ".next", "oferta");
mkdirSync(tmpDir, { recursive: true });

async function prepareAssets() {
  const photos = [
    ["photos/hero/grad_1.webp", 1800],
    ["photos/hero/inne_1.webp", 1500],
    ["photos/hero/tedx_2.webp", 1500],
    ["photos/hero/da_1.webp", 1500],
    [contact.photo, 400],
    ...copy.pl.year.items.filter((i) => i[3]).map((i) => [`photos/projekty/${i[3]}/cover.webp`, 320]),
  ];
  for (const [p, width] of photos) {
    const out = join(tmpDir, p.replace(/[\/]/g, "_").replace(/\.webp$/, ".jpg"));
    await sharp(join(root, "public", p)).resize({ width, withoutEnlargement: true }).jpeg({ quality: 78, mozjpeg: true }).toFile(out);
    assets.set(p, pathToFileURL(out).href);
  }
  for (const [, file] of partners) {
    const p = `partnerzy/${file}`;
    const out = join(tmpDir, p.replace(/[\/]/g, "_").replace(/\.webp$/, ".png"));
    await sharp(join(root, "public", p)).resize({ width: 480, height: 200, fit: "inside", withoutEnlargement: true }).png({ compressionLevel: 9, palette: true }).toFile(out);
    assets.set(p, pathToFileURL(out).href);
  }
}
await prepareAssets();
const browser = await chromium.launch();
for (const c of Object.values(copy)) {
  const tmp = join(tmpDir, `oferta-${c.lang}.html`);
  writeFileSync(tmp, html(c));
  const page = await browser.newPage();
  await page.goto(pathToFileURL(tmp).href, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const out = join(outDir, c.file);
  await page.pdf({ path: out, format: "A4", printBackground: true, preferCSSPageSize: true, tagged: true, outline: false });
  await page.close();
  console.log(`${c.file}: ${(statSync(out).size / 1024 / 1024).toFixed(2)} MB`);
}
await browser.close();
