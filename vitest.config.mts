import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "scripts/**/*.test.mjs"],
    environment: "node",
    // next-intl importuje „next/server" bez rozszerzenia, a Node w trybie ESM
    // nie znajduje takiego pliku. Przepuszczenie paczki przez Vite rozwiązuje
    // import tak jak bundler Next — inaczej test blokady w ogóle się nie ładuje.
    server: { deps: { inline: ["next-intl"] } },
  },
});
