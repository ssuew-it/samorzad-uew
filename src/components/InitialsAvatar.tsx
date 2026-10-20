/**
 * Awatar z inicjałami - używany na stronach z osobami, dopóki nie pojawią się
 * prawdziwe zdjęcia. Świadomy wybór projektowy (a nie placeholder zdjęcia):
 * spójny, instytucjonalny, bez zależności od plików graficznych.
 */

/**
 * Imię i nazwisko bez stopni naukowych: „dr hab. Wawrzyniec Michalczyk, prof.
 * UEW” → „WM”. Wcześniej brane były dwa pierwsze słowa, więc wychodziło „DH”.
 * Stopnie piszemy małą literą (dr, hab., inż., prof.), a tytuł po przecinku
 * odcinamy w całości.
 */
function initials(name: string): string {
  const words = name
    .split(",")[0]
    .split(/\s+/)
    .filter((word) => word && word[0] === word[0].toLocaleUpperCase() && !word.endsWith("."));
  const picked = words.length > 1 ? [words[0], words[words.length - 1]] : words;
  return picked.map((word) => word[0].toLocaleUpperCase()).join("");
}

export function InitialsAvatar({
  name,
  size = 56,
}: {
  name: string;
  size?: number;
}) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: size * 0.34 }}
      className="flex shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent-glow font-display font-medium tracking-[-0.01em] text-accent"
    >
      {initials(name)}
    </span>
  );
}
