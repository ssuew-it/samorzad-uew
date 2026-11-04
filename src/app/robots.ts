import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/og";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // `/api/og` generuje obrazy udostępnień. Twitterbot i część crawlerów
      // podglądu linków respektuje robots.txt, więc blokada całego `/api/`
      // odcinała im og:image.
      allow: ["/", "/api/og"],
      disallow: "/api/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
