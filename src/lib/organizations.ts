/**
 * Katalog organizacji studenckich i kół naukowych UEW.
 *
 * Źródło: oficjalna strona UEW „Organizacje studenckie i koła naukowe”
 * (https://uew.pl/studenci/organizacje-studenckie-i-kola-naukowe/), stan na
 * 17 października 2026. Opisy są skrócone i przeredagowane.
 *
 * Celowo BEZ nazwisk przewodniczących i ich maili: zmieniają się co rok
 * i to dane osób prywatnych. Aktualne kontakty i opiekunów podaje strona
 * UEW (`UEW_ORGS_PAGE`), do której katalog linkuje.
 *
 * Nowy wpis: dodaj obiekt do `organizations`; `topics` to słowa, po których
 * działa wyszukiwarka (bez polskich znaków też zadziała).
 */

export const UEW_ORGS_PAGE = "https://uew.pl/studenci/organizacje-studenckie-i-kola-naukowe/";

export type OrgKind = "organizacja" | "kolo";
export type OrgCampus = "wroclaw" | "jelenia-gora";
export type OrgLinkKind = "www" | "facebook" | "instagram" | "linkedin" | "tiktok" | "x";

export interface OrgLink {
  kind: OrgLinkKind;
  url: string;
}

export interface Organization {
  id: string;
  name: string;
  kind: OrgKind;
  campus: OrgCampus;
  /** Katedra, przy której działa koło (nazwa własna, bez tłumaczenia). */
  unit?: string;
  desc: { pl: string; en: string };
  /** Słowa do wyszukiwania (tematy), PL i EN. */
  topics: string[];
  links: OrgLink[];
  /** Jednostka organizacyjna Samorządu (Regulamin Samorządu, § 4 ust. 4): IKSS i Klub BIT. */
  ssuew?: boolean;
  /** Logo ze strony organizacji (public/photos/organizacje/logo). Bez logo - monogram. */
  logo?: string;
  /** Jasne logo, które wymaga ciemnego tła. */
  logoDark?: boolean;
  /** Tylko jednostki Samorządu: skrót, liczby i projekty do dużej karty. */
  feature?: {
    short: string;
    /** Jedno zdanie do katalogu - pełny opis stoi w dużej karcie wyżej. */
    teaser: { pl: string; en: string };
    facts: { value: string; label: { pl: string; en: string } }[];
    projects: string[];
  };
  /** Link wewnętrzny zamiast zewnętrznego (np. dla samego Samorządu). */
  internalHref?: string;
}

export const organizations: Organization[] = [
  // ---------- Organizacje studenckie ----------
  {
    id: "ikss",
    logo: "/photos/organizacje/logo/ikss.svg",
    name: "Informacja Kulturalno-Sportowa Studentów",
    kind: "organizacja",
    campus: "wroclaw",
    ssuew: true,
    desc: {
      pl: "Robi wydarzenia kulturalne i sportowe dla studentów Uczelni i mieszkańców Wrocławia. Od 2008 roku zespół przygotował ponad 160 edycji projektów, od Wrocławskiego Biegu Akademickiego po seanse Nocnego Kina Akademickiego. Pomysły na kolejne wydarzenia przynoszą sami członkowie.",
      en: "Runs cultural and sports events for the University's students and the people of Wrocław. Since 2008 the team has delivered over 160 editions of its projects, from the Wrocław Academic Run to the Night Academic Cinema screenings. Ideas for new events come from the members themselves.",
    },
    feature: {
      short: "IKSS",
      teaser: {
        pl: "Wydarzenia kulturalne i sportowe dla studentów Uczelni i mieszkańców Wrocławia.",
        en: "Cultural and sports events for the University's students and the people of Wrocław.",
      },
      facts: [
        { value: "2008", label: { pl: "rok założenia", en: "founded" } },
        { value: "160+", label: { pl: "edycji projektów", en: "project editions" } },
      ],
      projects: ["Wrocławski Bieg Akademicki", "Nocne Kino Akademickie", "Turniej IKSS dla WOŚP", "Pracownia Teatralna", "FightIKSS", "Wrocław E-Sport Tournament"],
    },
    topics: ["IKSS", "kultura", "sport", "bieganie", "teatr", "kino", "e-sport", "culture", "running", "theatre", "cinema"],
    links: [
      { kind: "www", url: "https://ikss.ue.wroc.pl/" },
      { kind: "facebook", url: "https://www.facebook.com/IKSSUE" },
      { kind: "instagram", url: "https://www.instagram.com/ikssue" },
    ],
  },
  {
    id: "bit",
    logo: "/photos/organizacje/logo/bit.webp",
    name: "Klub Podróżników „Because I Travel”",
    kind: "organizacja",
    campus: "wroclaw",
    ssuew: true,
    desc: {
      pl: "Założyli go w 2008 roku studenci, którzy chcieli zarażać innych podróżami. Dziś to ponad sto osób i około dwudziestu projektów rocznie, w tym Auto Stop Race, największy wyścig autostopowy na świecie, który startuje z kampusu Uczelni. Wszystko robią jako wolontariusze.",
      en: "Founded in 2008 by students who wanted to share their love of travel. Today it has over a hundred members and runs around twenty projects a year, including Auto Stop Race, the world's largest hitchhiking race, which starts from the University campus. Everything is done by volunteers.",
    },
    feature: {
      short: "BIT",
      teaser: {
        pl: "Wyjazdy, festiwal podróżniczy i Auto Stop Race, największy wyścig autostopowy na świecie.",
        en: "Trips, a travel festival and Auto Stop Race, the world's largest hitchhiking race.",
      },
      facts: [
        { value: "100+", label: { pl: "aktywnych członków", en: "active members" } },
        { value: "20", label: { pl: "projektów rocznie", en: "projects a year" } },
      ],
      projects: ["Auto Stop Race", "Dni Podróżnika", "Rajd Ekonomisty", "Skok na Stok", "Metro Survival", "BITcast"],
    },
    topics: ["BIT", "podróże", "autostop", "wyjazdy", "rajd", "travel", "hitchhiking", "trips"],
    links: [
      { kind: "www", url: "https://klubpodroznikowbit.pl/" },
      { kind: "facebook", url: "https://www.facebook.com/KPBIT" },
      { kind: "instagram", url: "https://www.instagram.com/becauseitravel" },
    ],
  },
  {
    id: "esn",
    logo: "/photos/organizacje/logo/esn.webp",
    name: "ESN UE Wrocław",
    kind: "organizacja",
    campus: "wroclaw",
    desc: {
      pl: "Oddział Erasmus Student Network, największej organizacji studenckiej w Europie. Pomaga studentom z wymiany odnaleźć się na Uczelni, organizuje wydarzenia integracyjne i zachęca do wyjazdów za granicę.",
      en: "A branch of the Erasmus Student Network, Europe's largest student organisation. It helps exchange students settle in at the University, runs integration events and encourages studying abroad.",
    },
    topics: ["erasmus", "wymiana", "międzynarodowe", "języki", "exchange", "international"],
    links: [
      { kind: "www", url: "https://accounts.esn.org/section/pl-wroc-ue1" },
      { kind: "facebook", url: "https://www.facebook.com/esnuewwroclaw" },
    ],
  },
  {
    id: "nzs",
    logo: "/photos/organizacje/logo/nzs.webp",
    name: "Niezależne Zrzeszenie Studentów (NZS)",
    kind: "organizacja",
    campus: "wroclaw",
    desc: {
      pl: "Na Uczelni od 1980 roku. Projekty merytoryczne, charytatywne i rozrywkowe prowadzone przez zespoły z własnymi koordynatorami.",
      en: "At the University since 1980. Educational, charity and entertainment projects run by teams with their own coordinators.",
    },
    topics: ["projekty", "charytatywne", "wydarzenia", "projects", "charity", "events"],
    links: [{ kind: "www", url: "https://nzs.ue.wroc.pl/" }, { kind: "facebook", url: "https://www.facebook.com/NZS.UE.Wroc" }],
  },
  {
    id: "aiesec",
    logo: "/photos/organizacje/logo/aiesec.svg",
    name: "AIESEC",
    kind: "organizacja",
    campus: "wroclaw",
    desc: {
      pl: "Oddział AIESEC przy Uczelni. Wysyła wolontariuszy i praktykantów za granicę, prowadzi projekty dla wolontariuszy z zagranicy i rozwija kompetencje liderskie członków.",
      en: "The University branch of AIESEC. It sends volunteers and interns abroad, runs projects for international volunteers and builds members' leadership skills.",
    },
    topics: ["przywództwo", "praktyki", "zagranica", "leadership", "internships", "abroad"],
    links: [{ kind: "www", url: "https://aiesec.pl/oddzialy/wroclaw-uniwersytet-ekonomiczny/" }],
  },
  {
    id: "wiggor",
    name: "Stowarzyszenie Studenckie WIGGOR",
    kind: "organizacja",
    campus: "wroclaw",
    desc: {
      pl: "Od 1996 roku łączy studentów, którzy chcą zamieniać pomysły w realne projekty i budować kompetencje potrzebne na rynku pracy.",
      en: "Since 1996 it has brought together students who want to turn ideas into real projects and build skills for the job market.",
    },
    topics: ["projekty", "kariera", "rynek pracy", "projects", "career"],
    links: [{ kind: "facebook", url: "https://www.facebook.com/WIGGOR" }],
  },
  {
    id: "wsfk",
    name: "Wirtualna Studencka Firma Konsultingowa (WSFK)",
    kind: "organizacja",
    campus: "jelenia-gora",
    desc: {
      pl: "Działa w Filii w Jeleniej Górze jak firma symulacyjna: łączy realne potrzeby przedsiębiorstw z pomysłami studentów i daje doświadczenie w zarządzaniu projektami.",
      en: "Works at the Jelenia Góra Branch as a simulated company: it matches real business needs with students' ideas and gives experience in project management.",
    },
    topics: ["konsulting", "firma symulacyjna", "projekty", "Jelenia Góra", "consulting", "projects"],
    links: [],
  },
  {
    id: "cognitis",
    logo: "/photos/organizacje/logo/cognitis.webp",
    name: "Stowarzyszenie Cognitis",
    kind: "organizacja",
    campus: "wroclaw",
    desc: {
      pl: "Dla osób, które myślą o karierze w konsultingu. Zrzesza studentów czołowych polskich uczelni zainteresowanych doradztwem strategicznym i organizuje m.in. cykl wydarzeń „Złap Konsulting”.",
      en: "For students considering a career in consulting. It brings together students from leading Polish universities interested in strategy consulting and runs the \"Złap Konsulting\" event series, among others.",
    },
    topics: ["konsulting", "doradztwo", "case study", "consulting", "advisory"],
    links: [{ kind: "www", url: "http://www.cognitis.pl" }],
  },
  {
    id: "zsp",
    logo: "/photos/organizacje/logo/zsp.webp",
    name: "Zrzeszenie Studentów Polskich (ZSP)",
    kind: "organizacja",
    campus: "wroclaw",
    desc: {
      pl: "Oddział Zrzeszenia Studentów Polskich z ponad setką aktywnych członków. Projekty merytoryczne, charytatywne i rozrywkowe, a na co dzień praca w pięciu pionach: od administracji i finansów po HR, kontakty zewnętrzne i promocję.",
      en: "A branch of the Polish Students' Association with over a hundred active members. Educational, charity and entertainment projects, and day-to-day work in five teams: from administration and finance to HR, external relations and promotion.",
    },
    topics: ["projekty", "charytatywne", "kultura", "projects", "charity", "culture"],
    links: [{ kind: "www", url: "https://zspuewro.wixsite.com/zsp-ue-wroc-aw/blank-7" }],
  },
  {
    id: "sfbcc",
    logo: "/photos/organizacje/logo/sfbcc.svg",
    name: "Studenckie Forum Business Centre Club (SF BCC)",
    kind: "organizacja",
    campus: "wroclaw",
    desc: {
      pl: "Wspiera przedsiębiorczość młodych od 2001 roku: konferencje, warsztaty i projekty prowadzone we współpracy z Business Centre Club, jedną z największych organizacji przedsiębiorców w Polsce.",
      en: "Supporting young people's entrepreneurship since 2001: conferences, workshops and projects run with Business Centre Club, one of Poland's largest business associations.",
    },
    topics: ["biznes", "przedsiębiorczość", "startup", "business", "entrepreneurship"],
    links: [{ kind: "www", url: "http://www.sfbcc.org.pl" }],
  },
  {
    id: "ars-cantandi",
    logo: "/photos/organizacje/logo/ars-cantandi.webp",
    logoDark: true,
    name: "Chór „Ars Cantandi”",
    kind: "organizacja",
    campus: "wroclaw",
    desc: {
      pl: "Chór Uczelni od 2004 roku. Muzyka poważna i nie tylko, występy na uroczystościach Uczelni i festiwalach oraz nagrody z konkursów krajowych i międzynarodowych. Znajomość nut nie jest wymagana.",
      en: "The University choir since 2004. Classical music and more, performances at University ceremonies and festivals, and awards from national and international competitions. You don't need to read music.",
    },
    topics: ["chór", "muzyka", "śpiew", "choir", "music", "singing"],
    links: [{ kind: "www", url: "http://www.arscantandi.wroclaw.pl" }],
  },

  // ---------- Koła naukowe: Wrocław ----------
  {
    id: "enactus",
    logo: "/photos/organizacje/logo/enactus.webp",
    name: "Enactus UE Wrocław",
    kind: "kolo",
    campus: "wroclaw",
    unit: "Katedra Badań Marketingowych",
    desc: {
      pl: "Zespół międzynarodowej organizacji non-profit Enactus. Tworzy projekty biznesowe, które rozwiązują problemy lokalnej społeczności, i przy okazji uczy przedsiębiorczości, pracy w zespole, modeli biznesowych i analizy finansowej.",
      en: "A team of the international non-profit Enactus. It builds business projects that solve problems in the local community, and along the way teaches entrepreneurship, teamwork, business models and financial analysis.",
    },
    topics: ["przedsiębiorczość społeczna", "projekty", "marketing", "ESG", "social entrepreneurship"],
    links: [
      { kind: "www", url: "https://enactus.pl/enactus-uniwersytet-ekonomiczny-we-wroclawiu/" },
      { kind: "facebook", url: "https://www.facebook.com/EnactusUEWroclaw" },
    ],
  },
  {
    id: "ai4business",
    logo: "/photos/organizacje/logo/ai4business.webp",
    name: "Koło Naukowe AI4Business",
    kind: "kolo",
    campus: "wroclaw",
    unit: "Katedra Inteligencji Biznesowej w Zarządzaniu",
    desc: {
      pl: "Sztuczna inteligencja i analiza danych w praktyce: projekty dla partnerów zewnętrznych, m.in. szpitali i uczelni, od pomysłu i prototypu po testy i wdrożenie. Do tego warsztaty z machine learningu i programowania.",
      en: "AI and data analysis in practice: projects for external partners such as hospitals and universities, from idea and prototype to testing and deployment. Plus workshops in machine learning and programming.",
    },
    topics: ["AI", "sztuczna inteligencja", "machine learning", "dane", "programowanie", "data", "programming"],
    links: [
      { kind: "www", url: "https://ai4business.edu.pl/" },
      { kind: "facebook", url: "https://www.facebook.com/profile.php?id=61574131987453" },
      { kind: "instagram", url: "https://www.instagram.com/ai4business_uew/" },
      { kind: "linkedin", url: "https://www.linkedin.com/company/ko%C5%82o-naukowe-ai4business/" },
    ],
  },
  {
    id: "biofood",
    name: "Koło Naukowe BioFood",
    kind: "kolo",
    campus: "wroclaw",
    unit: "Katedra Technologii Żywności i Żywienia",
    desc: {
      pl: "Badania żywności w laboratorium, m.in. naturalnych przeciwutleniaczy w produktach mięsnych i jakości produktów marynowanych. Efektem są prace inżynierskie i publikacja naukowa.",
      en: "Food research in the lab, including natural antioxidants in meat products and the quality of marinated products. The results include engineering theses and a scientific publication.",
    },
    topics: ["żywność", "laboratorium", "technologia żywności", "food", "lab", "food technology"],
    links: [{ kind: "facebook", url: "https://www.facebook.com/profile.php?id=100090255109355" }],
  },
  {
    id: "chemicy",
    name: "Koło Naukowe Chemików",
    kind: "kolo",
    campus: "wroclaw",
    unit: "Katedra Chemii Bioorganicznej",
    desc: {
      pl: "Działa od 2009 roku. Własne projekty badawcze, pokazy na Dolnośląskim Festiwalu Nauki i wycieczki do instytutów oraz zakładów chemicznych.",
      en: "Active since 2009. Student research projects, shows at the Lower Silesian Science Festival and trips to research institutes and chemical plants.",
    },
    topics: ["chemia", "laboratorium", "festiwal nauki", "chemistry", "lab", "science"],
    links: [],
  },
  {
    id: "feb",
    name: "Koło Naukowe Forum Edukacji Biznesowej",
    kind: "kolo",
    campus: "wroclaw",
    unit: "Katedra Strategii i Metod Zarządzania",
    desc: {
      pl: "Spotkania z praktykami biznesu i wizyty studyjne w firmach. Gośćmi koła byli m.in. Rafał Brzoska (InPost), Marcin Iwiński (CD Projekt) i Herbert Wirth (KGHM).",
      en: "Talks with business practitioners and study visits to companies. Past guests include Rafał Brzoska (InPost), Marcin Iwiński (CD Projekt) and Herbert Wirth (KGHM).",
    },
    topics: ["biznes", "prelekcje", "przedsiębiorczość", "business", "talks", "entrepreneurship"],
    links: [
      { kind: "facebook", url: "https://www.facebook.com/forum.edukacji.biznesowej" },
      { kind: "instagram", url: "https://www.instagram.com/feb_ue/" },
      { kind: "linkedin", url: "https://pl.linkedin.com/company/forum-edukacji-biznesowej" },
    ],
  },
  {
    id: "go-global",
    name: "Koło Naukowe Go Global",
    kind: "kolo",
    campus: "wroclaw",
    unit: "Katedra Międzynarodowych Stosunków Gospodarczych",
    desc: {
      pl: "Biznes międzynarodowy i komunikacja międzykulturowa: projekty z uczelniami zagranicznymi, badania firm i instytucji, warsztaty, konferencje i praca w międzynarodowym zespole.",
      en: "International business and intercultural communication: projects with foreign universities, research on companies and institutions, workshops, conferences and work in an international team.",
    },
    topics: ["międzynarodowe", "biznes międzynarodowy", "kultura", "international", "global business"],
    links: [],
  },
  {
    id: "aliquanta",
    name: "Koło Naukowe Gospodarki Przestrzennej Aliquanta",
    kind: "kolo",
    campus: "wroclaw",
    unit: "Katedra Gospodarki Przestrzennej i Administracji Samorządowej",
    desc: {
      pl: "Gospodarka przestrzenna w praktyce: nieruchomości, urbanistyka, polityka miejska i regionalna. Organizuje ogólnopolską konferencję naukową „MIASTO - współczesne problemy w zarządzaniu przestrzenią zurbanizowaną”.",
      en: "Spatial economy in practice: real estate, urban planning, urban and regional policy. It runs the national conference \"MIASTO\" on managing urban space.",
    },
    topics: ["miasto", "urbanistyka", "nieruchomości", "przestrzeń", "urban", "real estate"],
    links: [{ kind: "facebook", url: "https://www.facebook.com/Aliquanta/" }],
  },
  {
    id: "hashtag",
    name: "Koło Naukowe Hashtag",
    kind: "kolo",
    campus: "wroclaw",
    unit: "Katedra Socjologii i Polityki Społecznej",
    desc: {
      pl: "Trendy społeczne, media i marketing: komunikacja w reklamie, PR i zasoby ludzkie. Dla osób, które wiążą przyszłość zawodową z mediami i reklamą.",
      en: "Social trends, media and marketing: advertising communication, PR and human resources. For people who see their future in media and advertising.",
    },
    topics: ["media", "reklama", "PR", "socjologia", "komunikacja", "advertising", "communication"],
    links: [{ kind: "facebook", url: "https://www.facebook.com/profile.php?id=61560364913850" }],
  },
  {
    id: "klub-mowcow",
    name: "Koło Naukowe Klub Mówców",
    kind: "kolo",
    campus: "wroclaw",
    unit: "Katedra Ekonomii i Finansów",
    desc: {
      pl: "Wystąpienia publiczne i sztuka dyskusji: warsztaty mówienia przed publicznością, debaty oksfordzkie na Uczelni i ćwiczenia z budowania argumentacji.",
      en: "Public speaking and the art of debate: workshops on speaking in front of an audience, Oxford-style debates at the University and practice in building arguments.",
    },
    topics: ["debaty", "wystąpienia", "retoryka", "debate", "public speaking"],
    links: [{ kind: "facebook", url: "https://www.facebook.com/KNKlubMowcowUE" }],
  },
  {
    id: "logis",
    name: "Koło Naukowe Logis",
    kind: "kolo",
    campus: "wroclaw",
    unit: "Katedra Logistyki",
    desc: {
      pl: "Logistyka i łańcuch dostaw: badania naukowe, konferencje, szkolenia oraz współpraca z firmami i innymi kołami.",
      en: "Logistics and supply chains: research, conferences, training and cooperation with companies and other clubs.",
    },
    topics: ["logistyka", "łańcuch dostaw", "logistics", "supply chain"],
    links: [{ kind: "facebook", url: "https://www.facebook.com/profile.php?id=100054467559262" }],
  },
  {
    id: "mlody-adept",
    name: "Koło Naukowe Młody Adept",
    kind: "kolo",
    campus: "wroclaw",
    unit: "Katedra Mikroekonomii i Ekonomii Instytucjonalnej",
    desc: {
      pl: "Ekonomia i inżynieria produkcji: praktyczna wiedza o produkcji i wymiana doświadczeń między członkami koła.",
      en: "Economics and production engineering: practical knowledge about production and sharing experience between members.",
    },
    topics: ["ekonomia", "produkcja", "mikroekonomia", "economics", "production"],
    links: [],
  },
  {
    id: "pareto",
    name: "Koło Naukowe Pareto",
    kind: "kolo",
    campus: "wroclaw",
    unit: "Katedra Zarządzania Strategicznego; Katedra Ekonomii Matematycznej",
    desc: {
      pl: "Wszechstronny rozwój członków: umiejętności przedsiębiorcze i projekty łączące naukę z praktyką, w których wyzwania są okazją do nauki.",
      en: "All-round development for members: entrepreneurial skills and projects that combine learning with practice, treating challenges as a chance to grow.",
    },
    topics: ["rozwój osobisty", "przedsiębiorczość", "strategia", "personal development", "strategy"],
    links: [],
  },
  {
    id: "plantfood",
    name: "Koło Naukowe PlantFood",
    kind: "kolo",
    campus: "wroclaw",
    unit: "Katedra Inżynierii Bioprocesowej",
    desc: {
      pl: "Żywność pochodzenia roślinnego, zwłaszcza fermentowana: planowanie eksperymentów i analizy laboratoryjne. Wyniki trafiają na konferencje i do czasopism naukowych, a koło współorganizuje ogólnopolską konferencję „Wkraczając w świat nauki”.",
      en: "Plant-based food, especially fermented: planning experiments and lab analysis. Results go to conferences and journals, and the club co-organises the national conference \"Wkraczając w świat nauki\".",
    },
    topics: ["żywność", "fermentacja", "bioprocesy", "laboratorium", "food", "fermentation"],
    links: [],
  },
  {
    id: "rozwoj-regionalny",
    name: "Koło Naukowe Rozwoju Regionalnego",
    kind: "kolo",
    campus: "wroclaw",
    unit: "Katedra Gospodarki Regionalnej",
    desc: {
      pl: "Ekonomia, analiza ekonomiczna i rozwój regionalny: własne projekty badawcze, warsztaty i seminaria oraz współpraca z kołami w kraju i za granicą.",
      en: "Economics, economic analysis and regional development: student research projects, workshops and seminars, and cooperation with clubs in Poland and abroad.",
    },
    topics: ["region", "rozwój lokalny", "analiza ekonomiczna", "regional development"],
    links: [
      { kind: "facebook", url: "https://www.facebook.com/sknrozwojuregionalnego/" },
      { kind: "linkedin", url: "https://www.linkedin.com/company/skn-rozwoju-regionalnego/" },
    ],
  },
  {
    id: "hossa",
    logo: "/photos/organizacje/logo/hossa.webp",
    name: "Koło Naukowe Rynków Kapitałowych Hossa ProCapital",
    kind: "kolo",
    campus: "wroclaw",
    unit: "Katedra Finansów; Katedra Inwestycji Finansowych i Zarządzania Ryzykiem",
    desc: {
      pl: "Rynki kapitałowe i inwestowanie od prawie 30 lat. Cotygodniowe spotkania środowe z analizami i warsztatami, otwarte konferencje z gośćmi z branży finansowej i wyjazdy na wydarzenia w całej Polsce. Ponad 150 aktywnych członków.",
      en: "Capital markets and investing for almost 30 years. Weekly Wednesday meetings with analyses and workshops, open conferences with guests from the finance industry and trips to events across Poland. Over 150 active members.",
    },
    topics: ["giełda", "inwestowanie", "finanse", "rynki kapitałowe", "stock market", "investing", "finance"],
    links: [
      { kind: "www", url: "https://hossaprocapital.pl/" },
      { kind: "facebook", url: "https://www.facebook.com/knrkhossaprocapital" },
      { kind: "instagram", url: "https://www.instagram.com/hossaprocapital/" },
      { kind: "linkedin", url: "https://www.linkedin.com/company/knrk-hossa-procapital/" },
      { kind: "tiktok", url: "https://www.tiktok.com/@hossaprocapital" },
    ],
  },
  {
    id: "bezpieczenstwo",
    name: "Koło Naukowe Zarządzania Bezpieczeństwem w Organizacji",
    kind: "kolo",
    campus: "wroclaw",
    unit: "Katedra Agroinżynierii i Analizy Jakości",
    desc: {
      pl: "Bezpieczeństwo żywności i organizacja rynku żywności: szkolenia, wyjazdy studyjne i konferencje. Koło realizowało m.in. projekt „Żywność z recyklingu” w ramach wrocławskiego Funduszu Aktywności Studenckiej. Otwarte dla studentów całej Uczelni.",
      en: "Food safety and food market organisation: training, study trips and conferences. Projects include \"Food from recycling\", funded by Wrocław's Student Activity Fund. Open to students from the whole University.",
    },
    topics: ["bezpieczeństwo", "żywność", "jakość", "safety", "food safety"],
    links: [{ kind: "www", url: "https://fastprojektzr.ue.wroc.pl/" }],
  },
  {
    id: "qualiteam",
    name: "Koło Naukowe Zarządzania Jakością QUALITEAM",
    kind: "kolo",
    campus: "wroclaw",
    unit: "Katedra Pracy, Kapitału i Innowacji",
    desc: {
      pl: "Zarządzanie jakością od strony technologii, organizacji i ekonomii: szkolenia, referaty i badania nad poprawą jakości produktów.",
      en: "Quality management from the technological, organisational and economic side: training, talks and research on improving product quality.",
    },
    topics: ["jakość", "zarządzanie jakością", "quality", "quality management"],
    links: [{ kind: "facebook", url: "https://www.facebook.com/knzj.qualiteam/" }],
  },
  {
    id: "zarzadzanie-projektami",
    name: "Koło Naukowe Zarządzanie Projektami",
    kind: "kolo",
    campus: "wroclaw",
    unit: "Katedra Ekonomiki i Organizacji Przedsiębiorstwa",
    desc: {
      pl: "Zarządzanie projektami w praktyce: realne projekty z dofinansowaniem, organizacja wydarzeń i meet-upy z przedsiębiorcami. Członkowie mogą zdobyć certyfikat IPMA Student.",
      en: "Project management in practice: real funded projects, event organisation and meet-ups with entrepreneurs. Members can earn the IPMA Student certificate.",
    },
    topics: ["projekty", "eventy", "IPMA", "project management", "events"],
    links: [
      { kind: "facebook", url: "https://www.facebook.com/share/17h6Bkb9U4/" },
      { kind: "instagram", url: "https://www.instagram.com/pmclub_uew" },
      { kind: "linkedin", url: "https://www.linkedin.com/company/kolo-naukowe-zarzadzanie-projektami/" },
    ],
  },
  {
    id: "saper",
    logo: "/photos/organizacje/logo/saper.webp",
    name: "Koło Naukowe Zintegrowanych Systemów Informatycznych SAPer",
    kind: "kolo",
    campus: "wroclaw",
    unit: "Katedra Ekonomiki i Organizacji Przedsiębiorstwa",
    desc: {
      pl: "Systemy SAP od środka: cotygodniowe zajęcia z finansów i controllingu, logistyki, Business Intelligence i programowania w ABAP. Dla osób, które myślą o pracy konsultanta SAP.",
      en: "SAP systems from the inside: weekly sessions on finance and controlling, logistics, Business Intelligence and ABAP programming. For anyone considering a career as an SAP consultant.",
    },
    topics: ["SAP", "ERP", "ABAP", "BI", "informatyka", "programowanie", "IT", "programming"],
    links: [
      { kind: "www", url: "https://www.knsaper.pl" },
      { kind: "facebook", url: "https://www.facebook.com/knsaper" },
      { kind: "instagram", url: "https://instagram.com/knsaper/" },
    ],
  },

  // ---------- Koła naukowe: Filia w Jeleniej Górze ----------
  {
    id: "economicus",
    name: "Koło Naukowe „Economicus”",
    kind: "kolo",
    campus: "jelenia-gora",
    unit: "Katedra Ekonomii i Polityki Ekonomicznej",
    desc: {
      pl: "Ekonomia w praktyce, zwłaszcza analiza ekonomiczna i finanse: współpraca z firmami, panele dyskusyjne, badania i konferencje.",
      en: "Economics in practice, especially economic analysis and finance: cooperation with companies, panel discussions, research and conferences.",
    },
    topics: ["ekonomia", "analiza ekonomiczna", "finanse", "economics", "finance"],
    links: [{ kind: "facebook", url: "https://www.facebook.com/profile.php?id=100063835036437" }],
  },
  {
    id: "finansista",
    name: "Koło Naukowe Finansów i Rachunkowości „Finansista”",
    kind: "kolo",
    campus: "jelenia-gora",
    unit: "Katedra Finansów i Rachunkowości",
    desc: {
      pl: "Finanse i rachunkowość: spotkania dyskusyjne, konferencje, projekty badawcze i współpraca ze Stowarzyszeniem Księgowych w Polsce.",
      en: "Finance and accounting: discussion meetings, conferences, research projects and cooperation with the Accountants Association in Poland.",
    },
    topics: ["rachunkowość", "finanse", "księgowość", "accounting", "finance"],
    links: [{ kind: "facebook", url: "https://www.facebook.com/groups/1862339103805734" }],
  },
  {
    id: "meritum",
    name: "Koło Naukowe Zarządzania i Przedsiębiorczości „MERITUM”",
    kind: "kolo",
    campus: "jelenia-gora",
    unit: "Katedra Nauk o Przedsiębiorstwie",
    desc: {
      pl: "Nowoczesne zarządzanie wdrażane w firmach i rozwój przedsiębiorczości: dla osób, które chcą czegoś więcej niż teorii.",
      en: "Modern management applied in companies and the development of entrepreneurship: for people who want more than theory.",
    },
    topics: ["zarządzanie", "przedsiębiorczość", "management", "entrepreneurship"],
    links: [{ kind: "facebook", url: "https://www.facebook.com/KoloNaukoweMeritum" }],
  },
  {
    id: "marketingowe",
    name: "Marketingowe Koło Naukowe",
    kind: "kolo",
    campus: "jelenia-gora",
    unit: "Katedra Nauk o Przedsiębiorstwie",
    desc: {
      pl: "Marketing cyfrowy w praktyce: badanie, czy w turystyce lepiej działa marketing organiczny czy płatny, strategie w Business Suite i Facebook Ads oraz zasady marketingu w sieci zgodne z RODO.",
      en: "Digital marketing in practice: testing whether organic or paid marketing works better in tourism, strategies in Business Suite and Facebook Ads, and GDPR-compliant online marketing.",
    },
    topics: ["marketing", "social media", "reklama", "digital marketing", "advertising"],
    links: [{ kind: "facebook", url: "https://www.facebook.com/groups/1933847743521740" }],
  },
  {
    id: "logrit",
    name: "Naukowe Koło Logistyczne LOGRiT",
    kind: "kolo",
    campus: "jelenia-gora",
    unit: "Katedra Zarządzania Strategicznego i Logistyki",
    desc: {
      pl: "Kształci młodych logistyków: konferencje, publikacje, wizyty studyjne i projekty, także z HR czy finansów oglądanych z logistycznej perspektywy.",
      en: "Training young logisticians: conferences, publications, study visits and projects, including HR and finance seen from a logistics perspective.",
    },
    topics: ["logistyka", "łańcuch dostaw", "logistics", "supply chain"],
    links: [{ kind: "facebook", url: "https://www.facebook.com/profile.php?id=100064642273476" }],
  },
];
