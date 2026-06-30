import type { CSSProperties } from "react";

/** Inverse-surface tooltip, shared by contentStyle and custom content. */
export const chartTooltipStyle: CSSProperties = {
  background: "var(--bg-inverse)",
  border: "none",
  borderRadius: 6,
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  color: "var(--fg-on-inverse)",
};
