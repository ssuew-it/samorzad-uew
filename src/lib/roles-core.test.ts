import { describe, expect, it } from "vitest";
import * as R from "./roles-core";

const d = (iso: string) => new Date(iso);
const prod = { NODE_ENV: "production" };
const store = (people: R.RolesStore["people"]): R.RolesStore => ({ v: 1, people });

describe("localPart", () => {
  it("normalizuje adres i samą część lokalną", () => {
    expect(R.localPart(" Jan.Kowalski@Samorzad.UE.wroc.pl ")).toBe("jan.kowalski");
    expect(R.localPart("jan.kowalski")).toBe("jan.kowalski");
  });
  it("odrzuca obce domeny i śmieci", () => {
    for (const x of ["jan@gmail.com", "", "  ", "a b", "jan@samorzad.ue.wroc.pl.evil.com"])
      expect(R.localPart(x)).toBeNull();
  });
});

describe("wygasanie", () => {
  it("rola działa do końca 31 maja czasu polskiego", () => {
    expect(R.isGrantActive("2027-05-31", d("2027-05-31T21:30:00Z"))).toBe(true); // 23:30 PL
    expect(R.isGrantActive("2027-05-31", d("2027-05-31T22:01:00Z"))).toBe(false); // 00:01 PL 1.06
    expect(R.isGrantActive(null, d("2099-01-01T00:00:00Z"))).toBe(true);
  });
  it("domyślna data to najbliższy 31 maja", () => {
    expect(R.defaultUntil("zarzad", d("2026-11-03T12:00:00Z"))).toBe("2027-05-31");
    expect(R.defaultUntil("russ", d("2027-03-10T12:00:00Z"))).toBe("2027-05-31");
    expect(R.defaultUntil("projekty", d("2027-05-31T10:00:00Z"))).toBe("2028-05-31");
    expect(R.defaultUntil("zarzad", d("2027-06-01T10:00:00Z"))).toBe("2028-05-31");
    expect(R.defaultUntil("admi", d("2026-11-03T12:00:00Z"))).toBeNull();
  });
  it("daysLeft liczy dni kalendarzowe w Warszawie", () => {
    expect(R.daysLeft("2027-05-31", d("2027-05-01T10:00:00Z"))).toBe(30);
  });
});

describe("resolveAccess", () => {
  const now = d("2026-11-03T12:00:00Z");
  it("kontakt@ jest superadminem nawet bez magazynu i nie da się go zablokować", () => {
    const a = R.resolveAccess("kontakt@samorzad.ue.wroc.pl", store({ kontakt: { r: {}, b: true } }), now, prod);
    expect(a).toEqual({ blocked: false, isSuperadmin: true, roles: [{ role: "superadmin", until: null }] });
  });
  it("bez ról = normal, wygasła rola się nie liczy", () => {
    const s = store({ ala: { r: { zarzad: "2026-05-31" } } });
    expect(R.resolveAccess("ala@samorzad.ue.wroc.pl", s, now, prod).roles).toEqual([{ role: "normal", until: null }]);
  });
  it("kilka ról w stałej kolejności", () => {
    const s = store({ ala: { r: { admi: null, zarzad: "2027-05-31" } } });
    expect(R.resolveAccess("Ala@samorzad.ue.wroc.pl", s, now, prod).roles).toEqual([
      { role: "zarzad", until: "2027-05-31" },
      { role: "admi", until: null },
    ]);
  });
  it("zablokowany traci wszystko", () => {
    const s = store({ ala: { r: { admi: null }, b: true } });
    expect(R.resolveAccess("ala@samorzad.ue.wroc.pl", s, now, prod)).toEqual({ blocked: true, isSuperadmin: false, roles: [] });
  });
  it("DEV_SUPERADMIN działa tylko w development", () => {
    const env = { DEV_SUPERADMIN: "test@samorzad.ue.wroc.pl" };
    expect(R.resolveAccess("test@samorzad.ue.wroc.pl", R.emptyStore(), now, { ...env, NODE_ENV: "development" }).isSuperadmin).toBe(true);
    expect(R.resolveAccess("test@samorzad.ue.wroc.pl", R.emptyStore(), now, { ...env, NODE_ENV: "production" }).isSuperadmin).toBe(false);
  });
});

describe("canSee", () => {
  const zarzad = { isSuperadmin: false, roles: [{ role: "zarzad" as const, until: null }] };
  it("brak wymagań = każdy, superadmin = wszystko, inaczej część wspólna", () => {
    expect(R.canSee(undefined, zarzad)).toBe(true);
    expect(R.canSee(["admi"], zarzad)).toBe(false);
    expect(R.canSee(["admi", "zarzad"], zarzad)).toBe(true);
    expect(R.canSee(["superadmin"], { isSuperadmin: true, roles: [] })).toBe(true);
  });
});

describe("parseRolesStore", () => {
  it("odfiltrowuje śmieci i nie rzuca", () => {
    expect(R.parseRolesStore(null)).toEqual(R.emptyStore());
    expect(R.parseRolesStore({ v: 1, people: { "Ala": { r: { zarzad: "31.05.2027", hacker: null, admi: null } } } }))
      .toEqual(store({ ala: { r: { admi: null } } }));
  });
});

describe("edycja magazynu", () => {
  it("nadaje, zmienia i usuwa pustą osobę", () => {
    let s = R.setPersonRoles(R.emptyStore(), "Jan@samorzad.ue.wroc.pl", { zarzad: "2027-05-31" });
    expect(s.people.jan).toEqual({ r: { zarzad: "2027-05-31" } });
    s = R.setPersonRoles(s, "jan", {});
    expect(s.people.jan).toBeUndefined();
  });
  it("blokuje osobę bez ról, a odblokowanie ją usuwa", () => {
    let s = R.setBlocked(R.emptyStore(), "obcy@samorzad.ue.wroc.pl", true, prod);
    expect(s.people.obcy).toEqual({ r: {}, b: true });
    s = R.setBlocked(s, "obcy", false, prod);
    expect(s.people.obcy).toBeUndefined();
  });
  it("odrzuca superadmina, obcą domenę i złą datę", () => {
    expect(() => R.setBlocked(R.emptyStore(), "kontakt@samorzad.ue.wroc.pl", true, prod)).toThrow(R.RoleEditError);
    expect(() => R.setPersonRoles(R.emptyStore(), "kontakt", { admi: null })).toThrow(R.RoleEditError);
    expect(() => R.setPersonRoles(R.emptyStore(), "x@gmail.com", { admi: null })).toThrow(R.RoleEditError);
    expect(() => R.setPersonRoles(R.emptyStore(), "jan", { zarzad: "jutro" })).toThrow(R.RoleEditError);
  });
  it("nie mutuje wejścia", () => {
    const s = R.emptyStore();
    R.setPersonRoles(s, "jan", { admi: null });
    expect(s).toEqual(R.emptyStore());
  });
  it("nie blokuje lokalnego DEV_SUPERADMIN w development, na produkcji to zwykły adres", () => {
    const dev = { NODE_ENV: "development", DEV_SUPERADMIN: "Tester@samorzad.ue.wroc.pl" };
    expect(() => R.setBlocked(R.emptyStore(), "tester", true, dev)).toThrow(
      expect.objectContaining({ code: "superadmin" }),
    );
    const prodWithDev = { ...dev, NODE_ENV: "production" };
    expect(R.setBlocked(R.emptyStore(), "tester", true, prodWithDev).people.tester).toEqual({ r: {}, b: true });
  });
  it("removePerson usuwa osobę z rolami i blokadą, nie mutuje wejścia", () => {
    const s = store({ jan: { r: { zarzad: "2027-05-31" }, b: true }, ola: { r: { admi: null } } });
    const next = R.removePerson(s, "Jan@samorzad.ue.wroc.pl");
    expect(next).toEqual(store({ ola: { r: { admi: null } } }));
    expect(s.people.jan).toBeDefined();
    expect(R.removePerson(s, "nieznany")).toEqual(s);
  });
});

describe("toPeopleView", () => {
  it("pełne adresy, sortowanie alfabetyczne, role w kolejności ASSIGNABLE_ROLES", () => {
    const view = R.toPeopleView(
      store({
        zofia: { r: { admi: null, zarzad: "2027-05-31" } },
        adam: { r: {}, b: true },
        "ma.nowak": { r: { russ: "2026-12-01" } },
      }),
    );
    expect(view).toEqual([
      { email: "adam@samorzad.ue.wroc.pl", blocked: true, grants: [] },
      { email: "ma.nowak@samorzad.ue.wroc.pl", blocked: false, grants: [{ role: "russ", until: "2026-12-01" }] },
      {
        email: "zofia@samorzad.ue.wroc.pl",
        blocked: false,
        grants: [
          { role: "zarzad", until: "2027-05-31" },
          { role: "admi", until: null },
        ],
      },
    ]);
  });
  it("pusty magazyn -> pusta lista", () => {
    expect(R.toPeopleView(R.emptyStore())).toEqual([]);
  });
});
