import type { Metadata } from "next";

const SITE_URL = "https://samorzad.ue.wroc.pl";

// Root layout for segments OUTSIDE `[locale]` (the auto `/_not-found` route,
// and the special metadata file conventions: opengraph-image, manifest,
// robots, sitemap). It exists ONLY to give the true app root a
// `metadataBase`, so those routes don't warn about resolving relative OG
// image URLs at build time. `[locale]/layout.tsx` remains the effective root
// layout for all real pages - it renders the actual `<html>`/`<body>` shell;
// this layout must stay a transparent pass-through so it doesn't introduce a
// second one.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
