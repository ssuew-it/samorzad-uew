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

/**
 * TEST - uruchom TĘ funkcję w edytorze (lista funkcji u góry -> testFormularza
 * -> Uruchom). Symuluje zgłoszenie ze strony z poprawnym sekretem: dopisuje
 * wiersz w zakładce „Kontakt” i wysyła mail na adres z CONFIG.ADRESACI.kontakt.
 * Przy pierwszym uruchomieniu Google poprosi o uprawnienia (arkusz + poczta) -
 * zgódź się, inaczej strona też nie będzie mogła wysyłać.
 *
 * Nie uruchamiaj ręcznie zapiszWiersz / wyslijPowiadomienie / szablonHtml:
 * dostają dane od doPost i bez nich kończą się błędem „undefined”.
 */
function testFormularza() {
  const wynik = doPost({
    postData: {
      contents: JSON.stringify({
        formularz: "kontakt",
        name: "Test z edytora Apps Script",
        email: "kontakt@samorzad.ue.wroc.pl",
        subject: "TEST formularza - proszę zignorować",
        message: "Wiadomość testowa wysłana funkcją testFormularza.",
        secret: CONFIG.SEKRET,
      }),
    },
  });
  Logger.log(wynik.getContent());
}

function doPost(e) {
  try {
    if (!e || !e.postData) {
      throw new Error("doPost wywołane bez danych - do testów użyj funkcji testFormularza");
    }
    const dane = JSON.parse(e.postData.contents);

    // Bez zgodnego sekretu nie przyjmujemy niczego - inaczej każdy, kto pozna
    // adres wdrożenia, mógłby wysyłać wiadomości w imieniu serwisu.
    if (dane.secret !== CONFIG.SEKRET) {
      return odpowiedz({ ok: false, blad: "brak_autoryzacji" });
    }

    // Ocena strony (okienko „Jak oceniasz nową stronę?”) - tylko wiersz
    // w zakładce „Opinie”, bez maila: przy wielu ocenach dziennie
    // powiadomienia zasypałyby skrzynkę.
    if (dane.formularz === "opinia") {
      zapiszOpinie(dane);
      return odpowiedz({ ok: true });
    }

    // Karteczka Kaizen ze Strefy Działacza - anonimowa, bez maila. Zarząd
    // omawia je z zakładki „Kaizen” (status, odpowiedź, „Pokaż na tablicy”).
    if (dane.formularz === "kaizen") {
      zapiszKaizen(dane);
      return odpowiedz({ ok: true });
    }

    // Tablica Kaizen w Strefie - tylko wiersze z „Pokaż na tablicy: TAK”.
    if (dane.formularz === "kaizen-tablica") {
      return odpowiedz({ ok: true, karteczki: tablicaKaizen() });
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
    if (!plik) {
      // Skrypt musi być przypięty do arkusza (Rozszerzenia -> Apps Script z
      // poziomu arkusza). Samodzielny projekt Apps Script nie ma „aktywnego” arkusza.
      throw new Error("Skrypt nie jest przypięty do arkusza - otwórz go z arkusza: Rozszerzenia -> Apps Script");
    }
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

/** Ocena strony: data, gwiazdki, czy udało się znaleźć, komentarz, strona, język. */
function zapiszOpinie(dane) {
  const ocena = Number(dane.ocena);
  if (!(ocena >= 1 && ocena <= 5)) throw new Error("ocena spoza 1-5");
  const blokada = LockService.getScriptLock();
  blokada.waitLock(10000);
  try {
    const plik = SpreadsheetApp.getActiveSpreadsheet();
    if (!plik) throw new Error("Skrypt nie jest przypięty do arkusza - otwórz go z arkusza: Rozszerzenia -> Apps Script");
    let arkusz = plik.getSheetByName("Opinie");
    if (!arkusz) {
      arkusz = plik.insertSheet("Opinie");
      arkusz.appendRow(["Data", "Ocena (1-5)", "Udało się znaleźć", "Komentarz", "Strona", "Język"]);
      arkusz.setFrozenRows(1);
    }
    arkusz.appendRow([
      new Date(),
      ocena,
      bezpieczne(dane.znalezione),
      bezpieczne(String(dane.komentarz || "").slice(0, 1000)),
      bezpieczne(dane.strona),
      bezpieczne(dane.jezyk),
    ]);
  } finally {
    blokada.releaseLock();
  }
}

/**
 * KAIZEN - karteczki Działaczy. Klucz obszaru przychodzi ze strony, w arkuszu
 * stoi czytelna nazwa (i z powrotem przy tablicy).
 */
const KAIZEN_OBSZARY = {
  komunikacja: "Komunikacja",
  organizacja: "Organizacja pracy",
  projekty: "Projekty i wydarzenia",
  wdrozenie: "Wdrażanie nowych Działaczy",
  narzedzia: "Narzędzia i Strefa",
  inne: "Inne",
};
const KAIZEN_ARKUSZ = "Kaizen";
const KAIZEN_NAGLOWKI = ["Data", "Obszar", "Co zauważam", "Co proponuję", "Status", "Odpowiedź Zarządu", "Pokaż na tablicy"];

/**
 * Nowa karteczka: data, obszar, dwa pola treści. Status i odpowiedź wpisuje
 * Zarząd; „Pokaż na tablicy” startuje od NIE - nic nie trafia do Strefy bez
 * decyzji Zarządu. W wierszu nie ma nikogo, kto ją napisał (strona tego nie
 * przysyła).
 */
function zapiszKaizen(dane) {
  const obszar = KAIZEN_OBSZARY[dane.obszar];
  const zauwazam = String(dane.zauwazam || "").slice(0, 800);
  const proponuje = String(dane.proponuje || "").slice(0, 800);
  if (!obszar || zauwazam.length < 5 || proponuje.length < 5) throw new Error("niepełna karteczka");
  const blokada = LockService.getScriptLock();
  blokada.waitLock(10000);
  try {
    const plik = SpreadsheetApp.getActiveSpreadsheet();
    if (!plik) throw new Error("Skrypt nie jest przypięty do arkusza - otwórz go z arkusza: Rozszerzenia -> Apps Script");
    let arkusz = plik.getSheetByName(KAIZEN_ARKUSZ);
    if (!arkusz) {
      arkusz = plik.insertSheet(KAIZEN_ARKUSZ);
      arkusz.appendRow(KAIZEN_NAGLOWKI);
      arkusz.setFrozenRows(1);
      // Listy rozwijane: Zarząd wybiera, a nie wpisuje - strona rozpozna każdą wartość.
      const statusy = SpreadsheetApp.newDataValidation()
        .requireValueInList(["omawiane", "wdrożone", "nie wdrażamy"], true)
        .setAllowInvalid(false)
        .build();
      const pokaz = SpreadsheetApp.newDataValidation().requireValueInList(["TAK", "NIE"], true).setAllowInvalid(false).build();
      arkusz.getRange(2, 5, 999, 1).setDataValidation(statusy);
      arkusz.getRange(2, 7, 999, 1).setDataValidation(pokaz);
    }
    arkusz.appendRow([new Date(), obszar, bezpieczne(zauwazam), bezpieczne(proponuje), "", "", "NIE"]);
  } finally {
    blokada.releaseLock();
  }
}

/** Wiersze z „Pokaż na tablicy: TAK” - dla Strefy Działacza (najwyżej 200). */
function tablicaKaizen() {
  const plik = SpreadsheetApp.getActiveSpreadsheet();
  const arkusz = plik && plik.getSheetByName(KAIZEN_ARKUSZ);
  if (!arkusz || arkusz.getLastRow() < 2) return [];
  const klucze = {};
  Object.keys(KAIZEN_OBSZARY).forEach(function (k) {
    klucze[KAIZEN_OBSZARY[k]] = k;
  });
  const wiersze = arkusz.getRange(2, 1, arkusz.getLastRow() - 1, KAIZEN_NAGLOWKI.length).getValues();
  const wynik = [];
  for (let i = wiersze.length - 1; i >= 0 && wynik.length < 200; i--) {
    const w = wiersze[i];
    if (String(w[6]).trim().toUpperCase() !== "TAK") continue;
    const data = w[0] instanceof Date ? Utilities.formatDate(w[0], "Europe/Warsaw", "yyyy-MM-dd") : String(w[0]);
    wynik.push({
      data: data,
      obszar: klucze[String(w[1]).trim()] || "inne",
      // Apostrof z `bezpieczne` jest tylko dla arkusza - na stronę bez niego.
      zauwazam: String(w[2]).replace(/^'/, ""),
      proponuje: String(w[3]).replace(/^'/, ""),
      status: String(w[4]),
      odpowiedz: String(w[5]),
    });
  }
  return wynik;
}

/**
 * TEST karteczki - uruchom w edytorze. Dopisuje karteczkę testową do zakładki
 * „Kaizen” (powstanie przy pierwszym razie) i wypisuje tablicę w logu.
 * Testowy wiersz usuń potem ręcznie.
 */
function testKaizen() {
  const wynik = doPost({
    postData: {
      contents: JSON.stringify({
        formularz: "kaizen",
        obszar: "komunikacja",
        zauwazam: "TEST - karteczka z edytora Apps Script",
        proponuje: "TEST - proszę usunąć ten wiersz",
        secret: CONFIG.SEKRET,
      }),
    },
  });
  Logger.log(wynik.getContent());
  Logger.log(JSON.stringify(tablicaKaizen()));
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
