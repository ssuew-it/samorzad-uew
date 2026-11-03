import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Testy (tu i w kolejnych taskach) mockują moduły pod "@/...", tak jak
    // kod aplikacji importuje je przez alias z tsconfig.json.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts", "scripts/**/*.test.mjs"],
    environment: "node",
    // next-intl importuje „next/server" bez rozszerzenia, a Node w trybie ESM
    // nie znajduje takiego pliku. Przepuszczenie paczki przez Vite rozwiązuje
    // import tak jak bundler Next — inaczej test blokady w ogóle się nie ładuje.
    server: { deps: { inline: ["next-intl"] } },
  },
});
