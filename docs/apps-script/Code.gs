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

function wyslijPowiadomienie(formularz, dane) {
  const adres = CONFIG.ADRESACI[formularz];
  const temat = "[" + formularz + "] " + (dane.subject || "Nowe zgłoszenie ze strony");

  const tresc =
    "Nowe zgłoszenie z formularza: " + formularz + "\n\n" +
    "Imię:    " + (dane.name || "-") + "\n" +
    "E-mail:  " + (dane.email || "-") + "\n" +
    "Temat:   " + (dane.subject || "-") + "\n\n" +
    "Wiadomość:\n" + (dane.message || "-") + "\n\n" +
    "Wysłane automatycznie ze strony samorzad.ue.wroc.pl";

  MailApp.sendEmail({
    to: adres,
    subject: temat,
    body: tresc,
    // Dzięki temu „Odpowiedz" w kliencie poczty pisze do studenta, a nie do
    // skrzynki skryptu.
    replyTo: String(dane.email || ""),
  });
}

function odpowiedz(obiekt) {
  return ContentService.createTextOutput(JSON.stringify(obiekt)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
