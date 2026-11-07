import { describe, expect, it } from "vitest";
import { DEFAULT_SIGNATURE_ROLE, SIGNATURE_ROLE_GROUPS, formatPhone } from "./signature-roles";

const SSUEW = "Samorządu Studentów Uniwersytetu Ekonomicznego we Wrocławiu";
const wszystkie = SIGNATURE_ROLE_GROUPS.flatMap((g) => g.roles);

describe("funkcje w stopce", () => {
  it("domyślna to Członek Komisji, zaraz po niej Członkini Komisji", () => {
    expect(DEFAULT_SIGNATURE_ROLE).toBe(`Członek Komisji ${SSUEW}`);
    expect(SIGNATURE_ROLE_GROUPS[0]!.roles.slice(0, 2)).toEqual([`Członek Komisji ${SSUEW}`, `Członkini Komisji ${SSUEW}`]);
  });

  it("grupy w kolejności ustalonej z Mikołajem", () => {
    expect(SIGNATURE_ROLE_GROUPS.map((g) => g.label)).toEqual([
      null,
      "Komisje",
      "Zarząd",
      "Komisja Rewizyjna",
      "Studencka Komisja Wyborcza",
      "Rzecznik Praw Studenta",
    ]);
  });

  it("każda komisja ma formę męską i żeńską", () => {
    const komisje = SIGNATURE_ROLE_GROUPS.find((g) => g.label === "Komisje")!.roles;
    for (const ds of ["Administracji", "Finansów", "Dydaktyki i Jakości Kształcenia", "Human Resources", "Kontaktów Zewnętrznych", "Promocji"]) {
      expect(komisje).toContain(`Członek Komisji ds. ${ds} ${SSUEW}`);
      expect(komisje).toContain(`Członkini Komisji ds. ${ds} ${SSUEW}`);
    }
  });

  it("Zarząd zaczyna się od Przewodniczącego, a dawne funkcje zostają", () => {
    const zarzad = SIGNATURE_ROLE_GROUPS.find((g) => g.label === "Zarząd")!.roles;
    expect(zarzad[0]).toBe(`Przewodniczący ${SSUEW}`);
    expect(zarzad).toContain(`Wiceprzewodniczący ds. Strategii i Działań Operacyjnych ${SSUEW}`);
    expect(zarzad).toContain(`Członek Zarządu ds. Filii w Jeleniej Górze ${SSUEW}`);
    expect(zarzad).toHaveLength(11);
  });

  it("KR, SKW i Rzecznik w brzmieniu ustalonym z Mikołajem", () => {
    expect(wszystkie).toContain(`Przewodnicząca Komisji Rewizyjnej ${SSUEW}`);
    expect(wszystkie).toContain(`Członkini Studenckiej Komisji Wyborczej ${SSUEW}`);
    expect(wszystkie).toContain(`Przewodniczący Studenckiej Komisji Wyborczej ${SSUEW}`);
    expect(wszystkie).toContain(`Rzecznik Praw Studenta ${SSUEW}`);
  });

  it("każda funkcja kończy się pełną nazwą Samorządu, bez powtórzeń i literówek", () => {
    for (const f of wszystkie) expect(f.endsWith(` ${SSUEW}`), f).toBe(true);
    expect(new Set(wszystkie).size).toBe(wszystkie.length);
    expect(wszystkie.join("|")).not.toMatch(/Zewnętrzene|  /);
  });
});

describe("formatPhone - spacje co trzy cyfry", () => {
  it("numer krajowy: 514 174 791", () => {
    expect(formatPhone("514174791")).toBe("514 174 791");
    expect(formatPhone("514")).toBe("514");
    expect(formatPhone("5141")).toBe("514 1");
  });

  it("nie dubluje spacji przy dopisywaniu i porządkuje wklejone myślniki", () => {
    expect(formatPhone("514 174 ")).toBe("514 174");
    expect(formatPhone("514-174-791")).toBe("514 174 791");
  });

  it("numer z plusem: kierunkowy osobno, reszta co trzy", () => {
    expect(formatPhone("+48514174791")).toBe("+48 514 174 791");
    expect(formatPhone("+4")).toBe("+4");
  });

  it("puste pole zostaje puste", () => {
    expect(formatPhone("")).toBe("");
  });
});
