import { ImageResponse } from "next/og";

export const alt =
  "Samorząd Studentów Uniwersytetu Ekonomicznego we Wrocławiu - reprezentujemy studentów";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
        {/* Eyebrow - full name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            color: "#2C4BFF",
            fontSize: "26px",
          }}
        >
          <div style={{ width: "44px", height: "3px", background: "#2C4BFF" }} />
          Samorząd Studentów Uniwersytetu Ekonomicznego we Wrocławiu
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", color: "#0B1322" }}>
          <div style={{ fontSize: "88px", lineHeight: 1.05 }}>Reprezentujemy</div>
          <div style={{ fontSize: "88px", lineHeight: 1.05 }}>studentów UEW</div>
          <div
            style={{
              marginTop: "28px",
              width: "300px",
              height: "3px",
              background: "#2C4BFF",
            }}
          />
        </div>

        {/* Footer line */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            color: "#475467",
            fontSize: "26px",
          }}
        >
          <span>Uniwersytet Ekonomiczny we Wrocławiu</span>
          <span style={{ color: "#2C4BFF" }}>samorzad.ue.wroc.pl</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
