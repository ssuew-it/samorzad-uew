/**
 * Statyczny indeks stron na potrzeby wyszukiwarki (command palette).
 * Każdy wpis ma etykietę/grupę/słowa kluczowe w obu językach (PL/EN); `keywords`
 * zawiera synonimy/odmiany, żeby trafiać mimo innego słowa niż w tytule.
 */

type Locale = "pl" | "en";

interface SearchSource {
  href: string;
  group: Record<Locale, string>;
  label: Record<Locale, string>;
  keywords: Record<Locale, string>;
}

const G = {
  student: { pl: "Strefa studenta", en: "Student zone" },
  samorzad: { pl: "Samorząd", en: "Student Government" },
  wspolpraca: { pl: "Współpraca", en: "Partnership" },
  ogolne: { pl: "Ogólne", en: "General" },
};

const sources: SearchSource[] = [
  // Strefa studenta
  { href: "/dla-studenta", group: G.student, label: { pl: "Strefa studenta", en: "Student zone" }, keywords: { pl: "dla studenta hub tematy", en: "student zone hub topics" } },
  { href: "/prawa-studenta", group: G.student, label: { pl: "Prawa studenta", en: "Student rights" }, keywords: { pl: "ustawa 2.0 prawo egzamin ios", en: "act rights exam ios board" } },
  { href: "/stypendia", group: G.student, label: { pl: "Stypendia i wsparcie", en: "Scholarships & support" }, keywords: { pl: "pieniądze wsparcie świadczenia rodzaje rektora socjalne zapomoga niepełnosprawność wyniki dochód świadczenia", en: "money support benefits types merit social hardship disability results income benefits" } },
  { href: "/stypendia#kalkulator", group: G.student, label: { pl: "Kalkulator średniej", en: "Grade average calculator" }, keywords: { pl: "średnia ważona ects oceny punkty stypendium policz", en: "weighted average ects grades points scholarship compute" } },
  { href: "/prawo-dla-studenta", group: G.student, label: { pl: "Prawo dla studenta", en: "Law for students" }, keywords: { pl: "regulaminy przepisy zarządzenia", en: "regulations rules orders" } },
  { href: "/infopacki", group: G.student, label: { pl: "Infopacki", en: "Infopacks" }, keywords: { pl: "pakiety informacje pdf poradnik", en: "packs information pdf guide" } },
  { href: "/infopacki/regulamin-studiow", group: G.student, label: { pl: "Regulamin studiów - żywy poradnik", en: "Study Regulations - living guide" }, keywords: { pl: "regulamin studiów nieobecność oceny egzamin warunek urlop zapisy podania", en: "study regulations absence grades exam conditional leave registration applications" } },
  { href: "/infopacki/podania", group: G.student, label: { pl: "Podania - żywy przewodnik", en: "Applications - living guide" }, keywords: { pl: "podanie wniosek usos warunek ios ips przeniesienie egzamin komisyjny odwołanie urlop wznowienie", en: "application request usos conditional ios ips transfer committee exam appeal leave resumption" } },
  { href: "/infopacki/usos", group: G.student, label: { pl: "USOS - żywy przewodnik", en: "USOS - living guide" }, keywords: { pl: "usos usosweb ankiety grupy rejestracje oceny podania mlegitymacja stypendia wybory obiegówka", en: "usos usosweb surveys groups registration grades applications mobile student id scholarships elections clearance" } },
  { href: "/infopacki/zaliczenie-semestru", group: G.student, label: { pl: "Zaliczenie semestru - kokpit decyzji", en: "Passing the semester - decision cockpit" }, keywords: { pl: "semestr sesja egzamin zaliczenie ocena poprawka komisyjny warunek powtarzanie brak oceny nieobecność", en: "semester session exam assessment grade resit committee conditional repeat missing grade absence" } },
  { href: "/infopacki/sprawy-studenckie", group: G.student, label: { pl: "Sprawy studenckie - router kontaktu", en: "Student matters - contact router" }, keywords: { pl: "dziekanat dziekan prodziekan kierunek zaświadczenie dokument problem spór eskalacja podanie", en: "dean office dean vice-dean programme certificate document problem dispute escalation application" } },
  { href: "/infopacki/biblioteka", group: G.student, label: { pl: "Biblioteka - żywy nawigator", en: "Library - living navigator" }, keywords: { pl: "biblioteka książka katalog sygnatura piętro magazyn książkomat wrzutnia proxy baza kabina obiegówka bibliografia", en: "library book catalogue call number floor stacks book locker return box proxy database cabin clearance bibliography" } },
  { href: "/infopacki/zycie-studenckie", group: G.student, label: { pl: "Życie studenckie - kompas zaangażowania", en: "Student life - engagement compass" }, keywords: { pl: "organizacje koła naukowe sport chór erasmus wymiana design thinking dthub kafe biuro karier jobteaser staż praktyka", en: "student organisations study circles sport choir erasmus mobility design thinking dthub career internship jobteaser" } },
  { href: "/infopacki/dyplomowanie", group: G.student, label: { pl: "Dyplomowanie - kokpit gotowości", en: "Graduation - readiness cockpit" }, keywords: { pl: "dyplom praca dyplomowa apd jsa antyplagiat obrona egzamin dyplomowy recenzja promotor termin średnia wynik", en: "graduation thesis apd jsa plagiarism defence diploma exam review supervisor deadline average result" } },
  { href: "/rzecznik-praw-studenta", group: G.student, label: { pl: "Rzecznik Praw Studenta", en: "Student Ombudsman" }, keywords: { pl: "spór uczelnia obrona buchta", en: "dispute university defense ombudsman" } },
  { href: "/mapa-kampusu", group: G.student, label: { pl: "Mapa kampusu", en: "Campus map" }, keywords: { pl: "budynki sale lokalizacja dojazd", en: "buildings rooms location directions" } },
  { href: "/pomoc-psychologiczna", group: G.student, label: { pl: "Pomoc psychologiczna", en: "Psychological support" }, keywords: { pl: "wsparcie kryzys telefon zaufania zdrowie psychiczne", en: "support crisis helpline mental health" } },
  { href: "/wladze-rektorskie", group: G.student, label: { pl: "Władze rektorskie", en: "University authorities" }, keywords: { pl: "rektor prorektor uczelnia", en: "rector vice-rector university" } },
  { href: "/dziekan-i-prodziekani", group: G.student, label: { pl: "Dziekan i prodziekani", en: "Dean & vice-deans" }, keywords: { pl: "dziekanat kierunek prodziekan", en: "dean office field vice-dean" } },
  { href: "/organizacje-studenckie", group: G.student, label: { pl: "Organizacje studenckie", en: "Student organizations" }, keywords: { pl: "koła naukowe organizacje inicjatywy społeczność dołącz NZS ZSP ESN AIESEC WIGGOR IKSS BIT chór Enactus", en: "academic clubs research clubs organizations initiatives community join NZS ZSP ESN AIESEC WIGGOR IKSS BIT choir Enactus" } },
  { href: "/wydawnictwo", group: G.student, label: { pl: "Wydawnictwo UEW", en: "UEW Publishing House" }, keywords: { pl: "debiuty studenckie publikacja artykuł isbn wydawnictwo koło naukowe otwarty dostęp cytowanie", en: "student debuts publication article isbn publishing house research circle open access citation" } },
  { href: "/kalendarz", group: G.student, label: { pl: "Kalendarz wydarzeń uczelnianych", en: "University events calendar" }, keywords: { pl: "kalendarz wydarzenia terminy uczelnia daty dni rektorskie", en: "calendar events dates university deadlines schedule" } },

  // Samorząd
  { href: "/o-nas", group: G.samorzad, label: { pl: "O nas", en: "About us" }, keywords: { pl: "samorząd kim jesteśmy działalność misja struktura organy schemat komisja rewizyjna historia", en: "student government about us activities mission structure bodies chart audit committee history" } },
  { href: "/nasze-projekty", group: G.samorzad, label: { pl: "Nasze projekty", en: "Our projects" }, keywords: { pl: "wydarzenia inicjatywy eventy", en: "events initiatives" } },
  { href: "/zarzad", group: G.samorzad, label: { pl: "Zarząd Samorządu", en: "Student Government Board" }, keywords: { pl: "kierownictwo zarząd reprezentant kontakt prezydium przewodniczący wiceprzewodniczący członkowie", en: "leadership board representative contact presidium chair vice-chair members" } },
  { href: "/filia-jelenia-gora", group: G.samorzad, label: { pl: "Samorząd Filii w Jeleniej Górze", en: "Jelenia Góra Branch Student Government" }, keywords: { pl: "filia jelenia góra jeleniogórska kampus woźniak kontakt wydarzenia projekty komisje", en: "branch campus jelenia gora wozniak contact events projects committees" } },
  { href: "/rada-uczelniana-samorzadu-studentow", group: G.samorzad, label: { pl: "Rada Uczelniana Samorządu (RUSS)", en: "University Council (RUSS)" }, keywords: { pl: "russ uchwałodawczy rada", en: "russ legislative council" } },
  { href: "/studencka-komisja-wyborcza", group: G.samorzad, label: { pl: "Studencka Komisja Wyborcza", en: "Student Electoral Committee" }, keywords: { pl: "skw wybory głosowanie", en: "skw elections voting" } },
  { href: "/regulacje-wewnetrzne", group: G.samorzad, label: { pl: "Regulacje wewnętrzne", en: "Internal regulations" }, keywords: { pl: "regulaminy dokumenty akty", en: "regulations documents acts" } },
  { href: "/zarzadzenia-przewodniczacego", group: G.samorzad, label: { pl: "Zarządzenia Przewodniczącej", en: "Chair’s orders" }, keywords: { pl: "akty wykonawcze dokumenty kadencja", en: "executive acts documents term" } },
  { href: "/rekrutacja", group: G.samorzad, label: { pl: "Rekrutacja", en: "Recruitment" }, keywords: { pl: "dołącz nabór formularz komisja wolontariat praca dla studenta", en: "join apply openings form committee volunteer" } },
  { href: "/fue-i-psrp", group: G.samorzad, label: { pl: "FUE i PSRP", en: "FUE & PSRP" }, keywords: { pl: "forum uczelni ekonomicznych parlament studentów reprezentacja ogólnopolska krajowa", en: "forum economic universities students parliament national representation" } },
  { href: "/transparentnosc", group: G.samorzad, label: { pl: "Transparentność", en: "Transparency" }, keywords: { pl: "jawność dokumenty sprawozdania finanse regulaminy zarządzenia księga finansowanie", en: "transparency openness documents reports finances regulations orders funding" } },
  { href: "/strefa-dzialacza", group: G.samorzad, label: { pl: "Strefa działacza", en: "Members area" }, keywords: { pl: "logowanie zaloguj cra panel wewnętrzny działacz konto", en: "login log in members area cra internal panel account" } },

  // Współpraca
  { href: "/partnerzy", group: G.wspolpraca, label: { pl: "Partnerzy i współpraca", en: "Partners & collaboration" }, keywords: { pl: "sponsorzy firmy współpraca biznes oferta partnerstwo b2b kontakt Zuzanna Bąk", en: "sponsors companies cooperation business offer partnership b2b contact Zuzanna Bąk" } },

  // Ogólne
  { href: "/", group: G.ogolne, label: { pl: "Strona główna", en: "Home" }, keywords: { pl: "home start", en: "home start" } },
  { href: "/kontakt", group: G.ogolne, label: { pl: "Kontakt", en: "Contact" }, keywords: { pl: "adres email formularz napisz", en: "address email form write" } },
  { href: "/prywatnosc", group: G.ogolne, label: { pl: "Polityka prywatności", en: "Privacy policy" }, keywords: { pl: "rodo dane cookie ciasteczka analityka prywatność", en: "gdpr data cookies analytics privacy" } },
  { href: "/deklaracja-dostepnosci", group: G.ogolne, label: { pl: "Deklaracja dostępności", en: "Accessibility statement" }, keywords: { pl: "dostępność wcag niepełnosprawność klawiatura kontrast", en: "accessibility wcag disability keyboard contrast" } },
];

/** Stable list of routes (href only) - used by sitemap.ts. */
export const searchIndex = sources;

export interface SearchEntry {
  label: string;
  href: string;
  group: string;
  keywords: string;
}

const toLocale = (l: string): Locale => (l === "en" ? "en" : "pl");

function resolve(s: SearchSource, loc: Locale): SearchEntry {
  return { label: s.label[loc], href: s.href, group: s.group[loc], keywords: s.keywords[loc] };
}

// NFD + strip combining marks handles ą ć ę ó ś ż ź ń, but Polish "ł"/"Ł" do not
// decompose - map them explicitly so "wladze" matches "władze". Each source char
// maps to exactly one output char, so indices stay 1:1 (needed for highlighting).
const deaccent = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .toLowerCase();

export function searchPages(query: string, locale: string): SearchEntry[] {
  const index = sources.map((s) => resolve(s, toLocale(locale)));
  const q = deaccent(query.trim());
  if (!q) return index;
  const terms = q.split(/\s+/);
  return index.filter((entry) => {
    const haystack = deaccent(`${entry.label} ${entry.keywords} ${entry.group}`);
    return terms.every((t) => haystack.includes(t));
  });
}

/**
 * Split a label into segments marking which characters matched the query, so the
 * UI can <mark> them. Diacritics-insensitive; relies on deaccent being 1:1 length.
 */
export function highlightSegments(
  label: string,
  query: string,
): { text: string; hit: boolean }[] {
  const q = deaccent(query.trim());
  if (!q) return [{ text: label, hit: false }];
  const terms = [...new Set(q.split(/\s+/).filter(Boolean))];
  const da = deaccent(label);
  const hits = new Array(label.length).fill(false);

  for (const term of terms) {
    let from = da.indexOf(term);
    while (from !== -1) {
      for (let k = from; k < from + term.length; k++) hits[k] = true;
      from = da.indexOf(term, from + term.length);
    }
  }

  const segments: { text: string; hit: boolean }[] = [];
  for (let i = 0; i < label.length; i++) {
    const hit = hits[i];
    const last = segments[segments.length - 1];
    if (last && last.hit === hit) last.text += label[i];
    else segments.push({ text: label[i], hit });
  }
  return segments;
}
