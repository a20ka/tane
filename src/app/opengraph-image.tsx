import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Tane — 世界のアイデアの脳みそ";

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
            "linear-gradient(160deg, #faf6ec 0%, #f5efe0 50%, #ebe2c9 100%)",
          color: "#2d2418",
          fontFamily: "serif",
          padding: "80px",
          position: "relative",
        }}
      >
        <svg
          viewBox="0 0 40 40"
          width="180"
          height="180"
          style={{ color: "#5a8c3f" }}
        >
          <path
            d="M20 34 C20 26 20 22 20 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M20 22 C14 20 10 14 10 10 C16 11 20 16 20 22 Z"
            fill="currentColor"
            opacity="0.75"
          />
          <path
            d="M20 18 C26 16 30 12 31 8 C24 9 20 13 20 18 Z"
            fill="currentColor"
          />
        </svg>
        <div
          style={{
            fontSize: 120,
            fontWeight: 700,
            letterSpacing: "0.06em",
            marginTop: 16,
          }}
        >
          Tane
        </div>
        <div
          style={{
            fontSize: 36,
            marginTop: 16,
            color: "#5a4a35",
            textAlign: "center",
            letterSpacing: "0.05em",
          }}
        >
          世界のアイデアの脳みそ
        </div>
        <div
          style={{
            fontSize: 24,
            marginTop: 12,
            color: "#8b7757",
            textAlign: "center",
          }}
        >
          まだ形になっていない種を蒔いて、みんなで育てる
        </div>
      </div>
    ),
    size
  );
}
