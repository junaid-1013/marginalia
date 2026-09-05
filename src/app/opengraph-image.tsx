import { ImageResponse } from "next/og";

import { SITE_NAME } from "@/lib/site";

// every character drawn below: the font request is subset to exactly these
const GLYPHS = `${SITE_NAME} Dense texts, decoded into active recall.`;

export const alt = "Marginalia: dense texts, decoded into active recall";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// satori needs the font file itself; fall back to its default if Google is unreachable
const loadFont = async (): Promise<ArrayBuffer | null> => {
  try {
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=Newsreader:wght@500&text=${encodeURIComponent(GLYPHS)}`,
        // an old user agent makes Google serve TTF, which satori can read
        { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1" } }
      )
    ).text();
    const url = css.match(/src: url\((.+?)\) format/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
};

export default async function OpengraphImage() {
  const font = await loadFont();
  const serif = font ? "Newsreader" : "serif";
  const line = { display: "flex", fontSize: 104, lineHeight: 1.04, letterSpacing: -3 } as const;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F4F2EC",
          color: "#1B2A41",
          padding: "64px 96px 64px 120px",
          fontFamily: serif,
          position: "relative",
        }}
      >
        {/* the red rule of a ruled page */}
        <div style={{ position: "absolute", left: 84, top: 0, bottom: 0, width: 2, background: "rgba(201,98,91,0.45)", display: "flex" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 40 }}>
          <div style={{ display: "flex", width: 40, height: 40, border: "4px solid #1B2A41", borderRadius: 8, position: "relative" }}>
            <div style={{ position: "absolute", left: -12, top: 10, width: 20, height: 10, background: "#F2B134", borderRadius: 3, display: "flex" }} />
          </div>
          <div style={{ display: "flex" }}>{SITE_NAME}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={line}>Dense texts,</div>
          <div style={line}>decoded into</div>
          <div style={{ ...line, alignSelf: "flex-start", background: "#FAE0A0", padding: "0 14px", marginLeft: -14 }}>
            active recall.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: "Newsreader", data: font, weight: 500, style: "normal" }] : undefined,
    }
  );
}
