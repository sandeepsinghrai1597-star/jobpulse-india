import { ImageResponse } from "next/og";

export const runtime = "edge";

const size = {
  width: 1200,
  height: 630,
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const title = (url.searchParams.get("title") || "JobPulse India").slice(0, 90);
  const company = (url.searchParams.get("company") || "Verified Indian jobs plus AI career tools").slice(0, 80);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0a0913 0%, #161328 48%, #062b2b 100%)",
          color: "white",
          padding: 72,
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#ff2d78",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            JP
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 30, fontWeight: 800 }}>JobPulse India</span>
            <span style={{ color: "#99f6e4", fontSize: 20 }}>No candidate fee. Official links first.</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ color: "#ff8ab5", fontSize: 22, fontWeight: 700, letterSpacing: 4 }}>
            VERIFIED JOB SEARCH
          </div>
          <div style={{ fontSize: 66, lineHeight: 1.05, fontWeight: 850, maxWidth: 980 }}>
            {title}
          </div>
          <div style={{ color: "#dbeafe", fontSize: 30, lineHeight: 1.25, maxWidth: 880 }}>
            {company}
          </div>
        </div>

        <div style={{ display: "flex", gap: 18, color: "#e2e8f0", fontSize: 22 }}>
          <span>Freshers</span>
          <span>|</span>
          <span>Remote</span>
          <span>|</span>
          <span>Government Jobs</span>
          <span>|</span>
          <span>Resume AI</span>
        </div>
      </div>
    ),
    size,
  );
}
