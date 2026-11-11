# Zdjęcia na stronę SSUEW

Zasady (od 11.11.2026):

- **Pełny kadr, bez przycinania.** Każde zdjęcie zachowuje proporcje, w jakich
  zrobił je fotograf; układ strony dostosowuje się do zdjęcia.
- **WebP, dłuższa krawędź do ok. 2400 px** (ściana hero: ok. 1600 px).
  Mniejsze wersje NIE są potrzebne - przy `npm run build` i `npm run dev`
  skrypt `scripts/build-image-variants.mjs` robi warianty szerokości do
  `public/_img` (poza repozytorium), a loader next/image podaje przeglądarce
  ten, który pasuje do ekranu. Vercel nie przelicza więc żadnego zdjęcia.
- Po dodaniu albo podmianie pliku uruchom `node scripts/build-image-variants.mjs`
  i zacommituj zmieniony `src/lib/image-variants.json`.

## Gdzie co leży

| Katalog | Co to jest | Gdzie w kodzie |
|---|---|---|
| `sciana/` | ściana kadrów w hero strony głównej (kolejność nazw = kolejność w ścianie) | `node scripts/build-hero-manifest.mjs` → `src/lib/hero-frames.ts` |
| `projekty/<klucz>/` | `cover.webp` + detale do paska pod zdjęciem | `src/lib/photos.ts` (`projectGallery`, z wymiarami) |
| `glowna/`, `zycie/`, `onas/` | pojedyncze kadry strony głównej i „O nas” | `src/lib/photos.ts`, `ONasContent.tsx` |
| `dla-studenta/`, `fue/`, `kalendarz/`, `rekrutacja/`, `kontakt/` | zdjęcia w nagłówkach podstron | `src/app/[locale]/<strona>/page.tsx` |
| `zarzad/`, `russ/`, `skw/`, `wladze/`, `dziekani/`, `filia/` | portrety osób | `src/lib/people.ts` |

Opisy alternatywne opisują to, co WIDAĆ na zdjęciu - nie zgadujemy, kim są
osoby ani na jakim wydarzeniu zrobiono zdjęcie, jeśli tego nie wiemy.
