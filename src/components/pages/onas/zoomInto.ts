/**
 * „Wejście przez węzeł”: z klikniętego węzła siatki rozchodzi się kolor pasa
 * struktury, siatka kropek przybliża się jak kamera wjeżdżająca w węzeł, a na
 * środku pojawia się nazwa organu. Pod tą zasłoną ładuje się podstrona; gdy
 * jest gotowa i przewinięta na górę, zasłona się rozpływa.
 *
 * Dlaczego nie wspólny element View Transitions: nowa strona renderuje się
 * najpierw w starej pozycji przewinięcia, a Next przewija ją na górę dopiero
 * po przejściu, więc „przelatujący” tytuł celował poza ekran i przez chwilę
 * było widać stopkę i puste klatki (sprawdzone nagraniem klatek kompozytora).
 * Zasłona nie zależy od tego, kiedy i jak przewija się nowa strona.
 *
 * Zwykły DOM i Web Animations API zamiast Reacta: zasłona musi przeżyć
 * odmontowanie strony „O nas”, a WAAPI chodzi poza głównym wątkiem, więc nie
 * gubi klatek, gdy przeglądarka jest zajęta ładowaniem podstrony.
 */

const EASE_IN_OUT = "cubic-bezier(0.77, 0, 0.175, 1)";
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
const EXPAND_MS = 560;
const MAX_WAIT_MS = 4000;

interface ZoomOptions {
  /** Środek węzła w układzie okna. */
  x: number;
  y: number;
  /** Promień startowy - połowa wysokości pigułki. */
  r: number;
  label: string;
  color: string;
}

export function zoomInto({ x, y, r, label, color }: ZoomOptions) {
  const startPath = window.location.pathname;
  const reach = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  // Zasłona ma dwie warstwy: tło (kolor + siatka), które się rozpływa, i
  // tytuł, który na końcu ląduje w miejscu prawdziwego tytułu podstrony.
  const veil = document.createElement("div");
  veil.setAttribute("aria-hidden", "true");
  Object.assign(veil.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483000",
    pointerEvents: "none",
  } satisfies Partial<CSSStyleDeclaration>);
  // Zmiana strony idzie przez View Transitions, a ich warstwy malują się NAD
  // całym dokumentem - także nad tą zasłoną, więc nowa strona prześwitywała
  // przez kolor. Z własną nazwą zasłona staje się osobną warstwą przejścia,
  // malowaną ostatnią, czyli na wierzchu.
  veil.style.setProperty("view-transition-name", "zoom-veil");

  const backdrop = document.createElement("div");
  Object.assign(backdrop.style, {
    position: "absolute",
    inset: "0",
    overflow: "hidden",
    background: color,
    clipPath: `circle(${r}px at ${x}px ${y}px)`,
  } satisfies Partial<CSSStyleDeclaration>);

  // Siatka kropek - ta sama co na mapie, przybliżana od punktu kliknięcia.
  const grid = document.createElement("div");
  Object.assign(grid.style, {
    position: "absolute",
    inset: "-10%",
    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.22) 1px, transparent 1.5px)",
    backgroundSize: "24px 24px",
    transformOrigin: `${x}px ${y}px`,
  } satisfies Partial<CSSStyleDeclaration>);

  // Tytuł wyrównany do lewej i „przytulony” do tekstu: tak samo stoi tytuł
  // podstrony, więc lądowanie to tylko przesunięcie i skala, bez skoku.
  const title = document.createElement("p");
  title.textContent = label;
  Object.assign(title.style, {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: "max-content",
    maxWidth: "min(88vw, 20ch)",
    margin: "0",
    transform: "translate(-50%, -50%)",
    transformOrigin: "0 0",
    textAlign: "left",
    color: "#ffffff",
    fontFamily: "var(--font-display), system-ui, sans-serif",
    fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)",
    fontWeight: "600",
    lineHeight: "1.05",
    letterSpacing: "-0.02em",
    opacity: "0",
  } satisfies Partial<CSSStyleDeclaration>);
  title.style.setProperty("text-wrap", "balance");

  backdrop.append(grid);
  veil.append(backdrop, title);
  document.body.append(veil);

  backdrop.animate(
    [{ clipPath: `circle(${r}px at ${x}px ${y}px)` }, { clipPath: `circle(${reach}px at ${x}px ${y}px)` }],
    { duration: EXPAND_MS, easing: EASE_IN_OUT, fill: "forwards" },
  );
  grid.animate([{ transform: "scale(1)" }, { transform: "scale(2.4)", opacity: 0.4 }], {
    duration: EXPAND_MS + 500,
    easing: EASE_OUT,
    fill: "forwards",
  });
  title.animate(
    [
      { opacity: 0, filter: "blur(8px)", transform: "translate(-50%, -42%)" },
      { opacity: 1, filter: "blur(0)", transform: "translate(-50%, -50%)" },
    ],
    { duration: 420, delay: 200, easing: EASE_OUT, fill: "forwards" },
  );

  const born = performance.now();
  let finished = false;

  /** Awaryjne zejście: całość gaśnie (brak tytułu docelowego, przekroczony czas). */
  const remove = () => {
    if (finished) return;
    finished = true;
    const fade = veil.animate(
      [
        { opacity: 1, filter: "blur(0)" },
        { opacity: 0, filter: "blur(6px)" },
      ],
      { duration: 380, easing: EASE_OUT, fill: "forwards" },
    );
    fade.onfinish = () => veil.remove();
  };

  /**
   * Lądowanie: tytuł z zasłony przelatuje w miejsce prawdziwego tytułu
   * podstrony i przejmuje jego kolor, a tło rozpływa się wokół. Prawdziwy
   * tytuł jest na ten czas niewidoczny; na końcu zastępuje kopię - w tym
   * samym miejscu, więc oko widzi jeden napis, który „wylądował”.
   */
  const land = () => {
    if (finished) return;
    const dest = document.querySelector<HTMLElement>("main h1");
    if (!dest) return remove();
    finished = true;

    const cs = getComputedStyle(dest);
    // Tytuł podstrony może właśnie wjeżdżać (własna animacja wejścia), więc
    // celujemy w jego pozycję KOŃCOWĄ: odejmujemy bieżące przesunięcie.
    const m = new DOMMatrixReadOnly(cs.transform === "none" ? undefined : cs.transform);
    const to = dest.getBoundingClientRect();
    const from = title.getBoundingClientRect();
    const dx = to.left - m.m41 - from.left;
    const dy = to.top - m.m42 - from.top;
    const s = parseFloat(cs.fontSize) / parseFloat(getComputedStyle(title).fontSize) || 1;

    // visibility, nie opacity: tytuł podstrony może mieć własną animację
    // wejścia na opacity (np. Filia), a animacja nadpisuje styl inline.
    dest.style.visibility = "hidden";

    const flight = title.animate(
      [
        { transform: "translate(-50%, -50%)", color: "#ffffff" },
        { transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${s})`, color: cs.color },
      ],
      { duration: 620, easing: EASE_IN_OUT, fill: "forwards" },
    );
    backdrop.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 460,
      delay: 120,
      easing: EASE_OUT,
      fill: "forwards",
    });

    flight.onfinish = () => {
      // Podmiana kopii na prawdziwy tytuł - dopiero gdy ten skończy własne
      // wejście, inaczej przez chwilę byłoby widać, jak dojeżdża z dołu.
      const reveal = () => {
        const settled = new DOMMatrixReadOnly(
          getComputedStyle(dest).transform === "none" ? undefined : getComputedStyle(dest).transform,
        );
        if (Math.abs(settled.m42) > 0.5 && performance.now() - born < MAX_WAIT_MS) {
          requestAnimationFrame(reveal);
          return;
        }
        dest.style.visibility = "";
        const out = title.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: "linear", fill: "forwards" });
        out.onfinish = () => veil.remove();
      };
      reveal();
    };
  };

  // Czekamy, aż zmieni się adres (nowa strona jest w DOM), przewijamy ją na
  // górę pod zasłoną i dopiero wtedy odsłaniamy - ale nie wcześniej, niż
  // zasłona zdąży się rozłożyć.
  const watch = () => {
    if (finished) return;
    const elapsed = performance.now() - born;
    if (elapsed > MAX_WAIT_MS) return remove();
    if (window.location.pathname !== startPath && elapsed >= EXPAND_MS) {
      window.scrollTo({ top: 0, behavior: "instant" });
      // Dwie klatki na wyrenderowanie nowej strony po przewinięciu.
      requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(land, 60)));
      return;
    }
    requestAnimationFrame(watch);
  };
  requestAnimationFrame(watch);

  // Przejście przerwane (np. błąd sieci) - zasłona nie może zostać na zawsze.
  return remove;
}
