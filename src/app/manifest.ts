import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Samorząd Studentów Uniwersytetu Ekonomicznego we Wrocławiu",
    short_name: "SSUEW",
    description:
      "Oficjalny serwis Samorządu Studentów UEW - stypendia, prawa studenta, wsparcie i działalność.",
    start_url: "/",
    display: "standalone",
    lang: "pl-PL",
    background_color: "#F6F8FC",
    theme_color: "#2C4BFF",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
  };
}
