import type { CSSProperties } from "react";

/** Direct-label style for Recharts LabelList (mono numerals, muted ink).
 *  Override `fill` inline where the label carries the finding. */
export const chartLabelStyle: CSSProperties = {
  fontSize: 10.5,
  fontFamily: "var(--font-mono)",
  fill: "var(--fg-2)",
};

/** Inverse-surface tooltip, shared by contentStyle and custom content. */
export const chartTooltipStyle: CSSProperties = {
  background: "var(--bg-inverse)",
  border: "none",
  borderRadius: 6,
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  color: "var(--fg-on-inverse)",
};
