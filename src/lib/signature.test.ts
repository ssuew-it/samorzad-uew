import { describe, expect, it } from "vitest";
import { buildSignature, buildSignaturePlain, SIGNATURE_DEFAULTS, type SignatureData } from "./signature";

const PELNA_NAZWA = "Samorząd Studentów Uniwersytetu Ekonomicznego we Wrocławiu";

const dane = (nad: Partial<SignatureData> = {}): SignatureData => ({
  name: "Alicja Rózik",
  title: "Członkini Zarządu ds. Promocji",
  phone: "500 600 700",
  email: "alicja.rozik@samorzad.ue.wroc.pl",
  web: SIGNATURE_DEFAULTS.web,
  ...nad,
});

/** Wszystkie profile włączone - tak jak w formularzu po zaznaczeniu każdego. */
const pelne = (nad: Partial<SignatureData> = {}) =>
  dane({
    instagram: SIGNATURE_DEFAULTS.instagram,
    facebook: SIGNATURE_DEFAULTS.facebook,
    linkedin: SIGNATURE_DEFAULTS.linkedin,
    ...nad,
  });

describe("buildSignature - bezpieczeństwo", () => {
  it("escapuje znaki, którymi dałoby się wstrzyknąć kod", () => {
    const html = buildSignature(dane({ name: `<script>alert("x")</script>` }), "daily");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("escapuje cudzysłów, żeby nie dało się dopisać atrybutu", () => {
    const html = buildSignature(dane({ title: `" onload="zly()` }), "daily");
    expect(html).not.toContain(`onload="zly()`);
    expect(html).toContain("&quot;");
  });

  it("escapuje ampersand w adresie strony", () => {
    const html = buildSignature(dane({ web: "example.com/?a=1&b=2" }), "daily");
    expect(html).toContain("a=1&amp;b=2");
  });

  it("adres strony z javascript: zostaje zwykłym linkiem https", () => {
    const html = buildSignature(dane({ web: 'javascript:alert(1)"x' }), "daily");
    expect(html).toContain('href="https://javascript:alert(1)&quot;x"');
    expect(html).not.toContain('href="javascript:');
  });
});

describe("buildSignature - numer telefonu", () => {
  it("dokleja polski kierunkowy do numeru krajowego", () => {
    expect(buildSignature(dane({ phone: "500 600 700" }), "daily")).toContain("tel:+48500600700");
  });

  it("NIE dokleja kierunkowego do numeru z plusem", () => {
    // Doklejenie +48 do numeru zagranicznego dałoby adres, pod który nikt się
    // nie dodzwoni.
    expect(buildSignature(dane({ phone: "+44 20 7946 0958" }), "daily")).toContain("tel:+442079460958");
  });
});

describe("buildSignature - karta (wersja codzienna)", () => {
  it("ma logo poziome i grafikę w wymiarach wyświetlanych", () => {
    const html = buildSignature(pelne(), "daily");
    expect(html).toContain('sig/logo-h.png" width="192" height="56"');
    expect(html).toContain('sig/grafika.png" width="200" height="135"');
  });

  it("przy pełnych danych ma pięć ikon w pasku", () => {
    const html = buildSignature(pelne(), "daily");
    for (const ikona of ["ic_web.png", "ic_instagram.png", "ic_facebook.png", "ic_linkedin.png", "ic_mail.png"]) {
      expect(html).toContain(ikona);
    }
  });

  it("nie ma starych grafik, akcentu strony ani znaku §", () => {
    const html = buildSignature(pelne(), "daily");
    for (const zakazane of ["logo-bg.png", "banner.jpg", "#2C4BFF", "#2c4bff", "§"]) {
      expect(html).not.toContain(zakazane);
    }
  });

  it("dane stoją nad logo", () => {
    const html = buildSignature(pelne(), "daily");
    const nazwisko = html.indexOf("Alicja Rózik");
    const mail = html.indexOf(">alicja.rozik@samorzad.ue.wroc.pl<");
    expect(nazwisko).toBeGreaterThan(-1);
    expect(nazwisko).toBeLessThan(mail);
    expect(mail).toBeLessThan(html.indexOf("logo-h.png"));
  });
});

describe("buildSignature - wersja do masówek", () => {
  it("ma małą, nieruchomą grafikę", () => {
    expect(buildSignature(pelne(), "bulk")).toContain('grafika-mala.png" width="120" height="81"');
  });

  it("ma w pasku tylko stronę i LinkedIn, bez ikony poczty", () => {
    const html = buildSignature(pelne(), "bulk");
    expect(html).toContain("ic_web.png");
    expect(html).toContain("ic_linkedin.png");
    for (const ikona of ["ic_instagram.png", "ic_facebook.png", "ic_mail.png"]) {
      expect(html).not.toContain(ikona);
    }
  });

  it("bez LinkedIna bierze następny włączony profil (Facebook)", () => {
    const html = buildSignature(pelne({ linkedin: undefined }), "bulk");
    expect(html).toContain("ic_facebook.png");
    expect(html).not.toContain("ic_instagram.png");
  });
});

describe("buildSignature - puste pola", () => {
  it("bez e-maila nie ma koperty ani linku mailto", () => {
    const html = buildSignature(pelne({ email: "" }), "daily");
    expect(html).not.toContain("ic_mail.png");
    expect(html).not.toContain("mailto:");
  });

  it("bez telefonu nie ma linku tel:", () => {
    expect(buildSignature(pelne({ phone: "" }), "daily")).not.toContain("tel:");
  });

  it("bez strony, profili i e-maila nie zostaje pusty pasek ikon", () => {
    const html = buildSignature(dane({ web: "", email: "" }), "daily");
    expect(html).not.toContain("ic_");
    expect(html).not.toContain('width="34"');
  });
});

describe("buildSignature - struktura dla klienta pocztowego", () => {
  it.each(["daily", "bulk"] as const)("%s: brak znaczników i własności, których Outlook nie renderuje", (v) => {
    const html = buildSignature(pelne(), v);
    for (const zakazane of ["<div", "class=", "display:flex", "background-image", "data:image"]) {
      expect(html).not.toContain(zakazane);
    }
  });

  it("obrazki mają sztywne wymiary i bezwzględne adresy", () => {
    const html = buildSignature(pelne(), "daily");
    expect(html).toContain("https://samorzad.ue.wroc.pl/sig/logo-h.png");
    for (const img of html.match(/<img [^>]*>/g)!) {
      expect(img).toMatch(/src="https:\/\//);
      expect(img).toMatch(/width="\d+" height="\d+"/);
    }
  });

  it("logo ma alt z pełną nazwą Samorządu, a każda ikona niepusty alt", () => {
    const html = buildSignature(pelne(), "daily");
    expect(html).toMatch(new RegExp(`logo-h\\.png"[^>]*alt="${PELNA_NAZWA}"`));
    for (const img of html.match(/<img [^>]*ic_[^>]*>/g)!) {
      expect(img).toMatch(/alt="[^"]+"/);
    }
  });

  it("każda komórka z tekstem ma własną czcionkę (Outlook jej nie dziedziczy)", () => {
    const html = buildSignature(pelne(), "daily");
    for (const tekst of ["Alicja Rózik", "Członkini Zarządu ds. Promocji", "tel. 500 600 700"]) {
      const td = html.slice(html.lastIndexOf("<td", html.indexOf(tekst)), html.indexOf(tekst));
      expect(td).toContain("font-family:Arial");
    }
  });

  it("strona z protokołem nie daje podwójnego https://", () => {
    expect(buildSignature(dane({ web: "https://samorzad.ue.wroc.pl" }), "daily")).not.toContain("https://https://");
  });
});

describe("buildSignaturePlain", () => {
  it("wersja tekstowa to czytelna stopka z pełną nazwą Samorządu", () => {
    const tekst = buildSignaturePlain(pelne());
    expect(tekst).not.toContain("<");
    expect(tekst.split("\n")).toEqual([
      "Alicja Rózik",
      "Członkini Zarządu ds. Promocji",
      PELNA_NAZWA,
      "",
      "tel. 500 600 700",
      "alicja.rozik@samorzad.ue.wroc.pl",
      "samorzad.ue.wroc.pl",
    ]);
  });
});
