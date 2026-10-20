/**
 * Arkusz „Treści strony” → odświeżenie strony Samorządu.
 *
 * Wklej ten plik do Apps Script ARKUSZA „Treści strony” (Rozszerzenia →
 * Apps Script), uzupełnij CONFIG i raz uruchom funkcję `instaluj`.
 * Pełna instrukcja: docs/JAK-EDYTOWAC.md.
 *
 * Jak to działa: po każdej edycji skrypt wysyła stronie sygnał „dane się
 * zmieniły”. Strona przy następnej wizycie pobiera arkusz od nowa - zmiana
 * jest widoczna po kilku sekundach. Przy serii szybkich edycji sygnał idzie
 * najwyżej raz na 20 sekund, a ostatnia zmiana zostaje dosłana w ciągu
 * minuty, żeby żadna nie przepadła.
 */

const CONFIG = {
  // Adres strony z końcówką /api/tresci/odswiez.
  ADRES: "https://samorzad.ue.wroc.pl/api/tresci/odswiez",
  // Ten sam ciąg co TRESCI_SECRET w Vercelu. Wygeneruj losowy, długi.
  SEKRET: "WSTAW_TEN_SAM_SEKRET_CO_W_VERCELU",
  // Najkrótszy odstęp między sygnałami (sekundy).
  ODSTEP: 20,
};

/** Uruchom RAZ po wklejeniu skryptu: podpina wyzwalacze. */
function instaluj() {
  ScriptApp.getProjectTriggers().forEach((t) => ScriptApp.deleteTrigger(t));
  const arkusz = SpreadsheetApp.getActive();
  ScriptApp.newTrigger("poZmianie").forSpreadsheet(arkusz).onEdit().create();
  ScriptApp.newTrigger("poZmianie").forSpreadsheet(arkusz).onChange().create();
  ScriptApp.newTrigger("dosliZalegle").timeBased().everyMinutes(1).create();
  odswiezTeraz();
}

/** Menu „Strona Samorządu” w arkuszu. */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Strona Samorządu")
    .addItem("Odśwież stronę teraz", "odswiezTeraz")
    .addToUi();
}

function poZmianie() {
  const props = PropertiesService.getScriptProperties();
  const ostatnio = Number(props.getProperty("ostatnio") || 0);
  if (Date.now() - ostatnio < CONFIG.ODSTEP * 1000) {
    props.setProperty("zalegle", "1");
    return;
  }
  wyslij();
}

function dosliZalegle() {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty("zalegle") === "1") wyslij();
}

function odswiezTeraz() {
  const ok = wyslij();
  try {
    SpreadsheetApp.getActive().toast(
      ok ? "Strona odświeżona. Zmiany są widoczne po przeładowaniu." : "Nie udało się odświeżyć - sprawdź ADRES i SEKRET w skrypcie.",
      "Strona Samorządu",
      6,
    );
  } catch (e) {
    // Bez otwartego arkusza (wyzwalacz czasowy) nie ma gdzie pokazać dymka.
  }
}

function wyslij() {
  const props = PropertiesService.getScriptProperties();
  try {
    const res = UrlFetchApp.fetch(CONFIG.ADRES, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({ secret: CONFIG.SEKRET }),
      muteHttpExceptions: true,
    });
    const ok = res.getResponseCode() === 200;
    props.setProperty("ostatnio", String(Date.now()));
    if (ok) props.deleteProperty("zalegle");
    return ok;
  } catch (e) {
    props.setProperty("zalegle", "1");
    return false;
  }
}
