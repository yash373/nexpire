import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ background: "#173B3F", borderRadius: 42, display: "flex", height: "100%", width: "100%", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#F4B942", borderRadius: "0 0 24px 24px", display: "flex", height: 82, width: 96, position: "relative", top: 14 }}>
        <div style={{ background: "#FFFDF8", borderRadius: "18px 18px 0 0", height: 28, left: 20, position: "absolute", top: -24, width: 72 }} />
        <div style={{ background: "#173B3F", borderRadius: 8, height: 9, left: 40, position: "absolute", top: 34, width: 42 }} />
        <div style={{ background: "#173B3F", borderRadius: 8, height: 9, left: 40, position: "absolute", top: 54, width: 32 }} />
      </div>
    </div>,
    size,
  );
}

