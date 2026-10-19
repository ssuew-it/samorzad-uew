/**
 * Awatar z inicjałami - używany na stronach z osobami, dopóki nie pojawią się
 * prawdziwe zdjęcia. Świadomy wybór projektowy (a nie placeholder zdjęcia):
 * spójny, instytucjonalny, bez zależności od plików graficznych.
 */

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
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
