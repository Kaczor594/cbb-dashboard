import { ImageResponse } from "next/og";

// Static link-preview card. Rendered at build time, no external fonts (keeps
// the build deterministic) — brand palette carries the look. next/og picks
// this up automatically for both og:image and twitter:image.
export const alt =
  "College basketball prediction model — an out-of-sample backtest by Isaac Kaczor";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#F8F5EE";
const INK = "#15140F";
const MOSS = "#3E5A32";
const SAGE = "#8FA474";
const STONE = "#5E5C52";
const LINE = "#D8CFB8";

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
          background: PAPER,
          color: INK,
          padding: "70px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 10,
              background: INK,
              color: PAPER,
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            <span>i</span>
            <span style={{ color: SAGE }}>k</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 6,
              color: STONE,
              textTransform: "uppercase",
            }}
          >
            College Basketball · Prediction model
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.04,
              letterSpacing: -2,
              maxWidth: 980,
            }}
          >
            An XGBoost model, scored honestly
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: STONE,
              maxWidth: 900,
              lineHeight: 1.3,
            }}
          >
            Out-of-sample across two seasons — accuracy, calibration and a
            head-to-head with the betting market.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${LINE}`,
            paddingTop: 22,
          }}
        >
          <div style={{ display: "flex", fontSize: 26, color: INK }}>
            Isaac Kaczor
          </div>
          <div style={{ display: "flex", fontSize: 22, color: MOSS, letterSpacing: 1 }}>
            71% accuracy · 11,000 games · point-in-time
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
