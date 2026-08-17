import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background:
          "radial-gradient(circle at 75% 20%, #7451f5 0%, #341b87 30%, #0a0912 72%)",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        padding: "80px",
        textAlign: "center",
        width: "100%",
      }}
    >
      <div style={{ color: "#ffd374", display: "flex", fontSize: 28, letterSpacing: 8 }}>
        LIVE MUSIC ACROSS INDIA
      </div>
      <div style={{ display: "flex", fontSize: 92, fontWeight: 700, marginTop: 24 }}>
        {siteConfig.name}
      </div>
      <div style={{ color: "#dedce8", display: "flex", fontSize: 42, marginTop: 18 }}>
        {siteConfig.tagline}
      </div>
    </div>,
    size,
  );
}
