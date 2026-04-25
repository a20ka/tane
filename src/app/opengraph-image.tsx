import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Tane — 未完成のアイデアを蒔く";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(135deg, #f8fafc 0%, #e0f2e9 50%, #f8fafc 100%)",
          color: "#18181b",
          fontFamily: "sans-serif",
          padding: "80px",
        }}
      >
        <div style={{ fontSize: 160 }}>🌱</div>
        <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: "-0.02em" }}>Tane</div>
        <div style={{ fontSize: 36, marginTop: 24, color: "#52525b", textAlign: "center" }}>
          未完成のアイデアを蒔いて、みんなで育てる場所
        </div>
      </div>
    ),
    size
  );
}
