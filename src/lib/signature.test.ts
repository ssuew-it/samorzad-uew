import { describe, expect, it } from "vitest";
import { buildSignature, SIGNATURE_DEFAULTS, type SignatureData } from "./signature";

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
    for (const plik of ["logo.png", "banner.jpg", "ic_phone.png"]) {
      expect(html).toContain(`https://samorzad.ue.wroc.pl/sig/${plik}`);
    }
    expect(html).toMatch(/<img [^>]*width="\d+" height="\d+"/);
    expect(html).not.toContain("data:image");
  });

  it("logo zachowuje proporcję przekazanego pliku", () => {
    // 369,93 : 220,98 ≈ 1,674. Pierwotny szablon miał 116×100 (1,16),
    // co ścisnęłoby znak o jedną trzecią.
    const html = buildSignature(dane());
    const m = html.match(/logo\.png" width="(\d+)" height="(\d+)"/);
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
