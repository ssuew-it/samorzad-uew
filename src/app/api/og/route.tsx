import { ImageResponse } from "next/og";

/**
 * Dynamiczny obraz Open Graph dla udostępnień w social media.
 * Wołany z metadanych strony: /api/og?title=...&eyebrow=...
 */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") ?? "Reprezentujemy studentów UEW").slice(0, 90);
  const eyebrow = (searchParams.get("eyebrow") ?? "Samorząd Studentów UEW").slice(0, 70);
  const titleSize = title.length > 44 ? 64 : 82;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FFFFFF",
          padding: "80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            color: "#2C4BFF",
            fontSize: "26px",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          <div style={{ width: "44px", height: "3px", background: "#2C4BFF" }} />
          {eyebrow}
        </div>

        <div style={{ display: "flex", flexDirection: "column", color: "#0B1322" }}>
          <div style={{ fontSize: `${titleSize}px`, lineHeight: 1.08 }}>{title}</div>
          <div style={{ marginTop: "28px", width: "300px", height: "3px", background: "#2C4BFF" }} />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            color: "#475467",
            fontSize: "26px",
          }}
        >
          <span>Samorząd Studentów UEW</span>
          <span style={{ color: "#2C4BFF" }}>samorzad.ue.wroc.pl</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
