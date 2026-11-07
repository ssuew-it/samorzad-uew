/**
 * Funkcje do wyboru w generatorze stopki (lista od Mikołaja, 7.11.2026).
 *
 * Każda funkcja kończy się pełną nazwą Samorządu - tak wygląda stanowisko
 * w stopkach członków i tak brzmi poprawna nazwa jednostki (księga znaku).
 * Stopka jest po polsku także w angielskiej wersji Strefy, więc lista nie
 * idzie przez tłumaczenia.
 *
 * Komisje i składy mają obie formy (Członek / Członkini). Funkcje jednoosobowe
 * w brzmieniu podanym przez Mikołaja; inne brzmienie każdy może wpisać sam
 * („Inna - wpiszę własną”).
 */

const SSUEW = "Samorządu Studentów Uniwersytetu Ekonomicznego we Wrocławiu";

/** Obie formy: „Członek …” i „Członkini …”. */
const obie = (reszta: string) => [`Członek ${reszta} ${SSUEW}`, `Członkini ${reszta} ${SSUEW}`];

export interface SignatureRoleGroup {
  /** null = bez nagłówka (pierwsza, domyślna grupa). */
  label: string | null;
  roles: string[];
}

export const SIGNATURE_ROLE_GROUPS: SignatureRoleGroup[] = [
  { label: null, roles: obie("Komisji") },
  {
    label: "Komisje",
    roles: [
      ...obie("Komisji ds. Administracji"),
      ...obie("Komisji ds. Finansów"),
      ...obie("Komisji ds. Dydaktyki i Jakości Kształcenia"),
      ...obie("Komisji ds. Human Resources"),
      ...obie("Komisji ds. Kontaktów Zewnętrznych"),
      ...obie("Komisji ds. Promocji"),
    ],
  },
  {
    label: "Zarząd",
    roles: [
      "Przewodniczący",
      "Wiceprzewodniczący ds. Strategii i Działań Operacyjnych",
      "Wiceprzewodnicząca ds. Projektów",
      "Wiceprzewodnicząca ds. Public Relations",
      "Członkini Zarządu ds. Administracji",
      "Członkini Zarządu ds. Kontaktów Zewnętrznych",
      "Członkini Zarządu ds. Dydaktyki i Jakości Kształcenia",
      "Członkini Zarządu ds. Promocji",
      "Członkini Zarządu ds. Finansów",
      "Członkini Zarządu ds. Human Resources",
      "Członek Zarządu ds. Filii w Jeleniej Górze",
    ].map((f) => `${f} ${SSUEW}`),
  },
  {
    label: "Komisja Rewizyjna",
    roles: [...obie("Komisji Rewizyjnej"), `Przewodnicząca Komisji Rewizyjnej ${SSUEW}`],
  },
  {
    label: "Studencka Komisja Wyborcza",
    roles: [...obie("Studenckiej Komisji Wyborczej"), `Przewodniczący Studenckiej Komisji Wyborczej ${SSUEW}`],
  },
  { label: "Rzecznik Praw Studenta", roles: [`Rzecznik Praw Studenta ${SSUEW}`] },
];

export const DEFAULT_SIGNATURE_ROLE = SIGNATURE_ROLE_GROUPS[0]!.roles[0]!;

/**
 * Numer telefonu ze spacją co trzy cyfry, formatowany w trakcie wpisywania:
 * „514174791” → „514 174 791”, „+48514174791” → „+48 514 174 791”.
 * Zostają tylko cyfry i plus na początku (myślniki, nawiasy, podwójne spacje
 * z wklejonego numeru znikają). Link `tel:` w stopce i tak bierze same cyfry.
 */
export function formatPhone(input: string): string {
  const plus = input.trim().startsWith("+");
  const cyfry = input.replace(/\D/g, "");
  if (!cyfry) return plus ? "+" : "";
  const grupy = (s: string) => s.match(/.{1,3}/g)!.join(" ");
  if (!plus) return grupy(cyfry);
  const kierunkowy = cyfry.slice(0, 2);
  const reszta = cyfry.slice(2);
  return reszta ? `+${kierunkowy} ${grupy(reszta)}` : `+${kierunkowy}`;
}
