import { describe, expect, it } from "vitest";
import { buildSignature, buildSignaturePlain, SIGNATURE_DEFAULTS, type SignatureData } from "./signature";

const dane = (nad: Partial<SignatureData> = {}): SignatureData => ({
  name: "Alicja Rózik",
  title: "Członkini Zarządu ds. Promocji",
  org: SIGNATURE_DEFAULTS.org,
  phone: "500 600 700",
  email: "alicja.rozik@samorzad.ue.wroc.pl",
  web: SIGNATURE_DEFAULTS.web,
  showBanner: true,
  ...nad,
});

describe("buildSignature - bezpieczeństwo", () => {
  it("escapuje znaki, którymi dałoby się wstrzyknąć kod", () => {
    const html = buildSignature(dane({ name: `<script>alert("x")</script>` }));
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("escapuje cudzysłów, żeby nie dało się wyjść z atrybutu", () => {
    // Bez tego `socialLabel` z cudzysłowem rozbiłby atrybut style i pozwolił
    // dopisać własny, obcy atrybut do znacznika.
    const html = buildSignature(dane({ socialLabel: `" onload="zly()` }));
    expect(html).not.toContain(`onload="zly()`);
    expect(html).toContain("&quot;");
  });

  it("escapuje ampersand w adresie strony", () => {
    const html = buildSignature(dane({ web: "example.com/?a=1&b=2" }));
    expect(html).toContain("a=1&amp;b=2");
  });
});

describe("buildSignature - numer telefonu", () => {
  it("dokleja polski kierunkowy do numeru krajowego", () => {
    expect(buildSignature(dane({ phone: "500 600 700" }))).toContain("tel:+48500600700");
  });

  it("NIE dokleja kierunkowego do numeru z plusem", () => {
    // Doklejenie +48 do numeru zagranicznego dałoby adres, pod który nikt się
    // nie dodzwoni.
    expect(buildSignature(dane({ phone: "+44 20 7946 0958" }))).toContain("tel:+442079460958");
  });
});

describe("buildSignature - struktura dla klienta pocztowego", () => {
  it("nie zawiera znaczników ani własności, których Outlook nie renderuje", () => {
    const html = buildSignature(dane());
    expect(html).not.toContain("<div");
    expect(html).not.toContain("class=");
    expect(html).not.toContain("background-image");
    expect(html).not.toContain("border-radius");
    expect(html).not.toContain("display:flex");
  });

  it("obrazki mają sztywne wymiary i bezwzględne adresy", () => {
    const html = buildSignature(dane());
    // Klient pocztowy nie wykona CSS-a ustalającego rozmiar, a adres względny
    // nie ma względem czego się rozwinąć w cudzej skrzynce.
    for (const plik of ["logo-bg.png", "banner.jpg", "ic_phone.png"]) {
      expect(html).toContain(`https://samorzad.ue.wroc.pl/sig/${plik}`);
    }
    expect(html).toMatch(/<img [^>]*width="\d+" height="\d+"/);
    expect(html).not.toContain("data:image");
  });

  it("logo zachowuje proporcję przekazanego pliku", () => {
    // 369,93 : 220,98 ≈ 1,674. Pierwotny szablon miał 116×100 (1,16),
    // co ścisnęłoby znak o jedną trzecią.
    const html = buildSignature(dane());
    const m = html.match(/logo-bg\.png" width="(\d+)" height="(\d+)"/);
    expect(m).not.toBeNull();
    const proporcja = Number(m![1]) / Number(m![2]);
    expect(proporcja).toBeCloseTo(369.93 / 220.98, 1);
  });
});

describe("buildSignature - części opcjonalne", () => {
  it("bez banera nie zostaje pusta komórka", () => {
    const html = buildSignature(dane({ showBanner: false }));
    expect(html).not.toContain("banner.jpg");
  });

  it("bez mediów i bez podpisu nie ma całego wiersza", () => {
    const html = buildSignature(dane());
    expect(html).not.toContain("ic_instagram.png");
    expect(html).not.toContain("ic_facebook.png");
  });

  it("pokazuje tylko te media, które podano", () => {
    const html = buildSignature(dane({ instagram: "https://instagram.com/x" }));
    expect(html).toContain("ic_instagram.png");
    expect(html).not.toContain("ic_linkedin.png");
  });
});

describe("buildSignature - poprawki z audytu 11.2026", () => {
  it("pusty telefon nie zostawia wiersza z samą ikoną", () => {
    const html = buildSignature(dane({ phone: "" }));
    expect(html).not.toContain("ic_phone.png");
    expect(html).not.toContain("tel:");
  });

  it("każda komórka z tekstem ma własną czcionkę (Outlook jej nie dziedziczy)", () => {
    const html = buildSignature(dane());
    for (const tekst of ["Alicja Rózik", "Członkini Zarządu ds. Promocji", SIGNATURE_DEFAULTS.org]) {
      const td = html.slice(html.lastIndexOf("<td", html.indexOf(tekst)), html.indexOf(tekst));
      expect(td).toContain("font-family:Arial");
    }
  });

  it("baner jest pod danymi, a nie trzecią kolumną", () => {
    const html = buildSignature(dane());
    expect(html.indexOf("banner.jpg")).toBeGreaterThan(html.indexOf("ic_web.png"));
    // Jedna tabela zewnętrzna z trzema komórkami: logo, linia, dane.
    const outerRow = html.slice(html.indexOf("<tr>"), html.indexOf("<table", 10));
    expect(outerRow.match(/<td/g)).toHaveLength(3);
  });

  it("strona z protokołem nie daje podwójnego https://", () => {
    expect(buildSignature(dane({ web: "https://samorzad.ue.wroc.pl" }))).not.toContain("https://https://");
  });

  it("wersja tekstowa to czytelna stopka, nie kod HTML", () => {
    const tekst = buildSignaturePlain(dane());
    expect(tekst).not.toContain("<");
    expect(tekst.split("\n")).toEqual([
      "Alicja Rózik",
      "Członkini Zarządu ds. Promocji",
      SIGNATURE_DEFAULTS.org,
      "",
      "tel. 500 600 700",
      "alicja.rozik@samorzad.ue.wroc.pl",
      "samorzad.ue.wroc.pl",
    ]);
  });
});
