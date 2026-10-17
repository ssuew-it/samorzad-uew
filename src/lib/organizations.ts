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
  /** Działa przy Samorządzie Studentów UEW — wyróżnione w „Działaj z nami”. */
  ssuew?: boolean;
  /** Link wewnętrzny zamiast zewnętrznego (np. dla samego Samorządu). */
  internalHref?: string;
}

export const organizations: Organization[] = [
  // ---------- Organizacje studenckie ----------
  {
    id: "samorzad",
    name: "Samorząd Studentów UEW",
    kind: "organizacja",
    campus: "wroclaw",
    ssuew: true,
    internalHref: "/struktura-samorzadu",
    desc: {
      pl: "Reprezentuje wszystkich studentów wobec uczelni, dba o ich prawa i organizuje wydarzenia, które tworzą studenckie życie na UEW.",
      en: "Represents all students before the university, looks after their rights and organises the events that make up student life at UEW.",
    },
    topics: ["samorząd", "prawa studenta", "wydarzenia", "juwenalia", "student government", "events"],
    links: [],
  },
  {
    id: "ikss",
    name: "IKSS (Informacja Kulturalno-Sportowa Studentów)",
    kind: "organizacja",
    campus: "wroclaw",
    ssuew: true,
    desc: {
      pl: "Część Samorządu od kultury i sportu: biegi akademickie, Pracownia Teatralna i wydarzenia dla studentów oraz mieszkańców Wrocławia.",
      en: "The Student Government’s culture and sport team: academic runs, a theatre workshop and events for students and Wrocław residents.",
    },
    topics: ["kultura", "sport", "bieganie", "teatr", "culture", "running", "theatre"],
    links: [{ kind: "facebook", url: "https://www.facebook.com/IKSSUE" }],
  },
  {
    id: "bit",
    name: "Klub Podróżników BIT",
    kind: "organizacja",
    campus: "wroclaw",
    ssuew: true,
    desc: {
      pl: "Działa przy Samorządzie i organizuje podróżnicze projekty: Auto Stop Race, Dni Podróżnika czy Rajd Ekonomisty.",
      en: "Works alongside the Student Government and runs travel projects such as Auto Stop Race, Travellers’ Days and the Economist Rally.",
    },
    topics: ["podróże", "autostop", "wyjazdy", "rajd", "travel", "hitchhiking", "trips"],
    links: [{ kind: "www", url: "https://www.klubpodroznikowbit.pl" }],
  },
  {
    id: "esn",
    name: "ESN UE Wrocław",
    kind: "organizacja",
    campus: "wroclaw",
    desc: {
      pl: "Część Erasmus Student Network, największej studenckiej organizacji w Europie. Wspiera studentów z wymiany i promuje mobilność.",
      en: "Part of Erasmus Student Network, Europe’s largest student organisation. Supports exchange students and promotes mobility.",
    },
    topics: ["erasmus", "wymiana", "międzynarodowe", "języki", "exchange", "international"],
    links: [{ kind: "facebook", url: "https://www.facebook.com/esnuewwroclaw" }],
  },
  {
    id: "nzs",
    name: "Niezależne Zrzeszenie Studentów (NZS)",
    kind: "organizacja",
    campus: "wroclaw",
    desc: {
      pl: "Na UEW od 1980 roku. Projekty merytoryczne, charytatywne i rozrywkowe w jednym z największych oddziałów NZS w Polsce.",
      en: "At UEW since 1980. Educational, charity and social projects in one of the largest NZS branches in Poland.",
    },
    topics: ["projekty", "charytatywne", "wydarzenia", "projects", "charity", "events"],
    links: [{ kind: "facebook", url: "https://www.facebook.com/NZS.UE.Wroc" }],
  },
  {
    id: "aiesec",
    name: "AIESEC",
    kind: "organizacja",
    campus: "wroclaw",
    desc: {
      pl: "Międzynarodowa organizacja rozwijająca przywództwo. Dobry start dla osób, które myślą o karierze w globalnym środowisku.",
      en: "An international organisation that builds leadership. A good start if you are thinking about a career in a global environment.",
    },
    topics: ["przywództwo", "praktyki", "zagranica", "leadership", "internships", "abroad"],
    links: [{ kind: "www", url: "https://www.aiesec.pl" }],
  },
  {
    id: "wiggor",
    name: "Stowarzyszenie Studenckie WIGGOR",
    kind: "organizacja",
    campus: "wroclaw",
    desc: {
      pl: "Od 1996 roku łączy osoby, które chcą działać: pomysły zamieniają się tu w realne projekty i kompetencje na rynek pracy.",
      en: "Since 1996 it has brought together people who want to act: ideas become real projects and skills for the job market.",
    },
    topics: ["projekty", "kariera", "rynek pracy", "projects", "career"],
    links: [{ kind: "facebook", url: "https://www.facebook.com/WIGGOR" }],
  },
  {
    id: "cognitis",
    name: "Stowarzyszenie Cognitis",
    kind: "organizacja",
    campus: "wroclaw",
    desc: {
      pl: "Dla osób, które planują karierę w doradztwie i konsultingu.",
      en: "For students planning a career in advisory and consulting.",
    },
    topics: ["konsulting", "doradztwo", "case study", "consulting", "advisory"],
    links: [{ kind: "www", url: "http://www.cognitis.pl" }],
  },
  {
    id: "zsp",
    name: "Zrzeszenie Studentów Polskich UEW (ZSP)",
    kind: "organizacja",
    campus: "wroclaw",
    desc: {
      pl: "Projekty merytoryczne, charytatywne i kulturalne. Łączy realizację pasji z dobrą zabawą.",
      en: "Educational, charity and cultural projects that combine pursuing your interests with having fun.",
    },
    topics: ["projekty", "charytatywne", "kultura", "projects", "charity", "culture"],
    links: [{ kind: "www", url: "https://zspuewro.wixsite.com/zsp-ue-wroc-aw" }],
  },
  {
    id: "sfbcc",
    name: "Studenckie Forum Business Centre Club (SF BCC)",
    kind: "organizacja",
    campus: "wroclaw",
    desc: {
      pl: "Wspiera przedsiębiorczość: biznesowe wydarzenia, które inspirują do realizacji własnych pomysłów.",
      en: "Supports entrepreneurship through business events that inspire you to pursue your own ideas.",
    },
    topics: ["biznes", "przedsiębiorczość", "startup", "business", "entrepreneurship"],
    links: [{ kind: "www", url: "http://www.sfbcc.org.pl" }],
  },
  {
    id: "ars-cantandi",
    name: "Chór „Ars Cantandi” UEW",
    kind: "organizacja",
    campus: "wroclaw",
    desc: {
      pl: "Muzyka poważna i nie tylko. Miejsce dla każdego, niezależnie od doświadczenia, nawet bez znajomości nut.",
      en: "Classical music and more. A place for everyone regardless of experience, even if you can’t read music.",
    },
    topics: ["chór", "muzyka", "śpiew", "choir", "music", "singing"],
    links: [{ kind: "www", url: "http://www.arscantandi.wroclaw.pl" }],
  },

  // ---------- Koła naukowe: Wrocław ----------
  {
    id: "enactus",
    name: "Enactus UE Wrocław",
    kind: "kolo",
    campus: "wroclaw",
    unit: "Katedra Badań Marketingowych",
    desc: {
      pl: "Część międzynarodowej sieci Enactus, która łączy studentów, opiekunów naukowych i praktyków biznesu wokół projektów społecznych.",
      en: "Part of the international Enactus network that brings students, academic advisors and business practitioners together around social projects.",
    },
    topics: ["przedsiębiorczość społeczna", "projekty", "marketing", "social entrepreneurship"],
    links: [{ kind: "facebook", url: "https://www.facebook.com/EnactusUEWroclaw" }],
  },
  {
    id: "ai4business",
    name: "Koło Naukowe AI4Business",
    kind: "kolo",
    campus: "wroclaw",
    unit: "Katedra Inteligencji Biznesowej w Zarządzaniu",
    desc: {
      pl: "Sztuczna inteligencja i analiza danych w praktyce: realne projekty dla partnerów, od pomysłu i prototypu po wdrożenie.",
      en: "Artificial intelligence and data analysis in practice: real projects for partners, from idea and prototype to deployment.",
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
      pl: "Badania laboratoryjne nad żywnością, m.in. naturalne przeciwutleniacze i jakość produktów mięsnych. Otwarte dla wszystkich wydziałów.",
      en: "Laboratory research on food, including natural antioxidants and meat product quality. Open to students of all faculties.",
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
      pl: "Od 2009 roku: projekty badawcze, pokazy na Dolnośląskim Festiwalu Nauki i wyjazdy do instytucji naukowych.",
      en: "Since 2009: research projects, shows at the Lower Silesian Science Festival and trips to research institutions.",
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
      pl: "Spotkania z praktykami biznesu, prelekcje i wizyty studyjne w firmach. Dla osób, które chcą zobaczyć biznes od środka.",
      en: "Meetings with business practitioners, talks and study visits to companies. For anyone who wants to see business from the inside.",
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
      pl: "Biznes międzynarodowy i komunikacja międzykulturowa: projekty z zagranicznymi uczelniami, warsztaty i konferencje.",
      en: "International business and intercultural communication: projects with foreign universities, workshops and conferences.",
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
      pl: "Nieruchomości, urbanistyka i polityka miejska. Od lat organizuje ogólnopolską konferencję „MIASTO”.",
      en: "Real estate, urban planning and city policy. Organises the national “MIASTO” conference every year.",
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
      pl: "Trendy społeczne, media, reklama i PR. Dla osób, które wiążą przyszłość z komunikacją.",
      en: "Social trends, media, advertising and PR. For those who see their future in communication.",
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
      pl: "Wystąpienia publiczne i sztuka dyskusji: warsztaty, debaty oksfordzkie i budowanie argumentacji.",
      en: "Public speaking and the art of debate: workshops, Oxford-style debates and building arguments.",
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
      pl: "Logistyka i łańcuch dostaw: badania, konferencje i współpraca z firmami.",
      en: "Logistics and supply chains: research, conferences and cooperation with companies.",
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
      pl: "Ekonomia i inżynieria produkcji w praktyce. Miejsce na wymianę wiedzy i doświadczeń.",
      en: "Economics and production engineering in practice. A place to share knowledge and experience.",
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
      pl: "Wszechstronny rozwój umiejętności życiowych i przedsiębiorczych: nauka połączona z praktyką.",
      en: "All-round development of life and entrepreneurial skills, combining study with practice.",
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
      pl: "Żywność roślinna i fermentowana: planowanie eksperymentów, analizy i publikacje. Współorganizuje konferencję „Wkraczając w świat nauki”.",
      en: "Plant-based and fermented food: experiment design, analysis and publications. Co-organises the “Wkraczając w świat nauki” conference.",
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
      pl: "Analiza ekonomiczna, badania regionalne i rozwój lokalny: warsztaty, projekty badawcze i konferencje.",
      en: "Economic analysis, regional research and local development: workshops, research projects and conferences.",
    },
    topics: ["region", "rozwój lokalny", "analiza ekonomiczna", "regional development"],
    links: [
      { kind: "facebook", url: "https://www.facebook.com/sknrozwojuregionalnego/" },
      { kind: "linkedin", url: "https://www.linkedin.com/company/skn-rozwoju-regionalnego/" },
    ],
  },
  {
    id: "hossa",
    name: "Koło Naukowe Rynków Kapitałowych Hossa ProCapital",
    kind: "kolo",
    campus: "wroclaw",
    unit: "Katedra Finansów; Katedra Inwestycji Finansowych i Zarządzania Ryzykiem",
    desc: {
      pl: "Rynki finansowe, zwłaszcza kapitałowy: dyskusje, projekty, seminaria i konferencje.",
      en: "Financial markets, especially capital markets: discussions, projects, seminars and conferences.",
    },
    topics: ["giełda", "inwestowanie", "finanse", "rynki kapitałowe", "stock market", "investing", "finance"],
    links: [
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
      pl: "Systemy bezpieczeństwa, zwłaszcza żywności: szkolenia, wyjazdy studyjne i konferencje. Otwarte dla całego UEW.",
      en: "Safety systems, especially food safety: training, study trips and conferences. Open to all of UEW.",
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
      pl: "Jakość produktów z perspektywy technologii, organizacji i ekonomii: szkolenia i referaty.",
      en: "Product quality from technological, organisational and economic perspectives: training and talks.",
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
      pl: "Praktyka w zarządzaniu projektami i organizacji wydarzeń: realne projekty z dofinansowaniem i możliwość certyfikatu IPMA Student.",
      en: "Hands-on project management and event organisation: real funded projects and a chance to earn the IPMA Student certificate.",
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
    name: "Koło Naukowe Zintegrowanych Systemów Informatycznych SAPer",
    kind: "kolo",
    campus: "wroclaw",
    unit: "Katedra Ekonomiki i Organizacji Przedsiębiorstwa",
    desc: {
      pl: "Systemy SAP od środka: logistyka, finanse, programowanie w ABAP i Business Intelligence na cotygodniowych spotkaniach.",
      en: "SAP systems from the inside: logistics, finance, ABAP programming and Business Intelligence at weekly meetings.",
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
      pl: "Ekonomia w praktyce, zwłaszcza analiza ekonomiczna i finanse: współpraca z firmami, panele i badania.",
      en: "Economics in practice, especially economic analysis and finance: work with companies, panels and research.",
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
      pl: "Finanse i rachunkowość: spotkania, konferencje, projekty badawcze i współpraca ze Stowarzyszeniem Księgowych w Polsce.",
      en: "Finance and accounting: meetings, conferences, research projects and cooperation with the Accountants Association in Poland.",
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
      pl: "Nowoczesne zarządzanie w firmach i przedsiębiorczość młodych ludzi, w praktyce, a nie tylko w teorii.",
      en: "Modern management in companies and youth entrepreneurship, in practice rather than just theory.",
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
      pl: "Marketing cyfrowy w praktyce: strategie w Business Suite i Facebook Ads, porównanie marketingu organicznego i płatnego.",
      en: "Digital marketing in practice: strategies in Business Suite and Facebook Ads, comparing organic and paid marketing.",
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
      pl: "Logistyka naukowo i biznesowo: konferencje, publikacje, wizyty studyjne i projekty z praktykami.",
      en: "Logistics from both a research and business angle: conferences, publications, study visits and projects with practitioners.",
    },
    topics: ["logistyka", "łańcuch dostaw", "logistics", "supply chain"],
    links: [{ kind: "facebook", url: "https://www.facebook.com/profile.php?id=100064642273476" }],
  },
];
