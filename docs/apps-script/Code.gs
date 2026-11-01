/**
 * Backend formularzy Samorządu Studentów UEW.
 *
 * Wklej ten plik do Apps Script przypiętego do arkusza Google na koncie
 * Samorządu. Skrypt zapisuje każde zgłoszenie do arkusza i wysyła
 * powiadomienie na wskazany adres.
 *
 * INSTRUKCJA W docs/WRZUC-TUTAJ.md - tutaj jest tylko kod.
 */

const CONFIG = {
  // Ten sam ciąg co APPS_SCRIPT_SECRET w Vercelu. Wygeneruj losowy, długi.
  SEKRET: "WSTAW_TEN_SAM_SEKRET_CO_W_VERCELU",

  // Gdzie ma przyjść powiadomienie o nowym zgłoszeniu.
  // Każdy formularz może mieć inny adres - dzięki temu sprawy do Rzecznika
  // nie lądują we wspólnej skrzynce.
  ADRESACI: {
    kontakt: "kontakt@samorzad.ue.wroc.pl",
    rzecznik: "rps@samorzad.ue.wroc.pl",
    partnerzy: "zuzanna.bak@samorzad.ue.wroc.pl",
  },

  // Zakładka w arkuszu dla każdego formularza. Powstaje sama przy pierwszym
  // zgłoszeniu. Rzecznik ma osobną, żeby łatwo ją ukryć lub zabezpieczyć
  // (Dane > Chroń arkusze i zakresy). Pełną poufność daje dopiero osobny plik.
  ARKUSZE: {
    kontakt: "Kontakt",
    rzecznik: "Rzecznik",
    partnerzy: "Partnerzy",
  },
};

function doPost(e) {
  try {
    const dane = JSON.parse(e.postData.contents);

    // Bez zgodnego sekretu nie przyjmujemy niczego - inaczej każdy, kto pozna
    // adres wdrożenia, mógłby wysyłać wiadomości w imieniu serwisu.
    if (dane.secret !== CONFIG.SEKRET) {
      return odpowiedz({ ok: false, blad: "brak_autoryzacji" });
    }

    // Tylko znane formularze; cokolwiek innego trafia jak zwykły kontakt.
    const formularz = CONFIG.ADRESACI[dane.formularz] ? String(dane.formularz) : "kontakt";
    const wiersz = [
      new Date(),
      bezpieczne(dane.name),
      bezpieczne(dane.email),
      bezpieczne(dane.subject),
      bezpieczne(dane.message),
    ];

    zapiszWiersz(formularz, wiersz);
    wyslijPowiadomienie(formularz, dane);

    return odpowiedz({ ok: true });
  } catch (err) {
    // Zgłoszenie zapisane, ale mail nie poszedł - nadal zwracamy błąd, żeby
    // strona nie obiecała użytkownikowi, że wiadomość dotarła.
    return odpowiedz({ ok: false, blad: String(err) });
  }
}

/**
 * Tekst, który zaczyna się od =, +, - albo @, Arkusze traktują jak formułę.
 * Wiadomość „=IMPORTXML(...)” mogłaby wtedy wysłać dane z arkusza na zewnątrz.
 * Apostrof na początku każe potraktować całość jako zwykły tekst.
 */
function bezpieczne(wartosc) {
  const tekst = String(wartosc || "");
  return /^[=+\-@\t\r]/.test(tekst) ? "'" + tekst : tekst;
}

function zapiszWiersz(formularz, wiersz) {
  // Blokada na wypadek dwóch zgłoszeń naraz przy pierwszym tworzeniu zakładki.
  const blokada = LockService.getScriptLock();
  blokada.waitLock(10000);
  try {
    const plik = SpreadsheetApp.getActiveSpreadsheet();
    const nazwa = CONFIG.ARKUSZE[formularz] || CONFIG.ARKUSZE.kontakt;
    let arkusz = plik.getSheetByName(nazwa);
    if (!arkusz) {
      arkusz = plik.insertSheet(nazwa);
      arkusz.appendRow(["Data", "Imię i nazwisko", "E-mail", "Temat", "Wiadomość"]);
      arkusz.setFrozenRows(1);
    }
    arkusz.appendRow(wiersz);
  } finally {
    blokada.releaseLock();
  }
}

/** Nazwy formularzy w powiadomieniu - zamiast technicznych kluczy. */
const NAZWY_FORMULARZY = {
  kontakt: "Formularz kontaktowy",
  rzecznik: "Rzecznik Praw Studenta",
  partnerzy: "Współpraca z partnerami",
};

/** Tekst wpisany przez studenta trafia do HTML - bez tego dałoby się wstrzyknąć kod. */
function html(tekst) {
  return String(tekst || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function wyslijPowiadomienie(formularz, dane) {
  const adres = CONFIG.ADRESACI[formularz];
  const nazwa = NAZWY_FORMULARZY[formularz] || formularz;
  const temat = "[" + nazwa + "] " + (dane.subject || "Nowe zgłoszenie ze strony");
  const kiedy = Utilities.formatDate(new Date(), "Europe/Warsaw", "d.MM.yyyy, HH:mm");

  // Wersja tekstowa - dla programów pocztowych, które nie pokazują HTML.
  const tresc =
    nazwa + " - nowe zgłoszenie (" + kiedy + ")\n\n" +
    "Imię i nazwisko: " + (dane.name || "-") + "\n" +
    "E-mail: " + (dane.email || "-") + "\n" +
    "Temat: " + (dane.subject || "-") + "\n\n" +
    "Wiadomość:\n" + (dane.message || "-") + "\n\n" +
    "Kliknij „Odpowiedz”, żeby napisać bezpośrednio do nadawcy.\n" +
    "Wysłane automatycznie ze strony samorzad.ue.wroc.pl";

  MailApp.sendEmail({
    to: adres,
    subject: temat,
    body: tresc,
    htmlBody: szablonHtml(nazwa, kiedy, dane),
    name: "Strona Samorządu Studentów",
    // Dzięki temu „Odpowiedz" w kliencie poczty pisze do studenta, a nie do
    // skrzynki skryptu.
    replyTo: String(dane.email || ""),
  });
}

/**
 * Powiadomienie w barwach serwisu. Tabele i style w atrybutach, bo Gmail
 * i Outlook ignorują <style> i nowoczesny CSS.
 */
function szablonHtml(nazwa, kiedy, dane) {
  const granat = "#0b1735";
  const akcent = "#2C4BFF";
  const szary = "#5b6478";
  const linia = "#e3e7f0";
  const czcionka = "font-family:Arial,Helvetica,sans-serif;";
  const email = html(dane.email);

  const wiersz = function (etykieta, wartosc) {
    return (
      '<tr><td style="' + czcionka + 'padding:10px 0;border-bottom:1px solid ' + linia + ';width:150px;vertical-align:top;font-size:13px;color:' + szary + ';">' + etykieta + "</td>" +
      '<td style="' + czcionka + 'padding:10px 0;border-bottom:1px solid ' + linia + ';font-size:15px;color:' + granat + ';">' + wartosc + "</td></tr>"
    );
  };

  return (
    '<!doctype html><html lang="pl"><body style="margin:0;padding:0;background:#f3f5fa;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5fa;padding:24px 12px;"><tr><td align="center">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">' +
    // Nagłówek
    '<tr><td style="background:' + granat + ';padding:22px 28px;">' +
    '<div style="' + czcionka + 'font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#9eb1ff;">Samorząd Studentów</div>' +
    '<div style="' + czcionka + 'font-size:22px;font-weight:bold;color:#ffffff;margin-top:6px;">' + html(nazwa) + "</div>" +
    '<div style="' + czcionka + 'font-size:13px;color:#c8d0e6;margin-top:4px;">Nowe zgłoszenie · ' + html(kiedy) + "</div>" +
    "</td></tr>" +
    // Dane nadawcy
    '<tr><td style="padding:22px 28px 6px;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' +
    wiersz("Imię i nazwisko", html(dane.name) || "-") +
    wiersz("E-mail", email ? '<a href="mailto:' + email + '" style="color:' + akcent + ';text-decoration:none;">' + email + "</a>" : "-") +
    wiersz("Temat", html(dane.subject) || "-") +
    "</table></td></tr>" +
    // Wiadomość
    '<tr><td style="padding:16px 28px 8px;">' +
    '<div style="' + czcionka + 'font-size:13px;color:' + szary + ';margin-bottom:8px;">Wiadomość</div>' +
    '<div style="' + czcionka + 'font-size:15px;line-height:1.6;color:' + granat + ';background:#f6f8fc;border-left:3px solid ' + akcent + ';border-radius:6px;padding:14px 16px;white-space:pre-wrap;">' +
    (html(dane.message).replace(/\n/g, "<br>") || "-") +
    "</div></td></tr>" +
    // Przycisk odpowiedzi
    (email
      ? '<tr><td style="padding:18px 28px 6px;"><a href="mailto:' + email + "?subject=" + encodeURIComponent("Re: " + (dane.subject || nazwa)) + '" style="' + czcionka + 'display:inline-block;background:' + akcent + ';color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;padding:12px 22px;border-radius:8px;">Odpowiedz nadawcy</a></td></tr>'
      : "") +
    // Stopka
    '<tr><td style="' + czcionka + 'padding:18px 28px 24px;font-size:12px;line-height:1.5;color:' + szary + ';">' +
    "Wiadomość wysłana automatycznie z formularza na stronie samorzad.ue.wroc.pl. Kliknięcie „Odpowiedz” w programie pocztowym też trafi bezpośrednio do nadawcy." +
    "</td></tr>" +
    "</table></td></tr></table></body></html>"
  );
}

function odpowiedz(obiekt) {
  return ContentService.createTextOutput(JSON.stringify(obiekt)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
