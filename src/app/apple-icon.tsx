import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#F4F2EC" }}>
        <div style={{ display: "flex", width: 84, height: 100, border: "8px solid #1B2A41", borderRadius: 16, position: "relative" }}>
          <div style={{ position: "absolute", left: -26, top: 24, width: 40, height: 20, background: "#F2B134", borderRadius: 5, display: "flex" }} />
          <div style={{ position: "absolute", left: 20, top: 0, bottom: 0, width: 3, background: "rgba(27,42,65,0.4)", display: "flex" }} />
          <div style={{ position: "absolute", left: 38, top: 22, width: 28, height: 8, background: "#1B2A41", borderRadius: 4, display: "flex" }} />
          <div style={{ position: "absolute", left: 38, top: 42, width: 28, height: 8, background: "#1B2A41", borderRadius: 4, display: "flex" }} />
        </div>
      </div>
    ),
    size
  );
}
