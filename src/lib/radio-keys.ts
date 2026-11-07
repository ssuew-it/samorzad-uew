/**
 * Strzałki w grupie radiowej (wzorzec ARIA radiogroup): w prawo/w dół -
 * następna opcja, w lewo/w górę - poprzednia, z zawijaniem na końcach.
 * Zwraca indeks nowej opcji albo null, gdy klawisz nie jest strzałką.
 */
export function radioKeyIndex(current: number, count: number, key: string): number | null {
  if (key === "ArrowRight" || key === "ArrowDown") return (current + 1) % count;
  if (key === "ArrowLeft" || key === "ArrowUp") return (current - 1 + count) % count;
  return null;
}
