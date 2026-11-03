/**
 * Podpowiedź „ktoś był tu zalogowany” - wspólna dla layoutu (skrypt przed
 * pierwszym malowaniem) i przycisku konta w nawigacji (AccountMenu).
 *
 * Strony są statyczne i layout NIE czyta ciasteczek, więc serwer zawsze
 * renderuje wariant „niezalogowany”. Bez tej podpowiedzi zalogowany działacz
 * przy każdym pełnym wejściu widział najpierw „Zaloguj się”, a po hydratacji
 * przycisk konta - inna szerokość, skok paska i mignięcie złego stanu.
 *
 * Plik bez "use client" i bez importów: layout (serwer) bierze z niego tekst
 * skryptu, komponent kliencki - nazwę klucza i atrybutu.
 */

/** Klucz w localStorage: `{ name, picture? }` ostatnio znanego konta. */
export const ACCOUNT_HINT_KEY = "ssuew-konto";

/** Atrybut na <html>: jest = pokaż szkielet przycisku konta zamiast „Zaloguj się”. */
export const ACCOUNT_HINT_ATTR = "data-konto";

/**
 * Wykonuje się synchronicznie w <head>, zanim przeglądarka cokolwiek
 * namaluje (ten sam wzorzec co skrypt motywu next-themes). Sprawdza
 * podpowiedź tak samo jak `readHint` w AccountMenu - przy rozjeździe CSS
 * schowałby link logowania osobie, której przycisk konta się nie pokaże.
 * try/catch: tryb prywatny albo zablokowane dane witryny rzucają przy
 * samym dostępie do localStorage.
 */
export const ACCOUNT_HINT_SCRIPT = `(function(){try{var v=JSON.parse(localStorage.getItem(${JSON.stringify(
  ACCOUNT_HINT_KEY,
)})||"null");if(v&&typeof v==="object"&&typeof v.name==="string"&&v.name.trim())document.documentElement.setAttribute(${JSON.stringify(
  ACCOUNT_HINT_ATTR,
)},"")}catch(e){}})()`;
